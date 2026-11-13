import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, CalendarRange } from "lucide-react";
import { getBalance } from "@/lib/semester-plan-balances";
import {
  SEMESTER_PLANS,
  SEMESTER_PLAN_NAME,
  SEMESTER_PLAN_TERM,
  SEMESTER_PLAN_HREF,
  daysUntil,
  formatDueDate,
} from "@/lib/semester-plan";
import PayBalanceButton from "@/components/semester-plan/PayBalanceButton";

export const metadata: Metadata = {
  title: "Second Payment | Full Semester Plan",
  robots: { index: false, follow: false },
};

// Always read the balance fresh: it changes the moment the payment lands.
export const dynamic = "force-dynamic";

/**
 * The second payment on a plan paid in 2. Linked from the first receipt, the
 * reminder emails and the admin Payments list.
 */
export default async function BalancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const balance = await getBalance(supabase, id);

  if (!balance) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--astar-bg)]">
        <div className="text-center">
          <p className="text-fg-subtle mb-2">We couldn&apos;t find that payment.</p>
          <a href={SEMESTER_PLAN_HREF} className="text-brand-ink font-semibold underline text-sm">
            Back to the {SEMESTER_PLAN_NAME}
          </a>
        </div>
      </div>
    );
  }

  const plan = SEMESTER_PLANS[balance.plan];
  const firstName = balance.full_name.split(" ")[0] || balance.full_name;
  const days = daysUntil(balance.due_date);
  const when =
    days > 1 ? `in ${days} days` : days === 1 ? "tomorrow" : days === 0 ? "today" : "and is now overdue";

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16">
      <div className="bg-surface-raised rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-[var(--astar-red)] px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            {balance.paid_at ? (
              <CheckCircle2 className="text-white" size={22} />
            ) : (
              <CalendarRange className="text-white" size={22} />
            )}
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              {balance.paid_at ? "Paid in full" : "Second payment"}
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {balance.paid_at ? `${firstName}'s semester is paid for` : `${firstName}'s ${plan.name}`}
          </h1>
          <p className="text-red-100 text-sm mt-1">{SEMESTER_PLAN_TERM}</p>
        </div>

        <div className="px-8 py-7 space-y-5">
          {balance.paid_at ? (
            <p className="text-fg-muted text-sm leading-relaxed">
              Both payments are in. Thank you! There&apos;s nothing more to pay this semester.
            </p>
          ) : (
            <>
              <p className="text-fg-muted text-sm leading-relaxed">
                The second payment of{" "}
                <span className="font-semibold text-fg">₦{balance.amount_due.toLocaleString()}</span> is due by{" "}
                <span className="font-semibold text-fg">{formatDueDate(balance.due_date)}</span> ({when}).
              </p>
              <PayBalanceButton balanceId={balance.id} amount={balance.amount_due} />
              <p className="text-center text-[11px] text-fg-faint">
                Payment secured by Paystack. The receipt goes to the email used for the first payment.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
