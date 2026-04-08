import { NextResponse } from 'next/server';
import { withAuth } from '@/server/middleware/withAuth';
import { createInvitation } from '@/server/services/auth.service';
import { parseBody } from '@/server/middleware/withValidation';
import { inviteSchema } from '@/server/lib/validation';
import { UserRole } from '@/generated/prisma/enums';

export const POST = withAuth(async (req, { session }) => {
  const { email, role } = await parseBody(req, inviteSchema);
  const invitation = await createInvitation(session.tenantId, email, role);
  return NextResponse.json({ data: invitation }, { status: 201 });
}, [UserRole.ADMIN, UserRole.OWNER]);
