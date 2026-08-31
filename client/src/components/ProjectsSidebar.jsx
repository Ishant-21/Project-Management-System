import { useState } from "react";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ChevronRightIcon,
  SettingsIcon,
  KanbanIcon,
  ChartColumnIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "lucide-react";
import { PRIORITY_DOT } from "../lib/tone";

const SUB_ITEMS = [
  { title: "Tasks", tab: "tasks", icon: KanbanIcon },
  { title: "Calendar", tab: "calendar", icon: CalendarIcon },
  { title: "Analytics", tab: "analytics", icon: ChartColumnIcon },
  { title: "Settings", tab: "settings", icon: SettingsIcon },
];

const ProjectSidebar = ({ setIsSidebarOpen }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  const projects = useVisibleProjects();

  const toggleProject = (id) => {
    const newSet = new Set(expandedProjects);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedProjects(newSet);
  };

  return (
    <div className="mt-6 px-3">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="label-micro text-slate-500">Projects</span>
        {/* A nested button inside a link is invalid HTML, so the link itself
            carries the icon-button styling. */}
        <Link
          to="/projects"
          aria-label="View all projects"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowRightIcon size={12} strokeWidth={2.4} />
        </Link>
      </div>

      <div className="space-y-0.5">
        {projects.length === 0 && (
          <p className="px-3 py-2 text-[12px] text-slate-500">No projects yet</p>
        )}

        {projects.map((project) => {
          const expanded = expandedProjects.has(project.id);

          return (
            <div key={project.id}>
              <button
                type="button"
                onClick={() => toggleProject(project.id)}
                aria-expanded={expanded}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <ChevronRightIcon
                  size={12}
                  strokeWidth={2.4}
                  className={`shrink-0 text-slate-500 transition-transform duration-200 ${
                    expanded ? "rotate-90" : ""
                  }`}
                />
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    PRIORITY_DOT[project.priority] || "bg-sky-500"
                  }`}
                />
                <span className="truncate text-[12px] font-medium">
                  {project.name}
                </span>
              </button>

              {expanded && (
                <div className="ml-6 mt-0.5 mb-1 space-y-0.5 border-l border-white/10 pl-2">
                  {SUB_ITEMS.map((subItem) => {
                    const isActive =
                      location.pathname === "/projectsDetail" &&
                      searchParams.get("id") === project.id &&
                      searchParams.get("tab") === subItem.tab;

                    return (
                      <Link
                        key={subItem.tab}
                        to={`/projectsDetail?id=${project.id}&tab=${subItem.tab}`}
                        onClick={() =>
                          setIsSidebarOpen && setIsSidebarOpen(false)
                        }
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all ${
                          isActive
                            ? "bg-sky-500/10 text-sky-400 font-semibold"
                            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <subItem.icon size={12} strokeWidth={2} />
                        {subItem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectSidebar;
