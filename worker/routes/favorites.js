import { json, readJson, badRequest } from "../lib/http.js"
import { requireUser } from "../lib/session.js"
import { safeImagePath } from "../lib/tmdb.js"

const MAX_FAVORITES = 500

function validMovie(raw) {
  const id = Number(raw?.id)
  const title = typeof raw?.title === "string" ? raw.title.trim().slice(0, 200) : ""
  if (!Number.isInteger(id) || id < 1 || id > 99_999_999 || !title) return null
  return {
    id,
    title,
    poster_path: safeImagePath(raw.poster_path),
    backdrop_path: safeImagePath(raw.backdrop_path),
    vote_average:
      typeof raw.vote_average === "number" && raw.vote_average >= 0 && raw.vote_average <= 10 ? raw.vote_average : null,
    release_date: /^\d{4}-\d{2}-\d{2}$/.test(raw.release_date ?? "") ? raw.release_date : null,
  }
}

const insert = (env, userId, m, now) =>
  env.DB.prepare(
    `INSERT INTO favorites (user_id, movie_id, title, poster_path, backdrop_path, vote_average, release_date, added_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) ON CONFLICT(user_id, movie_id) DO NOTHING`,
  ).bind(userId, m.id, m.title, m.poster_path, m.backdrop_path, m.vote_average, m.release_date, now)

// Every query is scoped by the session's user id — never by an id from the client.
async function list(env, userId) {
  const { results } = await env.DB.prepare(
    `SELECT movie_id AS id, title, poster_path, backdrop_path, vote_average, release_date
     FROM favorites WHERE user_id = ?1 ORDER BY added_at DESC LIMIT ${MAX_FAVORITES}`,
  )
    .bind(userId)
    .all()
  return results
}

export const favoriteRoutes = {
  "GET /api/favorites": async ({ env, request }) => {
    const user = await requireUser(env, request)
    return json({ items: await list(env, user.id) })
  },

  "PUT /api/favorites/:id": async ({ env, request, params }) => {
    const user = await requireUser(env, request)
    const movie = validMovie({ ...(await readJson(request)), id: params.id })
    if (!movie) throw badRequest("Invalid movie.")
    const { count } = await env.DB.prepare("SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?1")
      .bind(user.id)
      .first()
    if (count >= MAX_FAVORITES) throw badRequest("Your list is full.", "list_full")
    await insert(env, user.id, movie, Date.now()).run()
    return json({ ok: true })
  },

  "DELETE /api/favorites/:id": async ({ env, request, params }) => {
    const user = await requireUser(env, request)
    const id = Number(params.id)
    if (!Number.isInteger(id)) throw badRequest("Invalid movie.")
    await env.DB.prepare("DELETE FROM favorites WHERE user_id = ?1 AND movie_id = ?2").bind(user.id, id).run()
    return json({ ok: true })
  },

  // Called once after sign-in to move a guest's local list into the account.
  "POST /api/favorites/merge": async ({ env, request }) => {
    const user = await requireUser(env, request)
    const body = await readJson(request, 64 * 1024)
    const items = (Array.isArray(body.items) ? body.items : []).slice(0, 100).map(validMovie).filter(Boolean)
    if (items.length) {
      const now = Date.now()
      await env.DB.batch(items.map((m, i) => insert(env, user.id, m, now - i)))
    }
    return json({ items: await list(env, user.id) })
  },
}
