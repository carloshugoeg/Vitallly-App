import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getStats } from '@/server/services/dashboard.service';

export const GET = withAuth(async (req, { session }) => {
  const stats = await getStats(session.tenantId);
  return NextResponse.json({ data: stats });
});
