import { useState, useEffect } from "react";
import api from "../configs/api";

// Simple client-side auth hooks that use localStorage + /auth/me
export const useAuth = () => {
  return {
    getToken: () => localStorage.getItem("token"),
    setToken: (t) => localStorage.setItem("token", t),
    clearToken: () => localStorage.removeItem("token"),
  };
};

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoaded(true);
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (mounted) {
          setUser(data.user || null);
        }
      } catch (e) {
        localStorage.removeItem("token");
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { user, isLoaded };
};

export const useClerk = () => ({
  openUserProfile: () => {},
  openCreateOrganization: () => {
    // navigate to create organization page
    try {
      window.location.href = "/create-organization";
    } catch (e) {
      // fallback
      window.location.assign("/create-organization");
    }
  },
});

export const useOrganizationList = (opts = {}) => {
  const [userMemberships, setUserMemberships] = useState({ data: [] });
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await api.get("/api/workspaces");
        if (!mounted) return;

        const mapped = (data?.workspaces || []).map((ws) => ({
          organization: {
            id: ws.id,
            imageUrl: ws.image_url || ws.imageUrl || "",
            name: ws.name,
            membersCount: ws.members?.length || 0,
          },
        }));

        setUserMemberships({ data: mapped });
      } catch (e) {
        setUserMemberships({ data: [] });
      } finally {
        if (mounted) setLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const setActive = ({ organization }) => {
    try {
      localStorage.setItem("currentWorkspace", organization);
    } catch (e) {}
  };

  return { setActive, userMemberships, isLoaded };
};

export const useOrganization = () => ({ organization: null });

import { useNavigate } from "react-router-dom";
import React from "react";

export const UserButton = () => {
  const { user, isLoaded } = useUser();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.clearToken();
    navigate("/signin");
  };

  if (!isLoaded) return null;

  if (!user) {
    return (
      <button
        onClick={() => navigate("/signin")}
        className="px-3 py-1 text-sm rounded bg-blue-600 text-white"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm hidden sm:block">{user.name}</span>
      <button
        onClick={handleLogout}
        className="px-3 py-1 text-sm rounded bg-red-600 text-white"
      >
        Logout
      </button>
    </div>
  );
};

export default {
  useAuth,
  useUser,
  useClerk,
  useOrganizationList,
  useOrganization,
  UserButton,
};
