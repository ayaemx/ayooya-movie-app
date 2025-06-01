import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import StarIcon from '@mui/icons-material/Star'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from "react-i18next"
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar({ onSearch, genres = [], selectedGenre, onGenreChange }) {
  const favoritesCount = useSelector(state => state.favorites.items.length)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(search)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/favorites" className="nav-icon-link" title={t("favorites")}>
          <StarIcon style={{ color: '#F7C948', fontSize: 30 }} />
          <span className="badge">{favoritesCount}</span>
        </Link>
        <Link to="/" className="logo">Ayooya</Link>
        <Link to="/" className="nav-link">{t("home")}</Link>
        <Link to="/favorites" className="nav-link">{t("favorites")}</Link>
      </div>
      <form className="nav-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="nav-search-input"
        />
        <button type="submit" className="nav-search-btn" title={t("search")}><SearchIcon /></button>
        <select
          className="nav-genre-dropdown"
          value={selectedGenre}
          onChange={e => onGenreChange(e.target.value)}
        >
          <option value="">{t("all_genres")}</option>
          {(Array.isArray(genres) ? genres : []).map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </form>
      <div className="nav-right">
        <Link to="/register" className="nav-link">{t("register")}</Link>
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
