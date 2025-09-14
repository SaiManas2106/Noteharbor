export const runtime = 'nodejs';

import prisma from '../../../../../lib/prisma';
import { getAuth, requireAdmin } from '../../../../../lib/auth';
import { withCors, preflight } from '../../../../../lib/cors';

export async function OPTIONS() { return preflight(); }

export async function POST(req, { params }) {
  const auth = await getAuth(req);
  try { requireAdmin(auth); } catch (e) { return withCors(JSON.stringify({ error: e.message }), { status: e.status || 403 }); }

  const target = await prisma.tenant.findUnique({ where: { slug: params.slug } });
  if (!target) return withCors(JSON.stringify({ error: 'Tenant not found' }), { status: 404 });

  if (target.id !== auth.tenantId) {
    return withCors(JSON.stringify({ error: 'Forbidden: cannot upgrade another tenant' }), { status: 403 });
  }

  const tenant = await prisma.tenant.update({
    where: { id: target.id },
    data: { plan: 'PRO' },
    select: { id: true, slug: true, name: true, plan: true }
  });

  return withCors(JSON.stringify({ tenant, message: 'Upgraded to PRO' }), { headers: { 'Content-Type': 'application/json' } });
}
