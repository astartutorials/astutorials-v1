-- The Freshers' Advantage: a phone number for calls and the parent's / guardian's
-- full name, both now required on the /tfa form.
--
-- Nullable here because rows registered before this change have neither. The
-- API enforces them for new registrations (parent_name stays null when a parent
-- is the one registering).

ALTER TABLE public.tfa_registrations ADD COLUMN IF NOT EXISTS call_phone TEXT;
ALTER TABLE public.tfa_registrations ADD COLUMN IF NOT EXISTS parent_name TEXT;
