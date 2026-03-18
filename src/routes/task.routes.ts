import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createTask, getTasks, updateTaskStatus, deleteTask } from "../controllers/task.controller";

const router = Router();

router.post("/", authenticate, createTask);
router.get("/:projectId", authenticate, getTasks);
router.patch("/:taskId", authenticate, updateTaskStatus);
router.delete("/:taskId", authenticate, deleteTask);

export default router;