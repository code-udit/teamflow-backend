import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createProject = async (req: any, res: Response) => {
  try {
    const { name } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        organization: {
          connect: {
            id: req.user.organizationId,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProjects = async (req: any, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        organizationId: req.user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Delete tasks first
    await prisma.task.deleteMany({
      where: { projectId: id }
    });

    // Then delete project
    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
