import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMovies, searchMovies, filterByGenre } from '../features/movies/moviesSlice'
import { fetchGenres } from '../api/tmdb'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import MovieModal from '../components/MovieModel'
import YouTube from 'react-youtube'
import StarIcon from '@mui/icons-material/Star'
import MovieIcon from '@mui/icons-material/Movie'
import SearchIcon from '@mui/icons-material/Search'
import PublicIcon from '@mui/icons-material/Public'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'

const apiKey = import.meta.env.VITE_TMDB_API_KEY

export default function Home({ selectedGenre, searchTerm }) {
  const dispatch = useDispatch()
  const movies = useSelector(state => state.movies.items)
  const status = useSelector(state => state.movies.status)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [showTrailer, setShowTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const moviesPerPage = 6

  useEffect(() => {
    if (searchTerm) {
      dispatch(searchMovies(searchTerm))
    } else if (selectedGenre) {
      dispatch(filterByGenre(selectedGenre))
    } else {
      dispatch(fetchMovies())
    }
    setCurrentPage(1) // Reset to first page when search/filter changes
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

  // Fetch trailer for hero movie
  const fetchTrailer = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`
      )
      const data = await response.json()
      const trailer = data.results.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      )
      if (trailer) {
        setTrailerKey(trailer.key)
        setShowTrailer(true)
      }
    } catch (error) {
      console.error('Error fetching trailer:', error)
    }
  }

  // Hero navigation
  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
  }

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + Math.min(movies.length, 5)) % Math.min(movies.length, 5))
  }

  // Pagination logic
  const totalPages = Math.ceil(movies.length / moviesPerPage)
  const startIndex = (currentPage - 1) * moviesPerPage
  const currentMovies = movies.slice(startIndex, startIndex + moviesPerPage)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: document.querySelector('.main-movies-section').offsetTop - 100, behavior: 'smooth' })
  }

  if (status === 'loading') return <Loader />
  if (status === 'failed') return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>Failed to load movies.</div>

  const heroMovie = movies.length > 0 ? movies[heroIndex] : null
  const trendingMovies = movies.slice(0, 6)

  return (
    <>
      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="trailer-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-container" onClick={e => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setShowTrailer(false)}>
              <CloseIcon />
            </button>
            <YouTube
              videoId={trailerKey}
              opts={{
                width: '100%',
                height: '500px',
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                  rel: 0,
                  showinfo: 0,
                  modestbranding: 1,
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced Hero Section with Navigation */}
      {heroMovie && (
        <section className="hero-section">
          <img 
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.poster_path}`} 
            alt={heroMovie.title} 
            className="hero-bg" 
          />
          <div className="hero-overlay"></div>
          
          {/* Hero Navigation Arrows */}
          <button className="hero-nav hero-nav-left" onClick={prevHero}>
            <ChevronLeftIcon />
          </button>
          <button className="hero-nav hero-nav-right" onClick={nextHero}>
            <ChevronRightIcon />
          </button>

          <div className="hero-content">
            <div className="hero-badge">Featured Movie</div>
            <h1>{heroMovie.title}</h1>
            <div className="hero-meta">
              <span className="hero-rating">⭐ {heroMovie.vote_average?.toFixed(1)}</span>
              <span className="hero-year">{new Date(heroMovie.release_date).getFullYear()}</span>
            </div>
            <p>{heroMovie.overview}</p>
            <div className="hero-buttons">
              <button className="hero-btn primary" onClick={() => fetchTrailer(heroMovie.id)}>
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

      {/* Main Movies Section with Pagination */}
      <section className="main-movies-section">
        <div className="container">
          <h2>All Movies</h2>
          <div className="movie-grid">
            {currentMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onDetails={setSelectedMovie} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button 
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  )
}
