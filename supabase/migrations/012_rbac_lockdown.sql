-- Make the RBAC map in lib/rbac.ts the only thing that grants admin access.
--
-- Until now the database had a second, looser gate: schema.sql granted every
-- signed-in user FOR ALL on tutorials, bookings, careers and feedback (and later
-- migrations did the same for the registration tables). A `viewer` or `tutor`
-- could therefore skip the API and update or delete rows directly with their own
-- session and the public publishable key. Every admin read and write now goes
-- through an API route that checks can() first and then uses the service role,
-- so signed-in users need no table access at all.
--
-- Safe to re-run: policies are dropped by catalogue lookup, then recreated.

-- 1. Remove every policy on the data tables, whatever it was named. Dropping by
--    lookup rather than by name also catches policies added from the dashboard
--    that never made it into a migration.
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tutorials', 'bookings', 'careers', 'feedback',
    'bucc_registrations', 'playbook_registrations', 'student_registrations',
    'tutor_applications', 'audit_logs', 'invites'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- 2. The only direct access that remains: the public site reads live listings
--    with the publishable key (app/tutorials, app/careers). Read-only, and only
--    rows that are published.
CREATE POLICY "Public read active tutorials"
  ON public.tutorials FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Public read active careers"
  ON public.careers FOR SELECT TO anon, authenticated USING (status = 'active');

-- Not recreated, on purpose:
--  * "Public insert bookings" / "Public insert feedback" let anyone insert rows
--    straight into the table, including a booking marked 'paid' that would show
--    up as revenue. Bookings are written by the Paystack routes and feedback by
--    /api/feedback, both with the service role.
--  * "Read invites" was readable by anyone, not just signed-in users, and
--    returned every invite's token, so the token was not the secret its comment
--    claimed: anyone could list pending invites and accept one as org_admin. The
--    accept flow reads invites with the service role and never needed it.
--
-- organisations and user_roles keep their read-only policies from 001: the
-- middleware resolves the signed-in user's own role through them.

-- 3. BUCC registrations become org data. BUCC is Babcock's computer club, so its
--    registrants are Babcock students; tagging them lets the admin API scope the
--    list like every other org dataset instead of showing it to every org_admin.
ALTER TABLE public.bucc_registrations
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(id);

UPDATE public.bucc_registrations
SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id IS NULL;
