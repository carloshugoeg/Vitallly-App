import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuracion de Prisma ORM.
 * - DIRECT_URL tiene prioridad sobre DATABASE_URL para evitar el connection pooler
 *   de Supabase durante migraciones (el pooler no soporta DDL).
 * - El seed usa tsx para ejecutar TypeScript directamente.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
