import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ getToken }) => {
    try {
      const { data } = await api.get("/api/workspaces", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      return data.workspaces || [];
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
      return [];
    }
  }
);

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action) => {
      localStorage.setItem("currentWorkspaceId", action.payload);
      state.currentWorkspace = state.workspaces.find(
        (w) => w.id === action.payload
      );
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);

      // set current workspace to the new workspace
      if (state.currentWorkspace?.id !== action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    updateWorkspace: (state, action) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id ? action.payload : w
      );

      // if current workspace is updated, set it to the updated workspace
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(
        (w) => w.id !== action.payload
      );
      if (state.currentWorkspace?.id === action.payload) {
        state.currentWorkspace = state.workspaces[0] || null;
      }
    },
    // NOTE: currentWorkspace is always the same object reference as an entry in
    // `workspaces`. We therefore mutate the entry in `workspaces` and re-point
    // currentWorkspace at it, instead of updating both (which double-inserted).
    addProject: (state, action) => {
      const ws = state.workspaces.find(
        (w) => w.id === state.currentWorkspace?.id
      );
      if (!ws) return;
      ws.projects.push(action.payload);
      state.currentWorkspace = ws;
    },
    addTask: (state, action) => {
      const ws = state.workspaces.find(
        (w) => w.id === state.currentWorkspace?.id
      );
      if (!ws) return;
      const project = ws.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        if (!project.tasks) project.tasks = [];
        project.tasks.push(action.payload);
      }
      state.currentWorkspace = ws;
    },
    updateTask: (state, action) => {
      const ws = state.workspaces.find(
        (w) => w.id === state.currentWorkspace?.id
      );
      if (!ws) return;
      const project = ws.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        project.tasks = project.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
      }
      state.currentWorkspace = ws;
    },
    deleteTask: (state, action) => {
      // payload is an array of task ids
      const ids = action.payload;
      const ws = state.workspaces.find(
        (w) => w.id === state.currentWorkspace?.id
      );
      if (!ws) return;
      ws.projects.forEach((p) => {
        p.tasks = p.tasks.filter((t) => !ids.includes(t.id));
      });
      state.currentWorkspace = ws;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.workspaces = action.payload;

      if (action.payload.length > 0) {
        const localStorageCurrentWorkspaceId =
          localStorage.getItem("currentWorkspaceId");

        if (localStorageCurrentWorkspaceId) {
          const findWorkspace = action.payload.find(
            (w) => w.id === localStorageCurrentWorkspaceId
          );

          if (findWorkspace) {
            state.currentWorkspace = findWorkspace;
          } else {
            state.currentWorkspace = action.payload[0];
          }
        } else {
          state.currentWorkspace = action.payload[0];
        }
      }

      state.loading = false;
    });

    builder.addCase(fetchWorkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addProject,
  addTask,
  updateTask,
  deleteTask,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
