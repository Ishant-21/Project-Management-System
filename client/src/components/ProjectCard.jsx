import { Link } from "react-router-dom";
import { UsersIcon, ListChecks } from "lucide-react";
import { formatEnumLabel } from "../lib/format";
import { PROJECT_STATUS_TONE, PRIORITY_DOT } from "../lib/tone";
import { Badge, Card } from "../ui";

const ProjectCard = ({ project }) => {
  const taskCount = project.tasks?.length || 0;
  const doneCount = (project.tasks || []).filter((t) => t.status === "DONE")
    .length;

  return (
    <Card
      as={Link}
      hover
      to={`/projectsDetail?id=${project.id}&tab=tasks`}
      className="group block p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 text-[12px] text-slate-500 line-clamp-2 min-h-[2rem]">
            {project.description || "No description"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant={PROJECT_STATUS_TONE[project.status] || "default"} size="sm">
          {formatEnumLabel(project.status)}
        </Badge>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              PRIORITY_DOT[project.priority] || "bg-slate-400"
            }`}
          />
          {formatEnumLabel(project.priority)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <UsersIcon size={12} strokeWidth={2} />
          {project.members?.length || 0} member
          {project.members?.length === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks size={12} strokeWidth={2} />
          {doneCount} of {taskCount} done
        </span>
      </div>
    </Card>
  );
};

export default ProjectCard;
