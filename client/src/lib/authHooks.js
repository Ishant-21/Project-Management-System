import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import { AuthContext } from "./authContext";

// Simple client-side auth helpers backed by localStorage + /auth/me
export const useAuth = () => {
  return useMemo(
    () => ({
      getToken: () => localStorage.getItem("token"),
      setToken: (t) => localStorage.setItem("token", t),
      clearToken: () => {
        localStorage.removeItem("token");
        // Let AuthProvider drop the cached user so the UI reacts immediately.
        window.dispatchEvent(new Event("auth:change"));
      },
    }),
    []
  );
};

// Reads the single user record loaded once by <AuthProvider>. Previously every
// caller kept its own state and fired its own /auth/me, which meant ~15 parallel
// requests per page load and a navbar that popped in late.
export const useUser = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useUser must be used within <AuthProvider>");
  }

  return ctx;
};

export const useClerk = () => {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      openUserProfile: () => navigate("/settings"),
      openCreateOrganization: () => navigate("/create-organization"),
    }),
    [navigate]
  );
};

// Workspace list for the switcher. Derived from the Redux store that Layout
// already populates — it used to run a second /api/workspaces request of its
// own, so the dropdown and the rest of the app could disagree.
export const useOrganizationList = () => {
  const { workspaces, loading } = useSelector((state) => state.workspace);

  const setActive = useCallback(({ organization }) => {
    const id =
      typeof organization === "string" ? organization : organization?.id;
    if (id) localStorage.setItem("currentWorkspaceId", id);
  }, []);

  const userMemberships = useMemo(
    () => ({
      data: (workspaces || []).map((ws) => ({
        organization: {
          id: ws.id,
          imageUrl: ws.image_url || ws.imageUrl || "/workspace.svg",
          name: ws.name,
          membersCount: ws.members?.length || 0,
        },
      })),
    }),
    [workspaces]
  );

  return { setActive, userMemberships, isLoaded: !loading };
};

export const useOrganization = () => {
  const [organization, setOrganization] = useState(null);
  // Prefer the live workspace from Redux; fall back to localStorage. Reading
  // localStorage only once could target a stale/absent workspace on first
  // login, before currentWorkspaceId was written.
  const currentWorkspaceId = useSelector(
    (state) => state.workspace?.currentWorkspace?.id || null
  );

  useEffect(() => {
    const workspaceId =
      currentWorkspaceId || localStorage.getItem("currentWorkspaceId");

    if (!workspaceId) {
      setOrganization(null);
      return;
    }

    setOrganization({
      id: workspaceId,
      inviteMember: async ({ emailAddress, role, message } = {}) => {
        if (!emailAddress || !role) {
          throw new Error("Missing email or role");
        }

        // Map client role values to server role values
        const mappedRole = role === "org:admin" ? "ADMIN" : "MEMBER";

        const res = await api.post("/api/workspaces/add-member", {
          email: emailAddress,
          role: mappedRole,
          workspaceId,
          message: message || "",
        });
        return res.data;
      },
    });
  }, [currentWorkspaceId]);

  return { organization };
};
