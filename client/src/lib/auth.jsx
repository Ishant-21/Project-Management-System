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

    // Load once on mount
    load();

    // Re-load when other parts of the app dispatch an auth change (login/logout)
    const handleAuthChange = () => {
      // reset loaded flag while refreshing
      if (mounted) setLoaded(false);
      load();
    };

    window.addEventListener("auth:change", handleAuthChange);

    return () => {
      mounted = false;
      window.removeEventListener("auth:change", handleAuthChange);
    };
  }, []);

  return { user, isLoaded };
};

export const useClerk = () => ({
  openUserProfile: () => {
    try {
      // Navigate to the app's profile page (fallback for Clerk-hosted profile)
      window.location.href = "/profile";
    } catch (e) {
      window.location.assign("/profile");
    }
  },
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
      // store the workspace id under the same key the redux slice reads
      const id = typeof organization === "string" ? organization : organization?.id;
      if (id) localStorage.setItem("currentWorkspaceId", id);
    } catch (e) {}
  };

  return { setActive, userMemberships, isLoaded };
};

export const useOrganization = () => {
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    // Provide a lightweight organization object backed by localStorage
    const workspaceId = localStorage.getItem("currentWorkspaceId");

    if (!workspaceId) {
      setOrganization(null);
      return;
    }

    const org = {
      id: workspaceId,
      inviteMember: async ({ emailAddress, role, message } = {}) => {
        if (!emailAddress || !role) {
          throw new Error("Missing email or role");
        }

        // Map client role values to server role values
        const mappedRole = role === "org:admin" ? "ADMIN" : "MEMBER";

        const body = {
          email: emailAddress,
          role: mappedRole,
          workspaceId,
          message: message || "",
        };

        const res = await api.post("/api/workspaces/add-member", body);
        return res.data;
      },
    };

    setOrganization(org);
  }, []);

  return { organization };
};

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
