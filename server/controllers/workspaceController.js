import prisma from "../configs/prisma.js";
import { MESSAGES } from "../constants/messages.js";
import crypto from "crypto";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    console.log("[workspace] fetching for userId:", userId);
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });
    console.log("[workspace] returning workspaces:", workspaces.length);

    res.json({ workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Create a new workspace and add the creator as ADMIN
export const createWorkspace = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: MESSAGES.WORKSPACE_NAME_REQUIRED });
    }

    const id = crypto.randomUUID();
    const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${id.slice(0, 8)}`;

    // Create the workspace and add the creator as ADMIN atomically, so a
    // failure can't leave an orphaned workspace with no members (which would be
    // invisible to getUserWorkspaces and thus inaccessible to its creator).
    const workspace = await prisma.workspace.create({
      data: {
        id,
        name,
        slug,
        description: description || "",
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });

    const ws = await prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, owner: true },
    });

    res.json({ workspace: ws, message: MESSAGES.WORKSPACE_CREATED });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    // Validate parameters BEFORE any DB lookup (a missing email would otherwise
    // make prisma.user.findUnique throw a 500).
    if (!email || !workspaceId || !role) {
      return res.status(400).json({ message: MESSAGES.WORKSPACE_MISSING_PARAMS });
    }

    // Check if role is valid
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: MESSAGES.WORKSPACE_INVALID_ROLE });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
    }

    // fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: MESSAGES.WORKSPACE_NOT_FOUND });
    }

    // Check creator has admin role
    if (
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    ) {
      return res
        .status(401)
        .json({ message: MESSAGES.WORKSPACE_ADMIN_REQUIRED });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      (member) => member.userId === user.id
    );

    if (existingMember) {
      return res.status(400).json({ message: MESSAGES.WORKSPACE_MEMBER_EXISTS });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    return res.json({ member, message: MESSAGES.WORKSPACE_MEMBER_ADDED });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
