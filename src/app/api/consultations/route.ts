import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listConsultations, createConsultation } from '@/server/services/consultation.service';
import { parseBody, parseSearchParams } from '@/server/middleware/withValidation';
import { consultationCreateSchema, consultationListParamsSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { session }) => {
  const url = new URL(req.url);
  const params = parseSearchParams(url, consultationListParamsSchema);

  const result = await listConsultations(session.tenantId, params);

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});

export const POST = withAuth(async (req, { session }) => {
  const body = await parseBody(req, consultationCreateSchema);
  const consultation = await createConsultation(session.tenantId, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'CREATE',
    entityType: 'Consultation',
    entityId: consultation.id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: consultation }, { status: 201 });
});
