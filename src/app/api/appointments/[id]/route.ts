import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getAppointment, updateAppointment, deleteAppointment } from '@/server/services/appointment.service';
import { parseBody } from '@/server/middleware/withValidation';
import { appointmentUpdateSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const appointment = await getAppointment(session.tenantId, id);
  return NextResponse.json({ data: appointment });
});

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const body = await parseBody(req, appointmentUpdateSchema);
  const appointment = await updateAppointment(session.tenantId, id, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'UPDATE',
    entityType: 'Appointment',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: appointment });
});

export const DELETE = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deleteAppointment(session.tenantId, id);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'DELETE',
    entityType: 'Appointment',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
});
