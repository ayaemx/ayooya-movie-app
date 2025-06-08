import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Register from './pages/Register'
import ErrorBoundary from './components/ErrorBoundary'
import { fetchGenres } from './api/tmdb'

const apiKey = import.meta.env.VITE_TMDB_API_KEY

export default function App() {
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchGenres(apiKey).then(setGenres).catch(console.error)
  }, [])

  const handleSearch = (query) => setSearchTerm(query)
  const handleGenreChange = (genreId) => setSelectedGenre(genreId)

  return (
    <ErrorBoundary>
      <Navbar
        onSearch={handleSearch}
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={handleGenreChange}
      />
      <Routes>
        <Route path="/"
          element={
            <Home
              selectedGenre={selectedGenre}
              searchTerm={searchTerm}
            />
          }
        />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </ErrorBoundary>
  )
}
