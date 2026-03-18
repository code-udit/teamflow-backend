import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createTaskSchema } from "../validators/task.validator";
import { logger } from "../utils/logger";

export const createTask = async (req: any, res: Response) => {
  const validatedData = createTaskSchema.parse(req.body);
  try {
    const { title, projectId, status } = validatedData;

    const task = await prisma.task.create({
      data: {
        title,
        status: status || "TODO",
        projectId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    logger.error("CREATE TASK ERROR", { error });
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTasks = async (req: any, res: Response) => {
  try {
    const { projectId } = req.params;

    // Check if project belongs to user's organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: req.user.organizationId
      }
    });

    if (!project) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status as "TODO" | "IN_PROGRESS" | "DONE" | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    const totalTasks = await prisma.task.count({
      where: {
        projectId: projectId,
        ...(status && { status }),
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive"
          }
        })
      }
    });

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
        ...(status && { status }),
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive"
          }
        })
      },
      orderBy: {
        [sortBy]: order
      },
      skip: skip,
      take: limit
    });

    res.json({
      data: tasks,
      page,
      limit,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit)
    });

  } catch (error) {
    console.error("GET TASKS ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          organizationId: req.user.organizationId
        }
      }
    });

    if (!task) {
      return res.status(403).json({ message: "Access denied to this task" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });

    res.json(updatedTask);

  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          organizationId: req.user.organizationId
        }
      }
    });

    if (!task) {
      return res.status(403).json({ message: "Access denied to this task" });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

