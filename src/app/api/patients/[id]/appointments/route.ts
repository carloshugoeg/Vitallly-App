import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listAppointments } from '@/server/services/appointment.service';
import { parseSearchParams } from '@/server/middleware/withValidation';
import { appointmentListParamsSchema } from '@/server/lib/validation';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const url = new URL(req.url);
  const listParams = parseSearchParams(url, appointmentListParamsSchema);

  const result = await listAppointments(session.tenantId, { ...listParams, pacienteId: id });

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});
