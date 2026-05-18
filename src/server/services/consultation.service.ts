import 'server-only';

import { prisma } from '@/server/lib/prisma';
import { NotFoundError } from '@/server/lib/errors';
import type { Prisma, Consultation, Anthropometry, NutritionalPlan } from '@/generated/prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListConsultationsParams {
  search?: string;
  page: number;
  pageSize: number;
  pacienteId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type ConsultationWithRelations = Consultation & {
  anthropometry?: Anthropometry | null;
  nutritionalPlan?: NutritionalPlan | null;
  patient?: { id: string; nombre: string; apellido: string } | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a DB consultation (with relations) into the frontend format where
 * `antropometriaId` and `planNutricionalId` are the related record ids.
 */
export function toConsultationResponse(c: ConsultationWithRelations) {
  return {
    id: c.id,
    pacienteId: c.pacienteId,
    fecha: c.fecha,
    motivo: c.motivo,
    notasClinicas: c.notasClinicas,
    diagnostico: c.diagnostico,
    recomendaciones: c.recomendaciones,
    proximaCita: c.proximaCita,
    antropometriaId: c.anthropometry?.id ?? null,
    planNutricionalId: c.nutritionalPlan?.id ?? null,
    anthropometry: c.anthropometry ?? null,
    nutritionalPlan: c.nutritionalPlan ?? null,
    patient: c.patient ?? null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

const defaultInclude = {
  anthropometry: true,
  nutritionalPlan: true,
  patient: { select: { id: true, nombre: true, apellido: true } },
} as const;

export async function listConsultations(tenantId: string, params: ListConsultationsParams) {
  const {
    search,
    page,
    pageSize,
    pacienteId,
    dateFrom,
    dateTo,
    sortBy = 'fecha',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.ConsultationWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (pacienteId) {
    where.pacienteId = pacienteId;
  }

  if (dateFrom || dateTo) {
    where.fecha = {};
    if (dateFrom) (where.fecha as Prisma.StringFilter).gte = dateFrom;
    if (dateTo) (where.fecha as Prisma.StringFilter).lte = dateTo;
  }

  if (search) {
    where.OR = [
      { motivo: { contains: search, mode: 'insensitive' } },
      { notasClinicas: { contains: search, mode: 'insensitive' } },
      { diagnostico: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      include: defaultInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.consultation.count({ where }),
  ]);

  return {
    data: data.map(toConsultationResponse),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getConsultation(tenantId: string, id: string) {
  const consultation = await prisma.consultation.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: defaultInclude,
  });

  if (!consultation) {
    throw new NotFoundError('Consulta');
  }

  return toConsultationResponse(consultation);
}

export async function createConsultation(
  tenantId: string,
  data: {
    pacienteId: string;
    fecha: string;
    motivo?: string;
    notasClinicas?: string;
    diagnostico?: string;
    recomendaciones?: string;
    proximaCita?: string | null;
    anthropometry?: Record<string, unknown>;
    nutritionalPlan?: Record<string, unknown>;
  },
) {
  const { anthropometry: anthroData, nutritionalPlan: planData, ...consultationData } = data;
  const patient = await prisma.patient.findFirst({
    where: { id: consultationData.pacienteId, tenantId, deletedAt: null },
  });
  if (!patient) {
    throw new NotFoundError('Paciente');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the consultation
    const consultation = await tx.consultation.create({
      data: {
        tenantId,
        pacienteId: consultationData.pacienteId,
        fecha: consultationData.fecha,
        motivo: consultationData.motivo ?? '',
        notasClinicas: consultationData.notasClinicas ?? '',
        diagnostico: consultationData.diagnostico ?? '',
        recomendaciones: consultationData.recomendaciones ?? '',
        proximaCita: consultationData.proximaCita ?? null,
      },
    });

    await tx.appointment.updateMany({
      where: {
        tenantId,
        pacienteId: consultationData.pacienteId,
        fecha: consultationData.fecha,
        estado: 'programada',
        deletedAt: null,
      },
      data: { estado: 'completada' },
    });

    // 2. Optionally create anthropometry
    let anthropometry: Anthropometry | null = null;
    if (anthroData) {
      anthropometry = await tx.anthropometry.create({
        data: {
          tenantId,
          pacienteId: consultationData.pacienteId,
          consultaId: consultation.id,
          fecha: consultationData.fecha,
          ...anthroData,
        } as Prisma.AnthropometryUncheckedCreateInput,
      });
    }

    // 3. Optionally create nutritional plan
    let nutritionalPlan: NutritionalPlan | null = null;
    if (planData) {
      const { comidas, ...planRest } = planData;
      nutritionalPlan = await tx.nutritionalPlan.create({
        data: {
          tenantId,
          pacienteId: consultationData.pacienteId,
          consultaId: consultation.id,
          fecha: consultationData.fecha,
          ...planRest,
          comidas: comidas ?? [],
        } as Prisma.NutritionalPlanUncheckedCreateInput,
      });
    }

    return { ...consultation, anthropometry, nutritionalPlan };
  });

  return toConsultationResponse(result);
}

export async function updateConsultation(
  tenantId: string,
  id: string,
  data: {
    pacienteId?: string;
    fecha?: string;
    motivo?: string;
    notasClinicas?: string;
    diagnostico?: string;
    recomendaciones?: string;
    proximaCita?: string | null;
    anthropometry?: Record<string, unknown> | null;
    nutritionalPlan?: Record<string, unknown>;
  },
) {
  const existing = await prisma.consultation.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: defaultInclude,
  });

  if (!existing) {
    throw new NotFoundError('Consulta');
  }

  const { anthropometry: anthroData, nutritionalPlan: planData, ...consultationData } = data;
  // Prevent Over-posting / Tenant Injection
  const { id: _id, tenantId: _tenantId, createdAt: _createdAt, deletedAt: _deletedAt, ...safeConsultationData } = consultationData as any;
  const safeAnthroData = anthroData 
    ? (({ id, tenantId, consultaId, createdAt, deletedAt, ...rest }) => rest)(anthroData as any) 
    : undefined;
  const safePlanData = planData 
    ? (({ id, tenantId, consultaId, createdAt, deletedAt, ...rest }) => rest)(planData as any) 
    : undefined;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update the consultation
    const consultation = await tx.consultation.update({
      where: { id },
      data: safeConsultationData as Prisma.ConsultationUncheckedUpdateInput,
    });

    // 2. Upsert or delete anthropometry
    let anthropometry: Anthropometry | null = existing.anthropometry;
    if (anthroData === null) {
      if (existing.anthropometry) {
        await tx.anthropometry.delete({ where: { id: existing.anthropometry.id } });
        anthropometry = null;
      }
    } else if (safeAnthroData) {
      if (existing.anthropometry) {
        anthropometry = await tx.anthropometry.update({
          where: { id: existing.anthropometry.id },
          data: safeAnthroData as Prisma.AnthropometryUncheckedUpdateInput,
        });
      } else {
        anthropometry = await tx.anthropometry.create({
          data: {
            tenantId,
            pacienteId: existing.pacienteId,
            consultaId: id,
            fecha: consultation.fecha,
            ...safeAnthroData,
          } as Prisma.AnthropometryUncheckedCreateInput,
        });
      }
    }

    // 3. Upsert nutritional plan if provided
    let nutritionalPlan: NutritionalPlan | null = existing.nutritionalPlan;
    if (safePlanData) {
      const { comidas, ...planRest } = safePlanData;
      if (existing.nutritionalPlan) {
        nutritionalPlan = await tx.nutritionalPlan.update({
          where: { id: existing.nutritionalPlan.id },
          data: {
            ...planRest,
            comidas: comidas ?? undefined,
          } as Prisma.NutritionalPlanUncheckedUpdateInput,
        });
      } else {
        nutritionalPlan = await tx.nutritionalPlan.create({
          data: {
            tenantId,
            pacienteId: existing.pacienteId,
            consultaId: id,
            fecha: consultation.fecha,
            ...planRest,
            comidas: comidas ?? [],
          } as Prisma.NutritionalPlanUncheckedCreateInput,
        });
      }
    }

    return { ...consultation, anthropometry, nutritionalPlan };
  });

  return toConsultationResponse(result);
}

export async function deleteConsultation(tenantId: string, id: string) {
  const existing = await prisma.consultation.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Consulta');
  }

  await prisma.consultation.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}
