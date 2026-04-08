import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import { cleanupExpiredInvitations } from '@/server/lib/cleanupInvitations';

export async function GET(req: NextRequest) {
  // Only allow health checks from localhost or with a secret header
  const forwardedFor = req.headers.get('x-forwarded-for');
  const healthSecret = req.headers.get('x-health-secret');
  const isLocalhost = !forwardedFor || forwardedFor === '127.0.0.1' || forwardedFor === '::1';

  if (!isLocalhost && healthSecret !== process.env.HEALTH_CHECK_SECRET) {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    // Piggyback cleanup of expired invitations on health checks
    const expiredCount = await cleanupExpiredInvitations();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      expiredInvitationsCleaned: expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
