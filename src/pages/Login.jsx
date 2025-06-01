import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Replace this with real authentication logic
    if (email === 'test@example.com' && password === 'password') {
      setError('')
      navigate('/', { replace: true })
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {location.state && location.state.registered && (
          <div style={{ color: '#4ade80', marginBottom: '1rem', textAlign: 'center' }}>
            Registration successful! Please log in.
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit">Login</button>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#fff' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: '#E50914', textDecoration: 'underline' }}>Register</Link>
        </div>
      </form>
    </div>
  )
}
