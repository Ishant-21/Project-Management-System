import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import api from "../configs/api";
import { AuthContext } from "./authContext";
import { useAuth, useUser } from "./authHooks";

// Loads the signed-in user exactly once for the whole tree. Every `useUser()`
// caller reads this shared record instead of issuing its own /auth/me.
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ user: null, isLoaded: false });
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      if (mountedRef.current) setState({ user: null, isLoaded: true });
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      if (mountedRef.current) {
        setState({ user: data.user || null, isLoaded: true });
      }
    } catch {
      localStorage.removeItem("token");
      if (mountedRef.current) setState({ user: null, isLoaded: true });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();

    // Re-read when another part of the app changes auth state (login/logout).
    const handleAuthChange = () => {
      setState((prev) => ({ ...prev, isLoaded: false }));
      load();
    };

    window.addEventListener("auth:change", handleAuthChange);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("auth:change", handleAuthChange);
    };
  }, [load]);

  return (
    <AuthContext.Provider
      value={{ user: state.user, isLoaded: state.isLoaded, refresh: load }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserButton = () => {
  const { user, isLoaded } = useUser();
  const auth = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);

  // Close the menu when clicking anywhere outside it.
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    auth.clearToken();
    navigate("/signin");
  };

  // Reserve the button footprint while auth resolves so the header does not
  // shift once the user arrives.
  if (!isLoaded) {
    return <div className="h-8 w-24 rounded-xl bg-white/5 animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => navigate("/signin")}
        className="text-[13px] font-semibold px-3.5 py-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
      >
        Sign in
      </button>
    );
  }

  const initial = (user.name?.[0] || "?").toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <span className="w-6 h-6 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/20 flex items-center justify-center text-[11px] font-bold text-white">
          {initial}
        </span>
        <span className="hidden sm:block text-[13px] font-semibold text-slate-200 max-w-24 truncate">
          {user.name?.split(" ")[0] || "Account"}
        </span>
        <ChevronDown size={13} className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="label-micro text-slate-400 mb-1">Signed in as</p>
            <p className="text-[13px] font-bold text-slate-800 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/settings");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <SettingsIcon size={14} strokeWidth={2} className="text-slate-400" />
            Settings
          </button>

          <div className="p-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={14} strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
