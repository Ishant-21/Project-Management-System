import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import MyTasksSidebar from "./MyTasksSidebar";
import ProjectSidebar from "./ProjectsSidebar";
import WorkspaceDropdown from "./WorkspaceDropdown";
import {
  FolderOpenIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { name: "Projects", href: "/projects", icon: FolderOpenIcon },
  { name: "Team", href: "/team", icon: UsersIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, triggerRef }) => {
  const sidebarRef = useRef(null);

  // Only listen while the drawer is open, and ignore presses on the Navbar
  // toggle: that button fires on `click`, which runs after `mousedown`, so
  // closing here first meant its own toggle flipped the panel straight back
  // open and it could never be closed from the trigger.
  useEffect(() => {
    if (!isSidebarOpen) return;

    function handleClickOutside(event) {
      if (triggerRef?.current && triggerRef.current.contains(event.target)) {
        return;
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsSidebarOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, setIsSidebarOpen, triggerRef]);

  return (
    <aside
      ref={sidebarRef}
      // `invisible` when closed keeps the off-screen drawer out of the tab
      // order on mobile; from sm up it is a static column, always visible.
      className={`z-30 shrink-0 w-64 lg:w-[264px] bg-chrome flex flex-col border-r border-white/5 transition-transform duration-200 max-sm:fixed max-sm:top-14 max-sm:bottom-0 max-sm:left-0 ${
        isSidebarOpen
          ? "max-sm:translate-x-0"
          : "max-sm:-translate-x-full max-sm:invisible"
      }`}
    >
      <WorkspaceDropdown />

      <div className="flex-1 overflow-y-auto chrome-scroll pb-6">
        <nav className="px-3 space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              to={item.href}
              key={item.name}
              end={item.href === "/"}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all group ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sky-500" />
                  )}
                  <item.icon
                    size={16}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={
                      isActive
                        ? "text-sky-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <MyTasksSidebar setIsSidebarOpen={setIsSidebarOpen} />
        <ProjectSidebar setIsSidebarOpen={setIsSidebarOpen} />
      </div>
    </aside>
  );
};

export default Sidebar;
