# Project Manager

A workspace-scoped project and task tracker. Workspaces contain projects, projects
contain tasks, and every action is gated by a three-tier permission model
(workspace admin → project lead → task assignee).

**🌐 Live app:** https://project-management-system-nine-henna.vercel.app/

---

## ⚠️ About the credentials below

These are **demo accounts created by the seed script**, and the app they unlock is
publicly reachable at the URL above. Anyone who can read this file can sign in and
change the data. That is fine for a demo, but be aware of two things:

- If this GitHub repository is **public**, these credentials are public too.
- Never add a real user's password here. It could not be recovered anyway —
  passwords are hashed with bcrypt (10 rounds) in
  [`authController.js`](server/controllers/authController.js), which is one-way.
  The only reason the password below is knowable is that it is a plaintext
  constant in [`scripts/seed.js`](server/scripts/seed.js).

If you would rather not publish working logins, the safer pattern is to keep this
section out of the repo and share it privately, or rotate the seed password before
each demo.

---

## 👥 Demo accounts

Every account below uses the same password.

**Password (all users):** `12345678`

| # | Name | Email | Workspace role | Notes |
|---|---|---|---|---|
| 1 | user 1 | `employee1@yopmail.com` | **ADMIN** | Also the **project lead** on all 5 projects — use this one to see every permission unlocked |
| 2 | user 2 | `employee2@yopmail.com` | MEMBER | |
| 3 | user 3 | `employee3@yopmail.com` | MEMBER | |
| 4 | user 4 | `employee4@yopmail.com` | MEMBER | |
| 5 | user 5 | `employee5@yopmail.com` | MEMBER | |
| 6 | user 6 | `employee6@yopmail.com` | MEMBER | |
| 7 | user 7 | `employee7@yopmail.com` | MEMBER | |
| 8 | user 8 | `employee8@yopmail.com` | MEMBER | |
| 9 | user 9 | `employee9@yopmail.com` | MEMBER | |
| 10 | user 10 | `employee10@yopmail.com` | MEMBER | |

All ten belong to one shared workspace, **Acme Corp**, and are members of all
5 seeded projects (10–20 tasks each).

**To see the permission model in action:** sign in as `employee1` (admin + lead) and
then as `employee2` (plain member) on the same project. The member will find New
Project, New Task, Add Member and the project settings form all disabled, each with
a tooltip explaining why — and will still be able to edit the status of tasks
assigned to them.

> These accounts exist only after the seed script has been run against the database
> the app is connected to. See [Seeding demo data](#-seeding-demo-data).

---

## 🧱 Tech stack

**Client** — React 19, Vite 7, Tailwind CSS v4, Redux Toolkit, React Router 7,
lucide-react (icons), Recharts (charts), react-hot-toast, date-fns

**Server** — Node.js, Express 5, Prisma ORM, PostgreSQL, JWT auth (`jsonwebtoken`),
bcryptjs, Nodemailer

---

## 🗂️ Project structure

```
project-management/
├── client/                 React front-end
│   └── src/
│       ├── ui/             Design-system primitives (Card, Button, Badge,
│       │                   StatCard, Tooltip, PageHeader, EmptyState…)
│       ├── lib/
│       │   ├── permissions.js   Mirrors every server-side authorization rule
│       │   ├── format.js        Humanises SCREAMING_SNAKE enum values
│       │   └── tone.js          One status/priority → colour mapping
│       ├── features/       Redux slices (workspace, messages)
│       ├── components/     Feature components and dialogs
│       └── pages/          Routed pages
└── server/                 Express API
    ├── constants/messages.js    Every user-facing string in the app
    ├── controllers/             Route handlers + authorization
    ├── prisma/schema.prisma     Database schema
    └── scripts/seed.js          Demo data seeder
```

Two conventions worth knowing before you edit anything:

1. **No message text lives in the client.** Error, success and permission-denial
   copy all come from [`server/constants/messages.js`](server/constants/messages.js),
   served to the client via `GET /api/messages`. Add a string there, never in a
   component.
2. **Permission rules are defined twice on purpose.** The server is the real gate;
   [`client/src/lib/permissions.js`](client/src/lib/permissions.js) mirrors it so the
   UI can disable controls instead of letting a request fail with a 403. If you
   change a rule in a controller, change it there too.

---

## 🔐 Permission model

| Action | Who is allowed |
|---|---|
| Create a project | Workspace **admin** |
| Invite to workspace | Workspace **admin** |
| Edit project settings | Workspace **admin** *or* the project **lead** |
| Add a member to a project | Project **lead** only |
| Create / delete a task | Project **lead** |
| **Edit a task** | Project **lead**, *or* the person the task is **assigned to** |
| Reassign a task to someone else | Project **lead** only |
| Comment on a task | Any **project member** |

Note that "edit project settings" and "add a project member" deliberately differ —
a workspace admin who is not the lead can change a project's settings but cannot
add people to it.

---

## 🚀 Installation & Setup Guide

Welcome! This guide will help you get the **Project Manager** app running on your
computer, even if you are not a developer.

> 💡 **Need help?** If you hit an error message, copy it and paste it into
> **[ChatGPT](https://chatgpt.com/)** with the prompt: *"I am setting up a Node.js
> project and got this error, how do I fix it?"*

---

### 1️⃣ Step 1: Install the required software

Before we start, install these three tools. Think of them as the "engine" and
"fuel" for the app.

* **Node.js** — the environment that runs the code.
  [Download here](https://nodejs.org/) (choose the **LTS** version).
* **PostgreSQL & pgAdmin 4** — the database where all your project data is stored.
  [Download here](https://www.postgresql.org/download/)
  **Note:** the PostgreSQL installer asks whether to include **pgAdmin 4** — make
  sure that box is checked. pgAdmin is the visual tool used to manage the database.
* **Git** — the tool that downloads the code.
  [Download here](https://git-scm.com/)

---

### 2️⃣ Step 2: Download the project

1. Open your **Terminal** (Mac/Linux) or **Command Prompt** (Windows).
2. Run:

```bash
git clone https://github.com/Ishant-21/Project-Management-System.git
cd Project-Management-System
```

> The folder name comes from the repository, so if you renamed it when cloning,
> `cd` into that name instead.

---

### 3️⃣ Step 3: Create the database (using pgAdmin 4)

1. **Open pgAdmin 4** (search for it in your Start Menu / Applications).
2. If it asks for a "Master Password", enter the one you set during installation.
3. In the left sidebar, right-click **Databases**.
4. Choose **Create → Database…**
5. Name it `project_management`.
6. Click **Save**.

> 💡 Forgotten your PostgreSQL password? Ask ChatGPT:
> *"How do I reset my PostgreSQL password on Windows?"*

---

### 4️⃣ Step 4: Configure and start the server

The server is the "brain" of the app. It needs to know how to reach your database.

1. **Go into the server folder:**
   ```bash
   cd server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(This may take a minute — it is downloading the libraries the app needs.)*

3. **Create your settings file.** In the `server` folder, create a file named
   exactly `.env` and paste this in:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management
   JWT_SECRET=supersecretkey123

   # Optional — only needed if you want the app to send email
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SENDER_EMAIL=your_email@gmail.com
   ```
   **Important:** replace `YOUR_PASSWORD` with the password you chose when
   installing PostgreSQL. Never commit this file — it is already gitignored.

4. **Create the database tables:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the server:**
   ```bash
   npm run server
   ```
   You should see a message confirming it is running on port 5000.

---

### 5️⃣ Step 5: Start the client

This is the part you actually see and click on.

1. **Open a NEW terminal window** — keep the server one running.
2. From the project folder, go into the client:
   ```bash
   cd client
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create the client settings file.** In the `client` folder, create `.env`:
   ```env
   VITE_BASEURL="http://localhost:5000"
   ```
5. **Launch it:**
   ```bash
   npm run dev
   ```
   The terminal prints a link (usually `http://localhost:5173`). Open it.

---

### 🌱 Seeding demo data

To fill an empty database with the demo workspace, projects, tasks and the ten
accounts listed above:

```bash
cd server
node scripts/seed.js
```

> ⚠️ **This is destructive.** The seeder starts by deleting every comment, task,
> project, workspace and user in the database it is pointed at, then recreates the
> demo set. Check your `DATABASE_URL` before running it, and never run it against
> production data you want to keep.

---

### ✅ Success

The app should now be running locally. Sign in with any account from the
[Demo accounts](#-demo-accounts) table.

> 💡 Keep both terminal windows open while using the app. Closing them stops it.

---

## ☁️ Deployment (Vercel)

The client and server deploy as two separate Vercel projects.

**Client** — [`client/vercel.json`](client/vercel.json) rewrites all routes to `/`
so client-side routing works on refresh. It needs one environment variable, set in
the Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_BASEURL` | The full URL of the deployed **API** |

Two things about this variable are easy to get confused, so worth stating plainly:

- It is **baked in at build time**, not read at runtime. Vite inlines
  `import.meta.env.VITE_BASEURL` into the bundle when `npm run build` runs, so
  changing it requires a **redeploy**, not just a restart.
- `client/.env` is gitignored, so the `http://localhost:5000` in your local copy
  never reaches production — Vercel only sees its own dashboard variable. Local dev
  and production are independent.

**Server** — [`server/vercel.json`](server/vercel.json) builds `server.js` with
`@vercel/node`. It needs:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your hosted PostgreSQL connection string |
| `JWT_SECRET` | A long random string |
| `CLIENT_URL` | `https://project-management-system-nine-henna.vercel.app` |

### Two separate things have to line up

A working login needs **both**, and they do different jobs:

| | What it controls | Where it lives |
|---|---|---|
| `VITE_BASEURL` | **Where** the browser sends the request | Client build env var |
| CORS allow-list | Whether the browser is **permitted to read the reply** | [`server/server.js`](server/server.js) |

CORS does not route anything. If `VITE_BASEURL` were wrong, the request would go to
the wrong host and no CORS configuration could rescue it; if CORS were wrong, the
request would reach the right API and succeed server-side, but the browser would
throw the response away. Both must be right.

CORS is allow-listed in [`server/server.js`](server/server.js): `localhost:5173`,
the deployed client URL, and whatever `CLIENT_URL` is set to. Add any new front-end
origin there or it will be rejected.

---

## 📜 Available scripts

**client**

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `client/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

**server**

| Command | What it does |
|---|---|
| `npm run server` | Start with nodemon (auto-restart on changes) |
| `npm run migrate` | Apply migrations (`prisma migrate deploy`) |
| `npm start` | Generate client, migrate, then start — used in production |
| `node scripts/seed.js` | Reset the database to the demo dataset (destructive) |
