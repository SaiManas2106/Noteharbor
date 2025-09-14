import prisma from './prisma';
import bcrypt from 'bcryptjs';

export async function ensureSeeded() {
  const tenants = await prisma.tenant.count();
  if (tenants > 0) return;

  const password = await bcrypt.hash('password', 10);

  const acme = await prisma.tenant.create({
    data: {
      name: 'Acme',
      slug: 'acme',
      plan: 'FREE',
      users: {
        create: [
          { email: 'admin@acme.test', passwordHash: password, role: 'ADMIN' },
          { email: 'user@acme.test', passwordHash: password, role: 'MEMBER' }
        ]
      }
    }
  });

  const globex = await prisma.tenant.create({
    data: {
      name: 'Globex',
      slug: 'globex',
      plan: 'FREE',
      users: {
        create: [
          { email: 'admin@globex.test', passwordHash: password, role: 'ADMIN' },
          { email: 'user@globex.test', passwordHash: password, role: 'MEMBER' }
        ]
      }
    }
  });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    await prisma.note.create({
      data: {
        title: 'Welcome',
        content: `Welcome to ${admin.email.split('@')[1].split('.')[0]}!`,
        authorId: admin.id,
        tenantId: admin.tenantId
      }
    });
  }
}
