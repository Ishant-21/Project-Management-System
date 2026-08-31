import { useEffect, useMemo, useRef, useState } from "react";
import {
  SearchIcon,
  PanelLeft,
  FolderOpenIcon,
  CheckSquareIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UserButton } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";

const MAX_RESULTS = 6;

const Navbar = ({ setIsSidebarOpen, triggerRef }) => {
  const projects = useVisibleProjects();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Searches the projects and tasks the current user can actually see.
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const projectHits = projects
      .filter((project) => project.name?.toLowerCase().includes(term))
      .map((project) => ({
        key: `project-${project.id}`,
        label: project.name,
        hint: "Project",
        icon: FolderOpenIcon,
        to: `/projectsDetail?id=${project.id}&tab=tasks`,
      }));

    const taskHits = projects.flatMap((project) =>
      (project.tasks || [])
        .filter((task) => task.title?.toLowerCase().includes(term))
        .map((task) => ({
          key: `task-${task.id}`,
          label: task.title,
          hint: project.name,
          icon: CheckSquareIcon,
          to: `/taskDetails?projectId=${task.projectId}&taskId=${task.id}`,
        }))
    );

    return [...projectHits, ...taskHits].slice(0, MAX_RESULTS);
  }, [query, projects]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <header className="h-14 shrink-0 relative z-30 bg-chrome border-b border-white/5 flex items-center gap-3 px-4 sm:px-6">
      {/* Sidebar trigger (mobile) */}
      <button
        ref={triggerRef}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
        className="sm:hidden w-8 h-8 shrink-0 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/15 hover:border-white/20 flex items-center justify-center transition-all"
      >
        <PanelLeft size={15} strokeWidth={2} />
      </button>

      {/* Brand */}
      <Link
        to="/"
        className="flex items-center gap-2.5 shrink-0 mr-1 sm:mr-3"
        aria-label="Dashboard"
      >
        <span className="w-8 h-8 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/20 flex items-center justify-center shrink-0">
          <LayoutDashboardIcon size={17} className="text-white" strokeWidth={2.2} />
        </span>
        <span className="hidden sm:block text-white font-bold text-[16px] tracking-tight mr-12">
          Project Manager
        </span>
      </Link>

      <div className="w-px h-5 bg-white/10 hidden sm:block" />

      {/* Search */}
      <div className="relative flex-1 max-w-sm min-w-0" ref={searchRef}>
        <label htmlFor="global-search" className="sr-only">
          Search projects and tasks
        </label>
        <SearchIcon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search projects, tasks..."
          className="w-full h-9 pl-9 pr-3 text-[13px] rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all focus:outline-none focus:bg-white/10 focus:border-sky-500/50"
        />

        {isOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-slate-400">
                No matches found
              </p>
            ) : (
              results.map((result) => (
                <Link
                  key={result.key}
                  to={result.to}
                  onClick={closeSearch}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-slate-50 transition-colors"
                >
                  <result.icon
                    size={14}
                    className="shrink-0 text-slate-400"
                    strokeWidth={2}
                  />
                  <span className="truncate font-medium text-slate-700">
                    {result.label}
                  </span>
                  <span className="ml-auto shrink-0 truncate max-w-28 text-[11px] text-slate-400">
                    {result.hint}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <UserButton />
      </div>
    </header>
  );
};

export default Navbar;
