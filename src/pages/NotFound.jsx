import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="state">
      <title>{`${t("not_found_title")} — Ayooya`}</title>
      <h1>{t("not_found_title")}</h1>
      <p>{t("not_found_body")}</p>
      <Link to="/" className="btn btn-primary">
        {t("back_home")}
      </Link>
    </div>
  )
}
