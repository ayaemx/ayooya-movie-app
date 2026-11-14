// Offline API for UI work: the real Worker code, with TMDB and the AI model
// replaced by canned data. No keys or accounts needed.  Usage: npm run dev:mock
import { readFileSync } from "node:fs"
import { Miniflare } from "miniflare"

const TITLES = [
  "Paper Lanterns",
  "The Long Orbit",
  "Midnight Bakery",
  "Glass Harbor",
  "Echo Valley",
  "Small Giants",
  "The Last Signal",
  "Saffron Road",
  "Northern Lights Inn",
  "Clockwork Garden",
  "Tidewater",
  "Seven Minutes Past",
  "The Quiet Engine",
  "Sand & Stars",
  "Borrowed Summer",
  "Level Nine",
]
const GENRES = [28, 12, 16, 35, 80, 18, 10751, 14, 27, 9648, 10749, 878, 53]
const movie = (i) => ({
  id: 1000 + i,
  title: TITLES[i % TITLES.length],
  overview:
    "A warm, fast-moving story about unlikely friends who set out to fix one small thing and end up changing everything around them.",
  poster_path: `/poster${i % 8}.jpg`,
  backdrop_path: `/backdrop${i % 5}.jpg`,
  vote_average: 6.2 + (i % 7) * 0.4,
  release_date: `20${10 + (i % 15)}-0${1 + (i % 9)}-15`,
  genre_ids: [GENRES[i % GENRES.length], GENRES[(i + 3) % GENRES.length]],
})
const list = (offset) => ({ results: Array.from({ length: 16 }, (_, i) => movie(i + offset)) })

function fakeTmdb(request) {
  const p = new URL(request.url).pathname
  if (p.endsWith("/genre/movie/list")) {
    const names = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      27: "Horror",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      53: "Thriller",
    }
    return Response.json({ genres: Object.entries(names).map(([id, name]) => ({ id: Number(id), name })) })
  }
  const detail = p.match(/\/movie\/(\d+)$/)
  if (detail) {
    const m = movie(Number(detail[1]) - 1000)
    return Response.json({
      ...m,
      genres: [
        { id: 12, name: "Adventure" },
        { id: 35, name: "Comedy" },
      ],
      runtime: 112,
      tagline: "Some journeys start by accident.",
      videos: { results: [{ site: "YouTube", type: "Trailer", key: "aqz-KE-bpKQ" }] },
      recommendations: list(5),
    })
  }
  const offsets = { "/trending/movie/week": 0, "/movie/popular": 4, "/movie/top_rated": 8, "/movie/upcoming": 11 }
  return Response.json(list(Object.entries(offsets).find(([k]) => p.endsWith(k))?.[1] ?? 2))
}

const mf = new Miniflare({
  modules: true,
  scriptPath: "test/worker-entry.js",
  modulesRules: [{ type: "ESModule", include: ["**/*.js"] }],
  compatibilityDate: "2026-07-01",
  port: 8787,
  d1Databases: { DB: "mock-db" },
  bindings: {
    TMDB_API_KEY: "mock",
    ADMIN_TOKEN: "mock-admin",
    AI_MODEL: "mock",
    ALLOWED_ORIGINS: "http://localhost:5173",
  },
  outboundService: fakeTmdb,
})
const db = await mf.getD1Database("DB")
const sql = readFileSync("migrations/0001_init.sql", "utf8").replace(/--.*$/gm, "")
for (const stmt of sql
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean))
  await db.prepare(stmt).run()
await mf.ready
console.log("Mock API on http://localhost:8787 — now run `npm run dev` in another terminal.")
