import { useState, useEffect, useMemo } from "react";
import { useUser } from "../lib/auth";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  SettingsIcon,
  BarChart3Icon,
  CalendarIcon,
  FileStackIcon,
  ListChecks,
  CheckCircle2,
  Loader,
  UsersIcon,
  FolderX,
} from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import { formatEnumLabel } from "../lib/format";
import { PROJECT_STATUS_TONE } from "../lib/tone";
import { canManageTasks } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Badge, Button, EmptyState, StatCard, Tooltip } from "../ui";

const TABS = [
  { key: "tasks", label: "Tasks", icon: FileStackIcon },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
  { key: "analytics", label: "Analytics", icon: BarChart3Icon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function ProjectDetail() {
  const { msg } = useMessages();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const id = searchParams.get("id");

  const navigate = useNavigate();
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null
  );
  // Memoised so the fallback array does not change identity every render and
  // re-fire the effect below.
  const projects = useMemo(
    () => currentWorkspace?.projects || [],
    [currentWorkspace]
  );

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState(tab || "tasks");
  const { user } = useUser();

  // createTask is project-lead only server-side.
  const isLead = canManageTasks(project, user?.id);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    const proj = projects.find((p) => p.id === id);
    setProject(proj || null);
    setTasks(proj?.tasks || []);
  }, [id, projects]);

  // Workspace data still loading - avoid flashing "Project not found".
  if (!currentWorkspace) {
    return (
      <div className="py-24 text-center text-[13px] text-slate-400">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <EmptyState
          icon={FolderX}
          title={msg("PROJECT_NOT_FOUND")}
          hint="It may have been removed, or you may not have access to it."
          action={
            <Button variant="secondary" onClick={() => navigate("/projects")}>
              Back to Projects
            </Button>
          }
        />
      </div>
    );
  }

  const cards = [
    {
      icon: ListChecks,
      label: "Total Tasks",
      value: tasks.length,
      tone: "brand",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: tasks.filter((t) => t.status === "DONE").length,
      tone: "success",
    },
    {
      icon: Loader,
      label: "In Progress",
      value: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      tone: "warning",
    },
    {
      icon: UsersIcon,
      label: "Team Members",
      value: project.members?.length || 0,
      tone: "violet",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            aria-label="Back to projects"
            className="w-8 h-8 mt-0.5 shrink-0 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeftIcon size={15} strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight truncate">
                {project.name}
              </h1>
              <Badge
                variant={PROJECT_STATUS_TONE[project.status] || "default"}
                size="sm"
              >
                {formatEnumLabel(project.status)}
              </Badge>
            </div>
            {project.description && (
              <p className="mt-1 text-[13px] text-slate-500 line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <Tooltip
          title={isLead ? "Create Task" : msg("TASK_CREATE_DENIED")}
          className="shrink-0"
        >
          <Button
            onClick={() => isLead && setShowCreateTask(true)}
            disabled={!isLead}
          >
            <PlusIcon size={15} strokeWidth={2.4} />
            New Task
          </Button>
        </Tooltip>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Tabs */}
      <div>
        <div className="inline-flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {TABS.map((tabItem) => {
            const active = activeTab === tabItem.key;
            return (
              <button
                key={tabItem.key}
                type="button"
                onClick={() => {
                  setActiveTab(tabItem.key);
                  setSearchParams({ id: id, tab: tabItem.key });
                }}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all ${
                  active
                    ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <tabItem.icon size={14} strokeWidth={2.2} />
                {tabItem.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {activeTab === "tasks" && (
            <ProjectTasks tasks={tasks} project={project} />
          )}
          {activeTab === "analytics" && (
            <ProjectAnalytics tasks={tasks} project={project} />
          )}
          {activeTab === "calendar" && (
            <ProjectCalendar tasks={tasks} project={project} />
          )}
          {activeTab === "settings" && <ProjectSettings project={project} />}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskDialog
          showCreateTask={showCreateTask}
          setShowCreateTask={setShowCreateTask}
          projectId={id}
        />
      )}
    </div>
  );
}
