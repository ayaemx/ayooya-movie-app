// Cookieless, aggregate-only analytics. Sends just an event name (from a fixed
// list the server enforces) and the A/B variant. Honours Do Not Track / GPC.
import { load, save } from "./storage.js"

const optedOut = () =>
  typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true)

/** Stable 50/50 assignment for the hero experiment. */
export function heroVariant() {
  let v = load("ayooya:ab", null)
  if (v !== "A" && v !== "B") {
    v = Math.random() < 0.5 ? "A" : "B"
    save("ayooya:ab", v)
  }
  return v
}

export function track(name, variant = "") {
  if (optedOut() || import.meta.env.MODE === "test") return
  fetch("/api/events", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variant }),
  }).catch(() => {})
}
