import { createSlice } from '@reduxjs/toolkit'

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: []
  },
  reducers: {
    addFavorite: (state, action) => {
      if (!state.items.find(movie => movie.id === action.payload.id)) {
        state.items.push(action.payload)
      }
    },
    removeFavorite: (state, action) => {
      state.items = state.items.filter(movie => movie.id !== action.payload)
    }
  }
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions
export default favoritesSlice.reducer
