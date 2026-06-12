import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'bookings:update')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // ── Attendance toggle ────────────────────────────────────────────────────
  if (typeof body.attended === "boolean") {
    const baseQuery = serviceSupabase
      .from("bookings")
      .update({ attended: body.attended })
      .eq("id", id);
    const updateQuery = ctx.role !== 'super_admin' && ctx.orgId
      ? baseQuery.eq('org_id', ctx.orgId)
      : baseQuery;

    const { error } = await updateQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Cancellation ─────────────────────────────────────────────────────────
  if (body.status === 'cancelled') {
    const { data: booking, error: fetchErr } = await serviceSupabase
      .from('bookings')
      .select('id, full_name, email, payment_status, tutorial_id, org_id')
      .eq('id', id)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    if (ctx.role !== 'super_admin' && ctx.orgId && booking.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (booking.payment_status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled.' }, { status: 409 });
    }

    const wasPaid = booking.payment_status === 'paid';

    const { error: updateErr } = await serviceSupabase
      .from('bookings')
      .update({ payment_status: 'cancelled' })
      .eq('id', id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    if (wasPaid && booking.tutorial_id) {
      await serviceSupabase.rpc('decrement_seats_booked', { tid: booking.tutorial_id });
    }

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email ?? '',
      action: 'booking.cancelled',
      targetType: 'booking',
      targetId: id,
      targetLabel: `${booking.full_name} <${booking.email}>`,
      orgId: booking.org_id,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
}
