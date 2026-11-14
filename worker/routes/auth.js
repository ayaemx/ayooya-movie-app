import { json, readJson, badRequest, HttpError, clientIp, cleanText } from "../lib/http.js"
import { hashPassword, verifyPassword, PBKDF2_ITERATIONS } from "../lib/crypto.js"
import { rateLimit } from "../lib/ratelimit.js"
import { createSession, destroySession, currentUser } from "../lib/session.js"

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name })

// A fixed fake record lets us spend the same hashing time when the email is
// unknown, so response timing does not reveal which emails have accounts.
const DUMMY = { salt: "00".repeat(16), iterations: PBKDF2_ITERATIONS, password_hash: "0".repeat(64) }

function credentials(body) {
  const email = cleanText(body.email, 254).toLowerCase()
  const password = typeof body.password === "string" ? body.password : ""
  if (!EMAIL.test(email)) throw badRequest("Enter a valid email address.", "invalid_email")
  return { email, password }
}

export const authRoutes = {
  "POST /api/auth/register": async ({ env, request }) => {
    await rateLimit(env, "register", clientIp(request), 5, 3600)
    const body = await readJson(request)
    const { email, password } = credentials(body)
    const name = cleanText(body.name, 60)
    if (name.length < 2) throw badRequest("Enter your name.", "invalid_name")
    if (password.length < 10 || password.length > 128) {
      throw badRequest("Password must be 10–128 characters.", "weak_password")
    }
    const { hash, salt, iterations } = await hashPassword(password)
    let user
    try {
      user = await env.DB.prepare(
        `INSERT INTO users (email, name, password_hash, salt, iterations, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id, email, name`,
      )
        .bind(email, name, hash, salt, iterations, Math.floor(Date.now() / 1000))
        .first()
    } catch (err) {
      if (String(err).includes("UNIQUE")) {
        throw new HttpError(409, "email_taken", "An account with this email already exists.")
      }
      throw err
    }
    const setCookie = await createSession(env, request, user.id)
    return json({ user: publicUser(user) }, 201, { "Set-Cookie": setCookie })
  },

  "POST /api/auth/login": async ({ env, request }) => {
    const body = await readJson(request)
    const { email, password } = credentials(body)
    // Limit by IP and by targeted account, to slow both spraying and stuffing.
    await rateLimit(env, "login-ip", clientIp(request), 10, 600)
    await rateLimit(env, "login-email", email, 8, 600)

    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?1").bind(email).first()
    const ok = await verifyPassword(password.slice(0, 128), user ?? DUMMY)
    if (!user || !ok) {
      // Same message for "no such user" and "wrong password".
      throw new HttpError(401, "invalid_credentials", "Email or password is incorrect.")
    }
    const setCookie = await createSession(env, request, user.id)
    return json({ user: publicUser(user) }, 200, { "Set-Cookie": setCookie })
  },

  "POST /api/auth/logout": async ({ env, request }) =>
    json({ ok: true }, 200, { "Set-Cookie": await destroySession(env, request) }),

  "GET /api/auth/me": async ({ env, request }) => {
    const user = await currentUser(env, request)
    return json({ user: user ? publicUser(user) : null })
  },
}
