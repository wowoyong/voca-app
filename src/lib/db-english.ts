import { PrismaClient } from "@/generated/prisma-english/client";

const globalForPrisma = globalThis as unknown as {
  prismaEnglish: PrismaClient | undefined;
};

export const prismaEnglish =
  globalForPrisma.prismaEnglish ?? new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaEnglish = prismaEnglish;
