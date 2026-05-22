-- Add org_id directly to bookings for reliable revenue attribution.
-- Previously, org was inferred by joining bookings → tutorials → org_id,
-- which silently excluded all private bookings (tutorial_id IS NULL).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(id);

-- Backfill: group bookings inherit org from their tutorial
UPDATE public.bookings b
SET org_id = t.org_id
FROM public.tutorials t
WHERE b.tutorial_id = t.id
  AND b.org_id IS NULL;

-- Historical private bookings (tutorial_id IS NULL) had no org context at booking time.
-- Since Babcock University was the only org when these bookings were made, attribute them there.
-- Future private bookings will carry org_id in Paystack metadata from the booking page.
UPDATE public.bookings
SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE tutorial_id IS NULL AND org_id IS NULL;
