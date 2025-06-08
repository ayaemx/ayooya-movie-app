import React from 'react'
import { ClipLoader } from 'react-spinners'

export default function Loader({ message = "Loading amazing movies..." }) {
  return (
    <div className="enhanced-loader">
      <div className="loader-content">
        <ClipLoader
          color="#E50914"
          size={60}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <h3>{message}</h3>
        <p>Preparing your cinematic experience</p>
      </div>
    </div>
  )
}
