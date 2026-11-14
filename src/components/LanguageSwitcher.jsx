import { useTranslation } from "react-i18next"

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const next = i18n.language === "ar" ? "en" : "ar"
  return (
    <button
      type="button"
      className="btn btn-ghost lang-switch"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={`${t("language")}: ${next === "ar" ? "العربية" : "English"}`}
      lang={next}
    >
      {next === "ar" ? "العربية" : "EN"}
    </button>
  )
}
