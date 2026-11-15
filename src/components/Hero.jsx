import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"
import { useGetGenresQuery, useGetMovieQuery } from "../api/moviesApi.js"
import { backdropSrcSet, backdropUrl, yearOf } from "../lib/images.js"
import { heroVariant, track } from "../lib/analytics.js"
import { setChatOpen } from "../features/ui/uiSlice.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import FavoriteButton from "./FavoriteButton.jsx"
import { InfoIcon, MuteIcon, PlayIcon, SparkIcon, StarIcon, VolumeIcon } from "./Icons.jsx"

const STILL_MS = 9000 // a slide with no trailer
const TRAILER_MS = 32000 // a slide whose trailer is playing
const TRAILER_DELAY_MS = 2500 // show the still first, then bring the trailer in
const PLAYER = "https://www.youtube-nocookie.com"

/** Background video is a nice-to-have: skip it on small screens, for reduced motion, and on data saver. */
function allowsVideo() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  if (!window.matchMedia("(min-width: 900px)").matches) return false
  return !navigator.connection?.saveData
}

export default function Hero({ movies }) {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { id: openMovieId, open } = useMovieParam()
  const { data: genres = [] } = useGetGenresQuery(i18n.language)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [videoOn, setVideoOn] = useState(false)
  const [muted, setMuted] = useState(true)
  const [inView, setInView] = useState(true)
  const [variant] = useState(heroVariant)
  const section = useRef(null)
  const player = useRef(null)
  const slides = movies.slice(0, 5)
  const movie = slides[index % Math.max(slides.length, 1)]

  // The trailer key comes from the film's detail record (cached by RTK Query).
  const { data: details } = useGetMovieQuery({ id: movie?.id, lang: i18n.language }, { skip: !movie })
  const trailerKey = details?.id === movie?.id ? details.trailer_key : null
  const canPlay = Boolean(trailerKey) && inView && !openMovieId && allowsVideo()

  useEffect(() => track("hero_view", variant), [variant])

  // Only play while the hero is actually on screen.
  useEffect(() => {
    const el = section.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Start the trailer a moment after the slide appears; stop it whenever it can't play.
  useEffect(() => {
    setVideoOn(false)
    setMuted(true)
    if (!canPlay) return
    const timer = setTimeout(() => setVideoOn(true), TRAILER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [canPlay, index])

  // Auto-advance, but not while the visitor is interacting or has asked for reduced motion.
  const dwell = canPlay ? TRAILER_MS : STILL_MS
  useEffect(() => {
    if (paused || slides.length < 2) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), dwell)
    return () => clearTimeout(timer)
  }, [paused, slides.length, index, dwell])

  if (!movie) return null

  const toggleSound = () => {
    // The embedded player accepts commands as messages; no extra script is loaded.
    const func = muted ? "unMute" : "mute"
    player.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), PLAYER)
    setMuted(!muted)
  }
  const click = (action) => () => {
    track("hero_cta_click", variant)
    action()
  }
  const showDetails = click(() => open(movie.id))
  const assistant = click(() => dispatch(setChatOpen(true)))
  const genreNames = movie.genre_ids
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2)

  return (
    <section
      ref={section}
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
      {videoOn && canPlay && (
        <iframe
          ref={player}
          key={trailerKey}
          className="hero-video"
          src={`${PLAYER}/embed/${trailerKey}?autoplay=1&mute=1&start=6&controls=0&playsinline=1&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
          title={`${movie.title} trailer`}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      <div className="hero-shade" />

      {videoOn && canPlay && (
        <button
          type="button"
          className="icon-btn hero-sound"
          onClick={toggleSound}
          aria-label={t(muted ? "sound_on" : "sound_off")}
        >
          {muted ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
        </button>
      )}

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
              <button type="button" className="btn btn-secondary" onClick={showDetails}>
                <PlayIcon size={15} /> {t("watch_trailer")}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={showDetails}>
                <PlayIcon size={15} /> {t("watch_trailer")}
              </button>
              <button type="button" className="btn btn-secondary" onClick={showDetails}>
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
              style={i === index ? { "--rotate": `${dwell}ms` } : undefined}
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
