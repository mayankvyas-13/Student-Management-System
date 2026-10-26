import { PrismaClient } from "@prisma/client";

/**
 * One shared Prisma client for the whole app (it manages a pool of DB connections).
 *
 * In development, Next.js reloads modules on every code change; caching the client
 * on `globalThis` stops each reload from opening a new connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
