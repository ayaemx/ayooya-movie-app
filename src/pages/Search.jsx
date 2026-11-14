import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useDiscoverQuery, useGetGenresQuery, useSearchQuery } from "../api/moviesApi.js"
import MovieCard from "../components/MovieCard.jsx"
import { CardSkeleton } from "../components/Skeletons.jsx"
import { ChevronIcon } from "../components/Icons.jsx"

export default function Search() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [params, setParams] = useSearchParams()
  const q = (params.get("q") ?? "").trim()
  const genre = params.get("genre") ?? ""
  const page = Math.min(50, Math.max(1, Number(params.get("page")) || 1))

  const { data: genres = [] } = useGetGenresQuery(lang)
  const byQuery = useSearchQuery({ q, lang, page }, { skip: q.length < 2 })
  const byGenre = useDiscoverQuery({ genre, lang, page }, { skip: q.length >= 2 || !genre })
  const result = q.length >= 2 ? byQuery : byGenre
  const movies = result.data ?? []
  const heading =
    q.length >= 2 ? t("results_for", { q }) : (genres.find((g) => String(g.id) === genre)?.name ?? t("browse_genre"))

  const goTo = (next) => {
    const copy = new URLSearchParams(params)
    copy.set("page", String(next))
    setParams(copy)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="page">
      <title>{`${heading} — Ayooya`}</title>
      <h1>{heading}</h1>
      {result.isError ? (
        <div className="state" role="alert">
          <p>{t("load_failed")}</p>
          <button type="button" className="btn btn-secondary" onClick={result.refetch}>
            {t("retry")}
          </button>
        </div>
      ) : result.isFetching ? (
        <div className="grid" aria-busy="true">
          {Array.from({ length: 12 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <p className="state">{t("no_results")}</p>
      ) : (
        <>
          <ul className="grid">
            {movies.map((m) => (
              <li key={m.id}>
                <MovieCard movie={m} />
              </li>
            ))}
          </ul>
          <nav className="pager" aria-label="Pagination">
            <button
              type="button"
              className="icon-btn row-prev"
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
              aria-label={t("scroll_back")}
            >
              <ChevronIcon size={18} />
            </button>
            <span aria-current="page">{page}</span>
            <button
              type="button"
              className="icon-btn"
              disabled={movies.length < 15}
              onClick={() => goTo(page + 1)}
              aria-label={t("scroll_forward")}
            >
              <ChevronIcon size={18} />
            </button>
          </nav>
        </>
      )}
    </div>
  )
}
