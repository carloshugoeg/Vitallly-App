/**
 * Jerarquía de errores de dominio de la aplicación.
 * Cada subclase lleva su código HTTP, permitiendo que withAuth
 * los convierta automáticamente en respuestas JSON sin try/catch manual.
 */

/**
 * Clase base para errores controlados.
 * @param code - Código semántico (ej. 'NOT_FOUND') enviado al frontend.
 * @param statusCode - Código HTTP correspondiente.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Error 404 — el recurso solicitado no existe o fue eliminado. */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} no encontrado`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/** Error 403 — el usuario está autenticado pero no tiene permisos suficientes. */
export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/** Error 401 — no hay sesión válida o el token expiró. */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/** Error 400 — los datos enviados no pasan la validación de Zod u otra regla de negocio. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/** Error 409 — conflicto de unicidad (ej. DPI duplicado dentro del mismo tenant). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
