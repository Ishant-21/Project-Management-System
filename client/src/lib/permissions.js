// Mirrors the authorization rules enforced in the server controllers. Keep the
// two in sync: the server is the real gate, these helpers only stop the UI from
// offering actions that are guaranteed to come back 401/403.
//
//   createProject            workspace ADMIN            projectController.js:31
//   updateProject            workspace ADMIN OR lead    projectController.js:144
//   addMember (to project)   project lead ONLY          projectController.js:200
//   createTask               project lead               taskController.js:27
//   updateTask               project lead               taskController.js:101
//   deleteTask               project lead               taskController.js:162
//   addComment               project member             commentController.js:33
//   addMember (to workspace) workspace ADMIN            workspaceController.js:123

// A membership row may carry either a flat `userId` or a nested `user` object
// depending on which endpoint produced it, so check both.
const matchesUser = (membership, userId) =>
  Boolean(
    userId &&
      (membership?.userId === userId || membership?.user?.id === userId)
  );

export const isWorkspaceAdmin = (workspace, userId) =>
  Boolean(
    workspace?.members?.some(
      (m) => matchesUser(m, userId) && m.role === "ADMIN"
    )
  );

export const isProjectLead = (project, userId) =>
  Boolean(userId && project?.team_lead === userId);

export const isProjectMember = (project, userId) =>
  Boolean(project?.members?.some((m) => matchesUser(m, userId)));

// --- Action-level permissions ---------------------------------------------

export const canCreateProject = (workspace, userId) =>
  isWorkspaceAdmin(workspace, userId);

export const canInviteToWorkspace = (workspace, userId) =>
  isWorkspaceAdmin(workspace, userId);

// The server accepts a workspace admin OR the project lead here.
export const canEditProject = (workspace, project, userId) =>
  isWorkspaceAdmin(workspace, userId) || isProjectLead(project, userId);

// Deliberately stricter than canEditProject: addMember checks the lead only,
// so a workspace admin who isn't the lead cannot add project members.
export const canAddProjectMember = (project, userId) =>
  isProjectLead(project, userId);

// Creating and deleting tasks stays with the lead.
export const canManageTasks = (project, userId) =>
  isProjectLead(project, userId);

// Editing a single task: the lead may edit any task in the project, and anyone
// may edit the task assigned to them (taskController.js updateTask).
export const canEditTask = (project, task, userId) =>
  isProjectLead(project, userId) ||
  Boolean(userId && task?.assigneeId === userId) ||
  Boolean(userId && task?.assignee?.id === userId);

// Reassigning a task to somebody else remains lead-only.
export const canReassignTask = (project, userId) =>
  isProjectLead(project, userId);

export const canComment = (project, userId) =>
  isProjectMember(project, userId);
