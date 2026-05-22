import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can, AppRole } from '@/lib/rbac';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ASSIGNABLE_ROLES: AppRole[] = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];

export async function POST(request: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can register new users.' }, { status: 403 });
  }

  const { name, email, password, role = 'org_admin', orgId } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${ASSIGNABLE_ROLES.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: name },
    email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: roleError } = await adminSupabase
    .from('user_roles')
    .insert({
      user_id: data.user.id,
      org_id: orgId ?? null,
      role,
      invited_by: user.id,
    });

  if (roleError) {
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: data.user.id }, { status: 201 });
}
