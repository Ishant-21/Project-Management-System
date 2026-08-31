import { Plus, Save, SlidersHorizontal, Users, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectMember from "./AddProjectMember";
import { useDispatch, useSelector } from "react-redux";
import { useAuth, useUser } from "../lib/auth";
import { canEditProject, canAddProjectMember } from "../lib/permissions";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";
import useMessages from "../hooks/useMessages";
import {
  Badge,
  Button,
  SectionCard,
  Tooltip,
  inputClass,
  labelClass,
} from "../ui";

// Accepts an ISO timestamp, a Date, or an already-normalised yyyy-MM-dd string
// and returns what <input type="date"> expects — "" for anything unusable.
const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  // Date-only values are stored as UTC midnight; read UTC parts so they do not
  // slip a day for users behind UTC.
  return date.toISOString().slice(0, 10);
};

export default function ProjectSettings({ project }) {
  const { msg } = useMessages();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user } = useUser();
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );

  // These rules were enforced only on the server, so the form happily accepted
  // edits from anyone and then failed with a 403 on save. The two are
  // deliberately different: updateProject allows a workspace admin OR the lead,
  // while addMember allows the lead only.
  const canEdit = canEditProject(currentWorkspace, project, user?.id);
  const canAddMember = canAddProjectMember(project, user?.id);

  // Seeded from the real project — these used to be hardcoded placeholders that
  // flashed on screen before the effect below copied the actual project in.
  const [formData, setFormData] = useState(() => ({
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    start_date: "",
    end_date: "",
    ...(project || {}),
  }));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      toast.error(msg("PROJECT_EDIT_DENIED"));
      return;
    }

    setIsSubmitting(true);
    toast.loading("Saving...");

    try {
      const { data } = await api.put("/api/projects/", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      setIsDialogOpen(false);

      dispatch(fetchWorkspaces({ getToken }));
      toast.dismissAll();
      toast.success(data.message);
    } catch (error) {
      toast.dismissAll();
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (project) setFormData(project);
  }, [project]);

  const projectMembers = project?.members || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
      {/* Project details */}
      <SectionCard
        title="Project Details"
        icon={SlidersHorizontal}
        bodyClassName="p-5"
      >
        {!canEdit && (
          <div className="mb-5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] text-slate-600">
            {msg("PROJECT_EDIT_DENIED")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* A disabled fieldset natively disables every control inside it, so
              read-only users get the not-allowed cursor on each field rather
              than a form that submits and 403s. */}
          <fieldset disabled={!canEdit} className="space-y-4 min-w-0">
            <div>
              <label htmlFor="project-name" className={labelClass}>
                Project Name
              </label>
              <input
                id="project-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="project-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="project-description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`${inputClass} h-24 resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="project-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="project-priority" className={labelClass}>
                  Priority
                </label>
                <select
                  id="project-priority"
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

            {/* Dates are held as plain yyyy-MM-dd strings. Storing `new Date(...)`
                meant clearing the field produced an Invalid Date, which `format`
                then threw a RangeError on and took the whole page down. */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-start-date" className={labelClass}>
                  Start Date
                </label>
                <input
                  id="project-start-date"
                  type="date"
                  value={toDateInputValue(formData.start_date)}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="project-end-date" className={labelClass}>
                  End Date
                </label>
                <input
                  id="project-end-date"
                  type="date"
                  value={toDateInputValue(formData.end_date)}
                  min={toDateInputValue(formData.start_date) || undefined}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

          </fieldset>

          <div className="flex justify-end pt-5">
            <Tooltip
              title={canEdit ? "Save changes" : msg("PROJECT_EDIT_DENIED")}
            >
              <Button type="submit" disabled={isSubmitting || !canEdit}>
                <Save size={14} strokeWidth={2.2} />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </Tooltip>
          </div>
        </form>
      </SectionCard>

      {/* Team members */}
      <SectionCard
        title={`Team Members (${projectMembers.length})`}
        icon={Users}
        action={
          /* addMember is lead-only server-side — stricter than the form above,
             which a workspace admin may also use. */
          <Tooltip
            placement="left"
            title={
              canAddMember
                ? "Add member to project"
                : msg("PROJECT_MEMBER_ADD_DENIED")
            }
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={() => canAddMember && setIsDialogOpen(true)}
              disabled={!canAddMember}
              aria-label="Add member to project"
            >
              <Plus size={14} strokeWidth={2.4} />
            </Button>
          </Tooltip>
        }
        bodyClassName="p-3"
      >
        {projectMembers.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-slate-400">
            No members on this project yet
          </p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {projectMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50"
              >
                <span className="w-7 h-7 shrink-0 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-bold">
                  {member?.user?.name?.[0]?.toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-slate-800 truncate">
                    {member?.user?.name || "Unknown"}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate">
                    {member?.user?.email || ""}
                  </span>
                </span>
                {project?.team_lead === member?.user?.id && (
                  <Badge variant="brand" size="sm">
                    <Crown size={10} strokeWidth={2.4} />
                    Lead
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <AddProjectMember
          isDialogOpen={isDialogOpen && canAddMember}
          setIsDialogOpen={setIsDialogOpen}
        />
      </SectionCard>
    </div>
  );
}
