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
  <img src="https://img.shields.io/badge/tests-158%20passing-brightgreen" />
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

- Manage tutorials (create, edit, publish/draft, delete) with sortable columns
- View all bookings with payment references, amount paid, course, course of study, level, preferred schedule, and student notes
- Track attendance per session (toggle per student, export CSV)
- Manage job listings (careers) with sortable columns and inline editing
- Review tutor applications (expandable detail rows, status workflow)
- See student feedback with rating filters
- Manage admin profile, change password, and register new admins via the Settings page

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
| Email | Resend (REST API — no package, plain `fetch`) |
| Tutor CRM | Notion API (mirrored to Supabase) |
| Analytics | PostHog (pageviews, funnels, session replay, event capture) |
| Performance | Vercel Speed Insights (Core Web Vitals) + Vercel Analytics (page traffic) |
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
  tutorials/private/details/      — Post-payment details form (private bookings)
  apply/page.tsx                  — Tutor application form
  careers/page.tsx                — Job listings
  feedback/page.tsx               — Student feedback form
  group-tutorials/
    booking-details/              — Post-payment details form (group bookings)
    booking-success/              — Post-payment success page
    booking-failed/               — Post-payment failure page
  admin/
    login/                        — Admin login page
    (dashboard)/                  — Protected admin layout (middleware)
      dashboard/                  — Overview / stats
      tutorials/                  — List + manage tutorials (sortable columns)
      tutorials/[id]/             — Attendance list with toggle + CSV export
      tutorials/[id]/edit/        — Edit tutorial form
      payments/                   — Bookings with expandable detail rows + CSV export
      applications/               — Tutor applications with status workflow
      careers/                    — Job listing management (sortable, inline edit)
      feedback/                   — Student feedback viewer with rating filter
      settings/                   — Admin profile, password change, register new admin

app/api/
  paystack/initialize/            — POST: create Paystack transaction; blocks if fully booked
  paystack/verify/                — GET: verify payment, write booking row, send email, redirect
  bookings/[ref]/                 — GET: lookup booking by payment reference; PATCH: update course/level/schedule details
  feedback/                       — POST: submit star rating + comment
  tutor-applications/             — POST: submit tutor application → Notion + Supabase
  careers/                        — GET public job listings
  auth/admin/login/               — POST: admin sign in
  auth/admin/logout/              — POST: admin sign out
  admin/me/                       — GET: admin profile; PATCH: update name and phone
  admin/auth/update-password/     — POST: verify current password then set new password
  admin/auth/register/            — POST: create new admin account (service-role, email pre-confirmed)
  admin/tutorials/                — GET all tutorials (includes drafts), POST new tutorial
  admin/tutorials/[id]/           — PUT / DELETE a tutorial
  admin/tutorials/[id]/bookings/  — GET bookings for a specific tutorial (service-role)
  admin/bookings/                 — GET all bookings (service-role, bypasses RLS)
  admin/bookings/[id]/            — PATCH: update attended field
  admin/feedback/                 — GET all feedback (service-role, bypasses RLS)
  admin/careers/                  — POST new job listing
  admin/careers/[id]/             — PUT / DELETE a job listing
  admin/applications/             — GET all tutor applications
  admin/applications/[id]/        — PATCH: update application status

components/
  shared/                         — Navbar, Footer, ScrollReveal, CountUp, ClientFrame
  home/                           — HeroSection, WhoWeAre, Services, Testimonials, FAQ, BecomeTutor
  tutorials/                      — TutorialsHero, TutorialToggle, EmailModal (private booking modal)
  group-tutorials/                — TutorialCard, GroupBookingModal
  feedback/                       — FeedbackForm
  apply/                          — TutorApplicationForm
  careers/                        — JobCard, JobFilters, JobApplicationModal, CareersHero, AddCareerRoleModal
  admin/                          — AdminSidebar, AdminLoginForm, AdminLoginLeft

lib/
  email.ts                        — sendGroupBookingConfirmation(), sendPrivateBookingReceipt()
  format.ts                       — formatDay(), formatPrice() — pure, tested
  validate.ts                     — validateBookingForm() — pure, tested
  supabase-server.ts              — createSupabaseServerClient() for SSR (cookie-based)
  supabase.ts                     — browser Supabase client (anon key — only for public tables)
  posthog-server.ts               — getPostHogClient() singleton for server-side event capture
  utils.ts                        — cn() Tailwind class merger

instrumentation-client.ts         — PostHog browser init (pageviews, session replay, exception capture)
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
- A Resend account with a verified sending domain

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

# Resend (transactional email)
RESEND_API_KEY=re_...

# Notion (tutor applications)
NOTION_CONNECTION_KEY=secret_...

# App URL (used in payment redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Only use it in server-side API routes — never import it in client components or `lib/supabase.ts`.

### 4. Database setup

Run the full schema against your Supabase project:

```bash
# Option A: paste supabase/schema.sql into the Supabase SQL editor
# Option B: use the Supabase CLI
supabase db push
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Payment Flow

Paystack handles all payments. Both private and group bookings write a row to the `bookings` table, then redirect the student to a details collection page before proceeding to WhatsApp (private) or a success page (group).

```
Client                   Server                      Paystack
  |                         |                            |
  |--- POST /api/paystack/initialize --->               |
  |    { email, amount, metadata }                      |
  |                         |-- check seats (group) --  |
  |                         |   409 if fully booked     |
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
  |                         |-- idempotency check ----  |
  |                         |   (skip if ref exists)    |
  |                         |-- INSERT bookings row --   |
  |                         |                            |
  |  if metadata.type === "private":                    |
  |    send receipt email                               |
  |    redirect to /tutorials/private/details?ref=X    |
  |    student fills Course, Course of Study,          |
  |    Level, Schedule → PATCH /api/bookings/[ref]     |
  |    → open WhatsApp with full message               |
  |                         |                            |
  |  else (group):                                      |
  |    increment seats_booked                           |
  |    send confirmation email                          |
  |    redirect to /group-tutorials/booking-details    |
  |    student fills Course of Study, Level,           |
  |    Additional Info → PATCH /api/bookings/[ref]     |
  |    → redirect to booking-success                   |
```

**Amount convention:** the client sends the amount in **naira** (e.g. `6090`). The initialize route multiplies ×100 before sending to Paystack (which expects kobo). The verify route divides by 100 (`Math.round(tx.amount / 100)`) to store naira in `amount_paid`.

**Idempotency:** before inserting, the verify route checks if a booking with the same `payment_reference` already exists. If it does, the insert and seat increment are skipped, and the user is redirected as normal. This handles Paystack callback retries safely.

**Seat enforcement:** the initialize route queries `seats_booked` vs `seats_total` before creating a transaction for group bookings. If the tutorial is full, it returns 409. After a successful group booking insert, `seats_booked` is incremented via the Postgres function `increment_seats_booked(tid)`.

---

## Email

Emails are sent via the **Resend REST API** (no package — plain `fetch`). Both functions live in `lib/email.ts` and are fire-and-forget with silent error handling so they never block a booking.

| Function | Trigger | Recipient |
|---|---|---|
| `sendGroupBookingConfirmation` | After group booking DB insert | Student |
| `sendPrivateBookingReceipt` | After private booking DB insert | Student |

From address: `A-Star Tutorials <bookings@astartutorials.com>`

> Emails must be `await`ed in the verify route before returning the redirect response. Vercel terminates serverless functions the moment a response is sent — not awaiting means emails never complete.

---

## Admin Access

The admin dashboard lives at `/admin`. It is protected by `middleware.ts`, which checks the Supabase session cookie on every `/admin/*` request.

- **Login:** `/admin/login` — email + password via Supabase Auth
- **Session:** `getSession()` (reads from cookie — no network call, no rate limiting)
- **API auth:** all `/api/admin/*` routes independently verify identity using `createSupabaseServerClient().auth.getUser()`

**Settings page** is fully wired:
- **Profile tab:** loads name/email/phone from `GET /api/admin/me`, saves name and phone via `PATCH /api/admin/me`
- **Security tab:** change password via `POST /api/admin/auth/update-password` (verifies current password first); register a new admin via `POST /api/admin/auth/register` (service-role, email pre-confirmed)

To create the first admin user: use the Supabase Auth dashboard to create an account and set `user_metadata.role = "admin"`. Subsequent admins can be created from the Settings → Security tab.

**Important:** admin dashboard pages that display bookings or feedback use API routes (`/api/admin/*`), not the browser Supabase client directly. The browser client uses the anon key and cannot read from `bookings` or `feedback` (no public SELECT RLS policy). Only the service-role client in API routes can access those tables.

---

## Testing

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm test -- --ci      # CI mode (used in GitHub Actions)
```

Tests live in `__tests__/` and mirror the `app/api/` and `lib/` structure. All external calls (Supabase, Paystack, Notion, Resend) are mocked — no real credentials needed.

**Coverage (158 tests, 19 suites):**

| File | What's tested |
|---|---|
| `middleware.test.ts` | Unauthenticated redirect, authenticated access, login page redirect, `getSession` not `getUser` |
| `api/paystack-verify.test.ts` | No reference, missing secret key, failed payment, private → details page redirect (name/phone/course/notes), group → DB insert + seat increment + booking-details redirect, duplicate idempotency, DB failure → booking-failed, emails sent |
| `api/paystack-initialize.test.ts` | Missing fields, missing secret key, naira→kobo conversion, fully booked 409, private type bypasses seat check, Paystack error 502 |
| `api/bookings-ref.test.ts` | GET: found → 200 with fields, not found → 404, null data → 404, queries by payment_reference; PATCH: success → 200, DB error → 500, camelCase→snake_case mapping, filters by ref |
| `api/admin-auth.test.ts` | Missing fields, wrong credentials, non-admin role, valid login, `super_admin` role, logout success/failure |
| `api/admin-me.test.ts` | GET: auth guard, returns name/email/phone from metadata, email-prefix fallback, empty phone fallback; PATCH: auth guard, calls updateUser with correct fields, 500 on failure |
| `api/admin-update-password.test.ts` | Auth guard, missing fields → 400, too-short password → 400, wrong current password → 400, updateUser failure → 500, success → 200, verifies signInWithPassword called before updateUser |
| `api/admin-register.test.ts` | Auth guard, missing name/email/password → 400, too-short password → 400, createUser failure → 500, success → 201 with userId, email_confirm: true + full_name metadata |
| `api/admin-tutorials.test.ts` | Auth guard on GET/POST/PUT/DELETE, validation, draft vs active, DB errors |
| `api/admin-tutorial-bookings.test.ts` | Auth guard, returns bookings for tutorial, filters by correct `tutorial_id`, DB error |
| `api/admin-bookings.test.ts` | Auth guard, returns bookings with tutorial join, all queried fields present, DB error |
| `api/admin-booking-patch.test.ts` | Auth guard, 400 for non-boolean attended, marks attended, correct id and value passed to Supabase, DB error |
| `api/admin-feedback.test.ts` | Auth guard, returns feedback with tutorial join, DB error |
| `api/admin-applications.test.ts` | Auth guard, returns applications ordered by date, DB error; PATCH: auth guard, invalid status → 400, valid statuses accepted, DB error → 500 |
| `api/feedback.test.ts` | Invalid JSON, missing rating, out-of-range (0, 6), non-numeric string, comment trimming, null for whitespace, DB error |
| `api/tutor-applications.test.ts` | Missing Notion key, invalid JSON, missing fullName/email, Notion failure blocks DB write, Supabase mirror failure returns 201, array → comma join, optional fields stored as null |
| `api/careers.test.ts` | Public GET with camelCase mapping, admin POST/PUT/DELETE with auth and validation |
| `lib/format.test.ts` | `formatDay`, `formatPrice` edge cases |
| `lib/validate.test.ts` | `validateBookingForm` — valid, missing fields, invalid email, whitespace |

**CI:** GitHub Actions runs `npm test -- --ci` on every push and pull request to `main`. See `.github/workflows/ci.yml`.

---

## Analytics & Performance

**PostHog** is integrated for both client and server-side analytics:

- `instrumentation-client.ts` — initialises PostHog in the browser on every page load. Captures pageviews, navigation, session replays, and JS exceptions automatically.
- `lib/posthog-server.ts` — exports `getPostHogClient()`, a singleton PostHog Node client used in API routes to capture server-side events (payments verified, bookings created, applications submitted, etc.).

Key events captured across the app: booking initiated, payment verified, tutor application submitted, feedback submitted, job application submitted.

**Vercel Speed Insights** is mounted in `app/layout.tsx` via `<SpeedInsights />` and reports Core Web Vitals (LCP, CLS, FID) to the Vercel dashboard automatically — no configuration needed.

**Vercel Analytics** is mounted alongside it via `<Analytics />` (`@vercel/analytics/next`) and tracks page views and visitor traffic in the Vercel dashboard — no configuration needed.

---

## Key Conventions

**Supabase client selection:**

| Context | Client | Why |
|---|---|---|
| API routes that need to bypass RLS | `createClient(url, SERVICE_ROLE_KEY)` | Full DB access — bookings, feedback, admin reads/writes |
| API routes for auth identity checks | `createSupabaseServerClient()` from `lib/supabase-server.ts` | Reads user session from cookies |
| Middleware | `createServerClient` from `@supabase/ssr` | Must use `getSession()` — no network call, avoids rate limiting |
| Client components | `supabase` from `lib/supabase.ts` | Anon key — only safe for tables with a public SELECT RLS policy (`tutorials`, `careers`) |

**Never use the browser `supabase` client in admin pages for private data.** Tables like `bookings` and `feedback` have no public SELECT policy. The anon key returns empty rows — no error, just silence. Admin pages must fetch from `/api/admin/*` routes, which use the service-role client.

**Never call `supabase.auth.getUser()` in middleware.** It makes a live network request on every page load and will hit rate limits under normal traffic. Use `getSession()` in middleware (cookie read only). Reserve `getUser()` for API routes where you need a verified identity.

**Amount handling:** always store and pass prices in naira. Only multiply ×100 at the Paystack API boundary (`/api/paystack/initialize`). Store the actual charged amount in `bookings.amount_paid` (naira) — do not derive it from `tutorials.price` at query time, since private bookings have no linked tutorial.

**`'use client'` boundary:** any component using `useState`, `useEffect`, browser APIs, or event handlers needs `'use client'`. Server components are the default. Modals, forms, and interactive cards are all client components.

**iOS Safari inputs:** use `text-base` (font-size ≥ 16px) on all form inputs. Safari auto-zooms on inputs with font-size < 16px, which breaks the modal UX on mobile.

**Dropdown positioning in overflow containers:** dropdowns inside tables or `overflow-x: auto` wrappers must use `position: fixed` with coordinates from `getBoundingClientRect()`. CSS `overflow-x: auto` forces `overflow-y` to also clip, which silently cuts off absolutely-positioned children.

---

## Database Schema (summary)

```
tutorials       id, code, title, teacher, description, date, time,
                seats_total, seats_booked, price (naira), color_scheme,
                status, created_at

                seats_booked is incremented atomically via the Postgres
                function increment_seats_booked(tid UUID) after each
                confirmed group booking. Never update it directly.

bookings        id, tutorial_id (→ tutorials, nullable for private sessions),
                full_name, email, phone, course, course_of_study, level,
                preferred_schedule, notes, amount_paid (naira),
                payment_status, payment_reference (UNIQUE), attended, created_at

                course_of_study, level, preferred_schedule are collected
                after payment via the details page and written via PATCH
                /api/bookings/[ref].

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

**RLS policies:**
- `tutorials`: public SELECT for `status = 'active'`
- `careers`: public SELECT for `status = 'active'`
- `bookings`, `feedback`, `tutor_applications`: no public SELECT — service-role key only

Full schema with RLS policies and the `increment_seats_booked` function: `supabase/schema.sql`
