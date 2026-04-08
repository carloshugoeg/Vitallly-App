/**
 * @module usePatients
 * Hook y funciones de mutación para gestionar pacientes vía SWR.
 * SWR se encarga del cache y revalidación automática.
 */
import useSWR from 'swr';
import { PatientResponse } from '@/types/api';
import { fetcher, apiFetch } from '@/lib/fetcher';

const PREFIX = '/api/patients';

/** Obtiene la lista de pacientes con soporte de búsqueda y paginación. */
export function usePatients(params?: { search?: string; page?: number; pageSize?: number }) {
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
    patients: (data?.data ?? []) as PatientResponse[],
    meta: data?.meta as { total: number; page: number; pageSize: number } | undefined,
    isLoading,
    error,
    mutate,
  };
}

/** Obtiene un paciente individual. Pasa `null` para deshabilitar la petición. */
export function usePatient(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${PREFIX}/${id}` : null,
    fetcher
  );

  return {
    patient: data?.data as PatientResponse | undefined,
    isLoading,
    error,
    mutate,
  };
}

/** Crea un paciente y revalida el caché de la lista. */
export async function createPatient(data: Partial<PatientResponse>) {
  return apiFetch(PREFIX, 'POST', data, PREFIX);
}

/** Actualiza un paciente existente y revalida el caché. */
export async function updatePatient(id: string, data: Partial<PatientResponse>) {
  return apiFetch(`${PREFIX}/${id}`, 'PUT', data, PREFIX);
}

/** Soft-delete del paciente (marca como inactivo en el backend). */
export async function deletePatient(id: string) {
  return apiFetch(`${PREFIX}/${id}`, 'DELETE', undefined, PREFIX);
}
