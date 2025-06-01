import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addFavorite, removeFavorite } from '../features/favorites/favoritesSlice'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'

export default function MovieCard({ movie }) {
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.favorites.items)
  const isFavorite = favorites.some(fav => fav.id === movie.id)
  const [hovered, setHovered] = useState(false)

  const handleBookmark = (e) => {
    e.stopPropagation()
    if (isFavorite) {
      dispatch(removeFavorite(movie.id))
    } else {
      dispatch(addFavorite(movie))
    }
  }

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="movie-poster"
      />
      {/* Movie title always visible, overlayed */}
      <div className="movie-title-overlay">
        <span>{movie.title}</span>
      </div>
      {/* Hover overlay */}
      {hovered && (
        <div className="movie-hover-overlay">
          <button className="bookmark-btn" onClick={handleBookmark}>
            {isFavorite ? (
              <BookmarkIcon style={{ color: '#E50914' }} />
            ) : (
              <BookmarkBorderIcon style={{ color: '#fff' }} />
            )} 
            </button>
            <button className="details-btn" onClick={() => onDetails(movie)}>
            Details
          </button>
          <button className="details-btn">
            Details
          </button>
        </div>
      )}
    </div>
  )
}
