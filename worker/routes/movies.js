import { json, badRequest, cleanText } from "../lib/http.js"
import { lists, genres, movieDetails, isGenreId } from "../lib/tmdb.js"

const lang = (url) => (url.searchParams.get("lang") === "ar" ? "ar" : "en")
const page = (url) => {
  const n = Number(url.searchParams.get("page") ?? 1)
  return Number.isInteger(n) && n >= 1 && n <= 50 ? n : 1
}
// Public catalogue data is identical for everyone, so let the edge cache it.
const cached = (data, seconds = 600) => json(data, 200, { "Cache-Control": `public, max-age=${seconds}` })

export const movieRoutes = {
  "GET /api/movies/trending": async ({ env, url }) =>
    cached({ results: await lists.trending(env, lang(url), page(url)) }),
  "GET /api/movies/popular": async ({ env, url }) =>
    cached({ results: await lists.popular(env, lang(url), page(url)) }),
  "GET /api/movies/top-rated": async ({ env, url }) =>
    cached({ results: await lists.topRated(env, lang(url), page(url)) }),
  "GET /api/movies/upcoming": async ({ env, url }) =>
    cached({ results: await lists.upcoming(env, lang(url), page(url)) }),
  "GET /api/movies/genres": async ({ env, url }) => cached({ genres: await genres(env, lang(url)) }, 86400),

  "GET /api/movies/discover": async ({ env, url }) => {
    const genre = url.searchParams.get("genre")
    if (!isGenreId(genre)) throw badRequest("Unknown genre.")
    const results = await lists.discover(env, lang(url), { withGenres: [Number(genre)], page: page(url) })
    return cached({ results })
  },

  "GET /api/movies/search": async ({ env, url }) => {
    const q = cleanText(url.searchParams.get("q"), 100)
    if (q.length < 2) throw badRequest("Search needs at least 2 characters.")
    return cached({ results: await lists.search(env, lang(url), q, page(url)) }, 300)
  },

  "GET /api/movies/:id": async ({ env, url, params }) => {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1 || id > 99_999_999) throw badRequest("Invalid movie id.")
    return cached(await movieDetails(env, lang(url), id))
  },
}
