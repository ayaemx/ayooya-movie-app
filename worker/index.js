// Ayooya API — a single Cloudflare Worker in front of TMDB, D1 and Workers AI.
// Static files (the React build) are served by the platform; only /api/* runs here.

import { json, HttpError, assertSameOrigin } from "./lib/http.js"
import { movieRoutes } from "./routes/movies.js"
import { authRoutes } from "./routes/auth.js"
import { favoriteRoutes } from "./routes/favorites.js"
import { chatRoutes } from "./routes/chat.js"
import { eventRoutes } from "./routes/events.js"

const table = { ...authRoutes, ...favoriteRoutes, ...chatRoutes, ...eventRoutes, ...movieRoutes }

// Compile "METHOD /path/:param" keys once at startup.
const routes = Object.entries(table).map(([key, handler]) => {
  const [method, path] = key.split(" ")
  const pattern = new RegExp("^" + path.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$")
  return { method, pattern, handler }
})

export async function handle(request, env, ctx) {
  const url = new URL(request.url)
  try {
    const candidates = routes.filter((r) => r.pattern.test(url.pathname))
    if (!candidates.length) throw new HttpError(404, "not_found", "Unknown endpoint.")
    const route = candidates.find((r) => r.method === request.method)
    if (!route) {
      throw new HttpError(405, "method_not_allowed", "Method not allowed.", {
        Allow: candidates.map((r) => r.method).join(", "),
      })
    }
    if (request.method !== "GET") assertSameOrigin(request, env)
    const params = url.pathname.match(route.pattern).groups ?? {}
    return await route.handler({ request, env, ctx, url, params })
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: { code: err.code, message: err.message } }, err.status, err.headers)
    }
    // Log details server-side; the client only ever gets a generic message.
    console.error("unhandled", err?.stack ?? err)
    return json({ error: { code: "internal", message: "Something went wrong." } }, 500)
  }
}

export default {
  fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    if (pathname.startsWith("/api/")) return handle(request, env, ctx)
    return env.ASSETS.fetch(request)
  },
}
