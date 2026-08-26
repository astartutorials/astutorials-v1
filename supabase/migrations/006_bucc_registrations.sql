-- The BUCC Advantage — free webinar registrations.
--
-- Unlike bookings, there is no payment, so this table is the only record that a
-- student signed up. `concern` and `question` are the reason the form exists:
-- they feed the curated "Ask the Seniors" segment and the follow-up sequence.

CREATE TABLE IF NOT EXISTS public.bucc_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    level TEXT,
    programme TEXT,
    concern TEXT,
    question TEXT,
    heard_via TEXT,
    attended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One registration per person. The API upserts on this so a student who submits
-- twice updates their answers instead of creating a duplicate seat.
--
-- Indexed on the bare column, not lower(email): ON CONFLICT (email) can only
-- infer a plain-column index, and an expression index here would make every
-- upsert fail. The route lowercases the address before writing, so the two
-- are equivalent in practice.
CREATE UNIQUE INDEX IF NOT EXISTS bucc_registrations_email_key
    ON public.bucc_registrations (email);

CREATE INDEX IF NOT EXISTS bucc_registrations_created_at_idx
    ON public.bucc_registrations (created_at DESC);

ALTER TABLE public.bucc_registrations ENABLE ROW LEVEL SECURITY;

-- The public form writes through the service-role client in the API route, which
-- bypasses RLS; no anon insert policy is granted so the table cannot be written
-- to (or read) straight from the browser.
-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop-then-create keeps this
-- migration safe to re-run.
DROP POLICY IF EXISTS "Admin full access bucc_registrations" ON public.bucc_registrations;
CREATE POLICY "Admin full access bucc_registrations"
    ON public.bucc_registrations FOR ALL TO authenticated USING (true);
