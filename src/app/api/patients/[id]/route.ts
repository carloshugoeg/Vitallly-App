import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getPatient, updatePatient, deletePatient } from '@/server/services/patient.service';
import { parseBody } from '@/server/middleware/withValidation';
import { patientUpdateSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const patient = await getPatient(session.tenantId, id);
  return NextResponse.json({ data: patient });
});

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const body = await parseBody(req, patientUpdateSchema);
  const patient = await updatePatient(session.tenantId, id, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'UPDATE',
    entityType: 'Patient',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: patient });
});

export const DELETE = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deletePatient(session.tenantId, id);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'DELETE',
    entityType: 'Patient',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
});
