import { configureStore } from "@reduxjs/toolkit"
import { moviesApi } from "../api/moviesApi.js"
import authReducer from "../features/auth/authSlice.js"
import favoritesReducer from "../features/favorites/favoritesSlice.js"
import uiReducer from "../features/ui/uiSlice.js"

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      favorites: favoritesReducer,
      ui: uiReducer,
      [moviesApi.reducerPath]: moviesApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(moviesApi.middleware),
  })

export const store = makeStore()
