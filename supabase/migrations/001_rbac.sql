-- RBAC Migration
-- Adds: organisations, user_roles, invites
-- Modifies: tutorials (org_id column), RLS policies

-- 1. Organisations
CREATE TABLE IF NOT EXISTS public.organisations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('university', 'secondary', 'primary')),
  location   TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User roles (org_id NULL = platform-wide, for super_admin only)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id     UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One role per user per org
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_per_org_idx
  ON public.user_roles (user_id, org_id) WHERE org_id IS NOT NULL;

-- Only one platform-wide role per user
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_platform_idx
  ON public.user_roles (user_id) WHERE org_id IS NULL;

-- 3. Invites
CREATE TABLE IF NOT EXISTS public.invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  email       TEXT NOT NULL,
  org_id      UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('org_admin', 'tutor_manager', 'tutor', 'viewer')),
  invited_by  UUID NOT NULL REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Add org_id to tutorials
ALTER TABLE public.tutorials
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organisations(id);

-- 5. Enable RLS on new tables
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites       ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all organisations
CREATE POLICY "Authenticated read orgs"
  ON public.organisations FOR SELECT TO authenticated USING (true);

-- Users can only read their own role rows
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Invites are readable publicly (token acts as secret)
CREATE POLICY "Read invites"
  ON public.invites FOR SELECT USING (true);

-- 6. Seed default organisation
INSERT INTO public.organisations (id, name, type, location)
VALUES ('00000000-0000-0000-0000-000000000001', 'A-Star HQ', 'university', 'Lagos')
ON CONFLICT DO NOTHING;

-- 7. Migrate existing super_admin users from user_metadata
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT id, NULL, 'super_admin'
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'super_admin'
ON CONFLICT DO NOTHING;

-- 8. Migrate existing admin users as org_admin of A-Star HQ
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'org_admin'
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ON CONFLICT DO NOTHING;

-- 9. Assign existing tutorials to default org
UPDATE public.tutorials
SET org_id = '00000000-0000-0000-0000-000000000001'
WHERE org_id IS NULL;
