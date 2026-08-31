// Single source of truth for every user-facing message in the app.
//
// The client does not define message text of its own: it reads error/success
// text off the `message` field of a response, and fetches this catalog from
// GET /api/messages for the copy it needs before any request is made (the
// tooltip on a button the current user is not allowed to press, for example).
// Add a string here, never in the client.
export const MESSAGES = {
  // --- Auth ---------------------------------------------------------------
  AUTH_CREDENTIALS_REQUIRED: "Email and password are required",
  AUTH_USER_EXISTS: "User already exists",
  AUTH_INVALID_CREDENTIALS: "Invalid credentials",
  AUTH_UNAUTHORIZED: "Unauthorized",
  AUTH_LOGIN_FAILED: "Could not sign you in. Please try again.",
  USER_NOT_FOUND: "User not found",

  // --- Workspace ----------------------------------------------------------
  WORKSPACE_NAME_REQUIRED: "Workspace name is required",
  WORKSPACE_NOT_FOUND: "Workspace not found",
  WORKSPACE_CREATED: "Workspace created",
  WORKSPACE_NOT_SELECTED: "No active workspace selected",
  WORKSPACE_MISSING_PARAMS: "Missing required parameters",
  WORKSPACE_INVALID_ROLE: "Invalid role",
  WORKSPACE_MEMBER_EXISTS: "User is already a member",
  WORKSPACE_MEMBER_ADDED: "Member added successfully",
  // Shown both as the 403 body and as the tooltip on the disabled control.
  WORKSPACE_ADMIN_REQUIRED: "Only workspace admins can invite members",

  // --- Project ------------------------------------------------------------
  PROJECT_NAME_REQUIRED: "Project name is required",
  PROJECT_ID_REQUIRED: "Project id is required",
  PROJECT_NOT_FOUND: "Project not found",
  PROJECT_NOT_SELECTED: "No project selected",
  PROJECT_TEAM_LEAD_REQUIRED: "A valid team lead is required",
  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_CREATE_DENIED:
    "Only workspace admins can create projects in this workspace",
  PROJECT_EDIT_DENIED:
    "Only workspace admins or the project lead can edit this project",
  PROJECT_MEMBER_ADD_DENIED:
    "Only the project lead can add members to this project",
  PROJECT_MEMBER_EXISTS: "User is already a member",
  PROJECT_MEMBER_ADDED: "Member added successfully",

  // --- Task ---------------------------------------------------------------
  TASK_TITLE_REQUIRED: "Task title is required",
  TASK_ASSIGNEE_REQUIRED: "An assignee is required",
  TASK_DUE_DATE_REQUIRED: "A valid due date is required",
  TASK_NOT_FOUND: "Task not found",
  TASKS_NOT_FOUND: "Tasks not found",
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_ASSIGNEE_NOT_MEMBER:
    "Assignee is not a member of the project / workspace",
  TASK_MULTI_PROJECT_DELETE: "Cannot delete tasks from multiple projects",
  TASK_CREATE_DENIED: "Only the project lead can create tasks",
  // Assignees may edit the task assigned to them; everything else is lead-only.
  TASK_EDIT_DENIED:
    "Only the project lead or the person assigned to this task can edit it",
  TASK_REASSIGN_DENIED: "Only the project lead can reassign a task",
  TASK_DELETE_DENIED: "Only the project lead can delete tasks",

  // --- Comment ------------------------------------------------------------
  COMMENT_CONTENT_REQUIRED: "taskId and content are required",
  COMMENT_ADDED: "Comment added",
  COMMENT_DENIED: "Only project members can comment on this task",
};

export default MESSAGES;
