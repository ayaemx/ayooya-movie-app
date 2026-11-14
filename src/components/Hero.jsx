import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { backdropSrcSet, backdropUrl, yearOf } from "../lib/images.js"
import { heroVariant, track } from "../lib/analytics.js"
import { setChatOpen } from "../features/ui/uiSlice.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import FavoriteButton from "./FavoriteButton.jsx"
import { InfoIcon, PlayIcon, SparkIcon, StarIcon } from "./Icons.jsx"

const ROTATE_MS = 9000

export default function Hero({ movies }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { open } = useMovieParam()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [variant] = useState(heroVariant)
  const slides = movies.slice(0, 5)
  const movie = slides[index % Math.max(slides.length, 1)]

  useEffect(() => track("hero_view", variant), [variant])

  // Auto-advance, but never for people who asked for reduced motion, and not while they interact.
  useEffect(() => {
    if (paused || slides.length < 2) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [paused, slides.length])

  if (!movie) return null
  const click = (action) => () => {
    track("hero_cta_click", variant)
    action()
  }
  const trailer = click(() => open(movie.id))
  const assistant = click(() => dispatch(setChatOpen(true)))

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t("featured")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <img
        key={movie.id}
        className="hero-backdrop"
        src={backdropUrl(movie.backdrop_path)}
        srcSet={backdropSrcSet(movie.backdrop_path)}
        sizes="100vw"
        alt=""
        width="1280"
        height="720"
        fetchPriority="high"
      />
      <div className="hero-shade" />
      <div className="hero-content" aria-live="polite">
        <p className="eyebrow">{t("featured")}</p>
        <h1>{movie.title}</h1>
        <p className="hero-meta">
          {movie.vote_average > 0 && (
            <span className="rating">
              <StarIcon size={14} /> {movie.vote_average}
            </span>
          )}
          {yearOf(movie) && <span>{yearOf(movie)}</span>}
        </p>
        <p className="hero-overview">{movie.overview || t("no_overview")}</p>
        <div className="hero-actions">
          {/* A/B test: does leading with the AI assistant earn more clicks than the trailer? */}
          {variant === "B" ? (
            <>
              <button type="button" className="btn btn-primary" onClick={assistant}>
                <SparkIcon size={18} /> {t("ask_ai")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={trailer}>
                <PlayIcon size={16} /> {t("watch_trailer")}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={trailer}>
                <PlayIcon size={16} /> {t("watch_trailer")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={trailer}>
                <InfoIcon size={18} /> {t("more_info")}
              </button>
            </>
          )}
          <FavoriteButton movie={movie} />
        </div>
      </div>
      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className={i === index ? "dot is-active" : "dot"}
              onClick={() => setIndex(i)}
              aria-label={t("hero_slide", { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
