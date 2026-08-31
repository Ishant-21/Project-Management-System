import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useUser, useAuth } from "../lib/auth";
import SignIn from "./SignIn";
import { fetchWorkspaces } from "../features/workspaceSlice";

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <Loader2Icon className="size-6 text-sky-500 animate-spin" />
  </div>
);

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading } = useSelector((state) => state.workspace);
  const dispatch = useDispatch();

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { pathname, search } = useLocation();
  const mainContentRef = useRef(null);
  // Shared with Sidebar so its outside-click handler can ignore presses on the
  // Navbar toggle - otherwise mousedown closed the panel and the button click
  // immediately reopened it, making the toggle unable to ever close.
  const sidebarTriggerRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [pathname, search]);

  // Load workspaces once per signed-in user. Keying on the user id rather than
  // `workspaces.length === 0` means a second account in the same tab does not
  // inherit the previous account cached workspaces.
  const userId = user?.id;
  useEffect(() => {
    if (isLoaded && userId) {
      dispatch(fetchWorkspaces({ getToken }));
    }
  }, [userId, isLoaded, dispatch, getToken]);

  // Auth state still resolving (/auth/me in flight) - show a loader instead of
  // briefly flashing the Sign-In form to already-authenticated users on reload.
  if (!isLoaded) return <Loader />;

  // SignIn already renders its own full-height centered layout.
  if (!user) return <SignIn />;

  if (loading) return <Loader />;

  // Allow authenticated users into the app even with no workspaces yet.
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        triggerRef={sidebarTriggerRef}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          triggerRef={sidebarTriggerRef}
        />

        {/* Scrim behind the sidebar drawer on mobile */}
        {isSidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 top-14 z-20 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main
          ref={mainContentRef}
          className="flex-1 min-w-0 overflow-y-auto bg-slate-50 px-5 py-6 sm:px-7 lg:px-9 lg:py-8"
        >
          <div className="max-w-[1240px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
