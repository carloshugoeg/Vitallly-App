/**
 * Singleton de Prisma Client con adaptador PostgreSQL.
 * Se almacena en globalThis para evitar múltiples conexiones durante
 * el hot-reload de Next.js en desarrollo; en producción se crea una sola vez.
 */
import 'server-only';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/lib/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// En dev se cachea en globalThis para sobrevivir al hot-reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// En producción se desconecta limpiamente al recibir SIGTERM
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
