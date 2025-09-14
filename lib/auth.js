import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export async function getAuth(req) {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7);
  const data = verifyToken(token);
  if (!data) return null;
  const user = await prisma.user.findUnique({ where: { id: data.userId }, include: { tenant: true } });
  if (!user || user.tenantId !== data.tenantId) return null;
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenant.slug,
    tenantPlan: user.tenant.plan
  };
}

export function requireAuth(auth) {
  if (!auth) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
}

export function requireAdmin(auth) {
  requireAuth(auth);
  if (auth.role !== 'ADMIN') {
    const err = new Error('Forbidden: admin only');
    err.status = 403;
    throw err;
  }
}
