import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor para evitar llamadas excesivas al API.
 * Usado principalmente en barras de búsqueda para no disparar una petición por cada tecla.
 * @param delay - Milisegundos de espera tras el último cambio (default: 300ms)
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
