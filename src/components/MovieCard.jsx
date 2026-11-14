import { useTranslation } from "react-i18next"
import { posterSrcSet, posterUrl, yearOf } from "../lib/images.js"
import { useMovieParam } from "../hooks/useMovieParam.js"
import FavoriteButton from "./FavoriteButton.jsx"
import { StarIcon } from "./Icons.jsx"

export default function MovieCard({ movie, reason }) {
  const { t } = useTranslation()
  const { open } = useMovieParam()

  return (
    <article className="card">
      <button
        type="button"
        className="card-poster"
        onClick={() => open(movie.id)}
        aria-label={t("details_for", { title: movie.title })}
      >
        {movie.poster_path ? (
          <img
            src={posterUrl(movie.poster_path)}
            srcSet={posterSrcSet(movie.poster_path)}
            sizes="(max-width: 600px) 40vw, 200px"
            alt=""
            width="342"
            height="513"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="card-fallback">{movie.title}</span>
        )}
      </button>
      <div className="card-body">
        <h3 className="card-title" title={movie.title}>
          {movie.title}
        </h3>
        <p className="card-meta">
          {yearOf(movie) && <span>{yearOf(movie)}</span>}
          {movie.vote_average > 0 && (
            <span className="rating" aria-label={t("rating", { n: movie.vote_average })}>
              <StarIcon size={12} /> {movie.vote_average}
            </span>
          )}
        </p>
        {reason && <p className="card-reason">{reason}</p>}
      </div>
      <FavoriteButton movie={movie} className="card-fav" />
    </article>
  )
}
