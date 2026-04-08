/**
 * @module useToast
 * Hook para mostrar notificaciones temporales de éxito o error.
 * Se auto-ocultan después de `duration` ms. Limpia timers anteriores
 * para evitar parpadeos si se muestran varios toasts seguidos.
 */
import { useState, useCallback, useRef } from 'react';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

/** Gestiona notificaciones temporales con auto-cierre. */
export function useToast(duration = 3000) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss };
}
