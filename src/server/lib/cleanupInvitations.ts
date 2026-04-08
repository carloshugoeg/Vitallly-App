/**
 * Mantenimiento de invitaciones expiradas.
 * Diseñado para ejecutarse periódicamente (cron o startup) y garantizar
 * que las invitaciones vencidas no puedan ser aceptadas.
 */
import 'server-only';
import { prisma } from '@/server/lib/prisma';

/**
 * Marca como EXPIRED las invitaciones pendientes cuya fecha límite ya pasó.
 * Silencia errores para no interrumpir flujos que lo invoquen de forma secundaria.
 * @returns Cantidad de invitaciones expiradas actualizadas.
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  try {
    const result = await prisma.invitation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired invitations:', error);
    return 0;
  }
}
