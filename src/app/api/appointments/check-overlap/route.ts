import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { checkOverlap } from '@/server/services/appointment.service';
import { parseBody } from '@/server/middleware/withValidation';
import { checkOverlapSchema } from '@/server/lib/validation';

export const POST = withAuth(async (req, { session }) => {
  const { fecha, hora, duracion, excludeId } = await parseBody(req, checkOverlapSchema);
  const result = await checkOverlap(session.tenantId, fecha, hora, duracion, excludeId);
  return NextResponse.json({ data: result });
});
