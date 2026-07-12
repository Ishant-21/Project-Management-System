import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "../configs/prisma.js";

// ---------------------------------------------------------------------------
// Demo data seeder
//   - 10 users  -> "user 1".."user 10" / employee1..10@yopmail.com / 12345678
//   - 1 shared workspace (owned by "user 1" as ADMIN, everyone is a member)
//   - 5 projects (led by "user 1" so the demo login can manage them all)
//   - 10-20 tasks per project, each assigned to a project member
// ---------------------------------------------------------------------------

const USER_COUNT = 10;
const PROJECT_COUNT = 5;
const MIN_TASKS = 10;
const MAX_TASKS = 20;
const PASSWORD = "12345678";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// days offset from today -> Date
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const TASK_TYPES = ["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const PROJECT_STATUSES = ["ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD"];

const PROJECT_SEEDS = [
  {
    name: "Website Redesign",
    description: "Revamp the marketing site with a new design system.",
  },
  {
    name: "Mobile App Launch",
    description: "Ship the v1 iOS and Android apps to the stores.",
  },
  {
    name: "API Platform",
    description: "Build the public REST API and developer portal.",
  },
  {
    name: "Data Migration",
    description: "Migrate legacy records into the new PostgreSQL schema.",
  },
  {
    name: "Internal Dashboard",
    description: "Analytics dashboard for the operations team.",
  },
];

const TASK_TITLES = [
  "Set up project scaffolding",
  "Design database schema",
  "Implement authentication flow",
  "Build landing page",
  "Fix responsive layout issues",
  "Write unit tests",
  "Integrate payment gateway",
  "Optimize API response times",
  "Add dark mode support",
  "Configure CI/CD pipeline",
  "Refactor state management",
  "Create onboarding tutorial",
  "Resolve memory leak",
  "Add search functionality",
  "Improve error handling",
  "Update dependencies",
  "Implement notifications",
  "Add export to CSV",
  "Set up monitoring",
  "Conduct security review",
];

const COMMENT_TEXTS = [
  "I'll pick this up today.",
  "Blocked on the API change, will follow up.",
  "Looks good, ready for review.",
  "Can we bump the priority on this?",
  "Pushed a fix, please verify.",
  "Needs more details in the description.",
];

async function resetData() {
  // Delete in FK-safe order (cascades would cover most, but be explicit).
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Resetting existing data...");
  await resetData();

  console.log(`Creating ${USER_COUNT} users...`);
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const users = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `user ${i}`,
        email: `employee${i}@yopmail.com`,
        password: hashed,
        image: "",
      },
    });
    users.push(user);
  }

  const admin = users[0]; // "user 1" — the demo login / workspace owner / lead

  console.log("Creating shared workspace...");
  const workspaceId = randomUUID();
  await prisma.workspace.create({
    data: {
      id: workspaceId,
      name: "Acme Corp",
      slug: `acme-corp-${workspaceId.slice(0, 8)}`,
      description: "Shared demo workspace with sample projects and tasks.",
      ownerId: admin.id,
      members: {
        create: users.map((u, idx) => ({
          userId: u.id,
          role: idx === 0 ? "ADMIN" : "MEMBER",
        })),
      },
    },
  });

  console.log(`Creating ${PROJECT_COUNT} projects with tasks...`);
  let totalTasks = 0;
  let totalComments = 0;

  for (let p = 0; p < PROJECT_COUNT; p++) {
    const seed = PROJECT_SEEDS[p];
    const project = await prisma.project.create({
      data: {
        id: randomUUID(),
        name: seed.name,
        description: seed.description,
        priority: pick(PRIORITIES),
        status: PROJECT_STATUSES[p % PROJECT_STATUSES.length],
        progress: randInt(0, 100),
        start_date: daysFromNow(-randInt(20, 90)),
        end_date: daysFromNow(randInt(20, 90)),
        team_lead: admin.id,
        workspaceId,
        // Every user is a member of every project (simple + fully populated).
        members: {
          create: users.map((u) => ({ userId: u.id })),
        },
      },
    });

    const taskCount = randInt(MIN_TASKS, MAX_TASKS);
    for (let t = 0; t < taskCount; t++) {
      const status = pick(TASK_STATUSES);
      const assignee = pick(users);
      const task = await prisma.task.create({
        data: {
          id: randomUUID(),
          projectId: project.id,
          title: `${pick(TASK_TITLES)} #${t + 1}`,
          description: "Auto-generated demo task.",
          status,
          type: pick(TASK_TYPES),
          priority: pick(PRIORITIES),
          assigneeId: assignee.id,
          // Mix of overdue (past) and upcoming (future) due dates.
          due_date: daysFromNow(randInt(-15, 30)),
        },
      });
      totalTasks++;

      // ~30% of tasks get 1-2 comments from random members.
      if (Math.random() < 0.3) {
        const n = randInt(1, 2);
        for (let c = 0; c < n; c++) {
          await prisma.comment.create({
            data: {
              id: randomUUID(),
              taskId: task.id,
              userId: pick(users).id,
              content: pick(COMMENT_TEXTS),
            },
          });
          totalComments++;
        }
      }
    }
    console.log(`  • ${seed.name}: ${taskCount} tasks`);
  }

  console.log("\nSeeding finished ✅");
  console.log(`  Users:    ${users.length}`);
  console.log(`  Projects: ${PROJECT_COUNT}`);
  console.log(`  Tasks:    ${totalTasks}`);
  console.log(`  Comments: ${totalComments}`);
  console.log("\nDemo login:");
  console.log("  Email:    employee1@yopmail.com  (…through employee10@)");
  console.log(`  Password: ${PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
