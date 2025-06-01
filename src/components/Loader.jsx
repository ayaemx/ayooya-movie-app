import React from 'react'
import { ClipLoader } from 'react-spinners'

export default function Loader({ size = 60, color = '#E50914' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '40vh'
    }}>
      <ClipLoader size={size} color={color} />
    </div>
  )
}
