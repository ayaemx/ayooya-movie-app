import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'

export default function Navbar() {
  const favoritesCount = useSelector(state => state.favorites.items.length)

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
      </div>
      <div className="nav-right">
        <BookmarkBorderIcon fontSize="medium" />
        <span className="badge">{favoritesCount}</span>
        <Link to="/login" className="nav-link">Login</Link>
      </div>
    </nav>
  )
}
