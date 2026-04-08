import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { getSettings, updateSettings } from '@/server/services/settings.service';
import { parseBody } from '@/server/middleware/withValidation';
import { settingsUpdateSchema } from '@/server/lib/validation';

export const GET = withAuth(async (req, { session }) => {
  const settings = await getSettings(session.userId);
  return NextResponse.json({ data: settings });
});

export const PUT = withAuth(async (req, { session }) => {
  const body = await parseBody(req, settingsUpdateSchema);
  const settings = await updateSettings(session.userId, body);
  return NextResponse.json({ data: settings });
});
