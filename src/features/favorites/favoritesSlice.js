import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../api/client.js"
import { load, save } from "../../lib/storage.js"

const LOCAL_KEY = "ayooya:list"

// Store only what a card needs, never the whole API object.
const compact = (m) => ({
  id: m.id,
  title: m.title,
  poster_path: m.poster_path ?? null,
  backdrop_path: m.backdrop_path ?? null,
  vote_average: m.vote_average ?? null,
  release_date: m.release_date ?? null,
})

/** Guests keep their list in this browser; signed-in users keep it in their account. */
export const syncFavorites = createAsyncThunk("favorites/sync", async (_, { getState }) => {
  if (!getState().auth.user) return load(LOCAL_KEY, [])
  const local = load(LOCAL_KEY, [])
  if (local.length) {
    // First sign-in on this device: move the guest list into the account.
    const { items } = await api("/favorites/merge", { method: "POST", body: { items: local } })
    save(LOCAL_KEY, [])
    return items
  }
  return (await api("/favorites")).items
})

export const toggleFavorite = createAsyncThunk("favorites/toggle", async (movie, { getState, dispatch }) => {
  const state = getState()
  const exists = state.favorites.items.some((m) => m.id === movie.id)
  dispatch(exists ? favoritesSlice.actions.removed(movie.id) : favoritesSlice.actions.added(compact(movie)))
  if (!state.auth.user) {
    save(LOCAL_KEY, getState().favorites.items)
    return
  }
  try {
    if (exists) await api(`/favorites/${movie.id}`, { method: "DELETE", body: {} })
    else await api(`/favorites/${movie.id}`, { method: "PUT", body: compact(movie) })
  } catch (err) {
    // Roll the optimistic change back if the server refused it.
    dispatch(exists ? favoritesSlice.actions.added(compact(movie)) : favoritesSlice.actions.removed(movie.id))
    throw err
  }
})

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: () => ({ items: load(LOCAL_KEY, []) }),
  reducers: {
    added: (state, { payload }) => {
      if (!state.items.some((m) => m.id === payload.id)) state.items.unshift(payload)
    },
    removed: (state, { payload }) => {
      state.items = state.items.filter((m) => m.id !== payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncFavorites.fulfilled, (state, { payload }) => {
      state.items = payload
    })
  },
})

export const selectIsFavorite = (id) => (state) => state.favorites.items.some((m) => m.id === id)
export default favoritesSlice.reducer
