import { HttpError, parseCookies } from "./http.js"
import { randomHex, sha256Hex } from "./crypto.js"

const SESSION_DAYS = 7

// On HTTPS we use the __Host- prefix: the browser then refuses the cookie unless
// it is Secure, path=/ and has no Domain — it cannot be set by a sibling subdomain.
const cookieName = (request) =>
  new URL(request.url).protocol === "https:" ? "__Host-ayooya_session" : "ayooya_session"

function cookie(request, value, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? " Secure;" : ""
  return `${cookieName(request)}=${value}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAge}`
}

export async function createSession(env, request, userId) {
  const token = randomHex(32)
  const now = Math.floor(Date.now() / 1000)
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?1").bind(now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)").bind(
      await sha256Hex(token),
      userId,
      now,
      now + SESSION_DAYS * 86400,
    ),
  ])
  return cookie(request, token, SESSION_DAYS * 86400)
}

export async function destroySession(env, request) {
  const token = parseCookies(request)[cookieName(request)]
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?1")
      .bind(await sha256Hex(token))
      .run()
  }
  return cookie(request, "", 0)
}

export async function currentUser(env, request) {
  const token = parseCookies(request)[cookieName(request)]
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null
  return env.DB.prepare(
    `SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2`,
  )
    .bind(await sha256Hex(token), Math.floor(Date.now() / 1000))
    .first()
}

export async function requireUser(env, request) {
  const user = await currentUser(env, request)
  if (!user) throw new HttpError(401, "unauthorized", "Please sign in.")
  return user
}
