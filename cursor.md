# Integrate Techno Trade — Cursor / New PC Handoff Guide

This file is the project map for continuing work on a new computer after cloning from GitHub.

**Repo:** https://github.com/photouploadprapti-pixel/integratetechno  
**Live site:** https://integratetechnotrade.vercel.app  
**Local workspace name historically:** `Integrate`  
**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Supabase + jsPDF + Vercel

---

## 0) Security rule (read this first)

`.env.local` is **tracked in this repo by explicit owner request** so a new PC can clone and run immediately.

**Required:** keep the GitHub repository **private**. Anyone with read access can use the Supabase service role / DB password.

If this repo was ever public, or access leaked:

1. Rotate Supabase `service_role` key
2. Reset the database password
3. Update Vercel env vars
4. Commit the new `.env.local`

When you change PCs:

1. Clone this repo from GitHub.
2. `.env.local` should already be present after clone.
3. Run `npm install` and `npm run dev`.

---

## 1) New PC — start working in ~10 minutes

### 1.1 Install tools

- Node.js 20+ (LTS recommended)
- Git
- A code editor (Cursor / VS Code)
- Optional: Supabase CLI (only if you prefer CLI migrations)

### 1.2 Clone and install

```bash
git clone https://github.com/photouploadprapti-pixel/integratetechno.git
cd integratetechno
npm install
```

### 1.3 Environment file

`.env.local` is included in the repo for handoff. After clone it should already exist.

If it is missing, copy from `.env.example` and fill values from Supabase:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Public (browser-safe)
NEXT_PUBLIC_SUPABASE_URL=https://txudruypdlhejtmvnihe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase → Project Settings → API → anon public>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<same as anon key or publishable key if shown>

# Server-only (NEVER expose to browser / NEVER commit)
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Project Settings → API → service_role>
SUPABASE_DB_PASSWORD=<from Supabase → Project Settings → Database → Database password>
SUPABASE_DB_REGION=ap-northeast-1
DATABASE_URL=<from Supabase → Project Settings → Database → Connection string (URI / pooler)>
```

Where to get each value:

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret) |
| `SUPABASE_DB_PASSWORD` | Supabase → Project Settings → Database → Database password |
| `DATABASE_URL` | Supabase → Database → Connect → URI (prefer pooler / Session or Transaction mode) |

Known project identifiers already used in this codebase:

- Supabase project ref: `txudruypdlhejtmvnihe`
- Supabase host: `txudruypdlhejtmvnihe.supabase.co`
- Pooler host pattern: `aws-0-ap-northeast-1.pooler.supabase.com`
- Region: `ap-northeast-1`

### 1.4 Run locally

```bash
npm run dev
```

Open http://localhost:3000

Useful routes:

| Route | Purpose |
|---|---|
| `/` | Public landing page |
| `/chemical` | Chemical Division page |
| `/login` | Staff / editor login |
| `/admin/mom` | Admin home (MOM reports) |
| `/editor` | Website CMS editor (editor + super_admin) |
| `/editor/landing` | Landing CMS |
| `/editor/chemical` | Chemical CMS |

### 1.5 Vercel (production)

Live app is deployed from GitHub to Vercel (`integratetechnotrade.vercel.app`).

On a new PC you usually **do not** need Vercel CLI. After push to `master`, Vercel redeploys automatically if the GitHub repo is still connected.

In Vercel project settings, ensure these env vars exist (same names as `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (if used)
- `SUPABASE_SERVICE_ROLE_KEY` (required for CMS image upload / save APIs)

---

## 2) Accounts / access map

### 2.1 GitHub

- Remote: `origin` → `https://github.com/photouploadprapti-pixel/integratetechno.git`
- Default branch: `master`
- Push needs write access for the GitHub account that owns/collabs on `photouploadprapti-pixel/integratetechno`

If push fails with `Permission ... denied to <other-user>`, switch Windows Git credentials to the correct GitHub account.

### 2.2 App roles (Supabase Auth user metadata)

Roles are read from `app_metadata.role` or `user_metadata.role`:

| Role | Access |
|---|---|
| `super_admin` | All admin modules + CMS editor |
| `admin` | MOM, Sales Commission, Local Sales, S/I/S (+ Cash Book only for `service2@integratebd.com`) |
| `employee` | MOM + S/I/S |
| `editor` | CMS editor only (`/editor`) |

Cash Book special allowlist email:

- `service2@integratebd.com` (admin role + this email can open Cash Book)

Staff names/designations used for welcome text + PDF signer autofill live in:

- `src/lib/staff-directory.ts`

### 2.3 Important business emails already in the product

- Contact / brochure mailto default: `bijoy@integratebd.com`
- Footer phone default: `+8801755615339`
- Brochure Drive folder default: `https://drive.google.com/drive/folders/1zu18cRtL0psiKPSvxMYjjQQojKl443wC?usp=sharing`
- Office Maps share link: `https://maps.app.goo.gl/vzFxUagT9guoUKYP7`

---

## 3) What this project contains

### 3.1 Public website

- Landing page with hero slideshow, about, services, brochure download gate, clients, contact form
- Chemical Division page
- Footer with logo, interactive Google Maps office embed, call/address block
- Contact form fields: Name, **Company Name**, Email, Subject, Body
- Brochure flow: **Send & Download** opens Drive brochure link, then mailto

### 3.2 Website Editor CMS (`/editor`)

- Edit landing + chemical content (text, images, lists)
- Image upload via authenticated API (`/api/cms/upload`) using service role (avoids storage “too many DB connections” failures)
- Content save via `/api/cms/save`
- Media bucket: `cms-media`
- Content table: `site_content` (`landing` / `chemical` JSON documents)

### 3.3 Admin / Super Admin dashboard (`/admin/...`)

Modules:

- MOM Reports (`/admin/mom`)
- S/I/S Reports (`/admin/sis`)
- Sales Commission (`/admin/sales-commission`)
- Local Sales (`/admin/local-sales`)
- Income / L.C. (`/admin/income`)
- Cash Book (`/admin/cash-book`)
- Banking (`/admin/banking`)

Shared admin UX:

- Search
- Date filters (All / Month / Range) top-right of tables
- Cash Book: category multi-filter **and** date filter work together
- PDF print for MOM and S/I/S

### 3.4 MOM PDF signature block (important recent work)

MOM create/edit popup has a **PDF signature block** with:

- Customer Remarks
- Integrate Techno Trade: Name, Designation, Date
- Customer: Name, Designation, Date
- Signature remains blank for handwriting / seal

Printed PDF mirrors the S/I/S footer style.

DB columns added for this:

- `customer_remarks`
- `signer_name`, `signer_designation`, `signer_date`
- `customer_signer_name`, `customer_signer_designation`, `customer_signer_date`

---

## 4) Work done in this Cursor chat series (changelog map)

High-level changes implemented and pushed:

1. **Contact form**
   - Added Company Name after Name
   - Fixed brochure **Send & Download** so Drive link opens reliably

2. **CMS image upload / editor**
   - Fixed “Too many connections issued to the database” by routing uploads/saves through service-role API routes
   - Hardened CMS RLS/JWT editor checks (migration)

3. **Admin date filters**
   - Month / range filters on admin tables
   - Cash Book category + date filters combine correctly

4. **Footer Google Map**
   - Added office map in footer center
   - Upgraded to interactive place embed showing **INTEGRATE TECHNO TRADE-ITT**
   - Open in Google Maps link included

5. **Hero branding card**
   - Made smaller
   - Hides on hover so full slide photo is visible

6. **Editor office address field**
   - Fixed spaces being stripped / cursor jumping (`trimEnd` removed from live typing)

7. **MOM PDF + popup**
   - Added S/I/S-style remarks + signature footer to MOM PDF
   - Added editable popup fields for Integrate + Customer Name/Designation/Date
   - Signature left blank intentionally

---

## 5) Key source files (where to edit)

### Public site

- `src/app/page.tsx` — landing composition
- `src/components/hero-carousel.tsx` — hero + branding hover hide
- `src/components/contact-form.tsx` — contact / brochure form
- `src/components/services-section.tsx` — brochure modal + download
- `src/components/site-footer.tsx` — footer map + contact block

### CMS editor

- `src/app/editor/landing/page.tsx`
- `src/components/editor/landing-editor-panel.tsx`
- `src/components/editor/image-field.tsx`
- `src/lib/cms/client.ts`
- `src/app/api/cms/upload/route.ts`
- `src/app/api/cms/save/route.ts`

### Admin

- `src/components/admin/*-panel.tsx` — module tables
- `src/components/admin/date-range-filter.tsx`
- `src/lib/date-filter.ts`
- `src/lib/mom-pdf.ts` / `src/lib/sis-pdf.ts`
- `src/components/admin/mom-report-modal.tsx`

### Auth / roles

- `src/lib/auth/roles.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts` (service role, server-only)
- `src/middleware.ts`

### Data defaults

- `src/data/landing.ts`
- `src/lib/cms/defaults.ts`
- `src/lib/staff-directory.ts`

---

## 6) Database migrations

Migrations live in `supabase/migrations/`.

Important ones:

| File | Purpose |
|---|---|
| `20260711223000_init_bubble_tables.sql` | Core schema |
| `20260718100000_cms_editor_role.sql` | Editor role + `site_content` + `cms-media` |
| `20260718120000_sales_commission.sql` | Sales Commission |
| `20260718130000_local_sales.sql` | Local Sales |
| `20260719140000_cash_book_categories_access.sql` | Cash Book categories/access |
| `20260719150000_monthly_cash_allowance.sql` | Monthly cash allowance |
| `20260725120000_cms_upload_rls_hardening.sql` | CMS upload RLS hardening |
| `20260729100000_mom_signature_fields.sql` | MOM Integrate signer + remarks fields |
| `20260729110000_mom_customer_signer_fields.sql` | MOM Customer signer fields |

Helper scripts:

- `scripts/apply-supabase-schema.js` — apply SQL with `DATABASE_URL` / DB password
- `scripts/seed-dummy-data.js` — seed helpers (uses service role)

To apply a single new migration manually with Node + `pg` (already used on this project):

```bash
# Ensure DATABASE_URL is in .env.local, then run a small node snippet
# or use Supabase SQL editor and paste the migration SQL.
```

If tables/columns already exist, most migrations use `if not exists` and are safe to re-run.

---

## 7) Common commands

```bash
npm install
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

Git (conventional commits are used):

```bash
git status
git pull origin master
git add .
git commit -m "feat(scope): short description"
git push -u origin HEAD
```

---

## 8) Transfer checklist when changing PC

- [ ] Clone GitHub repo
- [ ] Confirm `.env.local` is present (tracked in repo)
- [ ] `npm install`
- [ ] Confirm login works (`/login`)
- [ ] Confirm CMS image upload works (`/editor/landing`)
- [ ] Confirm admin MOM print PDF shows signature block fields
- [ ] Confirm Git push uses the correct GitHub account
- [ ] Confirm Vercel still auto-deploys from `master`
- [ ] Confirm GitHub repo is **private**

---

## 9) Troubleshooting

### CMS upload: “Too many connections…”

Uploads must go through `/api/cms/upload` (service role). Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in local + Vercel env.

### Brochure download doesn’t open

Form opens brochure link first (same click gesture), then mailto. Brochure URL is CMS field `brochureUrl` (fallback in `src/data/landing.ts`).

### Git push 403

Wrong GitHub credential cached. Sign in as the account that can write to `photouploadprapti-pixel/integratetechno`.

### Missing MOM signature columns

Apply:

- `supabase/migrations/20260729100000_mom_signature_fields.sql`
- `supabase/migrations/20260729110000_mom_customer_signer_fields.sql`

---

## 10) Cursor note for future agents

When continuing this project:

1. Prefer existing patterns in `src/components/admin` and `src/lib/*-pdf.ts`.
2. Do not commit additional secrets beyond the intentional `.env.local` handoff file; keep the GitHub repo private.
3. After schema changes, add a Supabase migration under `supabase/migrations/`.
4. For CMS media, keep using `/api/cms/upload` + service role.
5. Use conventional commits (`feat`, `fix`, `chore`, …).
6. Push only when the user asks.

This file is the handoff map. Keep it updated when major modules or env requirements change.
