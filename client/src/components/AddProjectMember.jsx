import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAuth, useUser } from "../lib/auth";
import { canAddProjectMember } from "../lib/permissions";
import api from "../configs/api";
import toast from "react-hot-toast";
import { fetchWorkspaces } from "../features/workspaceSlice";
import Modal from "./Modal";
import useMessages from "../hooks/useMessages";
import { Button, Tooltip, inputClass, labelClass } from "../ui";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
  const { msg } = useMessages();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  const { getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );

  const project = currentWorkspace?.projects?.find((p) => p.id === id);
  // Default to an empty list — this used to be undefined whenever the project
  // had not resolved, and the `.includes()` below threw while rendering.
  const projectMemberEmails = (project?.members || []).map(
    (member) => member?.user?.email
  );
  const availableMembers = (currentWorkspace?.members || []).filter(
    (member) => !projectMemberEmails.includes(member?.user?.email)
  );
  // Server-side this endpoint is project-lead only. Checked here as well so the
  // dialog cannot submit a doomed request if it is ever opened another way.
  const canAdd = canAddProjectMember(project, user?.id);

  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!project) {
      toast.error(msg("PROJECT_NOT_SELECTED"));
      return;
    }
    if (!canAdd) {
      toast.error(msg("PROJECT_MEMBER_ADD_DENIED"));
      return;
    }

    setIsAdding(true);

    try {
      const { data } = await api.post(
        `/api/projects/${project.id}/addMember`,
        { email },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      toast.success(data.message);
      setEmail("");
      setIsDialogOpen(false);
      dispatch(fetchWorkspaces({ getToken }));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      labelledBy="add-project-member-title"
      panelClassName="max-w-md"
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
          <span className="w-9 h-9 shrink-0 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
            <UserPlus size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h2
              id="add-project-member-title"
              className="text-[16px] font-bold text-slate-900"
            >
              Add Member to Project
            </h2>
            {project && (
              <p className="text-[12px] text-slate-500 truncate">
                to{" "}
                <span className="font-semibold text-sky-600">
                  {project.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {!canAdd && (
          <div className="mb-5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] text-slate-600">
            {msg("PROJECT_MEMBER_ADD_DENIED")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-member-email" className={labelClass}>
              Workspace Member
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              {/* Lists all non-project members from the current workspace */}
              <select
                id="project-member-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canAdd}
                className={`${inputClass} pl-9`}
                required
              >
                <option value="">Select a member</option>
                {availableMembers.map((member) => (
                  <option key={member.user.id} value={member.user.email}>
                    {member.user.email}
                  </option>
                ))}
              </select>
            </div>
            {availableMembers.length === 0 && (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Every workspace member is already on this project.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Tooltip
              title={canAdd ? undefined : msg("PROJECT_MEMBER_ADD_DENIED")}
            >
              <Button
                type="submit"
                disabled={isAdding || !project || !email || !canAdd}
              >
                {isAdding ? "Adding..." : "Add Member"}
              </Button>
            </Tooltip>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddProjectMember;
