import 'server-only';

import { prisma } from '@/server/lib/prisma';
import { NotFoundError } from '@/server/lib/errors';
import type { NutritionalPlan, Prisma } from '@/generated/prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListParams {
  search?: string;
  page: number;
  pageSize: number;
  pacienteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a flat DB nutritional plan back to the frontend format with a
 * nested `macros` object and parsed `comidas` JSON.
 */
export function toPlanResponse(p: NutritionalPlan) {
  // comidas is stored as Json — ensure it's an array
  let comidas: unknown[];
  if (Array.isArray(p.comidas)) {
    comidas = p.comidas;
  } else if (typeof p.comidas === 'string') {
    try {
      comidas = JSON.parse(p.comidas as string);
    } catch {
      comidas = [];
    }
  } else {
    comidas = [];
  }

  return {
    id: p.id,
    pacienteId: p.pacienteId,
    consultaId: p.consultaId,
    fecha: p.fecha,
    objetivo: p.objetivo,
    caloriasDiarias: p.caloriasDiarias,
    macros: {
      proteinasPorcentaje: p.proteinasPorcentaje,
      carbohidratosPorcentaje: p.carbohidratosPorcentaje,
      grasasPorcentaje: p.grasasPorcentaje,
      proteinasGramos: p.proteinasGramos,
      carbohidratosGramos: p.carbohidratosGramos,
      grasasGramos: p.grasasGramos,
    },
    comidas,
    restricciones: p.restricciones,
    suplementos: p.suplementos,
    notas: p.notas,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Paginated list of nutritional plans for a specific patient.
 */
export async function listByPatient(
  tenantId: string,
  pacienteId: string,
  params: { page: number; pageSize: number; sortBy?: string; sortOrder?: 'asc' | 'desc' },
) {
  const { page, pageSize, sortBy = 'fecha', sortOrder = 'desc' } = params;

  const where: Prisma.NutritionalPlanWhereInput = {
    tenantId,
    pacienteId,
    deletedAt: null,
  };

  const [data, total] = await Promise.all([
    prisma.nutritionalPlan.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.nutritionalPlan.count({ where }),
  ]);

  return {
    data: data.map(toPlanResponse),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Paginated list of all nutritional plans for the tenant.
 */
export async function listPlans(tenantId: string, params: ListParams) {
  const { search, page, pageSize, pacienteId, sortBy = 'fecha', sortOrder = 'desc' } = params;

  const where: Prisma.NutritionalPlanWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (pacienteId) {
    where.pacienteId = pacienteId;
  }

  if (search) {
    where.OR = [
      { objetivo: { contains: search, mode: 'insensitive' } },
      { notas: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.nutritionalPlan.findMany({
      where,
      include: {
        patient: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.nutritionalPlan.count({ where }),
  ]);

  return {
    data: data.map((plan) => ({
      ...toPlanResponse(plan),
      patient: (plan as unknown as { patient: { id: string; nombre: string; apellido: string } }).patient,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single nutritional plan by id (scoped to tenant).
 */
export async function getPlan(tenantId: string, id: string) {
  const plan = await prisma.nutritionalPlan.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!plan) {
    throw new NotFoundError('Plan nutricional');
  }

  return toPlanResponse(plan);
}

/**
 * Create a standalone nutritional plan (not linked to a consultation).
 */
export async function createStandalonePlan(
  tenantId: string,
  data: Record<string, unknown>,
) {
  const patient = await prisma.patient.findFirst({
    where: { id: data.pacienteId as string, tenantId, deletedAt: null },
  });

  if (!patient) {
    throw new NotFoundError('Paciente');
  }

  const { comidas, ...rest } = data;

  const plan = await prisma.nutritionalPlan.create({
    data: {
      tenantId,
      ...rest,
      consultaId: null,
      comidas: (comidas as Prisma.InputJsonValue) ?? [],
    } as Prisma.NutritionalPlanUncheckedCreateInput,
  });

  return toPlanResponse(plan);
}

/**
 * Update an existing nutritional plan.
 */
export async function updatePlan(
  tenantId: string,
  id: string,
  data: Record<string, unknown>,
) {
  const existing = await prisma.nutritionalPlan.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Plan nutricional');
  }

  const { id: _id, tenantId: _tenantId, createdAt: _createdAt, deletedAt: _deletedAt, consultaId: _consultaId, comidas, ...rest } = data;

  const plan = await prisma.nutritionalPlan.update({
    where: { id },
    data: {
      ...rest,
      ...(comidas !== undefined ? { comidas: comidas as Prisma.InputJsonValue } : {}),
    } as Prisma.NutritionalPlanUncheckedUpdateInput,
  });

  return toPlanResponse(plan);
}

/**
 * Soft-delete a nutritional plan.
 */
export async function deletePlan(tenantId: string, id: string) {
  const existing = await prisma.nutritionalPlan.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Plan nutricional');
  }

  await prisma.nutritionalPlan.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}

/**
 * Duplicate a nutritional plan with a new id, current date, and consultaId = null.
 */
export async function duplicatePlan(tenantId: string, id: string) {
  const existing = await prisma.nutritionalPlan.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Plan nutricional');
  }

  const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

  const plan = await prisma.nutritionalPlan.create({
    data: {
      tenantId: existing.tenantId,
      pacienteId: existing.pacienteId,
      consultaId: null,
      fecha: today,
      objetivo: existing.objetivo,
      caloriasDiarias: existing.caloriasDiarias,
      proteinasPorcentaje: existing.proteinasPorcentaje,
      carbohidratosPorcentaje: existing.carbohidratosPorcentaje,
      grasasPorcentaje: existing.grasasPorcentaje,
      proteinasGramos: existing.proteinasGramos,
      carbohidratosGramos: existing.carbohidratosGramos,
      grasasGramos: existing.grasasGramos,
      comidas: existing.comidas as Prisma.InputJsonValue,
      restricciones: existing.restricciones,
      suplementos: existing.suplementos,
      notas: existing.notas,
    },
  });

  return toPlanResponse(plan);
}
