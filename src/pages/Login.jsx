import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
// import { login } from '../features/auth/authSlice' // for real auth

export default function Login() {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Example static login (replace with real API or Redux logic)
    if (email === 'test@example.com' && password === 'password') {
      // dispatch(login({ email })) // for real auth
      setError('')
      alert('Login successful! (implement real auth for production)')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
      </form>
    </div>
  )
}
