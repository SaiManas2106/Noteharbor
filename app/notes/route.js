export const runtime = 'nodejs';

import prisma from '../../lib/prisma';
import { getAuth, requireAuth } from '../../lib/auth';
import { withCors, preflight } from '../../lib/cors';

const FREE_LIMIT = 3;

export async function OPTIONS() { return preflight(); }

export async function GET(req) {
  const auth = await getAuth(req);
  try { requireAuth(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 401 }); }
  const notes = await prisma.note.findMany({
    where: { tenantId: auth.tenantId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, content: true, createdAt: true, updatedAt: true }
  });
  const tenant = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
  return withCors(JSON.stringify({
    notes,
    meta: { plan: tenant.plan, limit: tenant.plan === 'FREE' ? FREE_LIMIT : null, count: notes.length }
  }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req) {
  const auth = await getAuth(req);
  try { requireAuth(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 401 }); }

  const tenant = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
  if (tenant.plan === 'FREE') {
    const count = await prisma.note.count({ where: { tenantId: auth.tenantId } });
    if (count >= FREE_LIMIT) {
      return withCors(JSON.stringify({ error: 'Free plan note limit reached', code: 'FREE_LIMIT_REACHED' }), { status: 403 });
    }
  }

  const { title, content } = await req.json();
  if (!title) return withCors(JSON.stringify({ error: 'title required' }), { status: 400 });
  const note = await prisma.note.create({
    data: { title, content: content || '', tenantId: auth.tenantId, authorId: auth.userId },
    select: { id: true, title: true, content: true, createdAt: true, updatedAt: true }
  });
  return withCors(JSON.stringify({ note }), { headers: { 'Content-Type': 'application/json' } });
}
