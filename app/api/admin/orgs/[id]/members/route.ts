import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, AppRole } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ORG_ROLES: AppRole[] = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { userId, role } = await req.json();

  if (!userId || !role) return NextResponse.json({ error: 'userId and role are required.' }, { status: 400 });
  if (!ORG_ROLES.includes(role)) {
    return NextResponse.json({ error: `Role must be one of: ${ORG_ROLES.join(', ')}` }, { status: 400 });
  }

  const { error } = await serviceSupabase
    .from('user_roles')
    .update({ role })
    .eq('user_id', userId)
    .eq('org_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });

  const { error } = await serviceSupabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('org_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
