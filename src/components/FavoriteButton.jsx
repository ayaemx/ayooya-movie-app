import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { selectIsFavorite, toggleFavorite } from "../features/favorites/favoritesSlice.js"
import { track } from "../lib/analytics.js"
import { CheckIcon, PlusIcon } from "./Icons.jsx"

export default function FavoriteButton({ movie, withLabel = false, className = "" }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const active = useSelector(selectIsFavorite(movie.id))
  const label = active ? t("remove_from_list") : t("add_to_list")

  const onClick = () => {
    if (!active) track("favorite_add")
    dispatch(toggleFavorite(movie))
  }

  return (
    <button
      type="button"
      className={`${withLabel ? "btn btn-secondary" : "icon-btn"} ${active ? "is-active" : ""} ${className}`}
      aria-pressed={active}
      aria-label={withLabel ? undefined : `${label}: ${movie.title}`}
      title={withLabel ? undefined : label}
      onClick={onClick}
    >
      {active ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
      {withLabel && <span>{active ? t("in_list") : t("my_list")}</span>}
    </button>
  )
}
