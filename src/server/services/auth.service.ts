import 'server-only';

import bcrypt from 'bcryptjs';
import { prisma } from '@/server/lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/server/lib/errors';
import type { UserRole } from '@/generated/prisma/enums';

export async function acceptInvitation(data: {
  token: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  titulo?: string;
}) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: data.token },
  });

  if (!invitation || invitation.status !== 'PENDING') {
    throw new NotFoundError('Invitación');
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw new ValidationError('La invitación ha expirado');
  }

  if (invitation.email !== data.email) {
    throw new ValidationError('El email no coincide con la invitación');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('Ya existe un usuario con este email');
  }

  const passwordHash = await bcrypt.hash(data.password, 13);

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        tenantId: invitation.tenantId,
        email: data.email,
        passwordHash,
        nombre: data.nombre,
        apellido: data.apellido,
        titulo: data.titulo ?? '',
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    }),
  ]);

  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    role: user.role,
    tenantId: user.tenantId,
  };
}

export async function createInvitation(
  tenantId: string,
  email: string,
  role: UserRole,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Ya existe un usuario con este email');
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: { email, tenantId, status: 'PENDING' },
  });

  if (existingInvitation) {
    throw new ConflictError('Ya existe una invitación pendiente para este email');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      tenantId,
      email,
      role,
      expiresAt,
    },
  });

  return {
    token: invitation.token,
    email: invitation.email,
    expiresAt: invitation.expiresAt,
  };
}
