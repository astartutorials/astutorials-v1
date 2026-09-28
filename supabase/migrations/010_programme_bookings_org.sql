-- Attribute Pre-Clinicals and BUCC Classes bookings to Babcock University.
--
-- These programmes are not tutorials, so their bookings had no tutorial to
-- inherit an org from and their checkout never sent one. They landed with
-- org_id NULL: counted in the super_admin revenue total but missing from
-- Babcock's own figure. Both programmes are Babcock-only, and the payment
-- paths now tag them via lib/programme-org.ts; this backfills the rows
-- recorded before that change.

UPDATE public.bookings
SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id IS NULL
  AND tutorial_id IS NULL
  AND (course ILIKE 'Pre-Clinicals%' OR course ILIKE 'BUCC%');
