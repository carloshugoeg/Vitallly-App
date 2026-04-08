# Vitally App — Launch Plan

## Objective
Prepare the Vitally nutrition clinic app for production use with real users. The app has a complete backend (Prisma, services, API routes, SWR hooks) and frontend, but several critical gaps prevent real deployment.

## Current State (as of 2026-03-15)
- Mock data migration complete — all pages use API hooks
- Build compiles with zero errors
- Auth backend (NextAuth + Prisma) exists but is bypassed by hardcoded login
- Zod validation schemas exist but aren't enforced in API routes
- No error boundaries, no deployment config, no real database running

---

## Subtasks

### SUBTASK 1: Auth — Wire Login to NextAuth ✅ COMPLETED / ⬜ PENDING
**Status:** ✅ COMPLETED
**Priority:** CRITICAL — nothing works for real users without this
**Estimated focus:** 1 session

**What to do:**
1. Rewrite `src/app/login/page.tsx` to use NextAuth `signIn("credentials", { email, password })`
2. Rewrite `src/app/(dashboard)/layout.tsx` to use `useSession()` or server `auth()` instead of localStorage
3. Remove all `localStorage.getItem('vitally_auth')` references
4. Remove `src/lib/auth-context.tsx` (replaced by NextAuth session)
5. Update `src/app/page.tsx` root redirect if needed
6. Test: login with seed user `admin@vitally.app / admin123`

**Key files:**
- `src/lib/auth.ts` — NextAuth config (already correct, just unused)
- `src/app/login/page.tsx` — rewrite
- `src/app/(dashboard)/layout.tsx` — rewrite auth check
- `src/lib/auth-context.tsx` — delete
- `src/middleware.ts` — review/keep

**Why:** Without real auth, anyone can access the app by setting a localStorage flag. All API routes already use `withAuth` middleware that checks NextAuth sessions, so the API will reject requests from the fake login.

---

### SUBTASK 2: Environment & Database Setup
**Status:** ✅ COMPLETED
**Priority:** CRITICAL — app can't run without a database
**Estimated focus:** 1 session

**What to do:**
1. Create `.env.example` with all required variables documented
2. Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `.env`
3. Run `npx prisma migrate dev --name init` to create initial migration
4. Run `npx prisma db seed` to populate demo data
5. Add convenience scripts to `package.json`: `db:migrate`, `db:seed`, `db:reset`
6. Verify the full flow: start dev server → login → see seeded data
7. Document setup steps in README or SETUP.md

**Key files:**
- `.env` / `.env.example`
- `prisma/schema.prisma` (already complete)
- `prisma/seed.ts` (already complete)
- `package.json` (add scripts)

**Why:** No real database = no data. The seed creates a tenant, admin user, 7 patients, consultations, and appointments so the app has demo data on first run.

---

### SUBTASK 3: API Input Validation
**Status:** ✅ COMPLETED
**Priority:** HIGH — prevents crashes and bad data
**Estimated focus:** 1 session

**What to do:**
1. In every POST/PUT API route, parse request body with the corresponding Zod schema from `src/server/lib/validation.ts`
2. Return 400 with field-level error messages on validation failure
3. Routes to update:
   - `src/app/api/patients/route.ts` (POST) + `[id]/route.ts` (PUT)
   - `src/app/api/appointments/route.ts` (POST) + `[id]/route.ts` (PUT)
   - `src/app/api/consultations/route.ts` (POST) + `[id]/route.ts` (PUT)
   - `src/app/api/nutritional-plans/route.ts` (POST) + `[id]/route.ts` (PUT)
   - `src/app/api/auth/register/route.ts`
   - `src/app/api/auth/invite/route.ts`
   - `src/app/api/calculator/route.ts`
   - `src/app/api/settings/route.ts`
4. Consider creating a `validateBody(schema, req)` helper to DRY this up

**Key files:**
- `src/server/lib/validation.ts` — schemas already written
- All `src/app/api/**/route.ts` files

**Why:** Without validation, malformed requests hit Prisma directly and cause cryptic 500 errors. Real users will submit incomplete forms, paste bad data, etc.

---

### SUBTASK 4: Error Boundaries & Error States
**Status:** ✅ COMPLETED
**Priority:** HIGH — prevents white screens
**Estimated focus:** 1 session

**What to do:**
1. Create `src/app/error.tsx` — global error boundary with "Something went wrong" + retry button
2. Create `src/app/(dashboard)/error.tsx` — dashboard-specific error boundary
3. Create `src/app/not-found.tsx` — custom 404 page
4. Add error states to pages that fetch data (show message when API calls fail)
5. Add `loading.tsx` files for key routes (dashboard, pacientes, consultas, citas) for Suspense boundaries
6. Review that all `try/catch` blocks in page components surface errors to the user

**Key files:**
- New: `src/app/error.tsx`, `src/app/(dashboard)/error.tsx`, `src/app/not-found.tsx`
- New: `src/app/(dashboard)/dashboard/loading.tsx`, etc.
- Existing pages that use hooks — add error display

**Why:** If any page throws or an API call fails, users currently see a blank white screen with no way to recover.

---

### SUBTASK 5: Registration & Invitation UI
**Status:** ✅ COMPLETED
**Priority:** MEDIUM — needed for multi-user, but admin can use seed user initially
**Estimated focus:** 1 session

**What to do:**
1. Create `/register` page that accepts invitation token from URL, shows form (nombre, apellido, email, password)
2. Wire to `POST /api/auth/register` (endpoint exists)
3. Create invite UI in settings or admin area — form to send invitation (email + role)
4. Wire to `POST /api/auth/invite` (endpoint exists, requires ADMIN/OWNER role)
5. Add email sending for invitations (or show invitation link for MVP)
6. Add password requirements feedback in registration form

**Key files:**
- New: `src/app/register/page.tsx`
- New: settings page or admin section for invitations
- Existing: `src/app/api/auth/register/route.ts`, `src/app/api/auth/invite/route.ts`
- Existing: `src/server/services/auth.service.ts`

**Why:** Without this, there's no way to add new users. For MVP, showing the invitation link (instead of emailing) is acceptable.

---

### SUBTASK 6: Frontend Form Validation & UX Polish
**Status:** ✅ COMPLETED
**Priority:** MEDIUM — improves user experience significantly
**Estimated focus:** 1 session

**What to do:**
1. Add client-side validation to PatientForm (required fields, email format, DPI format)
2. Add client-side validation to appointment creation modal
3. Add client-side validation to consultation creation flow
4. Add pagination controls to patient list and consultation list (backend supports it)
5. Add confirmation dialogs for destructive actions (delete patient, delete plan)
6. Add loading states on form submit buttons (some already have this)
7. Mobile responsiveness: audit grid layouts (grid-cols-4, grid-cols-5, etc.)

**Key files:**
- `src/components/patients/PatientForm.tsx`
- `src/app/(dashboard)/citas/page.tsx`
- `src/app/(dashboard)/consultas/nueva/page.tsx`
- `src/app/(dashboard)/pacientes/page.tsx`
- `src/app/(dashboard)/consultas/page.tsx`

**Why:** Real users will make mistakes. Client-side validation gives instant feedback before hitting the API.

---

### SUBTASK 7: Security Hardening
**Status:** ✅ COMPLETED
**Priority:** MEDIUM-HIGH — important before public-facing
**Estimated focus:** 1 session

**What to do:**
1. Add rate limiting to auth endpoints (login, register, invite) — use a simple in-memory or Redis-based limiter
2. Add CSRF protection if not handled by NextAuth
3. Ensure passwords meet minimum requirements (server-side, in Zod schema)
4. Add security headers (X-Content-Type-Options, X-Frame-Options, etc.) in `next.config.ts`
5. Audit that all API routes use `withAuth` — grep for unprotected routes
6. Ensure sensitive data (passwords, tokens) never appear in API responses
7. Review soft-delete cascading — deleting a patient should handle their appointments/consultations

**Key files:**
- `next.config.ts` — security headers
- `src/server/middleware/withAuth.ts` — review
- `src/server/lib/validation.ts` — password requirements
- All API route files — audit

**Why:** Medical/nutritional data is sensitive. Even for a small clinic, basic security is non-negotiable.

---

### SUBTASK 8: Deployment & Infrastructure
**Status:** ✅ COMPLETED
**Priority:** HIGH — can't launch without deploying
**Estimated focus:** 1 session

**What to do:**
1. Decide deployment platform (Vercel + managed Postgres, Railway, VPS + Docker)
2. Create Dockerfile and docker-compose.yml if needed
3. Create production `.env` template
4. Add health check endpoint (`/api/health`)
5. Set up database backup strategy
6. Create basic CI: lint + typecheck + build on push (GitHub Actions)
7. Configure domain and HTTPS
8. Test full deploy: build → migrate → seed → run

**Key files:**
- New: `Dockerfile`, `docker-compose.yml` (if applicable)
- New: `.github/workflows/ci.yml`
- New: `src/app/api/health/route.ts`
- `package.json` — production scripts

**Why:** The app needs to be accessible on the internet for real users.

---

## Recommended Order

```
Session 1: SUBTASK 1 (Auth)          — unblocks everything
Session 2: SUBTASK 2 (DB Setup)      — app can actually run end-to-end
Session 3: SUBTASK 3 (Validation)    — prevents bad data from day 1
Session 4: SUBTASK 4 (Error States)  — prevents user confusion
Session 5: SUBTASK 7 (Security)      — before any real data enters
Session 6: SUBTASK 8 (Deployment)    — go live
Session 7: SUBTASK 5 (Registration)  — add team members
Session 8: SUBTASK 6 (UX Polish)     — iterate based on feedback
```

---

## Progress Log

| Date | Subtask | Status | Notes |
|------|---------|--------|-------|
| 2026-03-15 | Pre-work | ✅ Done | Migrated all pages from mock data to API hooks |
| 2026-03-15 | 1. Auth + DB Setup | ✅ Done | NextAuth wired, login/layout/sidebar/topbar/middleware rewritten, auth-context deleted, .env.example + db scripts added |
| 2026-03-15 | 2. API Validation | ✅ Done | All 14 POST/PUT routes use parseBody() with Zod schemas, ZodError handling in withAuth |
| 2026-03-15 | 3. Error Boundaries | ✅ Done | Global + dashboard error.tsx, not-found.tsx, 4 loading.tsx, ErrorDisplay component, error states on all list pages |
| 2026-03-15 | 4. Frontend UX | ✅ Done | PatientForm validation (DPI 13-digit), pagination on patients/consultas, TopBar search wired, responsive grids |
| 2026-03-15 | 5. Security | ✅ Done | Security headers in next.config, rate limiting on login, password strength in register schema, audit confirmed no passwordHash leaks |
| 2026-03-15 | 6. Deployment | ✅ Done | Health endpoint, CI workflow, production seed script |

---

## How to Resume

At the start of each session, say:
> "Read LAUNCH_PLAN.md and continue with the next subtask"

Claude will read the plan, see what's done, and pick up the next task.
