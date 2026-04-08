import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getPlan, updatePlan, deletePlan } from '@/server/services/nutritionalPlan.service';
import { parseBody } from '@/server/middleware/withValidation';
import { nutritionalPlanUpdateSchema } from '@/server/lib/validation';
import { logAudit, getClientIp } from '@/server/lib/auditLog';

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const plan = await getPlan(session.tenantId, id);
  return NextResponse.json({ data: plan });
});

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const body = await parseBody(req, nutritionalPlanUpdateSchema);
  const plan = await updatePlan(session.tenantId, id, body);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'UPDATE',
    entityType: 'NutritionalPlan',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: plan });
});

export const DELETE = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deletePlan(session.tenantId, id);

  logAudit({
    tenantId: session.tenantId,
    userId: session.userId,
    action: 'DELETE',
    entityType: 'NutritionalPlan',
    entityId: id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
});
