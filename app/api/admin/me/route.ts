import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole } from '@/lib/rbac';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(supabase, user.id, user.user_metadata as Record<string, unknown>);

  return NextResponse.json({
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.full_name as string) ?? user.email?.split('@')[0] ?? 'Admin',
    phone: (user.user_metadata?.phone as string) ?? '',
    role: ctx?.role ?? null,
    orgId: ctx?.orgId ?? null,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, phone } = await request.json();
  const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
