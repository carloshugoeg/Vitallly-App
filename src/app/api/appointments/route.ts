import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listAppointments, createAppointment } from '@/server/services/appointment.service';
import { parseBody, parseSearchParams } from '@/server/middleware/withValidation';
import { appointmentCreateSchema, appointmentListParamsSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { session }) => {
  const url = new URL(req.url);
  const params = parseSearchParams(url, appointmentListParamsSchema);

  const result = await listAppointments(session.tenantId, params);

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});

export const POST = withAuth(async (req, { session }) => {
  const body = await parseBody(req, appointmentCreateSchema);
  const appointment = await createAppointment(session.tenantId, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'CREATE',
    entityType: 'Appointment',
    entityId: appointment.id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: appointment }, { status: 201 });
});
