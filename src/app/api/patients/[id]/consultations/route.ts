import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listConsultations } from '@/server/services/consultation.service';
import { parseSearchParams } from '@/server/middleware/withValidation';
import { consultationListParamsSchema } from '@/server/lib/validation';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const url = new URL(req.url);
  const listParams = parseSearchParams(url, consultationListParamsSchema);

  const result = await listConsultations(session.tenantId, { ...listParams, pacienteId: id });

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});
