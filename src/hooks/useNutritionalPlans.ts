/**
 * @module useNutritionalPlans
 * Hook y funciones de mutación para planes nutricionales.
 * Los planes pueden crearse como parte de una consulta o de forma independiente.
 */
import useSWR from 'swr';
import { NutritionalPlanResponse } from '@/types/api';
import { fetcher, apiFetch } from '@/lib/fetcher';

const PREFIX = '/api/nutritional-plans';
/** Claves SWR a revalidar tras mutaciones. */
const INVALIDATE = ['/api/nutritional-plans', '/plans'];

/** Obtiene todos los planes nutricionales de un paciente. */
export function usePatientPlans(pacienteId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    pacienteId ? `/api/patients/${pacienteId}/plans` : null,
    fetcher
  );

  return {
    plans: (data?.data ?? []) as NutritionalPlanResponse[],
    isLoading,
    error,
    mutate,
  };
}

/** Obtiene un plan nutricional individual con macros y detalle de comidas. */
export function useNutritionalPlan(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `${PREFIX}/${id}` : null,
    fetcher
  );

  return {
    plan: data?.data as NutritionalPlanResponse | undefined,
    isLoading,
    error,
    mutate,
  };
}

/** Crea un plan nutricional independiente (no asociado a una consulta). */
export async function createStandalonePlan(data: Record<string, unknown>) {
  return apiFetch(PREFIX, 'POST', data, INVALIDATE);
}

/** Actualiza un plan nutricional existente. */
export async function updatePlan(id: string, data: Record<string, unknown>) {
  return apiFetch(`${PREFIX}/${id}`, 'PUT', data, INVALIDATE);
}

/** Elimina un plan nutricional. */
export async function deletePlan(id: string) {
  return apiFetch(`${PREFIX}/${id}`, 'DELETE', undefined, INVALIDATE);
}

/** Duplica un plan existente para usarlo como plantilla base de un nuevo plan. */
export async function duplicatePlan(id: string) {
  return apiFetch(`${PREFIX}/${id}/duplicate`, 'POST', undefined, INVALIDATE);
}
