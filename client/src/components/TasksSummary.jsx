import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { formatEnumLabel } from "../lib/format";
import { PRIORITY_DOT } from "../lib/tone";
import { Card } from "../ui";

export default function TasksSummary() {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useUser();
  const visibleProjects = useVisibleProjects();

  // Derived rather than effect-written state, so the lists cannot go stale when
  // projects change without currentWorkspace changing identity.
  const tasks = useMemo(() => {
    if (!currentWorkspace) return [];
    return (visibleProjects || []).flatMap((project) => project.tasks || []);
  }, [currentWorkspace, visibleProjects]);

  const { myTasks, overdueTasks, inProgressIssues } = useMemo(() => {
    const now = new Date();
    return {
      // Match the assignee test used by StatsGrid and MyTasksSidebar.
      myTasks: user
        ? tasks.filter(
            (t) => t.assigneeId === user.id || t.assignee?.id === user.id
          )
        : [],
      overdueTasks: tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE"
      ),
      inProgressIssues: tasks.filter((t) => t.status === "IN_PROGRESS"),
    };
  }, [tasks, user]);

  const summaryCards = [
    {
      title: "My Tasks",
      count: myTasks.length,
      icon: User,
      chip: "bg-violet-50 text-violet-500",
      items: myTasks.slice(0, 3),
    },
    {
      title: "Overdue",
      count: overdueTasks.length,
      icon: AlertTriangle,
      chip: "bg-rose-50 text-rose-500",
      items: overdueTasks.slice(0, 3),
    },
    {
      title: "In Progress",
      count: inProgressIssues.length,
      icon: Clock,
      chip: "bg-amber-50 text-amber-500",
      items: inProgressIssues.slice(0, 3),
    },
  ];

  return (
    <div className="space-y-5">
      {summaryCards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-100">
            <span
              className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${card.chip}`}
            >
              <card.icon size={13} strokeWidth={2.2} />
            </span>
            <h3 className="text-[13px] font-bold text-slate-800">
              {card.title}
            </h3>
            <span className="ml-auto text-[13px] font-bold text-slate-800 tabular-nums">
              {card.count}
            </span>
          </div>

          <div className="p-3">
            {card.items.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-slate-400">
                Nothing here
              </p>
            ) : (
              <div className="space-y-1.5">
                {card.items.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/taskDetails?projectId=${issue.projectId}&taskId=${issue.id}`}
                    className="block px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="flex items-center gap-2 text-[12px] font-semibold text-slate-800 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          PRIORITY_DOT[issue.priority] || "bg-slate-400"
                        }`}
                      />
                      {issue.title}
                    </h4>
                    <p className="mt-0.5 pl-3.5 text-[11px] text-slate-400">
                      {formatEnumLabel(issue.type)} - {formatEnumLabel(issue.priority)} priority
                    </p>
                  </Link>
                ))}

                {card.count > 3 && (
                  <Link
                    to="/projects"
                    className="flex items-center justify-center gap-1.5 w-full pt-1.5 text-[12px] font-semibold text-slate-500 hover:text-sky-600 transition-colors"
                  >
                    View {card.count - 3} more
                    <ArrowRight size={12} strokeWidth={2.4} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
