<p align="center">
  <img src="./public/logo.png" alt="A-Star Tutorials" width="160" />
</p>

<h1 align="center">A-Star Tutorials</h1>

<p align="center">
  A web platform for booking university tutorial sessions — group and private — with integrated payments, a tutor application pipeline, and a full admin dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Supabase-postgres-3ECF8E?logo=supabase" />
  <img src="https://img.shields.io/badge/Paystack-payments-00C3F7" />
  <img src="https://img.shields.io/badge/tests-93%20passing-brightgreen" />
</p>

---

## What This Is

A-Star Tutorials connects university students with tutors. Students can:

- Browse and book **group tutorial sessions** (per-session fee, paid via Paystack)
- Book **private one-on-one sessions** (paid via Paystack, connects to tutor via WhatsApp)
- Submit **feedback** on sessions (1–5 stars with optional comment)
- Browse and apply for **open positions** (careers page)
- Apply to **become a tutor** (multi-step application form → Notion + Supabase)

Administrators can:

- Manage tutorials (create, edit, publish/draft, delete)
- View all bookings with payment references and student notes
- Manage job listings (careers)
- Review tutor applications
- See student feedback

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 with `@theme` custom tokens |
| Font | Space Grotesk |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password, admin only) |
| Payments | Paystack |
| Tutor CRM | Notion API (mirrored to Supabase) |
| Testing | Jest 30 + `next/jest` transformer |
| CI | GitHub Actions |
| Icons | Lucide React |
| UI Primitives | Radix UI |

---

## Brand Tokens

These CSS variables are the single source of truth for colours. Use them everywhere.

```css
--astar-red:   #D93025   /* primary CTA, buttons, accents */
--astar-navy:  #0B1120   /* body text, dark backgrounds   */
--astar-bg:    #FDFAF6   /* page background (warm white)  */
```

Tailwind utility classes: `bg-astar-red`, `text-astar-navy`, `bg-astar-bg` (defined via `--color-*` in `@theme`).

---

## Project Structure

```
app/
  page.tsx                        — Home page
  layout.tsx                      — Root layout (font, global CSS)
  tutorials/page.tsx              — Group tutorials listing + booking modal
  apply/page.tsx                  — Tutor application form
  careers/page.tsx                — Job listings
  feedback/page.tsx               — Student feedback form
  group-tutorials/
    booking-success/              — Post-payment success page
    booking-failed/               — Post-payment failure page
  admin/
    login/                        — Admin login page
    (dashboard)/                  — Protected admin layout (middleware)
      dashboard/                  — Overview / stats
      tutorials/                  — List + manage tutorials
      payments/                   — Bookings with expandable detail rows
      applications/               — Tutor applications
      careers/                    — Job listing management
      feedback/                   — Student feedback viewer
      settings/                   — (Static, not yet wired)

app/api/
  tutorials/                      — GET active tutorials (public)
  paystack/initialize/            — POST: create Paystack transaction
  paystack/verify/                — GET: verify payment, write booking or WhatsApp redirect
  feedback/                       — POST: submit star rating + comment
  tutor-applications/             — POST: submit tutor application → Notion + Supabase
  careers/                        — GET public job listings
  auth/admin/login/               — POST: admin sign in
  auth/admin/logout/              — POST: admin sign out
  admin/tutorials/                — GET all tutorials (includes drafts), POST new tutorial
  admin/tutorials/[id]/           — PUT / DELETE a tutorial
  admin/bookings/                 — GET all bookings (service-role, bypasses RLS)
  admin/careers/                  — POST new job listing
  admin/careers/[id]/             — PUT / DELETE a job listing

components/
  shared/                         — Navbar, Footer, ScrollReveal, CountUp, ClientFrame
  home/                           — HeroSection, WhoWeAre, Services, Testimonials, FAQ, BecomeTutor
  tutorials/                      — TutorialsHero, TutorialToggle, EmailModal (private booking modal)
  group-tutorials/                — TutorialCard, GroupBookingModal
  feedback/                       — FeedbackForm
  apply/                          — TutorApplicationForm
  careers/                        — JobCard, JobFilters, JobApplicationModal, CareersHero
  admin/                          — AdminSidebar, AdminLoginForm, AdminLoginLeft

lib/
  format.ts                       — formatDay(), formatPrice() — pure, tested
  validate.ts                     — validateBookingForm() — pure, tested
  supabase-server.ts              — createSupabaseServerClient() for SSR (cookie-based)
  supabase.ts                     — browser Supabase client
  utils.ts                        — cn() Tailwind class merger

middleware.ts                     — Protects all /admin/* routes (reads session from cookie)
supabase/schema.sql               — Full Postgres schema + RLS policies
```

---

## Local Development

### 1. Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A Paystack account (test keys for dev)
- A Notion integration with a database (for tutor applications)

### 2. Install

```bash
npm install
```

### 3. Environment variables

Create `.env.local` at the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only, never expose to browser

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Notion (tutor applications)
NOTION_CONNECTION_KEY=secret_...

# App URL (used in payment redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It is only used in server-side API routes (`app/api/...`) — never import it in client components.

### 4. Database setup

Run the schema against your Supabase project:

```bash
# Option A: paste supabase/schema.sql into the Supabase SQL editor
# Option B: use the Supabase CLI
supabase db push
```

If upgrading from an older schema, run this migration:

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes text;
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Payment Flow

Paystack handles all payments. The flow has two steps:

```
Client                   Server                      Paystack
  |                         |                            |
  |--- POST /api/paystack/initialize --->               |
  |    { email, amount, metadata }                      |
  |                         |--- POST /transaction/initialize -->
  |                         |<-- { authorization_url } ----------
  |<-- { url } -------------|                            |
  |                         |                            |
  |--- redirects to authorization_url ----------------->|
  |                         |                            |
  |<-- redirects to /api/paystack/verify?reference=X ---|
  |                         |                            |
  |         GET /api/paystack/verify                    |
  |                         |--- GET /transaction/verify/:ref -->
  |                         |<-- { status: "success" } ---------
  |                         |                            |
  |  if metadata.type === "private":                    |
  |    redirect → WhatsApp (no DB write)               |
  |  else:                                              |
  |    insert into bookings → redirect → booking-success|
```

**Amount convention:** the client sends the amount in **naira** (e.g. `5000`). The initialize route multiplies by 100 before sending to Paystack (which expects kobo).

**Private vs group:** the `metadata.type` field in the Paystack transaction determines the post-payment action. `"private"` → WhatsApp DM. Anything else → DB booking.

---

## Admin Access

The admin dashboard lives at `/admin`. It is protected by `middleware.ts`, which checks the Supabase session cookie on every `/admin/*` request.

- **Login:** `/admin/login` — email + password via Supabase Auth
- **Session:** `getSession()` (reads from cookie — no network call, no rate limiting)
- **API auth:** admin API routes (`/api/admin/*`) verify the session independently using `getUser()` for actual security checks

To create an admin user: use the Supabase Auth dashboard to create an account. There is no public sign-up.

---

## Testing

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm test -- --ci      # CI mode (used in GitHub Actions)
```

Tests live in `__tests__/` and mirror the `app/api/` and `lib/` structure. All external calls (Supabase, Paystack, Notion) are mocked — no real credentials needed to run tests.

**Coverage:**

| File | What's tested |
|---|---|
| `middleware.test.ts` | Unauthenticated redirect, authenticated access, login page redirect, `getSession` not `getUser` |
| `api/paystack-verify.test.ts` | No reference, failed payment, private → WhatsApp, group → DB insert, DB failure → booking-failed |
| `api/paystack-initialize.test.ts` | Missing fields, amount conversion (naira → kobo), Paystack error |
| `api/admin-auth.test.ts` | Missing fields, wrong credentials, non-admin role, valid login, logout |
| `api/admin-tutorials.test.ts` | Auth guard, GET (includes drafts), POST (validation, draft/active), PUT, DELETE |
| `api/admin-bookings.test.ts` | Data returned, phone/notes fields present, DB error |
| `api/public-tutorials.test.ts` | Active-only filter, empty result, DB error |
| `api/feedback.test.ts` | Missing rating, out-of-range, non-numeric string, comment trimming, null for whitespace, DB error |
| `api/tutor-applications.test.ts` | Missing Notion key, invalid JSON, missing fullName/email, Notion failure blocks DB, Supabase mirror failure returns 201, array → CSV join |
| `api/careers.test.ts` | Public GET with camelCase mapping, admin POST/PUT/DELETE with auth and validation |
| `lib/format.test.ts` | `formatDay`, `formatPrice` edge cases |
| `lib/validate.test.ts` | `validateBookingForm` — valid, missing fields, invalid email |

**CI:** GitHub Actions runs `npm test -- --ci` on every push and pull request to `main`. See `.github/workflows/ci.yml`.

---

## Key Conventions

**Supabase client selection:**

| Context | Client | Why |
|---|---|---|
| Server API routes that need to bypass RLS | `createClient(url, SERVICE_ROLE_KEY)` | Full DB access, admin operations |
| Server API routes for auth-gated actions | `createSupabaseServerClient()` from `lib/supabase-server.ts` | Reads user session from cookies |
| Middleware | `createServerClient` from `@supabase/ssr` | Must use `getSession()` — no network call, avoids rate limiting |
| Client components | `createClient` from `lib/supabase.ts` | Browser-safe anon key |

**Never call `supabase.auth.getUser()` in middleware.** It makes a live network request to the Supabase Auth API on every page load and will hit rate limits under normal traffic. Use `getSession()` in middleware (cookie read only). Reserve `getUser()` for API routes where you need a verified identity.

**Amount handling:** always store and pass prices in naira. Only multiply ×100 at the Paystack API boundary (`/api/paystack/initialize`).

**`'use client'` boundary:** any component using `useState`, `useEffect`, browser APIs, or event handlers needs `'use client'`. Server components are the default. Modals, forms, and interactive cards are all client components.

---

## Database Schema (summary)

```
tutorials       id, code, title, teacher, description, date, time,
                seats_total, price (naira), color_scheme, status, created_at

bookings        id, tutorial_id (→ tutorials), full_name, email, phone,
                notes, payment_status, payment_reference, attended, created_at

feedback        id, tutorial_id (→ tutorials), full_name, email,
                rating (1–5), comment, created_at

careers         id, job_id, title, category, description, responsibilities,
                requirements, type, location, application_link, status, created_at

tutor_applications  id, full_name, email, phone, education_level, institution,
                    field_of_study, subjects_can_teach, levels_can_teach,
                    years_of_experience, teaching_mode, has_tutored_before,
                    previous_tutoring_description, why_astar,
                    difficult_concept_explanation, days_available, time_of_day,
                    cv_link, linkedin_portfolio, status, created_at
```

Full schema with RLS policies: `supabase/schema.sql`

---

## Known Gaps (pre-launch)

- **Booking confirmation email** — the success page implies an email is sent; nothing actually sends one yet
- **Admin settings page** — UI is present but not wired to any functionality
- **Seat tracking** — `seats_total` exists in the DB but booked seat count is not decremented or enforced
- **`notes` column migration** — if your Supabase project predates this column, run: `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes text;`
