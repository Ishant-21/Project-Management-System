import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";

export default function useVisibleProjects() {
  const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
  const { user } = useUser();

  if (!currentWorkspace || !currentWorkspace.projects) return [];

  // Filter projects where the current user is a member of the project
  const visible = currentWorkspace.projects.filter((p) => {
    const members = p.members || [];
    // member may have userId or nested user object
    return members.some(
      (m) => (m.userId && m.userId === user?.id) || (m.user && m.user.id === user?.id)
    );
  });

  return visible;
}
