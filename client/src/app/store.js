import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "../features/workspaceSlice";
import messagesReducer from "../features/messagesSlice";

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    messages: messagesReducer,
  },
});
