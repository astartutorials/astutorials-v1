-- Pay in 2 for the Full Semester Plan (Uche, 2026-11-13).
--
-- A split plan costs 10% more: ₦55,000 twice (group) or ₦165,000 twice
-- (private). The first payment is a normal booking; it also opens one row
-- here for the second payment. The second payment is another booking, and it
-- fills paid_reference and paid_at.
--
-- due_date is the later of 14 December 2026 and 14 days after the first
-- payment. reminder_*_sent_at stops the daily reminder job from emailing twice.
--
-- An ambassador's referral code may be used on a split plan (no discount); the
-- commission is recorded only when the second payment lands, so the referral is
-- kept here until then.

CREATE TABLE IF NOT EXISTS public.semester_plan_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_reference TEXT NOT NULL UNIQUE,
    org_id UUID REFERENCES public.organisations(id),
    plan TEXT NOT NULL CHECK (plan IN ('group', 'private')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    amount_due INTEGER NOT NULL CHECK (amount_due > 0),
    due_date DATE NOT NULL,
    referral_code TEXT,
    ambassador_id UUID REFERENCES public.ambassador_applications(id),
    paid_reference TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    reminder_week_sent_at TIMESTAMPTZ,
    reminder_due_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS semester_plan_balances_unpaid_idx
    ON public.semester_plan_balances (due_date)
    WHERE paid_at IS NULL;

-- Service-role API routes only; closed to the browser. Holds money owed.
ALTER TABLE public.semester_plan_balances ENABLE ROW LEVEL SECURITY;
