import { useState } from "react";
import { XIcon, FolderPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import toast from "react-hot-toast";
import api from "../configs/api";
import { useAuth } from "../lib/auth";
import { addProject } from "../features/workspaceSlice";
import Modal from "./Modal";
import { canCreateProject } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Badge, Button, Tooltip, inputClass, labelClass } from "../ui";

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "PLANNING",
  priority: "MEDIUM",
  start_date: "",
  end_date: "",
  team_members: [],
  team_lead: "",
};

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const { msg } = useMessages();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useUser();
  // Mirrors the server rule in one place — see lib/permissions.js
  const isAdmin = canCreateProject(currentWorkspace, user?.id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isAdmin) {
        return toast.error(msg("PROJECT_CREATE_DENIED"));
      }

      setIsSubmitting(true);

      // Always include the creator as a project member, otherwise the new
      // project is filtered out of their own views (useVisibleProjects only
      // shows projects the current user belongs to).
      const team_members = user?.email
        ? [...new Set([...formData.team_members, user.email])]
        : formData.team_members;

      const { data } = await api.post(
        "/api/projects",
        { workspaceId: currentWorkspace.id, ...formData, team_members },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      dispatch(addProject(data.project));
      toast.success(data.message);
      setIsDialogOpen(false);
      // Reset so reopening the dialog starts fresh instead of showing stale data.
      setFormData(EMPTY_FORM);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTeamMember = (email) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((m) => m !== email),
    }));
  };

  const workspaceMembers = currentWorkspace?.members || [];

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      labelledBy="create-project-title"
      panelClassName="max-w-lg"
    >
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          onClick={() => setIsDialogOpen(false)}
        >
          <XIcon size={15} strokeWidth={2.2} />
        </button>

        <div className="flex items-start gap-3 mb-5 pr-8">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <FolderPlus size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2
              id="create-project-title"
              className="text-[16px] font-bold text-slate-900"
            >
              Create New Project
            </h2>
            {currentWorkspace && (
              <p className="text-[12px] text-slate-500 truncate">
                in{" "}
                <span className="font-semibold text-sky-600">
                  {currentWorkspace.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] text-slate-600">
            {msg("PROJECT_CREATE_DENIED")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Disabled fieldset so a non-admin gets the not-allowed cursor on
              every field, rather than a form that fills in and then 403s. */}
          <fieldset disabled={!isAdmin} className="space-y-4 min-w-0">
            <div>
              <label htmlFor="cp-name" className={labelClass}>
                Project Name
              </label>
              <input
                id="cp-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="cp-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="cp-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your project"
                className={`${inputClass} h-20 resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cp-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="cp-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="cp-priority" className={labelClass}>
                  Priority
                </label>
                <select
                  id="cp-priority"
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
                <label htmlFor="cp-start" className={labelClass}>
                  Start Date
                </label>
                <input
                  id="cp-start"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cp-end" className={labelClass}>
                  End Date
                </label>
                <input
                  id="cp-end"
                  type="date"
                  value={formData.end_date}
                  // start_date is already a yyyy-MM-dd string from the date
                  // input; round-tripping it through toISOString() shifted it a
                  // day for users behind UTC.
                  min={formData.start_date || undefined}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cp-lead" className={labelClass}>
                Project Lead
              </label>
              <select
                id="cp-lead"
                value={formData.team_lead}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    team_lead: e.target.value,
                    team_members: e.target.value
                      ? [...new Set([...formData.team_members, e.target.value])]
                      : formData.team_members,
                  })
                }
                className={inputClass}
              >
                <option value="">No lead</option>
                {workspaceMembers.map((member) => (
                  <option key={member.user.email} value={member.user.email}>
                    {member.user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cp-members" className={labelClass}>
                Team Members
              </label>
              <select
                id="cp-members"
                value=""
                className={inputClass}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    !formData.team_members.includes(e.target.value)
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      team_members: [...prev.team_members, e.target.value],
                    }));
                  }
                }}
              >
                <option value="">Add team members</option>
                {workspaceMembers
                  .filter(
                    (member) =>
                      !formData.team_members.includes(member.user.email)
                  )
                  .map((member) => (
                    <option key={member.user.email} value={member.user.email}>
                      {member.user.email}
                    </option>
                  ))}
              </select>

              {formData.team_members.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {formData.team_members.map((email) => (
                    <Badge key={email} variant="brand" className="pr-1.5">
                      {email}
                      <button
                        type="button"
                        aria-label={`Remove ${email}`}
                        onClick={() => removeTeamMember(email)}
                        className="ml-0.5 w-4 h-4 rounded flex items-center justify-center hover:bg-sky-100 transition-colors"
                      >
                        <XIcon size={10} strokeWidth={3} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-5">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Tooltip title={isAdmin ? undefined : msg("PROJECT_CREATE_DENIED")}>
              <Button
                type="submit"
                disabled={isSubmitting || !currentWorkspace || !isAdmin}
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </Tooltip>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProjectDialog;
