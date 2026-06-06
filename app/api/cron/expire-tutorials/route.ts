import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: expired, error: fetchError } = await serviceSupabase
    .from('tutorials')
    .select('id, code, title, org_id')
    .eq('status', 'active')
    .lt('date', today);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  const ids = expired.map((t: { id: string }) => t.id);

  const { error: updateError } = await serviceSupabase
    .from('tutorials')
    .update({ status: 'completed' })
    .in('id', ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  for (const t of expired as { id: string; code: string; title: string; org_id: string | null }[]) {
    logAuditEvent({
      actorId: '00000000-0000-0000-0000-000000000000',
      actorEmail: 'system',
      action: 'tutorial.auto_expired',
      targetType: 'tutorial',
      targetId: t.id,
      targetLabel: `${t.code} — ${t.title}`,
      orgId: t.org_id,
      details: { reason: 'auto-expired by nightly cron' },
    });
  }

  return NextResponse.json({ updated: ids.length });
}
