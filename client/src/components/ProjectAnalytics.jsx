import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart as PieIcon,
  Flag,
} from "lucide-react";
import { formatEnumLabel } from "../lib/format";
import { PRIORITY_BAR } from "../lib/tone";
import { Card, SectionCard, StatCard } from "../ui";

// Chart palette drawn from the app accent plus its supporting hues.
const TYPE_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

// The app is light-only, so chart chrome can be fixed slate values.
const AXIS_TICK = "#94a3b8";
const AXIS_LINE = "#e2e8f0";
const GRID = "#f1f5f9";

const TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: `1px solid ${AXIS_LINE}`,
  borderRadius: "0.75rem",
  boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
  color: "#1e293b",
  fontSize: 12,
  fontWeight: 500,
};

const ProjectAnalytics = ({ project, tasks }) => {
  const { stats, statusData, typeData, priorityData } = useMemo(() => {
    const now = new Date();
    const taskList = tasks || [];
    const total = taskList.length;

    const stats = { total, completed: 0, inProgress: 0, todo: 0, overdue: 0 };

    const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    const typeMap = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
    const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    taskList.forEach((t) => {
      if (t.status === "DONE") stats.completed++;
      if (t.status === "IN_PROGRESS") stats.inProgress++;
      if (t.status === "TODO") stats.todo++;
      // Guard on due_date: `new Date(null)` is the 1970 epoch, so a task with
      // no due date was always counted as overdue.
      if (t.due_date && new Date(t.due_date) < now && t.status !== "DONE") {
        stats.overdue++;
      }

      if (statusMap[t.status] !== undefined) statusMap[t.status]++;
      if (typeMap[t.type] !== undefined) typeMap[t.type]++;
      if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
    });

    return {
      stats,
      statusData: Object.entries(statusMap).map(([k, v]) => ({
        name: formatEnumLabel(k),
        value: v,
      })),
      typeData: Object.entries(typeMap)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: formatEnumLabel(k), value: v })),
      priorityData: Object.entries(priorityMap).map(([k, v]) => ({
        key: k,
        name: formatEnumLabel(k),
        value: v,
        percentage: total > 0 ? Math.round((v / total) * 100) : 0,
      })),
    };
  }, [tasks]);

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const metrics = [
    {
      icon: CheckCircle,
      label: "Completion Rate",
      value: `${completionRate}%`,
      sublabel: `${stats.completed} of ${stats.total} done`,
      tone: "success",
    },
    {
      icon: Clock,
      label: "Active Tasks",
      value: stats.inProgress,
      sublabel: "in progress",
      tone: "warning",
    },
    {
      icon: AlertTriangle,
      label: "Overdue Tasks",
      value: stats.overdue,
      sublabel: "past due date",
      tone: "danger",
    },
    {
      icon: Users,
      label: "Team Size",
      value: project?.members?.length || 0,
      sublabel: "on this project",
      tone: "violet",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SectionCard
          title="Tasks by Status"
          icon={BarChart3}
          bodyClassName="p-4 pt-6"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} barCategoryGap="30%">
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: AXIS_TICK, fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "#0ea5e910" }}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Tasks by Type"
          icon={PieIcon}
          bodyClassName="p-4 pt-6"
        >
          {typeData.length === 0 ? (
            <p className="py-24 text-center text-[12px] text-slate-400">
              No tasks to chart yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {typeData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-[11px] font-medium text-slate-500">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Tasks by Priority"
        icon={Flag}
        bodyClassName="p-5 space-y-4"
      >
        {priorityData.map((p) => (
          <div key={p.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    PRIORITY_BAR[p.key] || "bg-slate-300"
                  }`}
                />
                {p.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500">
                  {p.value} task{p.value === 1 ? "" : "s"}
                </span>
                <span className="min-w-11 text-right text-[12px] font-bold text-slate-700 tabular-nums">
                  {p.percentage}%
                </span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  PRIORITY_BAR[p.key] || "bg-slate-300"
                }`}
                style={{ width: `${p.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
};

export default ProjectAnalytics;
