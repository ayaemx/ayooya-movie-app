import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovies, searchMovies, filterByGenre } from '../features/movies/moviesSlice'
import { fetchGenres } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import MovieModal from '../components/MovieModel'
import StarIcon from '@mui/icons-material/Star'
import MovieIcon from '@mui/icons-material/Movie'
import SearchIcon from '@mui/icons-material/Search'
import PublicIcon from '@mui/icons-material/Public'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

const apiKey = import.meta.env.VITE_TMDB_API_KEY

export default function Home({ selectedGenre, searchTerm }) {
  const dispatch = useDispatch()
  const movies = useSelector(state => state.movies.items)
  const status = useSelector(state => state.movies.status)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchMovies(searchTerm))
    } else if (selectedGenre) {
      dispatch(filterByGenre(selectedGenre))
    } else {
      dispatch(fetchMovies())
    }
  }, [dispatch, selectedGenre, searchTerm])

  // Auto-rotate hero every 8 seconds
  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [movies])

  if (status === 'loading') return <Loader />
  if (status === 'failed') return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>Failed to load movies.</div>

  const heroMovie = movies.length > 0 ? movies[heroIndex] : null
  const trendingMovies = movies.slice(0, 6)

  return (
    <>
      {/* Enhanced Hero Section */}
      {heroMovie && (
        <section className="hero-section">
          <img 
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path}`} 
            alt={heroMovie.title} 
            className="hero-bg" 
          />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge">Featured Movie</div>
            <h1>{heroMovie.title}</h1>
            <div className="hero-meta">
              <span className="hero-rating">⭐ {heroMovie.vote_average?.toFixed(1)}</span>
              <span className="hero-year">{new Date(heroMovie.release_date).getFullYear()}</span>
            </div>
            <p>{heroMovie.overview}</p>
            <div className="hero-buttons">
              <button className="hero-btn primary" onClick={() => setSelectedMovie(heroMovie)}>
                <PlayArrowIcon /> Watch Trailer
              </button>
              <button className="hero-btn secondary" onClick={() => setSelectedMovie(heroMovie)}>
                More Info
              </button>
            </div>
          </div>
          <div className="hero-indicators">
            {movies.slice(0, 5).map((_, index) => (
              <div 
                key={index}
                className={`hero-indicator ${index === heroIndex ? 'active' : ''}`}
                onClick={() => setHeroIndex(index)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Ayooya Section */}
      <section className="why-ayooya-section">
        <div className="container">
          <h2>Why Choose Ayooya?</h2>
          <p className="section-subtitle">The ultimate destination for movie lovers worldwide</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MovieIcon />
              </div>
              <h3>Vast Movie Library</h3>
              <p>Access thousands of movies from every genre, era, and country</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <SearchIcon />
              </div>
              <h3>Smart Discovery</h3>
              <p>Find your next favorite with our advanced search and filtering</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <StarIcon />
              </div>
              <h3>Personal Favorites</h3>
              <p>Create your own watchlist and bookmark movies you love</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <PublicIcon />
              </div>
              <h3>Global Content</h3>
              <p>Enjoy movies from around the world with multi-language support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2><TrendingUpIcon /> Trending Now</h2>
            <p>Discover what's popular today</p>
          </div>
          <div className="trending-grid">
            {trendingMovies.map((movie, index) => (
              <div key={movie.id} className="trending-card" onClick={() => setSelectedMovie(movie)}>
                <div className="trending-rank">#{index + 1}</div>
                <img 
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                  alt={movie.title}
                  className="trending-poster"
                />
                <div className="trending-info">
                  <h4>{movie.title}</h4>
                  <p>⭐ {movie.vote_average?.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="what-we-offer-section">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="offer-grid">
            <div className="offer-item">
              <h3>🎬 Latest Releases</h3>
              <p>Stay updated with the newest movies hitting the screens</p>
            </div>
            <div className="offer-item">
              <h3>🏆 Award Winners</h3>
              <p>Explore critically acclaimed and award-winning films</p>
            </div>
            <div className="offer-item">
              <h3>🌟 Hidden Gems</h3>
              <p>Discover underrated movies you might have missed</p>
            </div>
            <div className="offer-item">
              <h3>🎭 All Genres</h3>
              <p>From action to romance, find movies for every mood</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Movie Grid */}
      <section className="main-movies-section">
        <div className="container">
          <h2>All Movies</h2>
          <div className="movie-grid">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onDetails={setSelectedMovie} />
            ))}
          </div>
        </div>
      </section>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  )
}
