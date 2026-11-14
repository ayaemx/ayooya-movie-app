import { useId, useRef } from "react"
import { useTranslation } from "react-i18next"
import MovieCard from "./MovieCard.jsx"
import { RowSkeleton } from "./Skeletons.jsx"
import { ChevronIcon } from "./Icons.jsx"

export default function MovieRow({ title, movies = [], loading = false, variant = "wide" }) {
  const { t, i18n } = useTranslation()
  const track = useRef(null)
  const headingId = useId()
  if (!loading && movies.length === 0) return null

  // Scroll by roughly one screenful; direction flips for right-to-left layouts.
  const scroll = (direction) => {
    const el = track.current
    if (!el) return
    const sign = i18n.dir() === "rtl" ? -1 : 1
    el.scrollBy({ left: direction * sign * el.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <section className="row" aria-labelledby={headingId}>
      <div className="row-head">
        <h2 id={headingId}>{title}</h2>
        <div className="row-arrows">
          <button
            type="button"
            className="icon-btn row-prev"
            aria-label={`${t("scroll_back")}: ${title}`}
            onClick={() => scroll(-1)}
          >
            <ChevronIcon size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`${t("scroll_forward")}: ${title}`}
            onClick={() => scroll(1)}
          >
            <ChevronIcon size={18} />
          </button>
        </div>
      </div>
      {loading ? (
        <RowSkeleton variant={variant} />
      ) : (
        <ul className={`row-track row-${variant}`} ref={track}>
          {movies.map((m) => (
            <li key={m.id}>
              <MovieCard movie={m} variant={variant} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
