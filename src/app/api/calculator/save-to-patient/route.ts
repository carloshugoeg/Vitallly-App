import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { saveToPatient } from '@/server/services/calculator.service';
import { parseBody } from '@/server/middleware/withValidation';
import { saveToPatientSchema } from '@/server/lib/validation';

export const POST = withAuth(async (req, { session }) => {
  const body = await parseBody(req, saveToPatientSchema);
  const plan = await saveToPatient(session.tenantId, body);
  return NextResponse.json({ data: plan }, { status: 201 });
});
