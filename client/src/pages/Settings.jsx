import { useUser, useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogOut, UserCircle2, Mail, Building2 } from "lucide-react";
import { Badge, Button, PageHeader, SectionCard } from "../ui";
import { formatEnumLabel } from "../lib/format";

const Settings = () => {
  const { user, isLoaded } = useUser();
  const auth = useAuth();
  const navigate = useNavigate();
  const { workspaces, currentWorkspace } = useSelector(
    (state) => state.workspace
  );

  const handleLogout = () => {
    auth.clearToken();
    navigate("/signin");
  };

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="py-24 text-center text-[13px] text-slate-400">
        You are not signed in.
      </div>
    );
  }

  const myRole = currentWorkspace?.members?.find(
    (m) => m.userId === user.id || m.user?.id === user.id
  )?.role;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Your profile and workspace access"
      />

      <SectionCard title="Profile" icon={UserCircle2} bodyClassName="p-5">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 shrink-0 rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/20 flex items-center justify-center text-[20px] font-bold text-white">
            {user.name?.[0]?.toUpperCase() || "?"}
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-slate-900 truncate">
              {user.name}
            </p>
            <p className="flex items-center gap-1.5 mt-0.5 text-[13px] text-slate-500 truncate">
              <Mail size={12} strokeWidth={2} className="text-slate-400" />
              {user.email}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={`Workspaces (${workspaces.length})`}
        icon={Building2}
        bodyClassName="p-3"
      >
        {workspaces.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-slate-400">
            You are not a member of any workspace yet
          </p>
        ) : (
          <div className="space-y-1.5">
            {workspaces.map((ws) => {
              const active = ws.id === currentWorkspace?.id;
              const role = ws.members?.find(
                (m) => m.userId === user.id || m.user?.id === user.id
              )?.role;

              return (
                <div
                  key={ws.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50"
                >
                  <span
                    className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${
                      active
                        ? "bg-sky-50 text-sky-500"
                        : "bg-white border border-slate-200 text-slate-400"
                    }`}
                  >
                    <Building2 size={13} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-semibold text-slate-800 truncate">
                    {ws.name}
                  </span>
                  {active && (
                    <Badge variant="brand" size="sm">
                      Current
                    </Badge>
                  )}
                  <Badge
                    variant={role === "ADMIN" ? "violet" : "default"}
                    size="sm"
                  >
                    {formatEnumLabel(role) || "Member"}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Session" icon={LogOut} bodyClassName="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800">
              Sign out of this device
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {myRole
                ? `You are signed in as ${formatEnumLabel(myRole)} in ${currentWorkspace?.name}.`
                : "You will need to sign in again to continue."}
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout} className="shrink-0">
            <LogOut size={14} strokeWidth={2.2} />
            Sign out
          </Button>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
