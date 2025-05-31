import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'

export default function Navbar() {
  const favoritesCount = useSelector(state => state.favorites.items.length)

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Logo styled like Netflix */}
        <Link to="/" className="logo" style={{
          fontWeight: 'bold',
          fontSize: '2rem',
          color: '#E50914',
          letterSpacing: '2px',
          textShadow: '1px 1px 8px #000'
        }}>
          Ayooya
        </Link>
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
