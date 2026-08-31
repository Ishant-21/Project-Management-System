import prisma from "../configs/prisma.js";
import { MESSAGES } from "../constants/messages.js";

// Add comment
export const addComment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, taskId } = req.body;

    if (!taskId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: MESSAGES.COMMENT_CONTENT_REQUIRED });
    }

    // Check if user is project member
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: MESSAGES.TASK_NOT_FOUND });
    }

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: MESSAGES.PROJECT_NOT_FOUND });
    }

    const member = project.members.find((member) => member.userId === userId);

    if (!member) {
      return res
        .status(403)
        .json({ message: MESSAGES.COMMENT_DENIED });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        content,
        userId,
      },
      include: { user: true },
    });

    res.json({ comment, message: MESSAGES.COMMENT_ADDED });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Get comments for task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
    });

    res.json({ comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
