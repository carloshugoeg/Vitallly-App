/**
 * @module useAppointments
 * Hook y funciones de mutación para citas.
 * Soporta filtros por rango de fechas, estado y paciente.
 */
import useSWR from 'swr';
import { Appointment } from '@/types/api';
import { fetcher, apiFetch } from '@/lib/fetcher';

const PREFIX = '/api/appointments';

/** Obtiene citas con filtros opcionales de fecha, estado y paciente. */
export function useAppointments(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  estado?: string;
  pacienteId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
  if (params?.estado) searchParams.set('estado', params.estado);
  if (params?.pacienteId) searchParams.set('pacienteId', params.pacienteId);

  const query = searchParams.toString();
  const { data, error, isLoading, mutate } = useSWR(
    `${PREFIX}${query ? `?${query}` : ''}`,
    fetcher
  );

  return {
    appointments: (data?.data ?? []) as Appointment[],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

/** Obtiene las citas de un paciente específico. Usa endpoint anidado bajo /patients/. */
export function usePatientAppointments(pacienteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    pacienteId ? `/api/patients/${pacienteId}/appointments` : null,
    fetcher
  );

  return {
    appointments: (data?.data ?? []) as Appointment[],
    isLoading,
    error,
    mutate,
  };
}

/** Crea una cita nueva. */
export async function createAppointment(data: Omit<Appointment, 'id'>) {
  return apiFetch(PREFIX, 'POST', data, PREFIX);
}

/** Actualiza una cita existente. */
export async function updateAppointment(id: string, data: Partial<Appointment>) {
  return apiFetch(`${PREFIX}/${id}`, 'PUT', data, PREFIX);
}

/** Elimina una cita. */
export async function deleteAppointment(id: string) {
  return apiFetch(`${PREFIX}/${id}`, 'DELETE', undefined, PREFIX);
}

/** Verifica si existe traslape de horario con otras citas existentes. */
export async function checkOverlap(fecha: string, hora: string, duracion = 60, excludeId?: string) {
  return apiFetch(`${PREFIX}/check-overlap`, 'POST', { fecha, hora, duracion, excludeId });
}
