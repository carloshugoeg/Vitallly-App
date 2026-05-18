/**
 * Validación de variables de entorno al iniciar la aplicación.
 *
 * Usa Zod para fallar rápido en el arranque si faltan credenciales críticas
 * (BD, secreto de auth), en lugar de descubrirlo en runtime con errores crípticos.
 */

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid postgresql:// URL'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  HEALTH_CHECK_SECRET: z.string().optional(),
});

/**
 * Valida todas las variables de entorno requeridas contra el schema.
 * Lanza un error descriptivo si alguna falta o es inválida.
 */
function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Missing or invalid environment variables:\n${formatted}`);
  }
  return result.data;
}

/** Variables de entorno validadas y tipadas. Importar esto en lugar de usar process.env directamente. */
export const env = validateEnv();
