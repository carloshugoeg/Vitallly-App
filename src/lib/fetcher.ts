/**
 * Utilidades para comunicación con la API.
 *
 * - `fetcher`: para peticiones GET con SWR (lectura).
 * - `apiFetch`: para mutaciones (POST/PUT/DELETE) con invalidación automática del caché SWR.
 *
 * Centralizar aquí el manejo de errores y la invalidación de caché
 * evita duplicar lógica en cada componente que llama a la API.
 */

import { mutate as globalMutate } from 'swr';

/**
 * Fetcher estándar para SWR. Lanza error si la respuesta no es ok,
 * lo que permite a SWR manejar el estado de error automáticamente.
 */
export const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Error al cargar datos');
    return r.json();
  });

/**
 * Ejecuta una mutación (POST/PUT/DELETE) contra la API y opcionalmente
 * invalida entradas del caché SWR que coincidan con los prefijos dados.
 * Esto permite que, por ejemplo, al crear un paciente se refresque
 * automáticamente la lista de pacientes sin recarga manual.
 */
export async function apiFetch<T = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  data?: unknown,
  invalidatePrefix?: string | string[]
): Promise<T> {
  const res = await fetch(url, {
    method,
    ...(data != null && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ?? `Error en operación ${method}`
    );
  }

  const result = await res.json();

  // Invalidar todas las claves SWR que contengan alguno de los prefijos
  if (invalidatePrefix) {
    const prefixes = Array.isArray(invalidatePrefix) ? invalidatePrefix : [invalidatePrefix];
    await globalMutate(
      (key: string) =>
        typeof key === 'string' && prefixes.some((p) => key.startsWith(p) || key.includes(p))
    );
  }

  return result as T;
}
