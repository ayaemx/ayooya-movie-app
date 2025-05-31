import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
// import Favorites from './pages/Favorites'
// import Login from './pages/Login'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Uncomment and add these pages when you create them: */}
        {/* <Route path="/favorites" element={<Favorites />} /> */}
         <Route path="/login" element={<Login />} />
       </Routes>
    </>
  )
}
