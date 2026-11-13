import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can } from '@/lib/rbac';
import { lagosDate, SEMESTER_PLAN_NAME } from '@/lib/semester-plan';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** What needs someone's attention. Null means the role may not see it. */
export interface DashboardAttention {
  instalmentsOverdue: number | null;
  instalmentsDueSoon: { count: number; nextDue: string | null } | null;
  enquiriesThisWeek: number | null;
  applicationsNew: number | null;
  ambassadorsPending: number | null;
  sessionsThisWeek: number;
}

/** A figure this calendar month (Lagos) next to last month's. */
export interface MonthFigure {
  current: number;
  previous: number;
}

export interface DashboardResponse {
  attention: DashboardAttention;
  month: {
    revenue: MonthFigure | null;
    students: MonthFigure;
    plansSold: MonthFigure | null;
    registrations: MonthFigure | null;
    rating: { average: number | null; count: number } | null;
  };
  /** Every paid booking's date and amount, for the revenue chart. */
  revenueSeries: { created_at: string; amount_paid: number }[];
  upcoming: {
    id: string;
    code: string;
    title: string;
    date: string;
    time: string;
    organisations?: { name: string } | null;
  }[];
  recentPayments: {
    id: string;
    full_name: string;
    amount_paid: number;
    created_at: string;
    title: string;
  }[];
}

type BookingRow = {
  id: string;
  full_name: string;
  email: string;
  amount_paid: number | null;
  payment_reference: string | null;
  created_at: string;
  course: string | null;
  tutorials: { title: string } | { title: string }[] | null;
};

const DAY = 86_400_000;

function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

/** Midnight in Lagos (UTC+1) on the first of the month `offset` months from `today`. */
function monthStart(today: string, offset: number): Date {
  const [y, m] = today.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + offset, 1));
  return new Date(first.getTime() - 60 * 60 * 1000);
}

function tutorialTitle(t: BookingRow['tutorials']): string | null {
  const rel = Array.isArray(t) ? t[0] : t;
  return rel?.title ?? null;
}

function relOrgId(tutorials: unknown): string | null {
  const rel = Array.isArray(tutorials) ? tutorials[0] : tutorials;
  return (rel as { org_id?: string | null } | null | undefined)?.org_id ?? null;
}

/** Splits rows into this month and last month by created_at. */
function byMonth<T extends { created_at: string }>(rows: T[], thisStart: Date, lastStart: Date) {
  const current: T[] = [];
  const previous: T[] = [];
  for (const r of rows) {
    const at = new Date(r.created_at);
    if (at >= thisStart) current.push(r);
    else if (at >= lastStart) previous.push(r);
  }
  return { current, previous };
}

const none = Promise.resolve({ data: null, error: null });

/**
 * The dashboard: what needs attention today, this month's figures, and the
 * revenue trend. Open to every role (they all hold tutorials:read); each part
 * is fetched only for roles holding its permission, and org data is scoped to
 * the user's org. Withheld parts are null, not zero, so the page can tell
 * "none" from "not yours to see" — and nothing withheld is in the JSON.
 */
export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'tutorials:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const seesMoney = can(ctx.role, 'payments:read');
  const seesFeedback = can(ctx.role, 'feedback:read');
  const seesIntake = can(ctx.role, 'intake:read');
  const seesApplications = can(ctx.role, 'applications:read');
  const seesAmbassadors = can(ctx.role, 'ambassadors:read');

  // Org data is scoped; A-Star-wide data (tutor applications) is not.
  const scoped = ctx.role !== 'super_admin';
  const scope = <Q,>(q: Q): Q =>
    scoped ? (q as unknown as { eq: (col: string, v: unknown) => Q }).eq('org_id', ctx.orgId) : q;

  const today = lagosDate();
  const weekAhead = addDays(today, 7);
  const weekAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const thisMonth = monthStart(today, 0);
  const lastMonth = monthStart(today, -1);

  const [
    upcomingRes,
    bookingsRes,
    feedbackRes,
    enquiriesRes,
    registrationsRes,
    applicationsRes,
    ambassadorsRes,
    balancesRes,
  ] = await Promise.all([
    scope(
      serviceSupabase
        .from('tutorials')
        .select('id, code, title, date, time, organisations(name)')
        .gte('date', today)
        .neq('status', 'draft')
    ).order('date', { ascending: true }).limit(100),
    scope(
      serviceSupabase
        .from('bookings')
        .select('id, full_name, email, amount_paid, payment_reference, created_at, course, tutorials(title)')
        .eq('payment_status', 'paid')
    ).order('created_at', { ascending: false }),
    seesFeedback
      ? serviceSupabase
          .from('feedback')
          .select('rating, created_at, tutorials(org_id)')
          .gte('created_at', thisMonth.toISOString())
      : none,
    seesIntake
      ? scope(serviceSupabase.from('semester_plan_enquiries').select('id').gte('created_at', weekAgo))
      : none,
    seesIntake
      ? scope(
          serviceSupabase
            .from('student_registrations')
            .select('created_at')
            .gte('created_at', lastMonth.toISOString())
        )
      : none,
    seesApplications
      ? serviceSupabase.from('tutor_applications').select('id').eq('status', 'new')
      : none,
    seesAmbassadors
      ? scope(serviceSupabase.from('ambassador_applications').select('id').eq('status', 'pending'))
      : none,
    seesMoney
      ? scope(serviceSupabase.from('semester_plan_balances').select('due_date, paid_at, paid_reference'))
      : none,
  ]);

  // supabase-js types embedded to-one relations as arrays; take the one row.
  const upcomingAll: DashboardResponse['upcoming'] = (
    (upcomingRes.data ?? []) as unknown as (Omit<DashboardResponse['upcoming'][number], 'organisations'> & {
      organisations: { name: string } | { name: string }[] | null;
    })[]
  ).map((t) => ({
    ...t,
    organisations: Array.isArray(t.organisations) ? t.organisations[0] ?? null : t.organisations,
  }));
  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
  const balances = (balancesRes.data ?? []) as { due_date: string; paid_at: string | null; paid_reference: string | null }[];

  const bookingMonths = byMonth(bookings, thisMonth, lastMonth);
  const sum = (rows: BookingRow[]) => rows.reduce((s, b) => s + (b.amount_paid ?? 0), 0);
  const uniqueEmails = (rows: BookingRow[]) => new Set(rows.map((b) => b.email.toLowerCase())).size;

  // A plan is sold on its first payment; a second instalment is not a new sale.
  const secondInstalments = new Set(balances.map((b) => b.paid_reference).filter(Boolean));
  const isPlanSale = (b: BookingRow) =>
    (b.course?.startsWith(`${SEMESTER_PLAN_NAME}:`) ?? false) &&
    !secondInstalments.has(b.payment_reference);

  const unpaid = balances.filter((b) => !b.paid_at);
  const dueSoon = unpaid
    .filter((b) => b.due_date >= today && b.due_date <= weekAhead)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const registrations = byMonth((registrationsRes.data ?? []) as { created_at: string }[], thisMonth, lastMonth);

  // Feedback carries its org through the tutorial, so scope it here.
  const ratings = ((feedbackRes.data ?? []) as { rating: number; tutorials: unknown }[])
    .filter((f) => !scoped || relOrgId(f.tutorials) === ctx.orgId);

  const body: DashboardResponse = {
    attention: {
      instalmentsOverdue: seesMoney ? unpaid.filter((b) => b.due_date < today).length : null,
      instalmentsDueSoon: seesMoney ? { count: dueSoon.length, nextDue: dueSoon[0]?.due_date ?? null } : null,
      enquiriesThisWeek: seesIntake ? (enquiriesRes.data ?? []).length : null,
      applicationsNew: seesApplications ? (applicationsRes.data ?? []).length : null,
      ambassadorsPending: seesAmbassadors ? (ambassadorsRes.data ?? []).length : null,
      sessionsThisWeek: upcomingAll.filter((t) => t.date <= weekAhead).length,
    },
    month: {
      revenue: seesMoney
        ? { current: sum(bookingMonths.current), previous: sum(bookingMonths.previous) }
        : null,
      students: {
        current: uniqueEmails(bookingMonths.current),
        previous: uniqueEmails(bookingMonths.previous),
      },
      plansSold: seesMoney
        ? {
            current: bookingMonths.current.filter(isPlanSale).length,
            previous: bookingMonths.previous.filter(isPlanSale).length,
          }
        : null,
      registrations: seesIntake
        ? { current: registrations.current.length, previous: registrations.previous.length }
        : null,
      rating: seesFeedback
        ? {
            average: ratings.length ? ratings.reduce((s, f) => s + f.rating, 0) / ratings.length : null,
            count: ratings.length,
          }
        : null,
    },
    revenueSeries: seesMoney
      ? bookings.map((b) => ({ created_at: b.created_at, amount_paid: b.amount_paid ?? 0 }))
      : [],
    upcoming: upcomingAll.slice(0, 5),
    recentPayments: seesMoney
      ? bookings.slice(0, 6).map((b) => ({
          id: b.id,
          full_name: b.full_name,
          amount_paid: b.amount_paid ?? 0,
          created_at: b.created_at,
          title: tutorialTitle(b.tutorials) ?? b.course ?? 'Private session',
        }))
      : [],
  };

  return NextResponse.json(body);
}
