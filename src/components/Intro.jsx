import { useEffect, useState } from "react"

const DURATION_MS = 3000
const SEEN_KEY = "ayooya:intro"

function shouldPlay() {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false
  } catch {
    return false
  }
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

/**
 * Ayooya's own audio signature, synthesised with the Web Audio API (no audio file):
 * a low swell under a rising three-note chime. Browsers only allow sound once the
 * visitor has interacted with the site, so when it is blocked the intro stays silent.
 */
function playIdent() {
  const AudioCtx = window.AudioContext ?? window.webkitAudioContext
  if (!AudioCtx) return () => {}
  const ctx = new AudioCtx()
  const start = () => {
    if (ctx.state !== "running") return
    const now = ctx.currentTime + 0.05
    const master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
    const tone = (freq, at, length, peak, type = "sine") => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + at)
      gain.gain.exponentialRampToValueAtTime(peak, now + at + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + length)
      osc.connect(gain).connect(master)
      osc.start(now + at)
      osc.stop(now + at + length + 0.05)
    }
    tone(73.42, 0, 2.6, 0.5) // low D swell
    tone(146.83, 0, 2.4, 0.18, "triangle")
    tone(587.33, 0.55, 1.6, 0.16) // D5
    tone(739.99, 0.8, 1.5, 0.14) // F#5
    tone(880.0, 1.05, 1.7, 0.16) // A5
  }
  if (ctx.state === "running") start()
  else ctx.resume().then(start, () => {})
  return () => ctx.close().catch(() => {})
}

/** A three-second brand moment shown once per visit; the site loads underneath it. */
export default function Intro() {
  const [visible, setVisible] = useState(shouldPlay)

  useEffect(() => {
    if (!visible) return
    try {
      sessionStorage.setItem(SEEN_KEY, "1")
    } catch {
      /* ignore */
    }
    const stopSound = playIdent()
    const done = () => setVisible(false)
    const timer = setTimeout(done, DURATION_MS)
    window.addEventListener("keydown", done)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", done)
      stopSound()
    }
  }, [visible])

  if (!visible) return null
  return (
    // Purely decorative: screen readers go straight to the page. Click or any key skips it.

    <div className="intro" aria-hidden="true" onClick={() => setVisible(false)}>
      <div className="intro-mark">
        {"ayooya".split("").map((letter, i) => (
          <span key={i} className={`intro-letter intro-letter-${i}`}>
            {letter}
          </span>
        ))}
        <span className="intro-dot" />
      </div>
      <span className="intro-line" />
    </div>
  )
}
