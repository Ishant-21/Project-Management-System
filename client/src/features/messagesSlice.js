import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api";

// The client defines no message text of its own. Error and success copy comes
// off the `message` field of each response; the copy needed *before* a request
// (tooltips on controls the current user isn't permitted to use, empty states)
// comes from this catalog, served by GET /api/messages.
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async () => {
    const { data } = await api.get("/api/messages");
    return data.messages || {};
  }
);

const messagesSlice = createSlice({
  name: "messages",
  // `catalog` starts empty on purpose: a missing key renders nothing rather
  // than a hardcoded fallback, so no copy can quietly drift back into the client.
  initialState: { catalog: {}, loaded: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.catalog = action.payload;
        state.loaded = true;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loaded = true;
      });
  },
});

export default messagesSlice.reducer;
