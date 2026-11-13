import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBalanceReminder } from "@/lib/email";
import { BALANCE_COLUMNS, type SemesterPlanBalance } from "@/lib/semester-plan-balances";
import { SEMESTER_PLANS, daysUntil, lagosDate } from "@/lib/semester-plan";
import { recordHeartbeat } from "@/lib/health";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Daily: emails a reminder for each unpaid second payment, once in the week
 * before it is due and once on the day. The "within the week" and "on or after
 * the day" windows mean a missed run catches up the next day instead of
 * skipping the reminder. Each reminder is marked sent only once Resend has
 * accepted it, so a failed send is retried the next day.
 *
 * Nothing is sent once a payment is overdue: chasing then is the team's call,
 * from Semester Plan → Payments.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = lagosDate();
  const { data, error } = await supabase
    .from("semester_plan_balances")
    .select(BALANCE_COLUMNS)
    .is("paid_at", null)
    .gte("due_date", today);

  if (error) {
    console.error("[reminders] could not load balances", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sent: { id: string; stage: "week" | "due" }[] = [];
  const failed: string[] = [];

  for (const b of (data ?? []) as SemesterPlanBalance[]) {
    const days = daysUntil(b.due_date);
    const stage = days === 0 && !b.reminder_due_sent_at
      ? "due"
      : days > 0 && days <= 7 && !b.reminder_week_sent_at
      ? "week"
      : null;
    if (!stage) continue;

    const ok = await sendBalanceReminder({
      to: b.email,
      fullName: b.full_name,
      planName: SEMESTER_PLANS[b.plan]?.name ?? "Full Semester Plan",
      balance: { id: b.id, amountDue: b.amount_due, dueDate: b.due_date },
      stage,
    });
    if (!ok) {
      failed.push(b.id);
      continue;
    }

    const column = stage === "due" ? "reminder_due_sent_at" : "reminder_week_sent_at";
    await supabase
      .from("semester_plan_balances")
      .update({ [column]: new Date().toISOString() })
      .eq("id", b.id);
    sent.push({ id: b.id, stage });
  }

  await recordHeartbeat("semester-plan-reminders", { sent: sent.length, failed: failed.length });

  return NextResponse.json({ today, sent, failed });
}
