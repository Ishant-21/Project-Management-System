import { Plus } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../lib/auth";
import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";


const Dashboard = () => {
  const { user } = useUser();
  const currentWorkspace = useSelector((state) => state.workspace.currentWorkspace);
  const isAdmin = currentWorkspace?.members?.some(
    (m) => ((m.userId === user?.id) || (m.user && m.user.id === user?.id)) && m.role === "ADMIN"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {" "}
            Welcome back, {user?.fullName || "User"}{" "}
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            {" "}
            Here's what's happening with your projects today{" "}
          </p>
        </div>

        <button
          onClick={() => isAdmin && setIsDialogOpen(true)}
          disabled={!isAdmin}
          title={!isAdmin ? "Only workspace admins can create projects" : "Create new project"}
          className={`flex items-center gap-2 px-5 py-2 text-sm rounded space-x-2 transition ${
            isAdmin
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90"
              : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Plus size={16} /> New Project
        </button>

        <CreateProjectDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>

      <StatsGrid />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ProjectOverview />
          <RecentActivity />
        </div>
        <div>
          <TasksSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
