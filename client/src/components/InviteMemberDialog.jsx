import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { useOrganization } from "../lib/auth";
import { useUser } from "../lib/auth";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { canInviteToWorkspace } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Button, Tooltip, inputClass, labelClass } from "../ui";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const { msg } = useMessages();
  const { organization } = useOrganization();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const { user } = useUser();
  // Mirrors the server rule in one place — see lib/permissions.js
  const isAdmin = canInviteToWorkspace(currentWorkspace, user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "org:member",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organization) {
      toast.error(msg("WORKSPACE_NOT_SELECTED"));
      return;
    }
    if (!isAdmin) {
      toast.error(msg("WORKSPACE_ADMIN_REQUIRED"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await organization.inviteMember({
        emailAddress: formData.email,
        role: formData.role,
      });

      toast.success(result?.message);
      // Reset so reopening the dialog starts fresh instead of showing the
      // previously invited address.
      setFormData({ email: "", role: "org:member" });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      labelledBy="invite-member-title"
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
              id="invite-member-title"
              className="text-[16px] font-bold text-slate-900"
            >
              Add Team Member
            </h2>
            {currentWorkspace && (
              <p className="text-[12px] text-slate-500 truncate">
                to{" "}
                <span className="font-semibold text-sky-600">
                  {currentWorkspace.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {!isAdmin && (
          <div className="mb-5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] text-slate-600">
            {msg("WORKSPACE_ADMIN_REQUIRED")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={!isAdmin} className="space-y-4 min-w-0">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="teammate@company.com"
                  className={`${inputClass} pl-9`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="invite-role" className={labelClass}>
                Role
              </label>
              <select
                id="invite-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={inputClass}
              >
                <option value="org:member">Member</option>
                <option value="org:admin">Admin</option>
              </select>
            </div>
          </fieldset>

          {/* Cancel stays outside the fieldset so it is always usable */}
          <div className="flex justify-end gap-2 pt-5">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Tooltip title={isAdmin ? undefined : msg("WORKSPACE_ADMIN_REQUIRED")}>
              <Button
                type="submit"
                disabled={isSubmitting || !currentWorkspace || !isAdmin}
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </Tooltip>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InviteMemberDialog;
