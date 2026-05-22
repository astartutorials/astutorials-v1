import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await serviceSupabase
    .from('organisations')
    .select('id, name, type, location, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orgIds = (data ?? []).map(o => o.id);

  const [{ data: roleRows }, { data: tutorialRows }] = await Promise.all([
    serviceSupabase.from('user_roles').select('org_id').in('org_id', orgIds),
    serviceSupabase.from('tutorials').select('org_id').in('org_id', orgIds),
  ]);

  const memberCounts = (roleRows ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.org_id] = (acc[r.org_id] ?? 0) + 1;
    return acc;
  }, {});

  const tutorialCounts = (tutorialRows ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.org_id] = (acc[t.org_id] ?? 0) + 1;
    return acc;
  }, {});

  const enriched = (data ?? []).map(o => ({
    ...o,
    memberCount: memberCounts[o.id] ?? 0,
    tutorialCount: tutorialCounts[o.id] ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || ctx.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, type, location } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'Name and type are required.' }, { status: 400 });
  }

  const validTypes = ['university', 'secondary', 'primary'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await serviceSupabase
    .from('organisations')
    .insert({ name, type, location })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
