import { useState } from "react";
import {
  format,
  isSameDay,
  isBefore,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import {
  CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatEnumLabel } from "../lib/format";
import { TASK_TYPE_TONE, PRIORITY_BAR } from "../lib/tone";
import { Badge, Card, SectionCard } from "../ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ProjectCalendar = ({ tasks, project }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Every task in these three lists links through to its detail page. They used
  // to be plain divs, so clicking one did nothing.
  const taskHref = (task) =>
    `/taskDetails?projectId=${task.projectId || project?.id || ""}&taskId=${task.id}`;

  const today = new Date();
  const allTasks = tasks || [];

  const getTasksForDate = (date) =>
    allTasks.filter((task) => task.due_date && isSameDay(task.due_date, date));

  const upcomingTasks = allTasks
    .filter(
      (task) =>
        task.due_date &&
        !isBefore(task.due_date, today) &&
        task.status !== "DONE"
    )
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const overdueTasks = allTasks.filter(
    (task) =>
      task.due_date && isBefore(task.due_date, today) && task.status !== "DONE"
  );

  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(currentMonth),
  });

  // Blank cells so the 1st lands under its real weekday. Without these every
  // month started in the "Sun" column and the whole header row was wrong.
  const leadingBlanks = getDay(monthStart);

  const handleMonthChange = (direction) =>
    setCurrentMonth((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );

  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 space-y-5 min-w-0">
        {/* Month grid */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-slate-800">
              <CalendarIcon size={15} className="text-slate-400" strokeWidth={2} />
              Task Calendar
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => handleMonthChange("prev")}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={15} strokeWidth={2.2} />
              </button>
              <span className="min-w-32 text-center text-[13px] font-bold text-slate-800">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => handleMonthChange("next")}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="label-micro text-slate-400 text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} aria-hidden="true" />
            ))}
            {daysInMonth.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const hasOverdue = dayTasks.some(
                (t) => t.status !== "DONE" && isBefore(t.due_date, today)
              );

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  aria-pressed={isSelected}
                  className={`h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${
                    isSelected
                      ? "bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-500/20"
                      : hasOverdue
                        ? "bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300"
                        : "bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`text-[13px] ${
                      isToday(day) ? "font-bold" : "font-medium"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span
                      className={`text-[9px] font-semibold ${
                        isSelected ? "text-sky-100" : "text-slate-400"
                      }`}
                    >
                      {dayTasks.length} task{dayTasks.length === 1 ? "" : "s"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tasks for the selected day */}
        {selectedTasks.length > 0 && (
          <SectionCard
            title={`Tasks for ${format(selectedDate, "MMM d, yyyy")}`}
            icon={CalendarIcon}
            bodyClassName="p-4 space-y-2"
          >
            {selectedTasks.map((task) => (
              <Link
                key={task.id}
                to={taskHref(task)}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <span
                  className={`w-1 self-stretch rounded-full shrink-0 ${
                    PRIORITY_BAR[task.priority] || "bg-slate-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[13px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {task.title}
                    </h4>
                    <Badge
                      variant={TASK_TYPE_TONE[task.type] || "default"}
                      size="sm"
                    >
                      {formatEnumLabel(task.type)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{formatEnumLabel(task.priority)} priority</span>
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <User size={11} strokeWidth={2} />
                        {task.assignee.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </SectionCard>
        )}
      </div>

      {/* Side rail */}
      <div className="space-y-5 min-w-0">
        <SectionCard
          title="Upcoming"
          icon={Clock}
          bodyClassName="p-3 space-y-1.5"
        >
          {upcomingTasks.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-slate-400">
              No upcoming tasks
            </p>
          ) : (
            upcomingTasks.map((task) => (
              <Link
                key={task.id}
                to={taskHref(task)}
                className="block px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                    {task.title}
                  </span>
                  <Badge
                    variant={TASK_TYPE_TONE[task.type] || "default"}
                    size="sm"
                  >
                    {formatEnumLabel(task.type)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {format(new Date(task.due_date), "MMM d")}
                </p>
              </Link>
            ))
          )}
        </SectionCard>

        {overdueTasks.length > 0 && (
          <Card className="overflow-hidden border-rose-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-rose-100 bg-rose-50">
              <AlertTriangle size={15} className="text-rose-500" strokeWidth={2.2} />
              <h2 className="text-[14px] font-bold text-rose-700">
                Overdue ({overdueTasks.length})
              </h2>
            </div>
            <div className="p-3 space-y-1.5">
              {overdueTasks.slice(0, 5).map((task) => (
                <Link
                  key={task.id}
                  to={taskHref(task)}
                  className="block px-3 py-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100 transition-colors group"
                >
                  <span className="block text-[12px] font-semibold text-slate-800 truncate group-hover:text-rose-700 transition-colors">
                    {task.title}
                  </span>
                  <span className="text-[11px] text-rose-600">
                    Due {format(new Date(task.due_date), "MMM d")}
                  </span>
                </Link>
              ))}
              {overdueTasks.length > 5 && (
                <p className="pt-1 text-center text-[11px] text-slate-400">
                  +{overdueTasks.length - 5} more
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectCalendar;
