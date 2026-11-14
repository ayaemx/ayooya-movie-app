import { createSlice } from "@reduxjs/toolkit"

const uiSlice = createSlice({
  name: "ui",
  initialState: { chatOpen: false },
  reducers: {
    setChatOpen: (state, { payload }) => {
      state.chatOpen = payload
    },
  },
})

export const { setChatOpen } = uiSlice.actions
export default uiSlice.reducer
