# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server at localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm test           # run all tests (Jest)
npm run test:watch # watch mode

# Run a single test file
npx jest __tests__/api/admin-auth.test.ts
```

## Architecture

**A-Star Tutorials** is a Next.js 16 App Router application for booking university tutorial sessions (group and private). It has a public-facing student side and a protected admin dashboard.

### Auth & Multi-tenancy

Supabase Auth handles authentication (admin users only). The middleware (`middleware.ts`) protects all `/admin/*` routes by reading the session cookie and checking the user's role via `lib/rbac.ts`.

Roles: `super_admin` > `org_admin` > `tutor_manager` > `tutor` > `viewer`. Role + org scope are stored in the `user_roles` table. `super_admin` has no org scope (global). All other roles are org-scoped. The `can(role, action)` function in `lib/rbac.ts` checks permissions against a static `PERMISSIONS` map.

The `app/admin/(dashboard)/layout.tsx` wraps the entire admin area in `<AdminProvider>`, which fetches `/api/admin/me` and exposes the current user via `useAdminUser()`.

### Two Supabase Clients

- **`lib/supabase.ts`** — browser anon client; only for public tables
- **`lib/supabase-server.ts`** — SSR cookie-based client (uses anon key); respects RLS
- **`lib/audit.ts`** — uses a hardcoded service-role client; bypasses RLS for writing audit logs

Admin API routes that need to bypass RLS (e.g., read all orgs' data) create their own `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` inline. Never use the service-role key in client components or `lib/supabase.ts`.

### Payment Flow

1. `POST /api/paystack/initialize` — checks seat availability, creates Paystack transaction
2. Student pays on Paystack, redirected to `GET /api/paystack/verify?reference=X`
3. Verify route checks idempotency (skips if booking ref already exists), inserts `bookings` row, sends email, then redirects:
   - **Private booking** → `/tutorials/private/details?ref=X` (student fills details → WhatsApp)
   - **Group booking** → increments `seats_booked`, sends confirmation → `/group-tutorials/booking-success`

### Audit Logging

Call `logAuditEvent()` from `lib/audit.ts` after any significant admin action. It is fire-and-forget and never throws — audit failures must not break the primary action.

### Email

All emails go via Resend using plain `fetch` (no SDK). All send functions live in `lib/email.ts`.

### Brand Tokens

```css
--astar-red:   #D93025   /* primary CTA */
--astar-navy:  #0B1120   /* body text, dark backgrounds */
--astar-bg:    #FDFAF6   /* page background (warm white) */
```

Tailwind utilities: `bg-astar-red`, `text-astar-navy`, `bg-astar-bg` (defined via `--color-*` in `@theme`).

### Testing

Tests live in `__tests__/` mirroring the source structure. All tests mock `@/lib/supabase-server`, `@/lib/audit`, and `@/lib/posthog-server` — see any existing test for the boilerplate. The test environment is `node` (not jsdom).

### Key Conventions

- Admin API routes read the acting user's role from `request.headers.get('x-user-role')` and org from `x-user-org` (set by middleware).
- `org_admin` routes must filter by `orgId` — super_admin sees everything.
- The Paystack webhook (`/api/paystack/webhook`) verifies the `x-paystack-signature` header using `lib/paystack-signature.ts` before processing.
- Rate limiting on admin login uses Upstash Redis via `lib/rate-limit.ts`; silently skipped if env vars are absent.
- Cloudflare Turnstile bot protection on public forms; verified server-side in API routes via `lib/turnstile.ts`; silently skipped if env vars are absent.
