import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";

import { authenticate, authorizeRoles } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Protected Route
app.get("/api/protected", authenticate, (req: Request, res: Response) => {
  res.json({
    message: "You have access to this protected route",
  });
});

// Admin Route
app.get(
  "/api/admin",
  authenticate,
  authorizeRoles("ADMIN"),
  (req: Request, res: Response) => {
    res.json({ message: "Welcome Admin 🚀" });
  }
);

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("TeamFlow API Running 🚀");
});

// Error Handler
app.use(errorHandler);

export default app;