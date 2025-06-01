import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModel'

export default function Favorites() {
  const favorites = useSelector(state => state.favorites.items)
  const [selectedMovie, setSelectedMovie] = useState(null)

  if (favorites.length === 0) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '3rem' }}>No favorites yet.</div>
  }

  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {favorites.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onDetails={setSelectedMovie} // Pass this prop for the Details button
          />
        ))}
      </div>
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  )
}
