import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "../configs/prisma.js";

async function main() {
  console.log("Starting database seeding...");

  // 0. Clear existing data in reverse order of dependencies
  console.log("Clearing existing data...");
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.workspaceMember.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  const password = await bcrypt.hash("password123", 10);

  // 1. Create Users
  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Admin User",
      email: "admin@gmail.com",
      password,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "John Member",
      email: "user1@gmail.com",
      password,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
  });

  const member2 = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: "Jane Member",
      email: "user2@gmail.com",
      password,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
  });

  // 2. Create Workspace
  console.log("Creating workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      id: "ws-dev-01",
      name: "Development Team",
      slug: "dev-team",
      description: "Primary workspace for engineering and design.",
      ownerId: admin.id,
      image_url: "https://api.dicebear.com/7.x/shapes/svg?seed=Dev",
    },
  });

  // Add members to workspace
  await prisma.workspaceMember.createMany({
    data: [
      { userId: admin.id, workspaceId: workspace.id, role: "ADMIN" },
      { userId: member1.id, workspaceId: workspace.id, role: "MEMBER" },
      { userId: member2.id, workspaceId: workspace.id, role: "MEMBER" },
    ],
  });

  // 3. Create Projects
  console.log("Creating projects...");
  const project1 = await prisma.project.create({
    data: {
      id: randomUUID(),
      name: "Nexus API Overhaul",
      description: "Deep refactor of the core API service layer for better performance.",
      priority: "HIGH",
      status: "ACTIVE",
      team_lead: admin.id,
      workspaceId: workspace.id,
      progress: 45,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      id: randomUUID(),
      name: "Project Phoenix UI",
      description: "Developing a premium, glassmorphism-inspired UI components library.",
      priority: "MEDIUM",
      status: "PLANNING",
      team_lead: member1.id,
      workspaceId: workspace.id,
      progress: 10,
    },
  });

  // Add members to projects
  await prisma.projectMember.createMany({
    data: [
      { userId: admin.id, projectId: project1.id },
      { userId: member1.id, projectId: project1.id },
      { userId: member1.id, projectId: project2.id },
      { userId: member2.id, projectId: project2.id },
    ],
  });

  // 4. Create Tasks
  console.log("Creating tasks...");
  const task1 = await prisma.task.create({
    data: {
      id: randomUUID(),
      projectId: project1.id,
      title: "Design Database Indexing Strategy",
      description: "Analyze query patterns and implement composite indexes.",
      status: "DONE",
      type: "TASK",
      priority: "HIGH",
      assigneeId: admin.id,
      due_date: new Date(Date.now() + 86400000 * 7),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: randomUUID(),
      projectId: project1.id,
      title: "Implement JWT Refresh Logic",
      description: "Add support for sliding window sessions with refresh tokens.",
      status: "IN_PROGRESS",
      type: "FEATURE",
      priority: "MEDIUM",
      assigneeId: member1.id,
      due_date: new Date(Date.now() + 86400000 * 3),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      id: randomUUID(),
      projectId: project2.id,
      title: "Breadcrumb Component implementation",
      description: "Create a reusable breadcrumb component with framer-motion animations.",
      status: "TODO",
      type: "IMPROVEMENT",
      priority: "LOW",
      assigneeId: member2.id,
      due_date: new Date(Date.now() + 86400000 * 10),
    },
  });

  // 5. Create Comments
  console.log("Adding comments...");
  await prisma.comment.createMany({
    data: [
      {
        id: randomUUID(),
        content: "I've started looking into PostgreSQL GiST indexes for this.",
        userId: admin.id,
        taskId: task1.id,
      },
      {
        id: randomUUID(),
        content: "Should we use Redis for token blacklisting?",
        userId: member1.id,
        taskId: task2.id,
      },
    ],
  });

  console.log("\nSeeding finished successfully!");
  console.log("-----------------------------------");
  console.log("Admin Account: admin@gmail.com / password123");
  console.log("User 1 Account: user1@gmail.com / password123");
  console.log("User 2 Account: user2@gmail.com / password123");
  console.log("-----------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
