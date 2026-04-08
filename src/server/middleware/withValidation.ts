/**
 * Utilidades de validación para route handlers.
 * Protegen contra payloads malformados, demasiado grandes o con
 * Content-Type incorrecto antes de llegar a la lógica de negocio.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/** Límite de tamaño del body (1 MB) para prevenir abuso de memoria. */
const MAX_BODY_SIZE = 1_048_576;

/**
 * Parsea y valida el body JSON contra un esquema Zod.
 * Verifica Content-Type y Content-Length antes de parsear,
 * evitando cargar en memoria payloads inválidos o gigantes.
 * @throws {ZodError} Si el body no pasa la validación del esquema.
 */
export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const contentType = req.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    throw new ZodError([{
      code: 'custom',
      message: 'Content-Type must be application/json',
      path: [],
    }]);
  }

  // Rechazar antes de parsear para no cargar en memoria payloads gigantes
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    throw new ZodError([{
      code: 'custom',
      message: 'Request body too large',
      path: [],
    }]);
  }

  const body = await req.json();
  return schema.parse(body);
}

/** Parsea y valida los query params de la URL contra un esquema Zod. */
export function parseSearchParams<T>(url: URL, schema: ZodSchema<T>): T {
  const params = Object.fromEntries(url.searchParams.entries());
  return schema.parse(params);
}

/** Convierte un ZodError en respuesta JSON 400; re-lanza otros errores. */
export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const messages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: messages.join(', ') } },
      { status: 400 }
    );
  }
  throw error;
}
