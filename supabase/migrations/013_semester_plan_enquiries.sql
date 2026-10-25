-- Full Semester Plan enquiries — people who want a call before paying.
--
-- The plan is aimed at 100L students, but parents usually pay, so the page
-- offers two routes: pay now (a programme booking in public.bookings) or leave
-- details and be contacted. This table is the second route. Either the student
-- or the parent may fill it in; `submitted_by` records which.
--
-- Babcock-only for now; org_id is set by the API (lib/programme-org.ts), never
-- taken from the browser.

CREATE TABLE IF NOT EXISTS public.semester_plan_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session TEXT NOT NULL,
    org_id UUID REFERENCES public.organisations(id),
    plan TEXT NOT NULL CHECK (plan IN ('group', 'private', 'undecided')),
    submitted_by TEXT NOT NULL CHECK (submitted_by IN ('student', 'parent')),
    student_name TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    student_email TEXT,
    course_of_study TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The admin console lists newest first, one org at a time.
CREATE INDEX IF NOT EXISTS semester_plan_enquiries_org_created_at_idx
    ON public.semester_plan_enquiries (org_id, created_at DESC);

-- Reads and writes go through service-role clients in the API routes. No policy
-- is granted, so the table is closed to the browser: the rows hold students'
-- and parents' contact details.
ALTER TABLE public.semester_plan_enquiries ENABLE ROW LEVEL SECURITY;
