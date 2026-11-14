import { json, readJson, badRequest, HttpError, clientIp } from "../lib/http.js"
import { rateLimit } from "../lib/ratelimit.js"
import { timingSafeEqual, sha256Hex } from "../lib/crypto.js"

// Privacy-first analytics: an allow-list of event names, counted per day.
// No cookies, no user ids, no IPs, no free-text — nothing personal is stored.
const EVENTS = new Set([
  "page_view",
  "hero_view",
  "hero_cta_click",
  "trailer_play",
  "details_open",
  "favorite_add",
  "search",
  "chat_open",
  "chat_message",
  "signup",
  "login",
])
const VARIANTS = new Set(["", "A", "B"])

export const eventRoutes = {
  "POST /api/events": async ({ env, request }) => {
    await rateLimit(env, "events", clientIp(request), 120, 60)
    const body = await readJson(request, 512)
    const name = String(body.name ?? "")
    const variant = String(body.variant ?? "")
    if (!EVENTS.has(name) || !VARIANTS.has(variant)) throw badRequest("Unknown event.")
    await env.DB.prepare(
      `INSERT INTO events_daily (day, name, variant, count) VALUES (?1, ?2, ?3, 1)
       ON CONFLICT(day, name, variant) DO UPDATE SET count = count + 1`,
    )
      .bind(new Date().toISOString().slice(0, 10), name, variant)
      .run()
    return json({ ok: true }, 202)
  },

  // Owner-only report, including the hero A/B test conversion per variant.
  "GET /api/stats": async ({ env, request }) => {
    const supplied = (request.headers.get("Authorization") ?? "").replace(/^Bearer /, "")
    const expected = env.ADMIN_TOKEN ?? ""
    // Compare hashes so the comparison is constant-time and length-independent.
    if (!expected || !timingSafeEqual(await sha256Hex(supplied), await sha256Hex(expected))) {
      throw new HttpError(401, "unauthorized", "Admin token required.")
    }
    const { results } = await env.DB.prepare(
      `SELECT day, name, variant, count FROM events_daily
       WHERE day >= date('now', '-30 day') ORDER BY day DESC, name`,
    ).all()
    const total = (name, variant) =>
      results.filter((r) => r.name === name && r.variant === variant).reduce((s, r) => s + r.count, 0)
    const abTest = ["A", "B"].map((v) => {
      const views = total("hero_view", v)
      const clicks = total("hero_cta_click", v)
      return { variant: v, views, clicks, click_rate: views ? Math.round((clicks / views) * 1000) / 10 : 0 }
    })
    return json({ range_days: 30, hero_ab_test: abTest, daily: results })
  },
}
