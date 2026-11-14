import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import MovieCard from "../components/MovieCard.jsx"

export default function Favorites() {
  const { t } = useTranslation()
  const items = useSelector((s) => s.favorites.items)
  const user = useSelector((s) => s.auth.user)

  return (
    <div className="page">
      <title>{`${t("my_list")} — Ayooya`}</title>
      <h1>{t("my_list")}</h1>
      {!user && items.length > 0 && (
        <p className="note">
          {t("list_guest_note")} <Link to="/login">{t("sign_in")}</Link>
        </p>
      )}
      {items.length === 0 ? (
        <div className="state">
          <h2>{t("list_empty_title")}</h2>
          <p>{t("list_empty_body")}</p>
          <Link to="/" className="btn btn-primary">
            {t("browse_movies")}
          </Link>
        </div>
      ) : (
        <ul className="grid">
          {items.map((m) => (
            <li key={m.id}>
              <MovieCard movie={m} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
