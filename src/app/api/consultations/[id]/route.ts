import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getConsultation, updateConsultation, deleteConsultation } from '@/server/services/consultation.service';
import { parseBody } from '@/server/middleware/withValidation';
import { consultationUpdateSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const consultation = await getConsultation(session.tenantId, id);
  return NextResponse.json({ data: consultation });
});

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const body = await parseBody(req, consultationUpdateSchema);
  const consultation = await updateConsultation(session.tenantId, id, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'UPDATE',
    entityType: 'Consultation',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: consultation });
});

export const DELETE = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deleteConsultation(session.tenantId, id);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'DELETE',
    entityType: 'Consultation',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
});
