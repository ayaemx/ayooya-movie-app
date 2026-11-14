import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { useGetGenresQuery } from "../api/moviesApi.js"
import { backdropSrcSet, backdropUrl, yearOf } from "../lib/images.js"
import { heroVariant, track } from "../lib/analytics.js"
import { setChatOpen } from "../features/ui/uiSlice.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import FavoriteButton from "./FavoriteButton.jsx"
import { InfoIcon, PlayIcon, SparkIcon, StarIcon } from "./Icons.jsx"

const ROTATE_MS = 9000

export default function Hero({ movies }) {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { open } = useMovieParam()
  const { data: genres = [] } = useGetGenresQuery(i18n.language)
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
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS)
    return () => clearTimeout(timer)
  }, [paused, slides.length, index])

  if (!movie) return null
  const click = (action) => () => {
    track("hero_cta_click", variant)
    action()
  }
  const details = click(() => open(movie.id))
  const assistant = click(() => dispatch(setChatOpen(true)))
  const genreNames = movie.genre_ids
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2)

  return (
    <section
      className={paused ? "hero is-paused" : "hero"}
      aria-roledescription="carousel"
      aria-label={t("hero_next")}
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

      <div className="hero-content" key={`content-${movie.id}`} aria-live="polite">
        <h1>{movie.title}</h1>
        <p className="hero-meta">
          {movie.vote_average > 0 && (
            <span className="rating" aria-label={t("rating", { n: movie.vote_average })}>
              <StarIcon size={14} /> {movie.vote_average}
            </span>
          )}
          {yearOf(movie) && <span>{yearOf(movie)}</span>}
          {genreNames.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </p>
        <p className="hero-overview">{movie.overview || t("no_overview")}</p>
        <div className="hero-actions">
          {/* A/B test: does leading with the assistant earn more clicks than the trailer? */}
          {variant === "B" ? (
            <>
              <button type="button" className="btn btn-primary" onClick={assistant}>
                <SparkIcon size={18} /> {t("ask_ai")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={details}>
                <PlayIcon size={15} /> {t("watch_trailer")}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={details}>
                <PlayIcon size={15} /> {t("watch_trailer")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={details}>
                <InfoIcon size={18} /> {t("more_info")}
              </button>
            </>
          )}
          <FavoriteButton movie={movie} />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="filmstrip">
          {slides.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className={i === index ? "frame is-active" : "frame"}
              onClick={() => setIndex(i)}
              aria-label={`${t("hero_slide", { n: i + 1 })}: ${m.title}`}
              aria-current={i === index ? "true" : undefined}
            >
              <img src={backdropUrl(m.backdrop_path, "w300")} alt="" width="300" height="169" loading="lazy" />
              <span className="frame-progress" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
