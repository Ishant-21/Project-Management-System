import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  globalForPrisma.prisma = prisma;
}

// Initialize and test database connection on server start
export const initializeDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful - Tables ready");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export default prisma;
