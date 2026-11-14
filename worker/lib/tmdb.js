// Server-side TMDB client. The API key lives only here (a Worker secret) and
// callers can reach only the fixed set of endpoints below — never a raw URL.

import { HttpError } from "./http.js"

const BASE = "https://api.themoviedb.org/3"
const LANGS = { en: "en-US", ar: "ar-SA" }

export const GENRES = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
}
const GENRE_IDS = new Set(Object.values(GENRES))
export const isGenreId = (id) => GENRE_IDS.has(Number(id))

const IMAGE_PATH = /^\/[A-Za-z0-9_.-]{5,80}\.(jpg|png|svg)$/
export const safeImagePath = (p) => (typeof p === "string" && IMAGE_PATH.test(p) ? p : null)

/** Keep only the fields the UI needs; drop everything else TMDB sends. */
export function slimMovie(m) {
  return {
    id: m.id,
    title: String(m.title ?? m.original_title ?? "").slice(0, 200),
    overview: String(m.overview ?? "").slice(0, 1200),
    poster_path: safeImagePath(m.poster_path),
    backdrop_path: safeImagePath(m.backdrop_path),
    vote_average: typeof m.vote_average === "number" ? Math.round(m.vote_average * 10) / 10 : null,
    release_date: /^\d{4}-\d{2}-\d{2}$/.test(m.release_date ?? "") ? m.release_date : null,
    genre_ids: Array.isArray(m.genre_ids) ? m.genre_ids.filter(Number.isInteger).slice(0, 8) : [],
  }
}

const slimList = (data) => (data?.results ?? []).filter((m) => Number.isInteger(m.id) && m.poster_path).map(slimMovie)

export async function tmdb(env, path, params = {}, lang = "en") {
  if (!env.TMDB_API_KEY) throw new HttpError(503, "not_configured", "Movie service is not configured.")
  const url = new URL(BASE + path)
  url.searchParams.set("language", LANGS[lang] ?? LANGS.en)
  url.searchParams.set("include_adult", "false")
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v))
  }
  // v4 tokens are JWTs and go in a header; v3 keys go in the query string.
  const headers = { Accept: "application/json" }
  if (env.TMDB_API_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${env.TMDB_API_KEY}`
  else url.searchParams.set("api_key", env.TMDB_API_KEY)

  let res
  try {
    res = await fetch(url, { headers })
  } catch {
    throw new HttpError(502, "upstream_error", "Movie service is unreachable.")
  }
  if (res.status === 404) throw new HttpError(404, "not_found", "Movie not found.")
  // Never forward upstream error bodies: they can echo the key or internals.
  if (!res.ok) throw new HttpError(502, "upstream_error", "Movie service error.")
  return res.json()
}

export const lists = {
  trending: (env, lang, page) => tmdb(env, "/trending/movie/week", { page }, lang).then(slimList),
  popular: (env, lang, page) => tmdb(env, "/movie/popular", { page }, lang).then(slimList),
  topRated: (env, lang, page) => tmdb(env, "/movie/top_rated", { page }, lang).then(slimList),
  upcoming: (env, lang, page) => tmdb(env, "/movie/upcoming", { page }, lang).then(slimList),
  search: (env, lang, query, page) => tmdb(env, "/search/movie", { query, page }, lang).then(slimList),
  recommendations: (env, lang, id) => tmdb(env, `/movie/${id}/recommendations`, {}, lang).then(slimList),
  discover: (env, lang, o = {}) =>
    tmdb(
      env,
      "/discover/movie",
      {
        page: o.page,
        with_genres: o.withGenres?.join(","),
        without_genres: o.withoutGenres?.join(","),
        sort_by: o.sortBy ?? "popularity.desc",
        "vote_count.gte": o.minVotes ?? 150,
        "primary_release_date.gte": o.yearFrom ? `${o.yearFrom}-01-01` : undefined,
        "primary_release_date.lte": o.yearTo ? `${o.yearTo}-12-31` : undefined,
      },
      lang,
    ).then(slimList),
}

export async function genres(env, lang) {
  const data = await tmdb(env, "/genre/movie/list", {}, lang)
  return (data.genres ?? [])
    .filter((g) => isGenreId(g.id))
    .map((g) => ({ id: g.id, name: String(g.name).slice(0, 40) }))
}

export async function movieDetails(env, lang, id) {
  const m = await tmdb(
    env,
    `/movie/${id}`,
    { append_to_response: "videos,recommendations", include_video_language: "en,ar,null" },
    lang,
  )
  const trailer = (m.videos?.results ?? []).find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && /^[\w-]{6,20}$/.test(v.key ?? ""),
  )
  return {
    ...slimMovie(m),
    genre_ids: (m.genres ?? []).map((g) => g.id),
    genres: (m.genres ?? []).map((g) => String(g.name).slice(0, 40)),
    tagline: String(m.tagline ?? "").slice(0, 200),
    runtime: Number.isInteger(m.runtime) ? m.runtime : null,
    trailer_key: trailer?.key ?? null,
    recommendations: slimList(m.recommendations).slice(0, 12),
  }
}
