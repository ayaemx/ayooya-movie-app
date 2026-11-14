// Test harness: the real API handler with a scripted stand-in for Workers AI.
import { handle } from "../worker/index.js"

const fakeAI = {
  async run(_model, { messages }) {
    const system = messages[0].content
    const user = messages[messages.length - 1].content
    if (user.includes("BROKEN")) throw new Error("model offline")
    if (system.includes("Pick the intent")) {
      if (user.includes("MALICIOUS")) {
        // A hijacked model: unknown intent, made-up genre, markup in the reply.
        return {
          response: {
            intent: "exfiltrate_secrets",
            include_genres: ["Totally Fake", "Comedy"],
            year_from: -5,
            reply: "ok\u0000<img src=x onerror=alert(1)>",
          },
        }
      }
      return {
        response: JSON.stringify({
          intent: "similar",
          title: "Interstellar",
          exclude_genres: ["Drama"],
          reply: "Space epics with a lighter touch:",
        }),
      }
    }
    // Picks: one known id, one invented id that must be dropped, plus (for the
    // offline mock) the first two candidates that were actually listed.
    const listed = [...user.matchAll(/id=(\d+)/g)]
      .map((m) => Number(m[1]))
      .filter((id) => id >= 1000)
      .slice(0, 4)
    const extra = listed.map((id) => ({ id, reason: "A lighter, feel-good take on the same kind of adventure." }))
    return {
      response: {
        intro: "Try these:",
        picks: [{ id: 102, reason: "Fun space adventure." }, { id: 999999, reason: "Injected" }, ...extra],
      },
    }
  },
}

export default {
  fetch: (request, env, ctx) => handle(request, { ...env, AI: fakeAI }, ctx),
}
