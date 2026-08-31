import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarIcon,
  MessageCircle,
  FolderOpen,
  Send,
  FileX,
  Info,
} from "lucide-react";
import { useAuth, useUser } from "../lib/auth";
import useVisibleProjects from "../hooks/useVisibleProjects";
import { formatEnumLabel } from "../lib/format";
import { canComment } from "../lib/permissions";
import {
  TASK_STATUS_TONE,
  TASK_TYPE_TONE,
  PRIORITY_TONE,
  PROJECT_STATUS_TONE,
} from "../lib/tone";
import api from "../configs/api";
import useMessages from "../hooks/useMessages";
import {
  Badge,
  Card,
  EmptyState,
  SectionCard,
  Tooltip,
  inputClass,
} from "../ui";

const TaskDetails = () => {
  const { msg } = useMessages();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const { user } = useUser();
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  // addComment is restricted to project members server-side; without this the
  // composer accepted input from anyone and failed with a 403 on Post.
  const mayComment = canComment(project, user?.id);

  const { currentWorkspace } = useSelector((state) => state.workspace);
  const visibleProjects = useVisibleProjects();

  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    try {
      const token = await getToken();
      const { data } = await api.get(`/api/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments(data.comments || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }, [taskId, getToken]);

  const fetchTaskDetails = useCallback(() => {
    if (!projectId || !taskId) {
      setTask(null);
      setProject(null);
      setLoading(false);
      return;
    }

    // Workspace/projects not loaded yet — stay in loading state so the effect
    // re-runs (and resolves) once the data arrives.
    if (!currentWorkspace) return;

    const proj = (visibleProjects || []).find((p) => p.id === projectId);
    const tsk = proj?.tasks?.find((t) => t.id === taskId);

    setProject(proj || null);
    setTask(tsk || null);
    setLoading(false);
  }, [projectId, taskId, currentWorkspace, visibleProjects]);

  const handleAddComment = async () => {
    if (!newComment.trim() || isPostingComment) return;
    if (!mayComment) {
      toast.error(msg("COMMENT_DENIED"));
      return;
    }

    setIsPostingComment(true);

    try {
      toast.loading("Adding comment...");

      const token = await getToken();
      const { data } = await api.post(
        "/api/comments",
        { taskId: task.id, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      toast.dismissAll();
      toast.success(data.message);
    } catch (error) {
      toast.dismissAll();
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsPostingComment(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  // Poll for new comments while a task is open. Keyed on taskId rather than the
  // task object so a task re-render does not tear down and rebuild the interval.
  const hasTask = Boolean(task);
  useEffect(() => {
    if (!taskId || !hasTask) return;

    fetchComments();
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [taskId, hasTask, fetchComments]);

  if (loading) {
    return (
      <div className="py-24 text-center text-[13px] text-slate-400">
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <Card>
        <EmptyState
          icon={FileX}
          title={msg("TASK_NOT_FOUND")}
          hint="It may have been deleted, or you may not have access to it."
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {/* Discussion */}
      <div className="lg:col-span-2 min-w-0 order-2 lg:order-1">
        <Card className="flex flex-col lg:h-[78vh] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <MessageCircle size={15} className="text-slate-400" strokeWidth={2} />
            <h2 className="text-[14px] font-bold text-slate-800">
              Task Discussion
            </h2>
            <Badge variant="default" size="sm" className="ml-1">
              {comments.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {comments.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-slate-400">
                No comments yet. Be the first.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {comments.map((comment) => {
                  const mine = comment.user?.id === user?.id;
                  return (
                    <div
                      key={comment.id}
                      className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl border ${
                        mine
                          ? "ml-auto bg-sky-50 border-sky-100"
                          : "mr-auto bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 shrink-0 rounded-md bg-white border border-slate-200 text-slate-500 flex items-center justify-center text-[9px] font-bold">
                          {comment.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                        <span className="text-[12px] font-bold text-slate-700">
                          {comment.user?.name || "Unknown user"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(comment.createdAt), "dd MMM, HH:mm")}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-700 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-end gap-2">
              <label htmlFor="new-comment" className="sr-only">
                Write a comment
              </label>
              <Tooltip
                title={mayComment ? undefined : msg("COMMENT_DENIED")}
                className="w-full"
              >
                <textarea
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    mayComment ? "Write a comment..." : msg("COMMENT_DENIED")
                  }
                  disabled={!mayComment}
                  className={`${inputClass} resize-none`}
                  rows={2}
                />
              </Tooltip>
              <Tooltip
                title={mayComment ? "Post comment" : msg("COMMENT_DENIED")}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={
                    !mayComment || !newComment.trim() || isPostingComment
                  }
                  aria-label="Post comment"
                  className="w-10 h-10 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/20 hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center transition-all"
                >
                  <Send size={15} strokeWidth={2.2} />
                </button>
              </Tooltip>
            </div>
          </div>
        </Card>
      </div>

      {/* Task + project info */}
      <div className="min-w-0 space-y-5 order-1 lg:order-2">
        <SectionCard title="Task" icon={Info} bodyClassName="p-5">
          <h1 className="text-[16px] font-bold text-slate-900 leading-snug">
            {task.title}
          </h1>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant={TASK_STATUS_TONE[task.status] || "default"} size="sm">
              {formatEnumLabel(task.status)}
            </Badge>
            <Badge variant={TASK_TYPE_TONE[task.type] || "default"} size="sm">
              {formatEnumLabel(task.type)}
            </Badge>
            <Badge variant={PRIORITY_TONE[task.priority] || "default"} size="sm">
              {formatEnumLabel(task.priority)}
            </Badge>
          </div>

          {task.description && (
            <p className="mt-4 text-[13px] text-slate-600 leading-relaxed">
              {task.description}
            </p>
          )}

          <hr className="my-4 border-slate-100" />

          <dl className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <dt className="label-micro text-slate-400">Assignee</dt>
              <dd className="flex items-center gap-2 text-[13px] font-medium text-slate-700 min-w-0">
                <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                  {task.assignee?.name?.[0]?.toUpperCase() || "?"}
                </span>
                <span className="truncate">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="label-micro text-slate-400">Due</dt>
              <dd className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                <CalendarIcon size={13} className="text-slate-400" strokeWidth={2} />
                {task.due_date
                  ? format(new Date(task.due_date), "dd MMM yyyy")
                  : "None"}
              </dd>
            </div>
          </dl>
        </SectionCard>

        {project && (
          <SectionCard title="Project" icon={FolderOpen} bodyClassName="p-5">
            <h2 className="text-[14px] font-bold text-slate-900">
              {project.name}
            </h2>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <Badge
                variant={PROJECT_STATUS_TONE[project.status] || "default"}
                size="sm"
              >
                {formatEnumLabel(project.status)}
              </Badge>
              <Badge
                variant={PRIORITY_TONE[project.priority] || "default"}
                size="sm"
              >
                {formatEnumLabel(project.priority)}
              </Badge>
            </div>

            {project.start_date && (
              <p className="mt-4 text-[11px] text-slate-400">
                Started {format(new Date(project.start_date), "dd MMM yyyy")}
              </p>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
