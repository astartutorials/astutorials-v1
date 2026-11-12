<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/brand/astar-wordmark-on-dark.svg">
    <img src="./public/brand/astar-wordmark.svg" alt="A-Star Tutorials" width="320">
  </picture>
</p>

<p align="center">
  The platform behind <a href="https://astartutorials.com">astartutorials.com</a>:
  booking and payments for university tutorials, programme registrations, and the admin tools the team runs on.
</p>

---

## What it does

**For students and parents**
- Book **group tutorials** and request **private tutorials**, paid through Paystack
- Buy the **Full Semester Plan** (50 sessions), with discount and ambassador referral codes at checkout
- Register for programmes and events (The Freshers' Advantage, BUCC, Pre-Clinicals, Playbooks, 100 level intake)
- Apply to become a **tutor** or an **ambassador**, and leave feedback after sessions

**For the team** (`/admin`)
- Tutorials, bookings, attendance and payments
- Registrations for every programme, Semester Plan enquiries and student intake
- Tutor applications, careers listings, and ambassadors: approve, assign referral codes, track commission, mark payouts
- Organisations, team invites, roles, and an activity log of every admin action

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion, CSS scroll-driven animations |
| Data and auth | Supabase (Postgres and Auth) |
| Payments | Paystack |
| Email | Resend (called with plain `fetch`) |
| Analytics | PostHog, loaded after the page settles |
| Protection | Cloudflare Turnstile on public forms; Upstash Redis rate limit on admin login |
| Hosting | Vercel, including three nightly cron jobs |
| Tests | Jest |

## Getting started

### 1. Prerequisites
- Node.js 20 or later
- A Supabase project, Paystack test keys, and a Resend account with a verified domain
- Optional: a Notion integration (tutor applications), Cloudflare Turnstile, Upstash Redis, PostHog

### 2. Install
```bash
npm install
```

### 3. Environment variables
Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...            # server only, never in client code

# Payments and email
PAYSTACK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
ADMIN_NOTIFICATION_EMAIL=...             # where new-booking notifications go

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # used in Paystack redirects

# Optional: each feature is skipped when its keys are missing
NOTION_CONNECTION_KEY=...                # tutor applications
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...       # bot protection
TURNSTILE_SECRET_KEY=...
UPSTASH_REDIS_REST_URL=...               # admin login rate limiting
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com
CRON_SECRET=...                          # set in Vercel; authorises the cron routes

# Optional: meeting links for online programmes
NEXT_PUBLIC_BUCC_MEETING_URL=...
NEXT_PUBLIC_ENGINEERING_MEETING_URL=...
NEXT_PUBLIC_HEALTH_SCIENCES_MEETING_URL=...
NEXT_PUBLIC_LAW_MEETING_URL=...
```

`NEXT_PUBLIC_BUILD_TIME` is set automatically at build time (see `next.config.ts`). Don't set it yourself.

### 4. Database
In the Supabase SQL editor, run `supabase/schema.sql` first, then every file in `supabase/migrations/` **in order** (`001` to the latest). The schema file only holds the original tables; everything since lives in the migrations.

### 5. Run
```bash
npm run dev        # http://localhost:3000
```

## Scripts

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | All tests |
| `npm run test:watch` | Tests in watch mode |
| `npx jest path/to/file.test.ts` | One test file |

## Project structure

```
app/                  Pages and API routes (App Router)
  admin/(dashboard)/  Admin pages, wrapped in the admin layout
  api/                Public, admin, Paystack and cron routes
components/           UI, grouped by feature (home, semester-plan, ambassador, admin, shared, …)
lib/                  Business logic and config, one file per feature
  rbac.ts             Roles and permissions: the only source of access
  admin-routes.ts     Which permission each admin page needs
  email.ts            Every email the site sends
  analytics.ts        PostHog wrapper (import this, not posthog-js)
supabase/             schema.sql and numbered migrations
public/brand/         Logo SVGs, with dark-mode variants
__tests__/            Jest tests, mirroring the source folders
```

## How things work

### Access
Only admins sign in. Roles, from most to least access: `super_admin`, `org_admin`, `tutor_manager`, `tutor`, `viewer`. Every role except `super_admin` is scoped to one organisation.
- `lib/rbac.ts` maps roles to permissions, and admin pages and API routes check `can(role, permission)`.
- The database grants signed-in users nothing directly. API routes check permissions, then use the service role.
- `__tests__/lib/rbac.test.ts` holds the full role × permission matrix. Change it together with `PERMISSIONS`.

### Payments
1. `POST /api/paystack/initialize` checks the price server-side: seat availability for tutorials, and the plan price plus any discount or referral code for the Semester Plan.
2. Paystack redirects to `GET /api/paystack/verify`, which records the booking once per reference, records any code use, and sends the receipt.
3. The Paystack webhook and the nightly reconcile cron record the same payment if the redirect never happened. All three paths are idempotent.

**Codes:** one per order. Discount codes take a fixed amount off and have a use cap. Ambassador referral codes take 10% off and earn the ambassador a flat commission. An ambassador can't use their own code.

### Programmes
Each programme has its open and close dates in `lib/<programme>.ts`. Pages are static, so the open/closed state is worked out on the visitor's clock, with the build time as the server's answer (`lib/build-time.ts`). A programme that had closed before the build isn't rendered at all.

### Email
All emails go through `lib/email.ts` using Resend. The account is on the free plan (100 emails a day), so think before adding new ones.

### Cron jobs (`vercel.json`)
| Time (UTC) | Route | |
|---|---|---|
| 01:00 | `/api/cron/expire-tutorials` | Marks past tutorials as expired |
| 02:30 | `/api/cron/reconcile-payments` | Records any Paystack payment that has no booking |
| 08:00 | `/api/cron/health-check` | Emails an alert if a job stopped running (e.g. the Paystack webhook) or payments needed rescuing |

### Performance
- The hero video is a compressed file loaded after the page, behind a priority poster image.
- Section and heading reveals are pure CSS, so nothing waits on JavaScript. Wrap them in `overflow-clip`, not `overflow-hidden`, or the animation never runs.
- PostHog loads once the page is idle.

## Testing
```bash
npm test
```
Tests run in Node (not a browser) and mock Supabase, Paystack, email and analytics. See any file in `__tests__/api/` for the setup.

## Deploying
Pushes to `main` deploy to Vercel. Database migrations aren't run automatically: run each new file in `supabase/migrations/` in the Supabase SQL editor **before** merging code that depends on it.

## For contributors and AI assistants
`CLAUDE.md` has the detailed conventions: how roles and permissions must change, the two Supabase clients, audit logging, and brand tokens.
