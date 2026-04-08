/**
 * Configuración base de NextAuth separada de los providers.
 *
 * Este archivo se mantiene aparte de auth.ts porque el middleware de Next.js
 * corre en el Edge Runtime, que no soporta módulos de Node como bcrypt o Prisma.
 * Al separar la config base, el middleware puede importar solo este archivo
 * para verificar sesiones sin romper la compatibilidad con Edge.
 */

import type { NextAuthConfig } from 'next-auth';

/**
 * Extensión de tipos de NextAuth para incluir campos multi-tenant.
 * tenantId permite aislar datos por clínica; role controla permisos.
 */
declare module 'next-auth' {
  interface User {
    id: string;
    tenantId: string;
    role: string;
    nombre: string;
    apellido: string;
  }
  interface Session {
    user: User & {
      id: string;
      tenantId: string;
      role: string;
      nombre: string;
      apellido: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    tenantId: string;
    role: string;
    nombre: string;
    apellido: string;
  }
}

/**
 * Configuración base de autenticación: estrategia JWT, cookies y callbacks.
 * Los providers se definen en auth.ts (separados para compatibilidad con Edge).
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      // En producción se usa prefijo __Secure- para forzar HTTPS
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    /** Persistir datos multi-tenant en el JWT para evitar consultas a BD en cada request */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
      }
      return token;
    },
    /** Exponer datos del JWT en la sesión del cliente */
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.tenantId = token.tenantId;
      session.user.role = token.role;
      session.user.nombre = token.nombre;
      session.user.apellido = token.apellido;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
