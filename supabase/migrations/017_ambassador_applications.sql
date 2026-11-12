-- A-Star Ambassadors — students who apply at /ambassador to promote A-Star.
--
-- An admin approves an application, which assigns the ambassador a unique
-- referral code. Commission on referred semester plans is tracked later; for
-- now the row is the applicant and, once approved, the ambassador.
--
-- Babcock-only for now; org_id is set by the API (lib/programme-org.ts), never
-- taken from the browser.

CREATE TABLE IF NOT EXISTS public.ambassador_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organisations(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    course_of_study TEXT NOT NULL,
    level TEXT NOT NULL,
    social_handle TEXT,
    motivation TEXT NOT NULL,
    heard_via TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    referral_code TEXT UNIQUE CHECK (referral_code = upper(referral_code)),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- An approved ambassador always has a code; nobody else does.
    CHECK ((status = 'approved') = (referral_code IS NOT NULL))
);

-- One application per email. The API lowercases the address and refuses a
-- second application rather than overwriting a reviewed one.
CREATE UNIQUE INDEX IF NOT EXISTS ambassador_applications_email_key
    ON public.ambassador_applications (email);

CREATE INDEX IF NOT EXISTS ambassador_applications_org_created_at_idx
    ON public.ambassador_applications (org_id, created_at DESC);

-- Reads and writes go through service-role clients in the API routes. No policy
-- is granted, so the table is closed to the browser: the rows hold students'
-- contact details.
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
