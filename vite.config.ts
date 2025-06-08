import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ayooya-movie-app/',
  server: {
    open: true,
  },
  // Optional: Vitest config
  
})
