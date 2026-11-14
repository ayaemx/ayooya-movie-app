// Small HTTP helpers shared by every API route.

const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...API_HEADERS, ...headers },
  })
}

export class HttpError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message)
    this.status = status
    this.code = code
    this.headers = headers
  }
}

export const badRequest = (message, code = "bad_request") => new HttpError(400, code, message)

/** Parse a JSON body with a hard size cap, so nobody can post megabytes at us. */
export async function readJson(request, maxBytes = 16 * 1024) {
  const type = request.headers.get("Content-Type") ?? ""
  if (!type.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "unsupported_media_type", "Send JSON.")
  }
  const text = await request.text()
  if (text.length > maxBytes) {
    throw new HttpError(413, "too_large", "Request body is too large.")
  }
  try {
    const body = JSON.parse(text)
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("not an object")
    }
    return body
  } catch {
    throw badRequest("Body must be a JSON object.")
  }
}

/**
 * CSRF defence for state-changing requests: the browser-supplied Origin must be
 * this site (or an explicitly allowed dev origin). Combined with SameSite=Lax
 * cookies and the JSON-only body rule above.
 */
export function assertSameOrigin(request, env) {
  const origin = request.headers.get("Origin")
  if (!origin) {
    const site = request.headers.get("Sec-Fetch-Site")
    if (site && site !== "same-origin" && site !== "none") {
      throw new HttpError(403, "bad_origin", "Cross-site request blocked.")
    }
    return
  }
  const own = new URL(request.url).origin
  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (origin !== own && !allowed.includes(origin)) {
    throw new HttpError(403, "bad_origin", "Cross-site request blocked.")
  }
}

export function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") ?? "local"
}

export function parseCookies(request) {
  const out = {}
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const i = part.indexOf("=")
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

/** Strip control characters and trim; returns "" for non-strings. */
export function cleanText(value, max) {
  if (typeof value !== "string") return ""
  return value
    .replace(/\p{Cc}/gu, " ")
    .trim()
    .slice(0, max)
}
