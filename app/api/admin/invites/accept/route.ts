import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json().catch(() => ({}));

  if (!token || !name?.trim() || !password) {
    return NextResponse.json({ error: 'Token, name, and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const { data: invite, error: inviteErr } = await serviceSupabase
    .from('invites')
    .select('id, email, role, org_id, expires_at, accepted_at')
    .eq('token', token)
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: 'Invalid or expired invitation.' }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'This invitation has already been accepted.' }, { status: 409 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  const { data: created, error: createErr } = await serviceSupabase.auth.admin.createUser({
    email: invite.email,
    password,
    user_metadata: { full_name: name.trim() },
    email_confirm: true,
  });

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  const { error: roleErr } = await serviceSupabase
    .from('user_roles')
    .insert({ user_id: created.user.id, org_id: invite.org_id, role: invite.role });

  if (roleErr) {
    await serviceSupabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: roleErr.message }, { status: 500 });
  }

  await serviceSupabase
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  await logAuditEvent({
    actorId: created.user.id,
    actorEmail: invite.email,
    action: 'invite.accepted',
    targetType: 'user',
    targetId: created.user.id,
    targetLabel: `${name.trim()} <${invite.email}>`,
    orgId: invite.org_id,
    details: { role: invite.role },
  });

  return NextResponse.json({ ok: true });
}
