import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "../configs/prisma.js";

async function main() {
  console.log("Seeding minimal data...");

  const password = await bcrypt.hash("password", 10);

  const userId = randomUUID();
  const workspaceId = randomUUID();
  const projectId = randomUUID();

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: "Admin User",
      email: "admin@local",
      password,
      image: "",
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      id: workspaceId,
      name: "Default Workspace",
      slug: "default",
      description: "Auto-created workspace",
      ownerId: userId,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId,
      workspaceId,
      role: "ADMIN",
    },
  });

  await prisma.project.create({
    data: {
      id: projectId,
      name: "First Project",
      description: "Auto-created project",
      team_lead: userId,
      workspaceId: workspaceId,
    },
  });

  console.log("Seeding finished. Admin credentials: admin@local / password");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
