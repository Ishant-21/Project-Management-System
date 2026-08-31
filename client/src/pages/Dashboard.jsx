import { Plus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { canCreateProject } from "../lib/permissions";
import useMessages from "../hooks/useMessages";
import { Button, PageHeader, Tooltip } from "../ui";

const Dashboard = () => {
  const { msg } = useMessages();
  const { user } = useUser();
  const currentWorkspace = useSelector(
    (state) => state.workspace.currentWorkspace
  );
  // Mirrors the server rule in one place - see lib/permissions.js
  const isAdmin = canCreateProject(currentWorkspace, user?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here is what is happening across your projects today"
        actions={
          <Tooltip
            title={isAdmin ? "Create new project" : msg("PROJECT_CREATE_DENIED")}
          >
            <Button
              onClick={() => isAdmin && setIsDialogOpen(true)}
              disabled={!isAdmin}
            >
              <Plus size={15} strokeWidth={2.4} />
              New Project
            </Button>
          </Tooltip>
        }
      />

      <StatsGrid />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5 min-w-0">
          <ProjectOverview />
          <RecentActivity />
        </div>
        <div className="min-w-0">
          <TasksSummary />
        </div>
      </div>

      <CreateProjectDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
