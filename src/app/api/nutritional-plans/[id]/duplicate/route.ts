import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { duplicatePlan } from '@/server/services/nutritionalPlan.service';

export const POST = withAuth(async (req, { params, session }) => {
  const { id } = await params;
  const plan = await duplicatePlan(session.tenantId, id);
  return NextResponse.json({ data: plan }, { status: 201 });
});
