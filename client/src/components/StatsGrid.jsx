import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { StatCard } from "../ui";

export default function StatsGrid() {
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null
  );
  const visibleProjects = useVisibleProjects();
  const { user } = useUser();

  // Derived straight from the source data, so the tiles cannot show stale counts.
  const stats = useMemo(() => {
    const projects = currentWorkspace ? visibleProjects || [] : [];
    const now = new Date();

    return {
      totalProjects: projects.length,
      completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
      myTasks: projects.reduce(
        (acc, project) =>
          acc +
          (project.tasks || []).filter(
            (t) =>
              t.assignee?.id === user?.id || t.assignee?.email === user?.email
          ).length,
        0
      ),
      overdueIssues: projects.reduce(
        (acc, project) =>
          acc +
          (project.tasks || []).filter(
            (t) =>
              t.status !== "DONE" && t.due_date && new Date(t.due_date) < now
          ).length,
        0
      ),
    };
  }, [currentWorkspace, visibleProjects, user?.id, user?.email]);

  const cards = [
    {
      icon: FolderOpen,
      label: "Total Projects",
      value: stats.totalProjects,
      // Layout lets authenticated users in without a workspace, so this guard
      // avoids rendering the literal text "projects in undefined".
      sublabel: currentWorkspace?.name
        ? `in ${currentWorkspace.name}`
        : "no workspace selected",
      tone: "brand",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completedProjects,
      sublabel: `of ${stats.totalProjects} total`,
      tone: "success",
    },
    {
      icon: Users,
      label: "My Tasks",
      value: stats.myTasks,
      sublabel: "assigned to me",
      tone: "violet",
    },
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: stats.overdueIssues,
      sublabel: "need attention",
      tone: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
