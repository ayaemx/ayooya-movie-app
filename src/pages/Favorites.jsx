import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeFavorite } from '../features/favorites/favoritesSlice'
import MovieCard from '../components/MovieCard'

export default function Favorites() {
  const favorites = useSelector(state => state.favorites.items)
  const dispatch = useDispatch()

  if (favorites.length === 0) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>No favorites yet.</div>
  }

  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {favorites.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
