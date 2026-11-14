import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { api } from "../api/client.js"
import { setChatOpen } from "../features/ui/uiSlice.js"
import { track } from "../lib/analytics.js"
import { posterUrl, yearOf } from "../lib/images.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import { CloseIcon, SendIcon, SparkIcon } from "./Icons.jsx"

/**
 * Ayooya Assistant. v1 matched keywords against the 20 movies already on screen;
 * v2 sends the message to /api/chat, where an LLM turns it into a real catalogue
 * search. Replies are rendered as plain text only — never as HTML.
 */
export default function ChatBot() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const isOpen = useSelector((s) => s.ui.chatOpen)
  const { open: openMovie } = useMovieParam()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const endRef = useRef(null)
  const launcherRef = useRef(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" })
  }, [messages, busy])

  const setOpen = (value) => {
    if (value) track("chat_open")
    dispatch(setChatOpen(value))
    if (!value) launcherRef.current?.focus()
  }

  const send = async (text) => {
    const message = text.trim()
    if (message.length < 2 || busy) return
    // Include the titles already shown, so "more like the second one" makes sense to the model.
    const history = messages
      .filter((m) => !m.error)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.movies?.length ? `${m.text}\n[Films shown: ${m.movies.map((x) => x.title).join("; ")}]` : m.text,
      }))
    setMessages((prev) => [...prev, { role: "user", text: message }])
    setInput("")
    setBusy(true)
    track("chat_message")
    try {
      const data = await api("/chat", { method: "POST", body: { message, history, lang: i18n.language } })
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply, movies: data.movies ?? [] }])
    } catch (err) {
      const text = err.status === 429 ? t("chat_rate_limited") : t("chat_error")
      setMessages((prev) => [...prev, { role: "assistant", text, error: true }])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const suggestions = [t("chat_s1"), t("chat_s2"), t("chat_s3"), t("chat_s4")]

  return (
    <>
      {isOpen && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <section
          className="chat"
          role="dialog"
          aria-label={t("chat_title")}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
          }}
        >
          <header className="chat-head">
            <span className="chat-avatar" aria-hidden="true">
              <SparkIcon size={18} />
            </span>
            <div>
              <h2>{t("chat_title")}</h2>
              <p>{t("chat_subtitle")}</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t("close")}>
              <CloseIcon size={18} />
            </button>
          </header>

          <div className="chat-log" role="log" aria-live="polite">
            <p className="bubble bubble-bot">{t("chat_welcome")}</p>
            {messages.length === 0 && (
              <ul className="chat-suggestions">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" className="chip chip-btn" onClick={() => send(s)}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "msg msg-user" : "msg"}>
                <p
                  className={`bubble ${m.role === "user" ? "bubble-user" : "bubble-bot"} ${m.error ? "bubble-error" : ""}`}
                >
                  {m.text}
                </p>
                {m.movies?.length > 0 && (
                  <ul className="chat-results">
                    {m.movies.map((movie) => (
                      <li key={movie.id}>
                        <button type="button" className="chat-movie" onClick={() => openMovie(movie.id)}>
                          {movie.poster_path && (
                            <img
                              src={posterUrl(movie.poster_path, "w185")}
                              alt=""
                              width="46"
                              height="69"
                              loading="lazy"
                            />
                          )}
                          <span>
                            <strong>{movie.title}</strong>
                            <small>
                              {[yearOf(movie), movie.vote_average > 0 && `★ ${movie.vote_average}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                            {movie.reason && <em>{movie.reason}</em>}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {busy && (
              <p className="bubble bubble-bot typing">
                <span className="sr-only">{t("chat_thinking")}</span>
                <i />
                <i />
                <i />
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <label className="sr-only" htmlFor="chat-input">
              {t("chat_placeholder")}
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat_placeholder")}
              maxLength={500}
              autoComplete="off"
            />
            <button
              type="submit"
              className="icon-btn chat-send"
              disabled={busy || input.trim().length < 2}
              aria-label={t("chat_send")}
            >
              <SendIcon size={18} />
            </button>
          </form>
        </section>
      )}
      {!isOpen && (
        <button
          type="button"
          ref={launcherRef}
          className="chat-launcher"
          onClick={() => setOpen(true)}
          aria-label={t("chat_open")}
        >
          <SparkIcon size={20} />
          <span>{t("chat_launcher")}</span>
        </button>
      )}
    </>
  )
}
