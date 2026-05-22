import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can, AppRole } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'invites:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = serviceSupabase
    .from('invites')
    .select('id, email, role, org_id, expires_at, accepted_at, created_at, organisations(name)')
    .order('created_at', { ascending: false });

  if (ctx.role !== 'super_admin' && ctx.orgId) {
    query = query.eq('org_id', ctx.orgId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'invites:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, role, orgId } = await request.json();

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required.' }, { status: 400 });
  }

  const validRoles: AppRole[] = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: `Role must be one of: ${validRoles.join(', ')}` }, { status: 400 });
  }

  // org_admin can only invite to their own org
  const targetOrgId = ctx.role === 'super_admin' ? (orgId ?? null) : ctx.orgId;
  if (ctx.role !== 'super_admin' && targetOrgId !== ctx.orgId) {
    return NextResponse.json({ error: 'Cannot invite to a different organisation.' }, { status: 403 });
  }

  const { data, error } = await serviceSupabase
    .from('invites')
    .insert({ email, role, org_id: targetOrgId, invited_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'invites:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Invite ID is required.' }, { status: 400 });

  let query = serviceSupabase.from('invites').delete().eq('id', id);
  if (ctx.role !== 'super_admin' && ctx.orgId) {
    query = query.eq('org_id', ctx.orgId);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
