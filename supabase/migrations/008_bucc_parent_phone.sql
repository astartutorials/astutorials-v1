-- Optional parent/guardian phone number on BUCC Advantage registrations.
--
-- Students are the ones who register, but parents are often the ones who pay
-- for what comes after the free webinar, so the form now asks for a second
-- number. Nullable on purpose: the field is optional and every existing row
-- predates it.

ALTER TABLE public.bucc_registrations ADD COLUMN IF NOT EXISTS parent_phone TEXT;
