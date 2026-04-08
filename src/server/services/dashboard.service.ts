import 'server-only';

import { prisma } from '@/server/lib/prisma';

export async function getStats(tenantId: string) {
  const today = new Date().toISOString().split('T')[0];

  const [
    totalPatients,
    todayAppointments,
    upcomingAppointments,
    totalConsultations,
    recentPatients,
  ] = await Promise.all([
    prisma.patient.count({
      where: { tenantId, deletedAt: null },
    }),
    prisma.appointment.count({
      where: { tenantId, fecha: today, deletedAt: null, estado: 'programada' },
    }),
    prisma.appointment.count({
      where: { tenantId, fecha: { gte: today }, deletedAt: null, estado: 'programada' },
    }),
    prisma.consultation.count({
      where: { tenantId, deletedAt: null },
    }),
    prisma.patient.count({
      where: {
        tenantId,
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalPatients,
    todayAppointments,
    upcomingAppointments,
    totalConsultations,
    recentPatients,
  };
}
