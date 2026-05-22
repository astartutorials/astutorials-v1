import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ id: string }> };

async function assertSuperAdmin(req: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return { user: null, ctx: null, err: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') return { user, ctx, err: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { user, ctx, err: null };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { err } = await assertSuperAdmin(_req);
  if (err) return err;

  const { id } = await params;

  const [{ data: org, error: orgErr }, { data: roleRows }, { count: tutorialCount }] = await Promise.all([
    serviceSupabase.from('organisations').select('*').eq('id', id).single(),
    serviceSupabase.from('user_roles').select('user_id, role, created_at').eq('org_id', id).order('created_at'),
    serviceSupabase.from('tutorials').select('id', { count: 'exact', head: true }).eq('org_id', id),
  ]);

  if (orgErr || !org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });

  // Fetch user details for members via admin API
  const { data: { users } } = await serviceSupabase.auth.admin.listUsers({ perPage: 1000 });
  const memberIds = (roleRows ?? []).map(r => r.user_id);
  const memberUsers = users.filter(u => memberIds.includes(u.id));

  const members = (roleRows ?? []).map(r => {
    const u = memberUsers.find(u => u.id === r.user_id);
    return {
      userId: r.user_id,
      role: r.role,
      name: (u?.user_metadata?.full_name as string) ?? u?.email?.split('@')[0] ?? 'Unknown',
      email: u?.email ?? '',
      joinedAt: r.created_at,
    };
  });

  return NextResponse.json({ org, members, tutorialCount: tutorialCount ?? 0 });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { err } = await assertSuperAdmin(req);
  if (err) return err;

  const { id } = await params;
  const { name, type, location } = await req.json();

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updateData.name = name;
  if (type) updateData.type = type;
  if (location !== undefined) updateData.location = location;

  const { data, error } = await serviceSupabase
    .from('organisations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { err } = await assertSuperAdmin(req);
  if (err) return err;

  const { id } = await params;

  // Block deletion if tutorials exist under this org
  const { count } = await serviceSupabase
    .from('tutorials')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Cannot delete — this organisation has ${count} tutorial(s). Reassign or delete them first.` },
      { status: 409 }
    );
  }

  const { error } = await serviceSupabase.from('organisations').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
