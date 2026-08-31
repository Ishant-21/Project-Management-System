import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GitCommit,
  MessageSquare,
  Clock,
  Bug,
  Zap,
  Square,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { formatEnumLabel } from "../lib/format";
import { TASK_STATUS_TONE } from "../lib/tone";
import { Badge, EmptyState, SectionCard } from "../ui";

const TYPE_ICONS = {
  BUG: { icon: Bug, chip: "bg-rose-50 text-rose-500" },
  FEATURE: { icon: Zap, chip: "bg-violet-50 text-violet-500" },
  TASK: { icon: Square, chip: "bg-sky-50 text-sky-500" },
  IMPROVEMENT: { icon: MessageSquare, chip: "bg-indigo-50 text-indigo-500" },
  OTHER: { icon: GitCommit, chip: "bg-slate-100 text-slate-500" },
};

const RecentActivity = () => {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const visibleProjects = useVisibleProjects();

  // Derived instead of effect-written state, so the list cannot lag behind the
  // data it renders.
  const tasks = useMemo(() => {
    if (!currentWorkspace) return [];

    const all = (visibleProjects || []).flatMap(
      (project) => project.tasks || []
    );

    // Most recently updated first, capped to a short list.
    return [...all]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      )
      .slice(0, 8);
  }, [currentWorkspace, visibleProjects]);

  return (
    <SectionCard title="Recent Activity" icon={Activity}>
      {tasks.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No recent activity"
          hint="Task updates will show up here"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const meta = TYPE_ICONS[task.type] || TYPE_ICONS.OTHER;
            const TypeIcon = meta.icon;

            return (
              <Link
                key={task.id}
                to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${meta.chip}`}
                >
                  <TypeIcon size={14} strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                      {task.title}
                    </h4>
                    <Badge
                      variant={TASK_STATUS_TONE[task.status] || "default"}
                      size="sm"
                    >
                      {formatEnumLabel(task.status)}
                    </Badge>
                  </div>

                  <div className="mt-1 flex items-center gap-2.5 text-[11px] text-slate-400">
                    <span>{formatEnumLabel(task.type)}</span>
                    {task.assignee && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold">
                          {task.assignee.name?.[0]?.toUpperCase() || "?"}
                        </span>
                        {task.assignee.name}
                      </span>
                    )}
                    {(task.updatedAt || task.createdAt) && (
                      <span className="ml-auto shrink-0">
                        {format(
                          new Date(task.updatedAt || task.createdAt),
                          "MMM d, h:mm a"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

export default RecentActivity;
