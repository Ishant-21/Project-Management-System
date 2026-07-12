import express from "express";
import "dotenv/config";
import cors from "cors";
import workspaceRouter from "./routes/workspaceRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { initializeDatabase } from "./configs/prisma.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://project-management-system-nine-henna.vercel.app",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
// JWT based auth middleware is applied per-route via `protect`

app.get("/", (req, res) => res.send("Server is live!⌛"));

// Authentication routes
app.use("/auth", authRouter);

// Routes
app.use("/api/workspaces", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter);
app.use("/api/tasks", protect, taskRouter);
app.use("/api/comments", protect, commentRouter);

const PORT = process.env.PORT || 5000;

// Initialize database on server start
initializeDatabase()
  .then(() => {
    app.listen(PORT, () =>
      console.log(
        `Server is running on port ${PORT} => http://localhost:${PORT} 🚀`
      )
    );
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
