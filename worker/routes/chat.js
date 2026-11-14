import { json, readJson, badRequest, clientIp, cleanText } from "../lib/http.js"
import { rateLimit } from "../lib/ratelimit.js"
import { assist } from "../lib/assistant.js"

export const chatRoutes = {
  "POST /api/chat": async ({ env, request }) => {
    // Per-visitor limit, plus a global daily cap that protects the free AI quota.
    await rateLimit(env, "chat", clientIp(request), 20, 600)
    await rateLimit(env, "chat-global", "all", 1500, 86400)

    const body = await readJson(request, 12 * 1024)
    const message = cleanText(body.message, 500)
    if (message.length < 2) throw badRequest("Say a little more about what you'd like to watch.")
    const history = (Array.isArray(body.history) ? body.history : [])
      .slice(-8)
      .map((h) => ({
        role: h?.role === "assistant" ? "assistant" : "user",
        content: cleanText(h?.content, 800),
      }))
      .filter((h) => h.content)
    const lang = body.lang === "ar" ? "ar" : "en"

    return json(await assist(env, { message, history, lang }))
  },
}
