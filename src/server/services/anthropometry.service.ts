/**
 * Servicio de antropometría.
 * Las medidas antropométricas siempre están vinculadas a una consulta;
 * no se crean de forma independiente. Se filtran por consultas no eliminadas
 * (soft delete) para mantener consistencia.
 */
import 'server-only';

import { prisma } from '@/server/lib/prisma';
import { NotFoundError } from '@/server/lib/errors';
import type { Prisma } from '@/generated/prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListByPatientParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Lista paginada de mediciones antropométricas de un paciente.
 * Excluye mediciones cuya consulta padre fue eliminada (soft delete).
 */
export async function listByPatient(
  tenantId: string,
  pacienteId: string,
  params: ListByPatientParams,
) {
  const { page, pageSize, sortBy = 'fecha', sortOrder = 'desc' } = params;

  // Filtra por consulta no eliminada para ocultar datos de consultas borradas
  const where: Prisma.AnthropometryWhereInput = {
    tenantId,
    pacienteId,
    consultation: { deletedAt: null },
  };

  const [data, total] = await Promise.all([
    prisma.anthropometry.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.anthropometry.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/** Obtiene una medición por ID, aislada por tenant y con consulta activa. */
export async function getAnthropometry(tenantId: string, id: string) {
  const record = await prisma.anthropometry.findFirst({
    where: { id, tenantId, consultation: { deletedAt: null } },
  });

  if (!record) {
    throw new NotFoundError('Antropometria');
  }

  return record;
}
