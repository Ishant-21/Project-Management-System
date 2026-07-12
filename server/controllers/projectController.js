import prisma from "../configs/prisma.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    // Check if user has admin role for workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (
      !workspace.members.some(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    ) {
      return res.status(403).json({
        message:
          "You don't have permission to create projects in this workspace",
      });
    }

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    // Get Team Lead using email. team_lead is a required FK, so it must resolve
    // to a real user — otherwise Prisma throws a 500 on create.
    const teamLead = team_lead
      ? await prisma.user.findUnique({
          where: { email: team_lead },
          select: { id: true },
        })
      : null;

    if (!teamLead) {
      return res
        .status(400)
        .json({ message: "A valid team lead is required" });
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLead.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    // Add members to project if they are in the workspace
    if (team_members?.length > 0) {
      const membersToAdd = [];
      workspace.members.forEach((member) => {
        if (team_members.includes(member.user.email)) {
          membersToAdd.push(member.user.id);
        }
      });

      await prisma.projectMember.createMany({
        data: membersToAdd.map((memberId) => ({
          projectId: project.id,
          userId: memberId,
        })),
      });
    }

    const projectWithMembers = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: { include: { user: true } },
        tasks: {
          include: { assignee: true, comments: { include: { user: true } } },
        },
        owner: true,
      },
    });

    res.json({
      project: projectWithMembers,
      message: "Project created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      id,
      description,
      name,
      status,
      start_date,
      end_date,
      progress,
      priority,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Project id is required" });
    }

    // Authorize against the project's REAL workspace, not a workspaceId from
    // the body (which could point at a workspace the caller controls).
    const existing = await prisma.project.findUnique({
      where: { id },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = existing.workspace.members.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );
    const isLead = existing.team_lead === userId;

    if (!isAdmin && !isLead) {
      return res.status(403).json({
        message: "You don't have permission to update this project",
      });
    }

    // Whitelist updatable fields; skip (undefined) rather than null when a field
    // is omitted so partial updates don't wipe existing values. workspaceId is
    // intentionally NOT updatable here (no re-parenting via this endpoint).
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (progress !== undefined) data.progress = progress;
    if (start_date !== undefined) {
      data.start_date = start_date ? new Date(start_date) : null;
    }
    if (end_date !== undefined) {
      data.end_date = end_date ? new Date(end_date) : null;
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    res.json({ project, message: "Project updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Add Member to Project
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { projectId } = req.params;
    const { email } = req.body;

    // Check if user is project lead
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "Only project lead can add members" });
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      (member) => member.user?.email === email
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
      },
    });

    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
