# Deployment Guide — Vitally App

## Prerequisites

- Node.js 20+
- Git repo pushed to GitHub
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier)

---

## Step 1: Create the Cloud Database

1. Go to **https://supabase.com** → sign up / log in
2. Create a new project:
   - Organization: create or select one
   - Project name: `vitally`
   - Database password: generate a strong password and **save it**
   - Region: `US East (N. Virginia)` (closest to Guatemala)
3. Wait for the project to finish provisioning (~2 minutes)
4. Go to **Project Settings → Database → Connection string**
5. Copy both connection strings:

**Session mode pooler** (port 5432 — for the app at runtime):
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
Save this as `DATABASE_URL`.

**Direct connection** (bypasses pooler — for migrations):
```
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```
Save this as `DIRECT_URL`.

> **Important:** Do NOT use port 6543 (Transaction mode). It breaks prepared statements used by the `pg` library.

---

## Step 2: Run Migrations Against Cloud DB

From the project root on your local machine:

```bash
DATABASE_URL="<SESSION_POOLER_URL>" DIRECT_URL="<DIRECT_URL>" npm run db:migrate:deploy
```

This creates all tables (patients, appointments, consultations, audit logs, etc.) in the cloud database.

---

## Step 3: Seed the Owner Account

```bash
DATABASE_URL="<SESSION_POOLER_URL>" \
OWNER_EMAIL="vitally@koisoftware.com" \
OWNER_PASSWORD="admin123" \
OWNER_NOMBRE="Karla" \
OWNER_APELLIDO="Soto" \
OWNER_TITULO="Lic." \
TENANT_NAME="Clínica Vitally" \
npm run db:seed:prod
```

You should see output confirming the tenant and user were created.

---

## Step 4: Push Code to GitHub

```bash
git add -A
git commit -m "Prepare for production deployment"
git push origin hugo
```

---

## Step 5: Deploy on Vercel

1. Go to **https://vercel.com** → sign up / log in
2. Click **"Add New Project"** → Import your GitHub repo
3. In the configuration screen:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `.` (default)
   - **Build Command:** `npm run build` (default)
4. Expand **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Session mode pooler URL (port 5432) |
| `DIRECT_URL` | Direct connection URL |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Leave blank for now — set after first deploy |

5. Click **Deploy** and wait for the build to finish
6. Vercel will give you a URL like `vitally-app.vercel.app`
7. Go back to **Settings → Environment Variables** and set:
   - `NEXTAUTH_URL` = `https://your-app-name.vercel.app`
8. **Redeploy** (Deployments tab → click the 3 dots on the latest → Redeploy)

---

## Step 6: Verify

1. Open the Vercel URL in a browser
2. Log in with:
   - **Email:** `vitally@koisoftware.com`
   - **Password:** `admin123`
3. Verify you see the empty dashboard (no demo data — clean slate)
4. Try creating a patient to confirm writes work
5. Open the same URL on phone — same data should appear

---

## Login Credentials

| Field | Value |
|-------|-------|
| Email | `vitally@koisoftware.com` |
| Password | `admin123` |

**Change the password before entering real patient data.**

---

## Optional: Custom Domain

If you want `vitally.koisoftware.com` instead of the Vercel URL:

1. In Vercel → Settings → Domains → Add `vitally.koisoftware.com`
2. Add the CNAME record Vercel tells you to your DNS provider
3. Update `NEXTAUTH_URL` to `https://vitally.koisoftware.com`
4. Redeploy

---

## Useful Commands

```bash
# Open database GUI to inspect data
DATABASE_URL="<SESSION_POOLER_URL>" DIRECT_URL="<DIRECT_URL>" npx prisma studio

# Run migrations after schema changes
DATABASE_URL="<SESSION_POOLER_URL>" DIRECT_URL="<DIRECT_URL>" npm run db:migrate:deploy

# Check app health
curl https://your-app.vercel.app/api/health
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login fails silently | Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in Vercel |
| "Internal server error" on API calls | Check `DATABASE_URL` in Vercel uses port 5432 (Session mode), not 6543 |
| Build fails on Vercel | Run `npm run build` locally first to check for errors |
| Migrations fail / hang | Make sure `DIRECT_URL` uses the direct connection string (not the pooler) |
| SSL handshake error | Ensure `?sslmode=require` is in the connection URL |
| "prepared statement already exists" | You're using port 6543 (Transaction mode) — switch to port 5432 |
