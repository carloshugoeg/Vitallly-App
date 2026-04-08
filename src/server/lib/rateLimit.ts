/**
 * Rate limiter en memoria basado en ventana fija (fixed window).
 *
 * Adecuado para despliegues de una sola instancia (ej. VPS/Docker).
 * Para serverless o multi-instancia, reemplazar con Redis/Upstash.
 *
 * Estrategia de protección de memoria:
 * - Máximo 10k entradas en el Map.
 * - Limpieza periódica cada 5 minutos.
 * - Evicción forzada si se llena el Map.
 */
import 'server-only';

const attempts = new Map<string, { count: number; resetAt: number }>();
/** Límite duro para evitar crecimiento ilimitado de memoria. */
const MAX_MAP_ENTRIES = 10_000;

interface RateLimitConfig {
  /** Duración de la ventana en milisegundos. */
  windowMs: number;
  /** Intentos permitidos por ventana. */
  maxAttempts: number;
}

/** Configuración estándar: 5 intentos por minuto. */
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000,
  maxAttempts: 5,
};

/** Configuración estricta: 5 intentos cada 15 minutos (registro, reset password). */
const STRICT_CONFIG: RateLimitConfig = {
  windowMs: 900_000,
  maxAttempts: 5,
};

/**
 * Verifica si una clave (ej. IP o email) ha excedido el límite de intentos.
 * Devuelve si la petición está permitida y cuánto esperar en caso contrario.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    // Evictar entradas expiradas para evitar fugas de memoria
    if (attempts.size >= MAX_MAP_ENTRIES) {
      for (const [k, v] of attempts) {
        if (now > v.resetAt) attempts.delete(k);
      }
      // Si la limpieza selectiva no fue suficiente, vaciar todo como último recurso
      if (attempts.size >= MAX_MAP_ENTRIES) {
        attempts.clear();
      }
    }

    attempts.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Rate limit estricto para operaciones sensibles (registro, reset de contraseña).
 * 5 intentos por cada 15 minutos.
 */
export function checkStrictRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  return checkRateLimit(key, STRICT_CONFIG);
}

// Limpieza periódica de entradas expiradas (cada 5 minutos)
if (typeof globalThis !== 'undefined') {
  const cleanupKey = '__rateLimitCleanup';
  const g = globalThis as Record<string, unknown>;
  if (!g[cleanupKey]) {
    g[cleanupKey] = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of attempts) {
        if (now > entry.resetAt) attempts.delete(key);
      }
    }, 300_000);
  }
}
