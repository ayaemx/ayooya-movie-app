import { useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useGetGenresQuery } from "../api/moviesApi.js"
import { logout } from "../features/auth/authSlice.js"
import { track } from "../lib/analytics.js"
import LanguageSwitcher from "./LanguageSwitcher.jsx"
import { SearchIcon } from "./Icons.jsx"

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const user = useSelector((s) => s.auth.user)
  const listCount = useSelector((s) => s.favorites.items.length)
  const { data: genres = [] } = useGetGenresQuery(i18n.language)
  const [query, setQuery] = useState(params.get("q") ?? "")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) return
    track("search")
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const genreValue = location.pathname === "/search" ? (params.get("genre") ?? "") : ""

  return (
    <header className={scrolled ? "nav is-solid" : "nav"}>
      <nav className="nav-inner" aria-label="Main">
        <Link to="/" className="logo" aria-label="Ayooya">
          <span className="logo-mark" aria-hidden="true" />
          ayooya
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              {t("home")}
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-list">
              {t("my_list")}
              {listCount > 0 && <span className="badge">{listCount}</span>}
            </NavLink>
          </li>
        </ul>

        <form className="nav-search" role="search" onSubmit={onSearch}>
          <label className="sr-only" htmlFor="nav-search">
            {t("search")}
          </label>
          <input
            id="nav-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            maxLength={100}
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" className="icon-btn" aria-label={t("search")}>
            <SearchIcon size={18} />
          </button>
        </form>

        <label className="sr-only" htmlFor="nav-genre">
          {t("browse_genre")}
        </label>
        <select
          id="nav-genre"
          className="nav-genre"
          value={genreValue}
          onChange={(e) => navigate(e.target.value ? `/search?genre=${e.target.value}` : "/")}
        >
          <option value="">{t("all_genres")}</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <div className="nav-end">
          <LanguageSwitcher />
          {user ? (
            <>
              <span className="avatar" title={user.name} aria-label={user.name}>
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => dispatch(logout())}>
                {t("sign_out")}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-small">
              {t("sign_in")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
