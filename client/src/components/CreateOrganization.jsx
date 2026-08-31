import { useState } from "react";
import { useDispatch } from "react-redux";
import api from "../configs/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { addWorkspace } from "../features/workspaceSlice";
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import { Button, SectionCard, inputClass, labelClass } from "../ui";

const CreateOrganization = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(
        "/api/workspaces",
        { name, description },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data?.workspace) {
        // Push the new workspace into the store and select it. Without this the
        // app only refetches when it holds zero workspaces, so a second one
        // stayed invisible until a full page reload.
        dispatch(addWorkspace(data.workspace));
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={2.4} />
        Back
      </button>

      <SectionCard
        title="Create Workspace"
        icon={Building2}
        bodyClassName="p-5"
      >
        {error && (
          <div
            className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-100 text-[12px] font-medium text-rose-700"
            role="alert"
          >
            <AlertCircle size={14} strokeWidth={2.2} className="shrink-0 mt-px" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="org-name" className={labelClass}>
              Workspace name
            </label>
            <input
              id="org-name"
              className={inputClass}
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="org-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="org-description"
              className={`${inputClass} h-20 resize-none`}
              placeholder="What is this workspace for? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default CreateOrganization;
