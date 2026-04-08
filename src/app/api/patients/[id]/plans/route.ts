import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listByPatient } from '@/server/services/nutritionalPlan.service';
import { parseSearchParams } from '@/server/middleware/withValidation';
import { nutritionalPlanListParamsSchema } from '@/server/lib/validation';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const url = new URL(req.url);
  const listParams = parseSearchParams(url, nutritionalPlanListParamsSchema);

  const result = await listByPatient(session.tenantId, id, listParams);

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});
