import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import { useUser } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import {
  Bug,
  CalendarIcon,
  GitCommit,
  MessageSquare,
  Square,
  Trash2,
  XIcon,
  Zap,
  ListX,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { canManageTasks, canEditTask } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { formatEnumLabel } from "../lib/format";
import { PRIORITY_TONE, TASK_TYPE_TONE } from "../lib/tone";
import api from "../configs/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Tooltip,
  filterClass,
  inputClass,
} from "../ui";

const TYPE_ICONS = {
  BUG: Bug,
  FEATURE: Zap,
  TASK: Square,
  IMPROVEMENT: GitCommit,
  OTHER: MessageSquare,
};

const FILTER_OPTIONS = {
  status: [
    { label: "All Statuses", value: "" },
    { label: "To Do", value: "TODO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
  ],
  type: [
    { label: "All Types", value: "" },
    { label: "Task", value: "TASK" },
    { label: "Bug", value: "BUG" },
    { label: "Feature", value: "FEATURE" },
    { label: "Improvement", value: "IMPROVEMENT" },
    { label: "Other", value: "OTHER" },
  ],
  priority: [
    { label: "All Priorities", value: "" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ],
};

const ProjectTasks = ({ tasks, project }) => {
  const { msg } = useMessages();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState([]);

  const { user } = useUser();
  const currentWorkspace = useSelector(
    (state) => state.workspace.currentWorkspace
  );

  // The project arrives as a prop. It used to be looked up via
  // `tasks[0].projectId`, which resolved to undefined for an empty task list —
  // so the project lead's own controls stayed locked on a project with no tasks.
  const activeProject =
    project ||
    currentWorkspace?.projects?.find((p) => p.id === tasks?.[0]?.projectId);
  const isLead = canManageTasks(activeProject, user?.id);
  // The lead may edit any task in the project; anyone else only their own.
  const mayEditTask = (task) => canEditTask(activeProject, task, user?.id);

  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    assignee: "",
  });

  const assigneeList = useMemo(
    () =>
      Array.from(
        new Set((tasks || []).map((t) => t.assignee?.name).filter(Boolean))
      ),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((task) => {
      const { status, type, priority, assignee } = filters;
      return (
        (!status || task.status === status) &&
        (!type || task.type === type) &&
        (!priority || task.priority === priority) &&
        (!assignee || task.assignee?.name === assignee)
      );
    });
  }, [filters, tasks]);

  const hasFilters =
    filters.status || filters.type || filters.priority || filters.assignee;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openTask = (task) =>
    navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`);

  const toggleSelected = (taskId) =>
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((i) => i !== taskId)
        : [...prev, taskId]
    );

  const handleStatusChange = async (taskId, newStatus) => {
    const target = (tasks || []).find((t) => t.id === taskId);
    if (!mayEditTask(target)) {
      toast.error(msg("TASK_EDIT_DENIED"));
      return;
    }

    try {
      toast.loading("Updating status...");
      const token = await getToken();

      const { data } = await api.put(
        `/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // updateTask returns the task with its assignee relation, so use the
      // server copy instead of patching a local clone.
      dispatch(updateTask(data.task));

      toast.dismissAll();
      toast.success(data.message);
    } catch (error) {
      toast.dismissAll();
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete the selected tasks?"
      );
      if (!confirmed) return;
      if (!isLead) {
        toast.error(msg("TASK_DELETE_DENIED"));
        return;
      }

      const token = await getToken();
      toast.loading("Deleting tasks...");

      const { data } = await api.post(
        "/api/tasks/delete",
        { tasksIds: selectedTasks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(deleteTask(selectedTasks));
      // Clear the selection, otherwise the Delete button lingers and the
      // select-all checkbox stays checked against rows that no longer exist.
      setSelectedTasks([]);

      toast.dismissAll();
      toast.success(data.message);
    } catch (error) {
      toast.dismissAll();
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const allSelected =
    filteredTasks.length > 0 && selectedTasks.length === filteredTasks.length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {["status", "type", "priority"].map((name) => (
          // Controlled: without `value` the Reset button cleared the filters in
          // state while the dropdowns kept showing the old selections.
          <select
            key={name}
            name={name}
            value={filters[name]}
            aria-label={`Filter by ${name}`}
            onChange={handleFilterChange}
            className={filterClass}
          >
            {FILTER_OPTIONS[name].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        <select
          name="assignee"
          value={filters.assignee}
          aria-label="Filter by assignee"
          onChange={handleFilterChange}
          className={filterClass}
        >
          <option value="">All Assignees</option>
          {assigneeList.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setFilters({ status: "", type: "", priority: "", assignee: "" })
            }
          >
            <XIcon size={12} strokeWidth={2.4} />
            Reset
          </Button>
        )}

        {selectedTasks.length > 0 && (
          <Tooltip
            title={!isLead ? msg("TASK_DELETE_DENIED") : undefined}
            className="ml-auto"
          >
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={!isLead}
            >
              <Trash2 size={12} strokeWidth={2.4} />
              Delete ({selectedTasks.length})
            </Button>
          </Tooltip>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListX}
            title="No tasks found"
            hint={
              hasFilters
                ? "No tasks match the selected filters"
                : "Tasks created for this project will appear here"
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="pl-5 pr-2 py-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all tasks"
                        onChange={() =>
                          allSelected
                            ? setSelectedTasks([])
                            : setSelectedTasks(filteredTasks.map((t) => t.id))
                        }
                        checked={allSelected}
                      />
                    </th>
                    {[
                      "Title",
                      "Type",
                      "Priority",
                      "Status",
                      "Assignee",
                      "Due",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 label-micro text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const TypeIcon = TYPE_ICONS[task.type] || Square;
                    const editable = mayEditTask(task);

                    return (
                      <tr
                        key={task.id}
                        onClick={() => openTask(task)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="pl-5 pr-2 py-3"
                        >
                          <input
                            type="checkbox"
                            aria-label={`Select ${task.title}`}
                            onChange={() => toggleSelected(task.id)}
                            checked={selectedTasks.includes(task.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-slate-800 max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-[12px] text-slate-600">
                            <TypeIcon
                              size={13}
                              strokeWidth={2.2}
                              className="text-slate-400"
                            />
                            {formatEnumLabel(task.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={PRIORITY_TONE[task.priority] || "default"}
                            size="sm"
                          >
                            {formatEnumLabel(task.priority)}
                          </Badge>
                        </td>
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-3"
                        >
                          <Tooltip
                            title={
                              editable ? undefined : msg("TASK_EDIT_DENIED")
                            }
                          >
                            <select
                              name="status"
                              aria-label={`Status for ${task.title}`}
                              onChange={(e) =>
                                handleStatusChange(task.id, e.target.value)
                              }
                              value={task.status}
                              disabled={!editable}
                              className="px-2 py-1 text-[12px] font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-sky-400 disabled:bg-slate-50 disabled:text-slate-400"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-[12px] text-slate-600">
                            <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                              {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                            {task.assignee?.name || "Unassigned"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon
                              size={12}
                              strokeWidth={2}
                              className="text-slate-400"
                            />
                            {task.due_date
                              ? format(new Date(task.due_date), "dd MMM")
                              : "None"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards — clickable like the desktop rows */}
          <div className="lg:hidden space-y-3">
            {filteredTasks.map((task) => {
              const TypeIcon = TYPE_ICONS[task.type] || Square;
              const editable = mayEditTask(task);

              return (
                <Card
                  key={task.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openTask(task);
                    }
                  }}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-[13px] font-bold text-slate-800">
                      {task.title}
                    </h3>
                    <input
                      type="checkbox"
                      aria-label={`Select ${task.title}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelected(task.id)}
                      checked={selectedTasks.includes(task.id)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant={TASK_TYPE_TONE[task.type] || "default"}
                      size="sm"
                    >
                      <TypeIcon size={11} strokeWidth={2.4} />
                      {formatEnumLabel(task.type)}
                    </Badge>
                    <Badge
                      variant={PRIORITY_TONE[task.priority] || "default"}
                      size="sm"
                    >
                      {formatEnumLabel(task.priority)}
                    </Badge>
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="mb-3">
                    <label
                      htmlFor={`status-${task.id}`}
                      className="label-micro text-slate-400 block mb-1.5"
                    >
                      Status
                    </label>
                    <Tooltip
                      title={editable ? undefined : msg("TASK_EDIT_DENIED")}
                      className="w-full"
                    >
                      <select
                        id={`status-${task.id}`}
                        name="status"
                        aria-label={`Status for ${task.title}`}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        value={task.status}
                        disabled={!editable}
                        className={inputClass}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </Tooltip>
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                        {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                      {task.assignee?.name || "Unassigned"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon size={12} strokeWidth={2} />
                      {task.due_date
                        ? format(new Date(task.due_date), "dd MMM")
                        : "None"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectTasks;
