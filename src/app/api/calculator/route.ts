import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { calculate } from '@/server/services/calculator.service';
import { parseBody } from '@/server/middleware/withValidation';
import { calculatorSchema } from '@/server/lib/validation';

export const POST = withAuth(async (req) => {
  const body = await parseBody(req, calculatorSchema);
  const result = calculate(body);
  return NextResponse.json({ data: result });
});
