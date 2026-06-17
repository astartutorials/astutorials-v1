import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authClient = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'tutorials:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = serviceSupabase.from('tutorials').select('*').eq('id', id);

  // Non-super_admin users only see their org's tutorials
  if (ctx.role !== 'super_admin' && ctx.orgId) {
    query = query.eq('org_id', ctx.orgId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await getUserRole(supabase, user.id, user.user_metadata as Record<string, unknown>);
    if (!ctx || !can(ctx.role, 'tutorials:update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, title, teacher, description, date, time, location, capacity, price, colorScheme, status } = body;

    const updateData: Record<string, unknown> = {};
    if (code !== undefined) updateData.code = code;
    if (title !== undefined) updateData.title = title;
    if (teacher !== undefined) updateData.teacher = teacher;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (capacity !== undefined) updateData.seats_total = capacity;
    if (price !== undefined) updateData.price = price;
    if (colorScheme !== undefined) updateData.color_scheme = colorScheme;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    let query = supabase.from('tutorials').update(updateData).eq('id', id);

    // Non-super_admin users can only edit tutorials in their org
    if (ctx.role !== 'super_admin' && ctx.orgId) {
      query = query.eq('org_id', ctx.orgId);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Database Error', message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    const changedFields = Object.keys(updateData).filter(k => k !== 'updated_at');
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email ?? '',
      action: 'tutorial.updated',
      targetType: 'tutorial',
      targetId: id,
      targetLabel: `${data.code} — ${data.title}`,
      orgId: data.org_id ?? ctx.orgId,
      details: { changed: changedFields.join(', ') },
    });

    return NextResponse.json({ message: 'Tutorial updated successfully', tutorial: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await getUserRole(supabase, user.id, user.user_metadata as Record<string, unknown>);
    if (!ctx || !can(ctx.role, 'tutorials:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the tutorial first — establishes existence and ownership, and
    // provides the title for the audit label.
    const { data: tutorialData } = await supabase
      .from('tutorials')
      .select('code, title, org_id')
      .eq('id', id)
      .maybeSingle();

    if (!tutorialData) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }
    // Non-super_admin users can only delete tutorials in their org
    if (ctx.role !== 'super_admin' && ctx.orgId && tutorialData.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Block deletion when paid bookings exist — bookings.tutorial_id is
    // ON DELETE CASCADE, so deleting would permanently destroy payment records.
    const { count: paidCount } = await serviceSupabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('tutorial_id', id)
      .eq('payment_status', 'paid');

    if (paidCount && paidCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: this tutorial has ${paidCount} paid booking${paidCount === 1 ? '' : 's'}. Cancel those bookings first.`,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: 'Database Error', message: error.message }, { status: 500 });
    }

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email ?? '',
      action: 'tutorial.deleted',
      targetType: 'tutorial',
      targetId: id,
      targetLabel: tutorialData ? `${tutorialData.code} — ${tutorialData.title}` : id,
      orgId: tutorialData?.org_id ?? ctx.orgId,
    });

    return NextResponse.json({ message: 'Tutorial deleted successfully.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
