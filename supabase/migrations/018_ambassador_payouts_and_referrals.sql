-- Ambassadors, part 2 (Uche, 2026-11-12).
--
-- 1. The sign-up form now asks for everything needed to pay an ambassador:
--    institution, matric number, a calls number, Instagram and TikTok, and
--    bank details. Nullable because applications made before this keep their
--    rows; the API requires the fields on new applications.
-- 2. referral_redemptions: one row per Semester Plan paid with an
--    ambassador's referral code. The student got 10% off; the ambassador is
--    owed a flat commission (₦5,000 group, ₦15,000 private). paid_out_at is
--    set when the team pays it (manually, monthly).

ALTER TABLE public.ambassador_applications
    ADD COLUMN IF NOT EXISTS institution TEXT,
    ADD COLUMN IF NOT EXISTS matric_number TEXT,
    ADD COLUMN IF NOT EXISTS call_phone TEXT,
    ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
    ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_name TEXT;

CREATE TABLE IF NOT EXISTS public.referral_redemptions (
    payment_reference TEXT PRIMARY KEY,
    ambassador_id UUID NOT NULL REFERENCES public.ambassador_applications(id),
    referral_code TEXT NOT NULL,
    plan TEXT,
    discount_amount INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL,
    commission INTEGER NOT NULL,
    paid_out_at TIMESTAMPTZ,
    paid_out_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_redemptions_ambassador_idx
    ON public.referral_redemptions (ambassador_id, created_at DESC);

-- Service-role API routes only; closed to the browser. Holds money owed.
ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;
