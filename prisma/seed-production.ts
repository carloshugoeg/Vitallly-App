/**
 * Seed de producción: crea únicamente el tenant y la cuenta OWNER.
 * No genera pacientes ni datos de demostración.
 *
 * Se ejecuta una sola vez al desplegar la app en un nuevo entorno.
 * Los datos reales se crean desde la interfaz.
 *
 * Uso:
 *   DATABASE_URL="postgresql://..." \
 *   OWNER_EMAIL="nutricionista@email.com" \
 *   OWNER_PASSWORD="secure-password" \
 *   OWNER_NOMBRE="María" \
 *   OWNER_APELLIDO="García" \
 *   OWNER_TITULO="Lic." \
 *   TENANT_NAME="Clínica Vitally" \
 *   npx tsx prisma/seed-production.ts
 */
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Valida que una variable de entorno exista; aborta si falta.
 * Evita arrancar con configuración incompleta.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const pool = new pg.Pool({ connectionString: requireEnv('DATABASE_URL') });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = requireEnv('OWNER_EMAIL');
  const password = requireEnv('OWNER_PASSWORD');
  const nombre = requireEnv('OWNER_NOMBRE');
  const apellido = requireEnv('OWNER_APELLIDO');
  const titulo = process.env.OWNER_TITULO ?? 'Lic.';
  const tenantName = process.env.TENANT_NAME ?? 'Clínica Vitally';

  // Genera slug URL-friendly: quita acentos, espacios → guiones, solo alfanumérico
  const tenantSlug = tenantName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  console.log(`Creating tenant: ${tenantName} (${tenantSlug})`);

  // Upsert para que sea idempotente — se puede re-ejecutar sin duplicar datos
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {},
    create: {
      name: tenantName,
      slug: tenantSlug,
      isActive: true,
    },
  });

  // Costo de hash 13 rondas: balance entre seguridad y tiempo de respuesta
  const passwordHash = await bcrypt.hash(password, 13);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      tenantId: tenant.id,
      email,
      passwordHash,
      nombre,
      apellido,
      titulo,
      role: 'OWNER',
      isActive: true,
    },
  });

  // Crea settings con valores por defecto para que la UI no falle al cargar preferencias
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  console.log('Production seed complete!');
  console.log(`Tenant: ${tenant.name} (id: ${tenant.id})`);
  console.log(`Owner: ${email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
