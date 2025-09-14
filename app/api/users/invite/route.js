export const runtime = 'nodejs';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { getAuth, requireAdmin } from '../../../../lib/auth';
import { withCors, preflight } from '../../../../lib/cors';

export async function OPTIONS() { return preflight(); }

export async function POST(req) {
  const auth = await getAuth(req);
  try { requireAdmin(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 403 }); }

  const { email, role = 'MEMBER', password = 'password' } = await req.json();
  if (!email) return withCors(JSON.stringify({ error: 'email required' }), { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return withCors(JSON.stringify({ error: 'user already exists' }), { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash, role, tenantId: auth.tenantId },
    select: { id: true, email: true, role: true }
  });

  return withCors(JSON.stringify({ user }), { headers: { 'Content-Type': 'application/json' } });
}
