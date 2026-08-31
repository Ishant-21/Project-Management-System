import { useMemo, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useUser } from "../lib/auth";
import { useSelector } from "react-redux";
import { formatEnumLabel } from "../lib/format";
import { canInviteToWorkspace } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  Tooltip,
  inputClass,
} from "../ui";

const Team = () => {
  const { msg } = useMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null
  );
  const { user } = useUser();
  const isAdmin = canInviteToWorkspace(currentWorkspace, user?.id);

  const projects = useMemo(
    () => currentWorkspace?.projects || [],
    [currentWorkspace]
  );

  // Derived from the workspace instead of mirrored into local state.
  const users = useMemo(
    () => currentWorkspace?.members || [],
    [currentWorkspace]
  );
  const tasks = useMemo(
    () => projects.flatMap((project) => project.tasks || []),
    [projects]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter(
      (member) =>
        member?.user?.name?.toLowerCase().includes(term) ||
        member?.user?.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const stats = [
    {
      icon: UsersIcon,
      label: "Total Members",
      value: users.length,
      sublabel: "in this workspace",
      tone: "brand",
    },
    {
      icon: Activity,
      label: "Active Projects",
      value: projects.filter(
        (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
      ).length,
      sublabel: `of ${projects.length} total`,
      tone: "success",
    },
    {
      icon: Shield,
      label: "Total Tasks",
      value: tasks.length,
      sublabel: "across all projects",
      tone: "violet",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Manage members and their contributions"
        actions={
          <Tooltip
            title={isAdmin ? "Invite member" : msg("WORKSPACE_ADMIN_REQUIRED")}
          >
            <Button
              onClick={() => isAdmin && setIsDialogOpen(true)}
              disabled={!isAdmin}
            >
              <UserPlus size={15} strokeWidth={2.4} />
              Add Member
            </Button>
          </Tooltip>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <label htmlFor="team-search" className="sr-only">
          Search team members
        </label>
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          id="team-search"
          type="search"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClass} pl-9`}
        />
      </div>

      {/* Members */}
      {filteredUsers.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title={
              users.length === 0
                ? "No team members yet"
                : "No members match your search"
            }
            hint={
              users.length === 0
                ? "Invite team members to start collaborating"
                : "Try a different search term"
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden sm:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Name", "Email", "Role"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 label-micro text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Renamed from `user` — it shadowed the signed-in user from
                      useUser() inside this scope. */}
                  {filteredUsers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2.5">
                          <span className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-[12px] font-bold">
                            {member.user?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-800 truncate">
                            {member.user?.name || "Unknown User"}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-slate-500 whitespace-nowrap">
                        {member.user?.email || "None"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            member.role === "ADMIN" ? "violet" : "default"
                          }
                          size="sm"
                        >
                          {formatEnumLabel(member.role) || "Member"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredUsers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-[13px] font-bold">
                    {member.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-800 truncate">
                      {member.user?.name || "Unknown User"}
                    </p>
                    <p className="text-[12px] text-slate-400 truncate">
                      {member.user?.email || "None"}
                    </p>
                  </div>
                  <Badge
                    variant={member.role === "ADMIN" ? "violet" : "default"}
                    size="sm"
                  >
                    {formatEnumLabel(member.role) || "Member"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <InviteMemberDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
};

export default Team;
