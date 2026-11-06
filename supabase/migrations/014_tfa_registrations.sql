-- The Freshers' Advantage 2.0 — free in-person event registrations (/tfa).
--
-- No payment, so this table is the only record that someone signed up. It is
-- the guest list on the day and the follow-up list for the Semester Packages
-- introduced at the event.
--
-- Babcock-only; org_id is set by the API (lib/programme-org.ts), never taken
-- from the browser.

CREATE TABLE IF NOT EXISTS public.tfa_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organisations(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    attendee_type TEXT NOT NULL,
    course_of_study TEXT,
    parent_phone TEXT,
    question TEXT,
    question_for TEXT,
    heard_via TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One registration per email. The API lowercases the address and upserts on
-- this, so a second submission updates the first instead of adding a row.
-- Bare column, not lower(email): ON CONFLICT (email) can only infer a plain
-- column index.
CREATE UNIQUE INDEX IF NOT EXISTS tfa_registrations_email_key
    ON public.tfa_registrations (email);

CREATE INDEX IF NOT EXISTS tfa_registrations_org_created_at_idx
    ON public.tfa_registrations (org_id, created_at DESC);

-- Reads and writes go through service-role clients in the API routes. No policy
-- is granted, so the table is closed to the browser: the rows hold students'
-- and parents' contact details.
ALTER TABLE public.tfa_registrations ENABLE ROW LEVEL SECURITY;

-- Which speaker the question is for. Added after the first draft of this file;
-- harmless when the CREATE above already included it.
ALTER TABLE public.tfa_registrations ADD COLUMN IF NOT EXISTS question_for TEXT;
