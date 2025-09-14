export const runtime = 'nodejs';

import prisma from '../../../lib/prisma';
import { getAuth, requireAuth } from '../../../lib/auth';
import { withCors, preflight } from '../../../lib/cors';

export async function OPTIONS() { return preflight(); }

export async function GET(req, { params }) {
  const auth = await getAuth(req);
  try { requireAuth(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 401 }); }
  const note = await prisma.note.findFirst({
    where: { id: params.id, tenantId: auth.tenantId },
    select: { id: true, title: true, content: true, createdAt: true, updatedAt: true }
  });
  if (!note) return withCors(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return withCors(JSON.stringify({ note }), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req, { params }) {
  const auth = await getAuth(req);
  try { requireAuth(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 401 }); }
  const existing = await prisma.note.findFirst({ where: { id: params.id, tenantId: auth.tenantId } });
  if (!existing) return withCors(JSON.stringify({ error: 'Not found' }), { status: 404 });
  const { title, content } = await req.json();
  const note = await prisma.note.update({ where: { id: params.id }, data: { title, content } });
  return withCors(JSON.stringify({ note }), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req, { params }) {
  const auth = await getAuth(req);
  try { requireAuth(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 401 }); }
  const existing = await prisma.note.findFirst({ where: { id: params.id, tenantId: auth.tenantId } });
  if (!existing) return withCors(JSON.stringify({ error: 'Not found' }), { status: 404 });
  await prisma.note.delete({ where: { id: params.id } });
  return withCors(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
