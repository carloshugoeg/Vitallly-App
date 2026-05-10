/**
 * @module middleware
 * Middleware de Next.js para protección de rutas a nivel de edge.
 * Las rutas API se excluyen porque tienen su propia autenticación vía withAuth,
 * evitando doble verificación y permitiendo respuestas JSON de error adecuadas.
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

/** Rutas accesibles sin autenticación. */
const publicPaths = ['/login', '/register', '/api/auth'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (publicPaths.some(p => pathname.startsWith(p))) {
    return;
  }

  // Archivos estáticos e internos de Next.js no necesitan verificación
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return;
  }

  // Las rutas API manejan su propia auth con withAuth (respuestas JSON)
  if (pathname.startsWith('/api/')) {
    return;
  }

  // La raíz redirige al dashboard como punto de entrada principal
  if (pathname === '/') {
    return Response.redirect(new URL('/dashboard', req.url));
  }

  // Usuarios no autenticados van al login
  if (!req.auth) {
    return Response.redirect(new URL('/login', req.url));
  }
});

/** Excluye archivos estáticos del middleware para mejorar rendimiento. */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
