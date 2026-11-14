import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetMovieQuery } from "../api/moviesApi.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import { backdropUrl, posterUrl, yearOf } from "../lib/images.js"
import { track } from "../lib/analytics.js"
import FavoriteButton from "./FavoriteButton.jsx"
import MovieCard from "./MovieCard.jsx"
import { CloseIcon, PlayIcon, StarIcon } from "./Icons.jsx"

function Details({ movie }) {
  const { t } = useTranslation()
  const [playing, setPlaying] = useState(false)
  const image = backdropUrl(movie.backdrop_path, "w780") ?? posterUrl(movie.poster_path, "w500")

  return (
    <>
      <div className="modal-media">
        {playing && movie.trailer_key ? (
          // youtube-nocookie.com: no tracking cookies until the viewer presses play.
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${movie.trailer_key}?autoplay=1&rel=0`}
            title={`${movie.title} — trailer`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <>
            {image && <img src={image} alt="" width="780" height="439" />}
            <div className="modal-media-shade" />
          </>
        )}
      </div>
      <div className={playing && movie.trailer_key ? "modal-body is-playing" : "modal-body"}>
        <h2 id="movie-dialog-title">{movie.title}</h2>
        {movie.tagline && <p className="tagline">{movie.tagline}</p>}
        <p className="modal-meta">
          {movie.vote_average > 0 && (
            <span className="rating" aria-label={t("rating", { n: movie.vote_average })}>
              <StarIcon size={14} /> {movie.vote_average}
            </span>
          )}
          {yearOf(movie) && <span>{yearOf(movie)}</span>}
          {movie.runtime > 0 && <span>{t("minutes", { n: movie.runtime })}</span>}
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g} className="chip">
              {g}
            </span>
          ))}
        </p>
        <div className="modal-actions">
          {movie.trailer_key ? (
            !playing && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setPlaying(true)
                  track("trailer_play")
                }}
              >
                <PlayIcon size={16} /> {t("watch_trailer")}
              </button>
            )
          ) : (
            <span className="muted">{t("no_trailer")}</span>
          )}
          <FavoriteButton movie={movie} withLabel />
        </div>
        <p className="overview">{movie.overview || t("no_overview")}</p>
        {movie.recommendations?.length > 0 && (
          <section aria-labelledby="more-like-this">
            <h3 id="more-like-this">{t("more_like_this")}</h3>
            <ul className="grid grid-compact">
              {movie.recommendations.slice(0, 8).map((m) => (
                <li key={m.id}>
                  <MovieCard movie={m} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

export default function MovieModal() {
  const { t, i18n } = useTranslation()
  const { id, close } = useMovieParam()
  const dialog = useRef(null)
  const { data, isFetching, isError, refetch } = useGetMovieQuery({ id, lang: i18n.language }, { skip: !id })

  // The native <dialog> gives us a focus trap, Esc-to-close and focus return for free.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (id && !el.open) {
      if (typeof el.showModal === "function") el.showModal()
      else el.setAttribute("open", "")
      track("details_open")
    } else if (!id && el.open) {
      el.close?.()
    }
  }, [id])

  const onClose = () => {
    if (id) close()
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="movie-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose()
      }}
    >
      {id && (
        <div className="modal-panel">
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label={t("close")}>
            <CloseIcon />
          </button>
          {isError ? (
            <div className="state">
              <h2 id="movie-dialog-title">{t("load_failed")}</h2>
              <button type="button" className="btn btn-secondary" onClick={refetch}>
                {t("retry")}
              </button>
            </div>
          ) : !data || (isFetching && data.id !== id) ? (
            <div className="modal-loading" aria-busy="true">
              <div className="modal-media skeleton" />
              <h2 id="movie-dialog-title" className="sr-only">
                {t("chat_thinking")}
              </h2>
            </div>
          ) : (
            <Details key={data.id} movie={data} />
          )}
        </div>
      )}
    </dialog>
  )
}
