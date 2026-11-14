import { HttpError } from "./http.js"
import { sha256Hex } from "./crypto.js"

/**
 * Fixed-window rate limiter backed by D1. One atomic upsert per check.
 * The key is hashed before storage so raw IPs / emails never hit the database.
 */
export async function rateLimit(env, scope, identity, limit, windowSeconds) {
  const key = await sha256Hex(`${scope}:${identity}`)
  const now = Math.floor(Date.now() / 1000)
  const cutoff = now - windowSeconds
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count        = CASE WHEN window_start <= ?3 THEN 1   ELSE count + 1    END,
       window_start = CASE WHEN window_start <= ?3 THEN ?2  ELSE window_start END
     RETURNING count, window_start`,
  )
    .bind(key, now, cutoff)
    .first()
  if (row.count > limit) {
    const retry = Math.max(1, row.window_start + windowSeconds - now)
    throw new HttpError(429, "rate_limited", "Too many requests. Please slow down.", {
      "Retry-After": String(retry),
    })
  }
}
