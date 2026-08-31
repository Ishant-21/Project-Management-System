import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { Plus, Search, FolderOpen } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { canCreateProject } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Button, EmptyState, PageHeader, Tooltip, inputClass } from "../ui";

export default function Projects() {
  const { msg } = useMessages();
  const projects = useVisibleProjects();
  const { user } = useUser();

  const currentWorkspace = useSelector(
    (state) => state.workspace.currentWorkspace
  );
  const isAdmin = canCreateProject(currentWorkspace, user?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "ALL", priority: "ALL" });

  // Derived rather than state written by an effect, so the grid is correct on
  // the very first render instead of briefly showing "No projects found".
  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      if (
        term &&
        !project.name?.toLowerCase().includes(term) &&
        !project.description?.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (filters.status !== "ALL" && project.status !== filters.status) {
        return false;
      }
      if (filters.priority !== "ALL" && project.priority !== filters.priority) {
        return false;
      }
      return true;
    });
  }, [projects, searchTerm, filters]);

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Manage and track everything you are part of"
        actions={
          <Tooltip
            title={isAdmin ? "Create new project" : msg("PROJECT_CREATE_DENIED")}
          >
            <Button
              onClick={() => isAdmin && setIsDialogOpen(true)}
              disabled={!isAdmin}
            >
              <Plus size={15} strokeWidth={2.4} />
              New Project
            </Button>
          </Tooltip>
        }
      />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="project-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className={`${inputClass} pl-9`}
          />
        </div>

        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={`${inputClass} sm:w-40`}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PLANNING">Planning</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          aria-label="Filter by priority"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className={`${inputClass} sm:w-40`}
        >
          <option value="ALL">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <EmptyState
            icon={FolderOpen}
            title={isFiltered ? "No projects match your filters" : "No projects yet"}
            hint={
              isFiltered
                ? "Try a different search term or clear the filters"
                : "Create your first project to get started"
            }
            action={
              isFiltered ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ status: "ALL", priority: "ALL" });
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Tooltip
                  title={
                    isAdmin ? "Create project" : msg("PROJECT_CREATE_DENIED")
                  }
                >
                  <Button
                    onClick={() => isAdmin && setIsDialogOpen(true)}
                    disabled={!isAdmin}
                  >
                    <Plus size={15} strokeWidth={2.4} />
                    Create Project
                  </Button>
                </Tooltip>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
