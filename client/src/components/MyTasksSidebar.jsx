import { useMemo, useState } from "react";
import { CheckSquareIcon, ChevronDownIcon } from "lucide-react";
import { useSelector } from "react-redux";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { Link } from "react-router-dom";
import { useUser } from "../lib/auth";
import { formatEnumLabel } from "../lib/format";
import { TASK_STATUS_DOT } from "../lib/tone";

function MyTasksSidebar({ setIsSidebarOpen }) {
  const { user } = useUser();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const visibleProjects = useVisibleProjects();
  const [showMyTasks, setShowMyTasks] = useState(false);

  // Derived from the same source the rest of the app reads, so the count cannot
  // drift when projects change without currentWorkspace changing identity.
  const myTasks = useMemo(() => {
    const userId = user?.id;
    if (!userId || !currentWorkspace) return [];

    return (visibleProjects || []).flatMap((project) =>
      (project.tasks || []).filter(
        (task) => task?.assignee?.id === userId || task?.assigneeId === userId
      )
    );
  }, [currentWorkspace, visibleProjects, user?.id]);

  return (
    <div className="mt-6 px-3">
      <button
        type="button"
        onClick={() => setShowMyTasks((prev) => !prev)}
        aria-expanded={showMyTasks}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
      >
        <CheckSquareIcon
          size={13}
          className="text-slate-500 group-hover:text-slate-300"
          strokeWidth={2}
        />
        <span className="label-micro text-slate-500 group-hover:text-slate-400">
          My Tasks
        </span>
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-300">
          {myTasks.length}
        </span>
        <ChevronDownIcon
          size={13}
          className={`ml-auto text-slate-500 transition-transform duration-200 ${
            showMyTasks ? "rotate-180" : ""
          }`}
        />
      </button>

      {showMyTasks && (
        <div className="mt-1 space-y-0.5">
          {myTasks.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-slate-500">
              No tasks assigned
            </p>
          ) : (
            myTasks.map((task) => (
              <Link
                key={task.id}
                to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`}
                onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    TASK_STATUS_DOT[task.status] || "bg-slate-400"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium truncate">
                    {task.title}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {formatEnumLabel(task.status)}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MyTasksSidebar;
