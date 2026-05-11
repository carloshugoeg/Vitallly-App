import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { listPlans, createStandalonePlan } from '@/server/services/nutritionalPlan.service';
import { parseBody, parseSearchParams } from '@/server/middleware/withValidation';
import { nutritionalPlanCreateSchema, nutritionalPlanListParamsSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { session }) => {
  const url = new URL(req.url);
  const params = parseSearchParams(url, nutritionalPlanListParamsSchema);

  const result = await listPlans(session.tenantId, params);

  return NextResponse.json({
    data: result.data,
    meta: { total: result.total, page: result.page, pageSize: result.pageSize },
  });
});

export const POST = withAuth(async (req, { session }) => {
  const body = await parseBody(req, nutritionalPlanCreateSchema);
  const plan = await createStandalonePlan(session.tenantId, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'CREATE',
    entityType: 'NutritionalPlan',
    entityId: plan.id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: plan }, { status: 201 });
});
