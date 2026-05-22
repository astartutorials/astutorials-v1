import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'tutorials:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = serviceSupabase
    .from('tutorials')
    .select('id, code, title, teacher, date, time, seats_total, status, location, org_id, organisations(name), bookings(id)')
    .order('created_at', { ascending: false });

  // Non-super_admin users only see their org's tutorials
  if (ctx.role !== 'super_admin' && ctx.orgId) {
    query = query.eq('org_id', ctx.orgId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await getUserRole(supabase, user.id, user.user_metadata as Record<string, unknown>);
    if (!ctx || !can(ctx.role, 'tutorials:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, title, teacher, description, date, time, location, capacity, price, colorScheme, status = 'active' } = body;

    if (!code || !title) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Course code and title are required.' },
        { status: 400 }
      );
    }
    if (status === 'active' && (!teacher || !capacity)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Tutor name and available seats are required to publish.' },
        { status: 400 }
      );
    }

    const orgId = ctx.role === 'super_admin'
      ? (body.orgId ?? '00000000-0000-0000-0000-000000000001')
      : ctx.orgId;

    const { data, error } = await supabase
      .from('tutorials')
      .insert([{
        code, title, teacher, description, date, time, location,
        seats_total: capacity, price, color_scheme: colorScheme, status,
        org_id: orgId,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Database Error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tutorial successfully created', tutorial: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
