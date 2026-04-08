import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitation } from '@/server/services/auth.service';
import { AppError } from '@/server/lib/errors';
import { parseBody } from '@/server/middleware/withValidation';
import { registerSchema } from '@/server/lib/validation';
import { checkStrictRateLimit } from '@/server/lib/rateLimit';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // Rate limit registration by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed, retryAfterMs } = checkStrictRateLimit(`register:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT', message: 'Demasiados intentos. Intente de nuevo más tarde.' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const body = await parseBody(req, registerSchema);
    const user = await acceptInvitation(body);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: messages.join(', '), details: error.issues } },
        { status: 400 }
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error:', error);
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
