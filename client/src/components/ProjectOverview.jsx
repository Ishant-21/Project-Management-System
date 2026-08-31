import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  UsersIcon,
  FolderOpen,
  LayoutList,
  ListChecks,
} from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { formatEnumLabel } from "../lib/format";
import { PROJECT_STATUS_TONE, PRIORITY_DOT } from "../lib/tone";
import CreateProjectDialog from "./CreateProjectDialog";
import { canCreateProject } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Badge, Button, EmptyState, SectionCard } from "../ui";

const ProjectOverview = () => {
  const { msg } = useMessages();
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Same membership-filtered list as the Projects page, the sidebar and the
  // stat tiles, so the dashboard cannot list projects the user is not on.
  const projects = useVisibleProjects();

  const { user } = useUser();
  const isAdmin = canCreateProject(currentWorkspace, user?.id);

  if (!currentWorkspace) return null;

  return (
    <SectionCard
      title="Project Overview"
      icon={LayoutList}
      action={
        <Link
          to="/projects"
          className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-sky-600 transition-colors"
        >
          View all
          <ArrowRight size={13} strokeWidth={2.4} />
        </Link>
      }
    >
      {projects.length === 0 ? (
        <>
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            hint="Create your first project to get started"
            action={
              <Button
                onClick={() => isAdmin && setIsDialogOpen(true)}
                disabled={!isAdmin}
                title={
                  isAdmin
                    ? "Create your first project"
                    : msg("PROJECT_CREATE_DENIED")
                }
              >
                Create Project
              </Button>
            }
          />
          <CreateProjectDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </>
      ) : (
        <div className="divide-y divide-slate-100">
          {projects.slice(0, 5).map((project) => {
            const tasks = project.tasks || [];
            const doneCount = tasks.filter((t) => t.status === "DONE").length;

            return (
              <Link
                key={project.id}
                to={`/projectsDetail?id=${project.id}&tab=tasks`}
                className="block px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          PRIORITY_DOT[project.priority] || "bg-slate-400"
                        }`}
                      />
                      {project.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-1">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <Badge
                    variant={PROJECT_STATUS_TONE[project.status] || "default"}
                    size="sm"
                  >
                    {formatEnumLabel(project.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  {project.members?.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <UsersIcon size={12} strokeWidth={2} />
                      {project.members.length} members
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <ListChecks size={12} strokeWidth={2} />
                    {doneCount} of {tasks.length} done
                  </span>
                  {project.end_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} strokeWidth={2} />
                      {format(new Date(project.end_date), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

export default ProjectOverview;
