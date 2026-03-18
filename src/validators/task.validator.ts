import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  projectId: z.string().uuid("Invalid project ID"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional()
});