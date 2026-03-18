import dotenv from "dotenv";
dotenv.config(); // 👈 Load env FIRST

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };