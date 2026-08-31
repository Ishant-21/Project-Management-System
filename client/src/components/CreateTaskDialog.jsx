import { useState } from "react";
import { Calendar as CalendarIcon, XIcon, ListPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { useAuth } from "../lib/auth";
import api from "../configs/api";
import toast from "react-hot-toast";
import { addTask } from "../features/workspaceSlice";
import { useUser } from "../lib/auth";
import Modal from "./Modal";
import { canManageTasks } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Button, Tooltip, inputClass, labelClass } from "../ui";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "TASK",
  status: "TODO",
  priority: "MEDIUM",
  assigneeId: "",
  due_date: "",
};

export default function CreateTaskDialog({
  showCreateTask,
  setShowCreateTask,
  projectId,
}) {
  const { msg } = useMessages();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const project = currentWorkspace?.projects?.find((p) => p.id === projectId);
  const teamMembers = project?.members || [];
  const { user } = useUser();
  const isLead = canManageTasks(project, user?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post(
        "/api/tasks",
        { ...formData, workspaceId: currentWorkspace.id, projectId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      setShowCreateTask(false);
      setFormData(EMPTY_FORM);

      toast.success(data.message);
      dispatch(addTask(data.task));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={showCreateTask}
      onClose={() => setShowCreateTask(false)}
      labelledBy="create-task-title"
      panelClassName="max-w-md"
    >
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          onClick={() => setShowCreateTask(false)}
        >
          <XIcon size={15} strokeWidth={2.2} />
        </button>

        <div className="flex items-start gap-3 mb-5 pr-8">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <ListPlus size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2
              id="create-task-title"
              className="text-[16px] font-bold text-slate-900"
            >
              Create New Task
            </h2>
            {project && (
              <p className="text-[12px] text-slate-500 truncate">
                in{" "}
                <span className="font-semibold text-sky-600">
                  {project.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {!isLead && (
          <div className="mb-5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] text-slate-600">
            {msg("TASK_CREATE_DENIED")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={!isLead} className="space-y-4 min-w-0">
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>
              <input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the task"
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ct-type" className={labelClass}>
                  Type
                </label>
                <select
                  id="ct-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="BUG">Bug</option>
                  <option value="FEATURE">Feature</option>
                  <option value="TASK">Task</option>
                  <option value="IMPROVEMENT">Improvement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="ct-priority" className={labelClass}>
                  Priority
                </label>
                <select
                  id="ct-priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="task-assignee" className={labelClass}>
                  Assignee
                </label>
                {/* Task.assigneeId is a non-null column and the API rejects an
                    empty assignee with a 400, so there is no "Unassigned"
                    choice to offer — it only produced a failed submit. */}
                <select
                  id="task-assignee"
                  value={formData.assigneeId}
                  onChange={(e) =>
                    setFormData({ ...formData, assigneeId: e.target.value })
                  }
                  disabled={!isLead}
                  required
                  className={inputClass}
                >
                  <option value="">Select an assignee</option>
                  {teamMembers.map((member) => (
                    <option key={member?.user.id} value={member?.user.id}>
                      {member?.user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ct-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="ct-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="task-due-date" className={labelClass}>
                Due Date
              </label>
              <div className="relative">
                <CalendarIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                {/* Task.due_date is non-null server-side — required here so the
                    form cannot be submitted into a guaranteed 400. */}
                <input
                  id="task-due-date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className={`${inputClass} pl-9`}
                />
              </div>
              {formData.due_date && (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {format(new Date(formData.due_date), "PPP")}
                </p>
              )}
            </div>
          </fieldset>

          {/* Cancel stays outside the fieldset so it is always usable */}
          <div className="flex justify-end gap-2 pt-5">
            <Button
              variant="secondary"
              onClick={() => setShowCreateTask(false)}
            >
              Cancel
            </Button>
            <Tooltip title={isLead ? undefined : msg("TASK_CREATE_DENIED")}>
              <Button type="submit" disabled={isSubmitting || !isLead}>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </Tooltip>
          </div>
        </form>
      </div>
    </Modal>
  );
}
