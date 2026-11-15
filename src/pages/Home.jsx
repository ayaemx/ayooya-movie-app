import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useGetListQuery } from "../api/moviesApi.js"
import Hero from "../components/Hero.jsx"
import MovieRow from "../components/MovieRow.jsx"
import { HeroSkeleton } from "../components/Skeletons.jsx"

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const myList = useSelector((s) => s.favorites.items)
  const trending = useGetListQuery({ kind: "trending", lang })
  const popular = useGetListQuery({ kind: "popular", lang })
  const topRated = useGetListQuery({ kind: "top-rated", lang })
  const upcoming = useGetListQuery({ kind: "upcoming", lang })

  if (trending.isError) {
    return (
      <div className="state" role="alert">
        <h1>{t("load_failed")}</h1>
        <button type="button" className="btn btn-primary" onClick={trending.refetch}>
          {t("retry")}
        </button>
      </div>
    )
  }

  const featured = (trending.data ?? []).filter((m) => m.backdrop_path)

  return (
    <>
      <title>{`Ayooya — ${t("brand_tagline")}`}</title>
      {trending.isLoading ? <HeroSkeleton /> : <Hero movies={featured} />}
      <div className="rows">
        <MovieRow
          title={t("row_top10")}
          movies={(trending.data ?? []).slice(0, 10)}
          loading={trending.isLoading}
          variant="poster"
          ranked
        />
        <MovieRow title={t("row_my_list")} movies={myList} />
        <MovieRow title={t("row_popular")} movies={popular.data} loading={popular.isLoading} />
        <MovieRow title={t("row_top_rated")} movies={topRated.data} loading={topRated.isLoading} />
        <MovieRow title={t("row_upcoming")} movies={upcoming.data} loading={upcoming.isLoading} variant="poster" />
      </div>
    </>
  )
}
