export const runtime = 'nodejs';

import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';
import { withCors, preflight } from '../../../../lib/cors';
import { ensureSeeded } from '../../../../lib/seed';

export async function OPTIONS() { return preflight(); }

export async function POST(req) {
  await ensureSeeded();
  const { email, password } = await req.json();
  if (!email || !password) return withCors(JSON.stringify({ error: 'Email and password required' }), { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
  if (!user) return withCors(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return withCors(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });

  const token = signToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
    tenantSlug: user.tenant.slug
  });

  return withCors(JSON.stringify({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: user.tenant.id, slug: user.tenant.slug, name: user.tenant.name, plan: user.tenant.plan }
  }), { headers: { 'Content-Type': 'application/json' } });
}
