import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";

export default function useVisibleProjects() {
  const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
  const { user } = useUser();

  // Memoize so the returned array keeps a stable reference across renders.
  // Consumers put this in useEffect/useMemo dependency lists; returning a fresh
  // array every render caused an infinite render loop on the Projects page.
  return useMemo(() => {
    if (!currentWorkspace || !currentWorkspace.projects) return [];

    // Filter projects where the current user is a member of the project.
    return currentWorkspace.projects.filter((p) => {
      const members = p.members || [];
      // member may have userId or a nested user object
      return members.some(
        (m) => (m.userId && m.userId === user?.id) || (m.user && m.user.id === user?.id)
      );
    });
  }, [currentWorkspace, user?.id]);
}
