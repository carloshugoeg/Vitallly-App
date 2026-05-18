import 'server-only';

import { prisma } from '@/server/lib/prisma';
import { NotFoundError } from '@/server/lib/errors';
import type { Prisma } from '@/generated/prisma/client';
import type { AppointmentStatus, AppointmentType } from '@/generated/prisma/enums';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListAppointmentsParams {
  search?: string;
  page: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
  estado?: string;
  pacienteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listAppointments(tenantId: string, params: ListAppointmentsParams) {
  const {
    search,
    page,
    pageSize,
    dateFrom,
    dateTo,
    estado,
    pacienteId,
    sortBy = 'fecha',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (pacienteId) {
    where.pacienteId = pacienteId;
  }

  if (estado) {
    where.estado = estado as AppointmentStatus;
  }

  if (dateFrom || dateTo) {
    where.fecha = {};
    if (dateFrom) (where.fecha as Prisma.StringFilter).gte = dateFrom;
    if (dateTo) (where.fecha as Prisma.StringFilter).lte = dateTo;
  }

  if (search) {
    where.OR = [
      { motivo: { contains: search, mode: 'insensitive' } },
      { notas: { contains: search, mode: 'insensitive' } },
      { patient: { nombre: { contains: search, mode: 'insensitive' } } },
      { patient: { apellido: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAppointment(tenantId: string, id: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      patient: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  if (!appointment) {
    throw new NotFoundError('Cita');
  }

  return appointment;
}

export async function createAppointment(
  tenantId: string,
  data: {
    pacienteId: string;
    fecha: string;
    hora: string;
    tipo: string;
    motivo?: string;
    estado?: string;
    notas?: string;
    duracion?: number;
  },
) {
  const patient = await prisma.patient.findFirst({
    where: { id: data.pacienteId, tenantId, deletedAt: null },
  });

  if (!patient) {
    throw new NotFoundError('Paciente');
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId,
      pacienteId: data.pacienteId,
      fecha: data.fecha,
      hora: data.hora,
      duracion: data.duracion ?? 60,
      tipo: data.tipo as AppointmentType,
      motivo: data.motivo ?? '',
      estado: (data.estado ?? 'programada') as AppointmentStatus,
      notas: data.notas ?? '',
    } as Prisma.AppointmentUncheckedCreateInput,
    include: {
      patient: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  return appointment;
}

export async function updateAppointment(
  tenantId: string,
  id: string,
  data: Record<string, unknown>,
) {
  const existing = await prisma.appointment.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Cita');
  }

  // Prevent Over-posting / Tenant Injection
  const safeData = { ...data };
  delete safeData.id;
  delete safeData.tenantId;
  delete safeData.createdAt;
  delete safeData.deletedAt;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: safeData as Prisma.AppointmentUncheckedUpdateInput,
    include: {
      patient: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  return appointment;
}

export async function deleteAppointment(tenantId: string, id: string) {
  const existing = await prisma.appointment.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Cita');
  }

  await prisma.appointment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// Overlap check
// ---------------------------------------------------------------------------

/**
 * Checks whether a proposed appointment overlaps with any existing one.
 * Times are in "HH:mm" format. Duration is in minutes.
 */
export async function checkOverlap(
  tenantId: string,
  fecha: string,
  hora: string,
  duracion: number,
  excludeId?: string,
) {
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const newStart = toMinutes(hora);
  const newEnd = newStart + duracion;

  const dates = [fecha];
  if (newEnd > 1440) {
    const d = new Date(`${fecha}T00:00:00`);
    d.setDate(d.getDate() + 1);
    dates.push(d.toISOString().split('T')[0]);
  }

  const where: Prisma.AppointmentWhereInput = {
    tenantId,
    fecha: dates.length > 1 ? { in: dates } : fecha,
    deletedAt: null,
    estado: { not: 'cancelada' },
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  const overlapping = existing.filter((appt) => {
    const apptStart = toMinutes(appt.hora);
    const apptEnd = apptStart + appt.duracion;
    if (appt.fecha === fecha) {
      return newStart < apptEnd && newEnd > apptStart;
    }
    // next-day appointment: shift its window by 1440 to compare in the same scale
    return newStart < (apptEnd + 1440) && newEnd > (apptStart + 1440);
  });

  return {
    hasOverlap: overlapping.length > 0,
    overlappingAppointments: overlapping,
  };
}
