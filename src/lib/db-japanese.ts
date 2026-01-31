import { PrismaClient } from "@/generated/prisma-japanese/client";

const globalForPrisma = globalThis as unknown as {
  prismaJapanese: PrismaClient | undefined;
};

export const prismaJapanese =
  globalForPrisma.prismaJapanese ?? new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaJapanese = prismaJapanese;
