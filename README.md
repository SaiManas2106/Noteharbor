# SaaS Notes (Multi-Tenant) — Vercel + Next.js + Prisma + Postgres

A production-ready demo of a **multi-tenant SaaS Notes** application designed to be deployed on **Vercel**. It demonstrates **tenant isolation**, **JWT auth**, **role-based access**, and **plan-based feature gating** (Free vs Pro).

## Multi-Tenancy Approach

**Shared schema with a `tenantId` column** on tenant-owned tables (User, Note).

- All reads/writes include `tenantId` from the authenticated user.
- Item endpoints (`/notes/:id`) check both `id` and `tenantId`, returning 404 if not in the current tenant.
- This keeps **Acme** and **Globex** strictly isolated.

## Plans & Feature Gating

- **Free**: Max **3 notes** per tenant
- **Pro**: Unlimited notes
- **Upgrade**: `POST /tenants/:slug/upgrade` — **Admin only**; **strictly** limited to upgrading your own tenant; effective immediately.

## Test Tenants & Accounts

All passwords: `password`

- **Acme**
  - `admin@acme.test` — **Admin**
  - `user@acme.test` — **Member**
- **Globex**
  - `admin@globex.test` — **Admin**
  - `user@globex.test` — **Member**

Seeding is performed on the first login (`lib/seed.js`).

---

## API Reference (Root paths per spec; `/api/*` aliases also provided)

### Health
- `GET /health` → `{ "status": "ok" }`
- Alias: `GET /api/health`

### Auth
- `POST /api/auth/login` → `{ token, user, tenant }`  
  Body: `{ email, password }`

### Notes (Tenant-scoped)
- `GET /notes` → list notes + `{ meta: { plan, limit, count } }`
- `POST /notes` → create note (enforces Free limit)
- `GET /notes/:id` → read single note (404 if not in tenant)
- `PUT /notes/:id` → update note (tenant-checked)
- `DELETE /notes/:id` → delete note (tenant-checked)

### Tenants
- `POST /tenants/:slug/upgrade` → **Admin only**, upgrades plan to **PRO** (only own tenant)
- Alias: `/api/tenants/:slug/upgrade`

### Users
- `POST /users/invite` → **Admin only** (creates a user inside current tenant; password defaults to `password`)
- Alias: `/api/users/invite`

**Auth Header**: `Authorization: Bearer <token>`

---

## Frontend (UI)
- `/login` — login screen (redirects to `/dashboard` on success)
- `/dashboard` — list/create/**edit**/delete notes; shows **Upgrade to Pro** CTA for Admin when Free limit reached
- `/admin` — Admin-only page with **Invite User** and **Upgrade** controls

---

## Environment

Create `.env` from `.env.example` and set:
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — any strong random string
- `ALLOWED_ORIGINS` — optional CORS allowlist (default `*`)

### Install & Run Locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000/login` and use the test accounts.

---

## Deploy to Vercel

1. Import the repo into Vercel
2. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`
3. Deploy
4. Run once locally against your production DB: `npx prisma db push` to create the schema

---

## Security Notes

- JWT stored in `localStorage` for simplicity; for production, prefer HttpOnly cookies.
- Admin-only endpoints (`/tenants/:slug/upgrade`, `/users/invite`) are guarded by role checks.
- All data access is tenant-scoped.

## Evaluation Mapping

- **Health** `/health` ✓
- **Login** with all predefined accounts ✓
- **Tenant isolation** enforced ✓
- **Role restrictions** (Member cannot invite/upgrade) ✓
- **Free plan limit** = 3; lifted immediately on upgrade ✓
- **CRUD** `/notes` endpoints fully implemented ✓
- **Frontend** accessible with required features ✓
