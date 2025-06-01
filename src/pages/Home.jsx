import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovies } from '../features/movies/moviesSlice'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'

export default function Home() {
  const dispatch = useDispatch()
  const movies = useSelector(state => state.movies.items)
  const status = useSelector(state => state.movies.status)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMovies())
    }
  }, [dispatch, status])

  if (status === 'loading') {
    return <Loader />
  }

  if (status === 'failed') {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>Failed to load movies.</div>
  }

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
