import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const apiKey = import.meta.env.VITE_TMDB_API_KEY

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
    )
    const data = await response.json()
    return data.results
  }
)

// ADD THIS THUNK:
export const filterByGenre = createAsyncThunk(
  'movies/filterByGenre',
  async (genreId) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=en-US&page=1`
    )
    const data = await response.json()
    return data.results
  }
)

// (Optional) Add a searchMovies thunk if you want search:
export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async (query) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    )
    const data = await response.json()
    return data.results
  }
)

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Add genre filter cases
      .addCase(filterByGenre.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(filterByGenre.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(filterByGenre.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Add search cases
      .addCase(searchMovies.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

export default moviesSlice.reducer
