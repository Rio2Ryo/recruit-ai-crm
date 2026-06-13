import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Build-time fallback only — any runtime DB call will throw a connection error.
    // Set DATABASE_URL (Supabase pgbouncer URL) to enable DB access.
    return new PrismaClient({ adapter: new PrismaPg({ connectionString: "postgresql://user:pass@localhost:5432/db" }) });
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
