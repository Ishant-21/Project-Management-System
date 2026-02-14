import prisma from "../configs/prisma.js";
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
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const id = crypto.randomUUID();
    const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${id.slice(0, 8)}`;

    const workspace = await prisma.workspace.create({
      data: {
        id,
        name,
        slug,
        description: description || "",
        ownerId: userId,
      },
    });

    // add creator as admin member
    await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: id,
        role: "ADMIN",
      },
    });

    const ws = await prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: true } }, owner: true },
    });

    res.json({ workspace: ws, message: "Workspace created" });
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

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if no missing parameters
    if (!workspaceId || !role) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check if role is valid
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check creator has admin role
    if (
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    ) {
      return res
        .status(401)
        .json({ message: "You do not have admin privileges" });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      (member) => member.userId === user.id
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    return res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
