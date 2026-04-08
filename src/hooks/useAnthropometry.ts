/**
 * @module useAnthropometry
 * Hook para obtener el historial de mediciones antropométricas de un paciente.
 * Usado en la vista de detalle del paciente para graficar la evolución corporal.
 */
import useSWR from 'swr';
import { Anthropometry } from '@/types/api';
import { fetcher } from '@/lib/fetcher';

/** Obtiene todas las mediciones antropométricas de un paciente ordenadas por fecha. */
export function usePatientAnthropometry(pacienteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    pacienteId ? `/api/patients/${pacienteId}/anthropometry` : null,
    fetcher
  );

  return {
    anthropometry: (data?.data ?? []) as Anthropometry[],
    isLoading,
    error,
    mutate,
  };
}
