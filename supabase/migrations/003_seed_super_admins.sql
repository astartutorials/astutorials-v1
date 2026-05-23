-- Promote users to platform-wide super_admin.
-- Removes any existing org-scoped role first so there is no conflicting row.

DO $$
DECLARE
  target_emails TEXT[] := ARRAY['paul@astartutorials.com', 'uchenna@astartutorials.com'];
BEGIN
  -- Remove all existing role rows for these users (org-scoped or platform-wide)
  DELETE FROM public.user_roles
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = ANY(target_emails)
  );

  -- Insert a single platform-wide super_admin row (org_id NULL)
  INSERT INTO public.user_roles (user_id, org_id, role)
  SELECT id, NULL, 'super_admin'
  FROM auth.users
  WHERE email = ANY(target_emails);
END $$;
