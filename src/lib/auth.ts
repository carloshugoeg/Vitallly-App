/**
 * Configuración principal de autenticación con NextAuth.
 *
 * Se usa el proveedor de credenciales (email/contraseña) porque la app
 * está dirigida a nutricionistas individuales, sin necesidad de OAuth externo.
 * La configuración base (JWT, callbacks, cookies) se importa de auth.config.ts
 * para poder reutilizarla en el middleware de Edge sin dependencias de Node.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/lib/prisma';
import { checkRateLimit } from '@/server/lib/rateLimit';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Limitar intentos por email para prevenir ataques de fuerza bruta
        const { allowed } = checkRateLimit(`login:${email}`);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { tenant: true },
        });

        // Verificar que tanto el usuario como su clínica (tenant) estén activos
        if (!user || !user.isActive || !user.tenant.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          nombre: user.nombre,
          apellido: user.apellido,
        };
      },
    }),
  ],
});
