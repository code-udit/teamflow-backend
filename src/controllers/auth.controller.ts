import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    // Create user linked to organization
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
    });

    res.status(201).json({
      message: "Organization and Admin user created",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
  {
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

    res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      organizationName: user.organization?.name || "",
    },
  });
  } catch (error) {
      console.error("LOGIN ERROR:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
};