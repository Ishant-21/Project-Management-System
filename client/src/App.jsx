import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { fetchMessages } from "./features/messagesSlice";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreateOrganization from "./components/CreateOrganization";
import Settings from "./pages/Settings";

const App = () => {
  const dispatch = useDispatch();

  // Load the server message catalog once. Every piece of user-facing error or
  // permission copy is read from here or from a response, never hardcoded.
  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
          <Route path="create-organization" element={<CreateOrganization />} />
          <Route path="settings" element={<Settings />} />
          {/* Kept so older links and bookmarks still resolve. */}
          <Route path="profile" element={<Navigate to="/settings" replace />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
