import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovies, searchMovies, filterByGenre } from '../features/movies/moviesSlice'
import { fetchGenres } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import MovieModal from '../components/MovieModel' // Fixed typo: MovieModel -> MovieModal

const apiKey = import.meta.env.VITE_TMDB_API_KEY

export default function Home({ selectedGenre, searchTerm }) {
  const dispatch = useDispatch()
  const movies = useSelector(state => state.movies.items)
  const status = useSelector(state => state.movies.status)
  const [selectedMovie, setSelectedMovie] = useState(null)

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchMovies(searchTerm))
    } else if (selectedGenre) {
      dispatch(filterByGenre(selectedGenre))
    } else {
      dispatch(fetchMovies())
    }
  }, [dispatch, selectedGenre, searchTerm])

  if (status === 'loading') return <Loader />
  if (status === 'failed') return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>Failed to load movies.</div>

  const heroMovie = movies.length > 0 ? movies[0] : null

  return (
    <>
      {heroMovie && (
        <section className="hero-section">
          <img 
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path}`} 
            alt={heroMovie.title} 
            className="hero-bg" 
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{heroMovie.title}</h1>
            <p>{heroMovie.overview}</p>
            <button className="hero-btn" onClick={() => setSelectedMovie(heroMovie)}>More Info</button>
          </div>
        </section>
      )}
      <div className="movie-grid-container">
        <div className="movie-grid">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onDetails={setSelectedMovie} />
          ))}
        </div>
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      </div>
    </>
  )
}
