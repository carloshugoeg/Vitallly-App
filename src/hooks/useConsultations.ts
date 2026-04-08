/**
 * @module useConsultations
 * Hook y funciones de mutación para consultas nutricionales.
 * INVALIDATE incluye varias claves SWR para asegurar que todas las vistas se actualicen.
 */
import useSWR from 'swr';
import { ConsultationResponse } from '@/types/api';
import { fetcher, apiFetch } from '@/lib/fetcher';

const PREFIX = '/api/consultations';
/** Claves SWR a revalidar tras mutaciones para mantener la coherencia de la UI. */
const INVALIDATE = ['/api/consultations', '/consultations'];

/** Obtiene la lista de consultas con búsqueda y paginación. */
export function useConsultations(params?: { search?: string; page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const query = searchParams.toString();
  const { data, error, isLoading, mutate } = useSWR(
    `${PREFIX}${query ? `?${query}` : ''}`,
    fetcher
  );

  return {
    consultations: (data?.data ?? []) as ConsultationResponse[],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

/** Obtiene las consultas de un paciente específico. */
export function usePatientConsultations(pacienteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    pacienteId ? `/api/patients/${pacienteId}/consultations` : null,
    fetcher
  );

  return {
    consultations: (data?.data ?? []) as ConsultationResponse[],
    isLoading,
    error,
    mutate,
  };
}

/** Obtiene una consulta individual con su antropometría y plan nutricional asociados. */
export function useConsultation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${PREFIX}/${id}` : null,
    fetcher
  );

  return {
    consultation: data?.data as ConsultationResponse | undefined,
    anthropometry: data?.data?.anthropometry,
    nutritionalPlan: data?.data?.nutritionalPlan,
    isLoading,
    error,
    mutate,
  };
}

/** Crea una consulta nueva. El backend asocia automáticamente la antropometría y el plan. */
export async function createConsultation(data: Record<string, unknown>) {
  return apiFetch(PREFIX, 'POST', data, INVALIDATE);
}

/** Actualiza una consulta existente. */
export async function updateConsultation(id: string, data: Record<string, unknown>) {
  return apiFetch(`${PREFIX}/${id}`, 'PUT', data, INVALIDATE);
}

/** Elimina una consulta. */
export async function deleteConsultation(id: string) {
  return apiFetch(`${PREFIX}/${id}`, 'DELETE', undefined, INVALIDATE);
}
