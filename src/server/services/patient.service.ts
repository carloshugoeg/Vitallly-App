import 'server-only';

import { prisma } from '@/server/lib/prisma';
import { NotFoundError } from '@/server/lib/errors';
import type { Patient, Prisma } from '@/generated/prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListPatientsParams {
  search?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a flat DB patient row into the nested frontend format with
 * `contactoEmergencia`, `estiloVida`, and `perfilClinico` objects.
 */
export function toPatientResponse(p: Patient) {
  return {
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido,
    dpi: p.dpi,
    fechaNacimiento: p.fechaNacimiento,
    genero: p.genero,
    telefono: p.telefono,
    email: p.email,
    direccion: p.direccion,
    ocupacion: p.ocupacion,
    contactoEmergencia: {
      nombre: p.contactoEmergenciaNombre,
      telefono: p.contactoEmergenciaTelefono,
      relacion: p.contactoEmergenciaRelacion,
    },
    antecedentesMedicos: p.antecedentesMedicos,
    antecedentesFamiliares: p.antecedentesFamiliares,
    alergias: p.alergias,
    medicamentos: p.medicamentos,
    estiloVida: {
      nivelActividad: p.nivelActividad,
      horasSueno: p.horasSueno,
      consumoAlcohol: p.consumoAlcohol,
      fumador: p.fumador,
      ejercicioSemanal: p.ejercicioSemanal,
    },
    perfilClinico: {
      estatura: p.estatura,
      patologias: p.patologias,
      examenesLaboratorio: p.examenesLaboratorio,
      sintomas: p.sintomas,
      vicios: p.vicios,
      alimentosNoTolerables: p.alimentosNoTolerables,
    },
    fechaRegistro: p.fechaRegistro,
    notas: p.notas,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * Flattens the nested frontend patient data into the flat DB shape.
 */
function flattenPatientData(data: Record<string, unknown>) {
  const { contactoEmergencia, estiloVida, perfilClinico, ...rest } = data;

  const flat: Record<string, unknown> = { ...rest };

  if (contactoEmergencia && typeof contactoEmergencia === 'object') {
    const ce = contactoEmergencia as Record<string, unknown>;
    if (ce.nombre !== undefined) flat.contactoEmergenciaNombre = ce.nombre;
    if (ce.telefono !== undefined) flat.contactoEmergenciaTelefono = ce.telefono;
    if (ce.relacion !== undefined) flat.contactoEmergenciaRelacion = ce.relacion;
  }

  if (estiloVida && typeof estiloVida === 'object') {
    const ev = estiloVida as Record<string, unknown>;
    if (ev.nivelActividad !== undefined) flat.nivelActividad = ev.nivelActividad;
    if (ev.horasSueno !== undefined) flat.horasSueno = ev.horasSueno;
    if (ev.consumoAlcohol !== undefined) flat.consumoAlcohol = ev.consumoAlcohol;
    if (ev.fumador !== undefined) flat.fumador = ev.fumador;
    if (ev.ejercicioSemanal !== undefined) flat.ejercicioSemanal = ev.ejercicioSemanal;
  }

  if (perfilClinico && typeof perfilClinico === 'object') {
    const pc = perfilClinico as Record<string, unknown>;
    if (pc.estatura !== undefined) flat.estatura = pc.estatura;
    if (pc.patologias !== undefined) flat.patologias = pc.patologias;
    if (pc.examenesLaboratorio !== undefined) flat.examenesLaboratorio = pc.examenesLaboratorio;
    if (pc.sintomas !== undefined) flat.sintomas = pc.sintomas;
    if (pc.vicios !== undefined) flat.vicios = pc.vicios;
    if (pc.alimentosNoTolerables !== undefined) flat.alimentosNoTolerables = pc.alimentosNoTolerables;
  }

  return flat;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listPatients(tenantId: string, params: ListPatientsParams) {
  const { search, page, pageSize, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  const where: Prisma.PatientWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { apellido: { contains: search, mode: 'insensitive' } },
      { dpi: { contains: search, mode: 'insensitive' } },
      { telefono: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    data: data.map(toPatientResponse),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPatient(tenantId: string, id: string) {
  const patient = await prisma.patient.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!patient) {
    throw new NotFoundError('Paciente');
  }

  return toPatientResponse(patient);
}

export async function createPatient(tenantId: string, data: Record<string, unknown>) {
  const flat = flattenPatientData(data) as Prisma.PatientUncheckedCreateInput;

  if (!flat.fechaRegistro) {
    flat.fechaRegistro = new Date().toISOString().split('T')[0];
  }

  const patient = await prisma.patient.create({
    data: {
      ...flat,
      tenantId,
    },
  });

  return toPatientResponse(patient);
}

export async function updatePatient(
  tenantId: string,
  id: string,
  data: Record<string, unknown>,
) {
  // Verify ownership & existence
  const existing = await prisma.patient.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Paciente');
  }

  const flat = flattenPatientData(data) as Prisma.PatientUncheckedUpdateInput;

  const patient = await prisma.patient.update({
    where: { id },
    data: flat,
  });

  return toPatientResponse(patient);
}

export async function deletePatient(tenantId: string, id: string) {
  const existing = await prisma.patient.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!existing) {
    throw new NotFoundError('Paciente');
  }

  await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { success: true };
}
