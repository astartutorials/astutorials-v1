-- The Playbook series — free webinar registrations for Engineering, Law and
-- Health Sciences.
--
-- One table, not three. The three webinars collect the same shape of answer and
-- are read by one admin console; separate tables would have meant three
-- migrations, three API routes and three copies of every future column. The
-- `playbook` column is the discriminator and matches a slug in lib/playbooks —
-- the API route validates against that registry before writing, so an unknown
-- slug is rejected rather than stored.
--
-- Deliberately NOT folded into bucc_registrations: that table is scoped to one
-- event, its columns are named for it (programme, concern), and rewriting it
-- would have meant a data migration on live registrations for no gain.

CREATE TABLE IF NOT EXISTS public.playbook_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playbook TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    parent_phone TEXT,
    university TEXT,
    level TEXT,
    -- Engineering discipline / Health Sciences department. Null for Law, which
    -- has no sub-discipline to ask about.
    discipline TEXT,
    challenge_academic TEXT,
    challenge_other TEXT,
    -- The reason the form exists: this feeds the curated Q&A segment.
    question TEXT,
    heard_via TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One registration per person PER PLAYBOOK. A Health Sciences student who also
-- wants the Engineering session is two rows, not a conflict; the same student
-- registering twice for one playbook updates their answers.
--
-- Indexed on the bare columns, not lower(email): ON CONFLICT can only infer a
-- plain-column index, and an expression index here would make every upsert
-- fail. The route lowercases the address before writing, so the two are
-- equivalent in practice.
CREATE UNIQUE INDEX IF NOT EXISTS playbook_registrations_playbook_email_key
    ON public.playbook_registrations (playbook, email);

-- The admin console lists one playbook at a time, newest first.
CREATE INDEX IF NOT EXISTS playbook_registrations_playbook_created_at_idx
    ON public.playbook_registrations (playbook, created_at DESC);

ALTER TABLE public.playbook_registrations ENABLE ROW LEVEL SECURITY;

-- The public form writes through the service-role client in the API route,
-- which bypasses RLS; no anon insert policy is granted, so the table cannot be
-- written to (or read) straight from the browser.
-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop-then-create keeps this
-- migration safe to re-run.
DROP POLICY IF EXISTS "Admin full access playbook_registrations" ON public.playbook_registrations;
CREATE POLICY "Admin full access playbook_registrations"
    ON public.playbook_registrations FOR ALL TO authenticated USING (true);
