/**
 * Middleware de autenticación y manejo centralizado de errores.
 *
 * Todas las rutas de API protegidas se envuelven con withAuth.
 * Esto garantiza:
 * 1. Verificación de sesión (NextAuth) antes de ejecutar el handler.
 * 2. Aislamiento multi-tenant: el tenantId se extrae del JWT.
 * 3. Autorización por rol (opcional).
 * 4. Conversión automática de errores (Zod, AppError, Prisma) a respuestas JSON.
 */
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AppError, UnauthorizedError, ForbiddenError } from '@/server/lib/errors';
import { UserRole } from '@/generated/prisma/enums';
import { ZodError } from 'zod';
import { Prisma } from '@/generated/prisma/client';

/**
 * Sesión autenticada inyectada en cada handler protegido.
 * El tenantId es clave para el aislamiento de datos multi-tenant.
 */
export interface AuthSession {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
  nombre: string;
  apellido: string;
}

type RouteHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>>; session: AuthSession }
) => Promise<NextResponse | Response>;

/**
 * HOC que protege un route handler con autenticación y autorización por rol.
 * @param handler - Función del route handler que recibe la sesión ya validada.
 * @param allowedRoles - Si se especifica, solo estos roles pueden acceder.
 */
export function withAuth(handler: RouteHandler, allowedRoles?: UserRole[]) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      const session = await auth();

      if (!session?.user) {
        throw new UnauthorizedError();
      }

      const authSession: AuthSession = {
        userId: session.user.id as string,
        email: session.user.email as string,
        tenantId: session.user.tenantId as string,
        role: session.user.role as UserRole,
        nombre: session.user.nombre as string,
        apellido: session.user.apellido as string,
      };

      if (allowedRoles && !allowedRoles.includes(authSession.role)) {
        throw new ForbiddenError();
      }

      return await handler(req, { params: context.params, session: authSession });
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: messages.join(', '), details: error.issues } },
          { status: 400 }
        );
      }
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: { code: error.code, message: error.message } },
          { status: error.statusCode }
        );
      }
      // P2002=unique constraint, P2025=record not found, P2003=FK inválida
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[])?.join(', ') ?? 'campo';
          return NextResponse.json(
            { error: { code: 'CONFLICT', message: `Ya existe un registro con ese ${target}` } },
            { status: 409 }
          );
        }
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: { code: 'NOT_FOUND', message: 'Registro no encontrado' } },
            { status: 404 }
          );
        }
        if (error.code === 'P2003') {
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: 'Referencia inválida: el registro relacionado no existe' } },
            { status: 400 }
          );
        }
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Prisma validation error:', error.message);
        }
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos o incompletos' } },
          { status: 400 }
        );
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unhandled error:', error);
      }
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
        { status: 500 }
      );
    }
  };
}
