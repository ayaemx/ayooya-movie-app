import React from 'react'
import MovieCard from '../components/MovieCard'

export default function Home() {
  // Replace with your real movies array later
  const movies = [
    {
      id: 1,
      title: "Inception",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
    },
    // Add more mock movies for testing
  ]

  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
