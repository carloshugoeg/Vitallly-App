/**
 * @module useSettings
 * Hook y funciones para las preferencias del usuario (nutricionista).
 * Incluye configuración de campos visibles en consultas, macros por defecto,
 * horario laboral y fórmula preferida para cálculos nutricionales.
 */
import useSWR, { mutate as globalMutate } from 'swr';
import { fetcher, apiFetch } from '@/lib/fetcher';

/** Estructura de preferencias del usuario nutricionista. */
export interface UserSettingsData {
  consultationFieldConfig: Record<string, { visible: boolean; required?: boolean; label?: string; order?: number }>;
  defaultAppointmentDuration: number;
  defaultProteinPct: number;
  defaultCarbPct: number;
  defaultFatPct: number;
  preferredFormula: string;
  workingHours: { start: string; end: string };
  timezone: string;
}

/** Obtiene las preferencias del usuario autenticado. */
export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings', fetcher);

  return {
    settings: data?.data as UserSettingsData | undefined,
    isLoading,
    error,
    mutate,
  };
}

/** Actualiza preferencias y revalida el caché global para reflejar los cambios inmediatamente. */
export async function updateSettings(data: Partial<UserSettingsData>) {
  const result = await apiFetch('/api/settings', 'PUT', data);
  await globalMutate('/api/settings');
  return result;
}
