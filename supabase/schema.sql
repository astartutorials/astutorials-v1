-- Core Database Schema for A-Star Tutorials

-- 1. Tutorials Table
CREATE TABLE public.tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    teacher TEXT NOT NULL,
    description TEXT,
    date DATE,
    time TEXT NOT NULL,
    seats_total INTEGER NOT NULL DEFAULT 30,
    price INTEGER DEFAULT 1000,
    color_scheme TEXT DEFAULT (ARRAY['blue', 'green', 'pink', 'orange', 'purple', 'yellow', 'indigo', 'teal', 'red', 'cyan'])[floor(random() * 10 + 1)],
    status TEXT DEFAULT 'active', -- active, draft, completed
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    course TEXT,
    matric_id TEXT,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
    payment_reference TEXT,
    attended BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Careers Table
CREATE TABLE public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT UNIQUE, -- e.g. #DEV-204
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- Full-time, Part-time, etc.
    location TEXT DEFAULT 'Remote',
    status TEXT DEFAULT 'active', -- active, draft
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Feedback Table
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id UUID REFERENCES public.tutorials(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Basic Row Level Security (RLS)
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Public Policies (Read access)
CREATE POLICY "Public read tutorials" ON public.tutorials FOR SELECT USING (status = 'active');
CREATE POLICY "Public read careers" ON public.careers FOR SELECT USING (status = 'active');

-- Admin Policies (All access for authenticated users)
CREATE POLICY "Admin full access tutorials" ON public.tutorials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access bookings" ON public.bookings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access careers" ON public.careers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access feedback" ON public.feedback FOR ALL TO authenticated USING (true);

-- Public Interaction (Insert)
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);
