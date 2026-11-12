-- Discount codes for the Full Semester Plan.
--
-- A code takes a fixed naira amount off a plan and can be used a limited number
-- of times. A use is counted when a discounted payment is recorded (verify
-- callback, webhook or reconcile), one row per Paystack reference, so the
-- count is idempotent across those paths.
--
-- The cap is checked when checkout starts. Two people who start checkout at the
-- same moment for the last slot can both pay, so a code can overshoot its cap
-- by the handful of checkouts open when it fills. Abandoned checkouts never
-- use a slot.

CREATE TABLE IF NOT EXISTS public.discount_codes (
    code TEXT PRIMARY KEY CHECK (code = upper(code)),
    amount_off INTEGER NOT NULL CHECK (amount_off > 0),
    max_uses INTEGER NOT NULL CHECK (max_uses > 0),
    plans TEXT[] NOT NULL DEFAULT ARRAY['group', 'private'],
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.discount_redemptions (
    payment_reference TEXT PRIMARY KEY,
    code TEXT NOT NULL REFERENCES public.discount_codes(code),
    plan TEXT,
    amount_off INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS discount_redemptions_code_idx
    ON public.discount_redemptions (code);

-- Read and written only by service-role API routes; closed to the browser.
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;

-- Uche, 2026-11-12: ₦20,000 off either plan, first 100 subscriptions.
INSERT INTO public.discount_codes (code, amount_off, max_uses)
VALUES ('ASTAR20K', 20000, 100)
ON CONFLICT (code) DO NOTHING;
