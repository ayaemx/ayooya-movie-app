import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../api/client.js"

const asThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return (await fn(arg)).user ?? null
    } catch (err) {
      return rejectWithValue({ code: err.code, message: err.message })
    }
  })

export const fetchMe = asThunk("auth/me", () => api("/auth/me"))
export const login = asThunk("auth/login", (body) => api("/auth/login", { method: "POST", body }))
export const register = asThunk("auth/register", (body) => api("/auth/register", { method: "POST", body }))
export const logout = asThunk("auth/logout", () => api("/auth/logout", { method: "POST", body: {} }))

const authSlice = createSlice({
  name: "auth",
  // The session lives in an HttpOnly cookie; JavaScript only ever sees the user's name/email.
  initialState: { user: null, ready: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload
        state.ready = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.ready = true
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.user = payload
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.user = payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export default authSlice.reducer
