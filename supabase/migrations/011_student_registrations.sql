-- Student intake registrations — the "join A-Star" form for new students.
--
-- The form is reused every year, so each row carries the academic `session` it
-- counts toward and the `entry_level` the student joined at. The level a student
-- is at now is derived from those two in lib/intakes.ts; it is deliberately not
-- stored, because a stored level would be wrong by next September.
--
-- The session is set by the API from the registry in lib/intakes.ts, never taken
-- from the browser, so a stale or hand-edited form can't file a student under
-- the wrong year.

CREATE TABLE IF NOT EXISTS public.student_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session TEXT NOT NULL,
    entry_level SMALLINT NOT NULL,
    org_id UUID REFERENCES public.organisations(id),
    -- Surname first, as the form asks.
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    course_of_study TEXT NOT NULL,
    instagram TEXT,
    tiktok TEXT,
    -- Day and month only: the form asks for a birthday to celebrate, not an age.
    birth_day SMALLINT NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
    birth_month SMALLINT NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One registration per student per intake: submitting twice updates the answers.
-- The same student in a later session's intake is a new row, not a conflict.
-- Bare columns rather than lower(email) so ON CONFLICT can infer the index; the
-- route lowercases the address before writing.
CREATE UNIQUE INDEX IF NOT EXISTS student_registrations_session_level_email_key
    ON public.student_registrations (session, entry_level, email);

-- The admin console lists one session at a time, newest first.
CREATE INDEX IF NOT EXISTS student_registrations_session_created_at_idx
    ON public.student_registrations (session, created_at DESC);

-- Reads and writes go through service-role clients in the API routes, which
-- bypass RLS. No policy is granted, so the table is closed to the browser —
-- including to signed-in admins' anon-key sessions, since the rows hold students'
-- and parents' contact details.
ALTER TABLE public.student_registrations ENABLE ROW LEVEL SECURITY;
