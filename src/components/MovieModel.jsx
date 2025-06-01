import React from 'react'

export default function MovieModal({ movie, onClose }) {
  if (!movie) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{ width: '200px', borderRadius: '10px', marginBottom: '1rem' }}
        />
        <h2 style={{ color: '#E50914' }}>{movie.title}</h2>
        <p style={{ color: '#fff' }}>{movie.overview}</p>
        <div style={{ color: '#aaa', marginTop: '1rem' }}>
          <strong>Release Date:</strong> {movie.release_date}
        </div>
        <div style={{ color: '#aaa' }}>
          <strong>Rating:</strong> {movie.vote_average}
        </div>
      </div>
    </div>
  )
}
