/**
 * @module useDashboardStats
 * Hook para las estadísticas del panel principal.
 * Se refresca cada 60s para mantener los contadores actualizados sin recargar la página.
 */
import useSWR from 'swr';
import { DashboardStats } from '@/types/api';
import { fetcher } from '@/lib/fetcher';

/** Obtiene métricas agregadas: total pacientes, citas de hoy, consultas, etc. */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/dashboard/stats',
    fetcher,
    // Refresco automático cada minuto para reflejar cambios de otros usuarios
    { refreshInterval: 60000 }
  );

  return {
    stats: data?.data as DashboardStats | undefined,
    isLoading,
    error,
    mutate,
  };
}
