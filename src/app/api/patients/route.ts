import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listPatients, createPatient } from '@/server/services/patient.service';
import { parseBody, parseSearchParams } from '@/server/middleware/withValidation';
import { patientCreateSchema, patientListParamsSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { session }) => {
  const url = new URL(req.url);
  const params = parseSearchParams(url, patientListParamsSchema);

  const result = await listPatients(session.tenantId, params);

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});

export const POST = withAuth(async (req, { session }) => {
  const body = await parseBody(req, patientCreateSchema);
  const patient = await createPatient(session.tenantId, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'CREATE',
    entityType: 'Patient',
    entityId: patient.id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: patient }, { status: 201 });
});
