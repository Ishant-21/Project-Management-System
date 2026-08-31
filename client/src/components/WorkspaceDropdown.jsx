import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Check, Plus, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk, useOrganizationList } from "../lib/auth";

function WorkspaceDropdown() {
  const { setActive, userMemberships, isLoaded } = useOrganizationList();
  const { openCreateOrganization } = useClerk();

  const { workspaces } = useSelector((state) => state.workspace);
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSelectWorkspace = (organizationId) => {
    setActive({ organization: organizationId });
    dispatch(setCurrentWorkspace(organizationId));
    setIsOpen(false);
    navigate("/");
  };

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentWorkspace && isLoaded) {
      setActive({ organization: currentWorkspace.id });
    }
  }, [currentWorkspace, isLoaded, setActive]);

  const memberships = userMemberships?.data || [];

  return (
    <div className="p-3 border-b border-white/5" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <span className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Building2 size={15} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold text-white truncate">
              {currentWorkspace?.name || "Select workspace"}
            </span>
            <span className="block text-[11px] text-slate-500 truncate">
              {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
            </span>
          </span>
          <ChevronsUpDown size={14} className="shrink-0 text-slate-500" />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <p className="label-micro text-slate-400 px-4 pt-3 pb-2">
              Workspaces
            </p>

            <div className="max-h-64 overflow-y-auto pb-1">
              {memberships.length === 0 && (
                <p className="px-4 py-2 text-[13px] text-slate-400">
                  No workspaces yet
                </p>
              )}
              {memberships.map(({ organization: ws }) => {
                const selected = currentWorkspace?.id === ws.id;
                return (
                  <button
                    type="button"
                    key={ws.id}
                    onClick={() => onSelectWorkspace(ws.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${
                        selected
                          ? "bg-sky-50 text-sky-500"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Building2 size={13} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-slate-800 truncate">
                        {ws.name}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {ws.membersCount || 0} member
                        {ws.membersCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    {selected && (
                      <Check size={14} className="shrink-0 text-sky-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                openCreateOrganization();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 border-t border-slate-100 text-[12px] font-semibold text-sky-600 hover:bg-sky-50 transition-colors"
            >
              <Plus size={14} strokeWidth={2.4} />
              Create workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceDropdown;
