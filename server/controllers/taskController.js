import prisma from "../configs/prisma.js";

// Create task
export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;
    const origin = req.get("origin");

    // Check if user has admin role for project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    } else if (
      assigneeId &&
      !project.members.find((member) => member.userId === assigneeId)
    ) {
      return res.status(403).json({
        message: "Assignee is not a member of the project / workspace",
      });
    }

    // assigneeId and due_date are required (non-null) columns — validate up
    // front so we return a clean 400 instead of a Prisma 500.
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!assigneeId) {
      return res.status(400).json({ message: "An assignee is required" });
    }
    const parsedDueDate = due_date ? new Date(due_date) : null;
    if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ message: "A valid due date is required" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId,
        status,
        type,
        due_date: parsedDueDate,
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });

    // Inngest removed: task assignment event emission omitted for simpler app

    res.json({ task: taskWithAssignee, message: "Task created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { userId } = await req.auth();

    // Check if user has admin role for project
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    // Whitelist updatable fields — never write req.body directly (would allow
    // changing id/projectId/createdAt and 500 on unknown/relation fields).
    const { title, description, status, type, priority, assigneeId, due_date } =
      req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (type !== undefined) data.type = type;
    if (priority !== undefined) data.priority = priority;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;
    if (due_date !== undefined) data.due_date = new Date(due_date);

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ task: updatedTask, message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { tasksIds } = req.body;
    const tasks = await prisma.task.findMany({
      where: { id: { in: tasksIds } },
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Tasks not found" });
    }

    // All tasks must belong to a single project (prevents deleting tasks across
    // projects the caller isn't lead of via a mixed id list).
    const projectIds = [...new Set(tasks.map((t) => t.projectId))];
    if (projectIds.length > 1) {
      return res
        .status(400)
        .json({ message: "Cannot delete tasks from multiple projects" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectIds[0] },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    // Scope the delete to the authorized project as defense-in-depth.
    await prisma.task.deleteMany({
      where: { id: { in: tasksIds }, projectId: project.id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
