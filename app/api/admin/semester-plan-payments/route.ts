import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { SEMESTER_PLAN_NAME, lagosDate, isSemesterPlanId, splitTotal, SEMESTER_PLANS } from "@/lib/semester-plan";
import {
  BALANCE_COLUMNS,
  balanceStatus,
  type PaymentStatus,
  type SemesterPlanBalance,
} from "@/lib/semester-plan-balances";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SemesterPlanPaymentRow {
  key: string;
  fullName: string;
  email: string;
  phone: string | null;
  plan: string | null;
  option: "full" | "split";
  status: PaymentStatus;
  amountPaid: number;
  total: number;
  dueDate: string | null;
  balanceId: string | null;
  firstReference: string;
  secondReference: string | null;
  firstPaidAt: string;
  notes: string | null;
}

type BookingRow = {
  full_name: string;
  email: string;
  phone: string | null;
  course: string | null;
  notes: string | null;
  amount_paid: number;
  payment_reference: string;
  created_at: string;
};

function planFromCourse(course: string | null): string | null {
  for (const p of Object.values(SEMESTER_PLANS)) {
    if (course?.includes(p.name)) return p.id;
  }
  return null;
}

/**
 * Who has paid for the Full Semester Plan, and how much: paid in full (either
 * way), part paid, or overdue on the second payment. Money, so payments:read,
 * the same permission as the main Payments page, and org-scoped like it.
 */
export async function GET() {
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, "payments:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let bookingsQuery = supabase
    .from("bookings")
    .select("full_name, email, phone, course, notes, amount_paid, payment_reference, created_at")
    .like("course", `${SEMESTER_PLAN_NAME}:%`)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });
  let balancesQuery = supabase
    .from("semester_plan_balances")
    .select(BALANCE_COLUMNS)
    .order("created_at", { ascending: false });

  if (ctx.role !== "super_admin") {
    bookingsQuery = bookingsQuery.eq("org_id", ctx.orgId);
    balancesQuery = balancesQuery.eq("org_id", ctx.orgId);
  }

  const [bookingsRes, balancesRes] = await Promise.all([bookingsQuery, balancesQuery]);
  if (bookingsRes.error) return NextResponse.json({ error: bookingsRes.error.message }, { status: 500 });
  if (balancesRes.error) return NextResponse.json({ error: balancesRes.error.message }, { status: 500 });

  const bookings = (bookingsRes.data ?? []) as BookingRow[];
  const balances = (balancesRes.data ?? []) as SemesterPlanBalance[];
  const byRef = new Map(bookings.map((b) => [b.payment_reference, b]));
  const today = lagosDate();

  const rows: SemesterPlanPaymentRow[] = balances.map((b) => {
    const first = byRef.get(b.first_reference);
    return {
      key: b.id,
      fullName: b.full_name,
      email: b.email,
      phone: b.phone,
      plan: b.plan,
      option: "split",
      status: balanceStatus(b, today),
      amountPaid: b.amount_due * (b.paid_at ? 2 : 1),
      total: isSemesterPlanId(b.plan) ? splitTotal(b.plan) : b.amount_due * 2,
      dueDate: b.due_date,
      balanceId: b.id,
      firstReference: b.first_reference,
      secondReference: b.paid_reference,
      firstPaidAt: first?.created_at ?? b.created_at,
      notes: first?.notes ?? null,
    };
  });

  const splitRefs = new Set(balances.flatMap((b) => [b.first_reference, b.paid_reference].filter(Boolean)));
  for (const b of bookings) {
    if (splitRefs.has(b.payment_reference)) continue;
    // A split payment whose balance row is missing (e.g. recorded before the
    // migration ran): still part paid, with no due date on record.
    // Matches both "Paying in 2: …" (first notes) and "Paying in 2 instalments: …".
    const orphanSplit = b.notes?.includes("Paying in 2") ?? false;
    rows.push({
      key: b.payment_reference,
      fullName: b.full_name,
      email: b.email,
      phone: b.phone,
      plan: planFromCourse(b.course),
      option: orphanSplit ? "split" : "full",
      status: orphanSplit ? "part_paid" : "paid_in_full",
      amountPaid: b.amount_paid,
      total: orphanSplit ? b.amount_paid * 2 : b.amount_paid,
      dueDate: null,
      balanceId: null,
      firstReference: b.payment_reference,
      secondReference: null,
      firstPaidAt: b.created_at,
      notes: b.notes,
    });
  }

  rows.sort((a, b) => b.firstPaidAt.localeCompare(a.firstPaidAt));
  return NextResponse.json(rows);
}
