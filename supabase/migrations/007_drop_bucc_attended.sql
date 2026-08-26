-- Drop the unused attendance flag from bucc_registrations.
--
-- 006 added it for a post-event attendee/no-show email split that we decided
-- not to run. Nothing ever wrote to it, so there is no data to preserve.

ALTER TABLE public.bucc_registrations DROP COLUMN IF EXISTS attended;
