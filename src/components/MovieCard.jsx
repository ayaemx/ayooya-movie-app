import { useTranslation } from "react-i18next"
import { backdropUrl, posterSrcSet, posterUrl, yearOf } from "../lib/images.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import FavoriteButton from "./FavoriteButton.jsx"
import { StarIcon } from "./Icons.jsx"

/**
 * variant "wide": a 16:9 still with the title set over it (the default).
 * variant "poster": the tall theatrical poster with the title underneath.
 */
export default function MovieCard({ movie, reason, variant = "wide" }) {
  const { t } = useTranslation()
  const { open } = useMovieParam()
  const wide = variant === "wide"
  const still = wide ? backdropUrl(movie.backdrop_path, "w780") : null

  const meta = (
    <span className="card-meta">
      {yearOf(movie) && <span>{yearOf(movie)}</span>}
      {movie.vote_average > 0 && (
        <span className="rating" aria-label={t("rating", { n: movie.vote_average })}>
          <StarIcon size={11} /> {movie.vote_average}
        </span>
      )}
    </span>
  )

  return (
    <article className={`card card-${variant}`}>
      <button
        type="button"
        className="card-media"
        onClick={() => open(movie.id)}
        aria-label={t("details_for", { title: movie.title })}
      >
        {still ? (
          <img src={still} alt="" width="780" height="439" loading="lazy" decoding="async" />
        ) : movie.poster_path ? (
          <img
            src={posterUrl(movie.poster_path)}
            srcSet={posterSrcSet(movie.poster_path)}
            sizes="(max-width: 600px) 45vw, 230px"
            alt=""
            width="342"
            height="513"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="card-fallback">{movie.title}</span>
        )}
        {wide && (
          <>
            <span className="card-shade" aria-hidden="true" />
            <span className="card-caption">
              <span className="card-title">{movie.title}</span>
              {meta}
            </span>
          </>
        )}
      </button>
      {!wide && (
        <div className="card-below">
          <h3 className="card-title" title={movie.title}>
            {movie.title}
          </h3>
          {meta}
        </div>
      )}
      {reason && <p className="card-reason">{reason}</p>}
      <FavoriteButton movie={movie} className="card-fav" />
    </article>
  )
}
