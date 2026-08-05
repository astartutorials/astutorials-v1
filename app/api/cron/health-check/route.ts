import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { collectHealthIssues } from '@/lib/health';
import { sendSystemAlert } from '@/lib/email';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Daily sweep for the things that fail silently: jobs that stopped running,
 * and payments the reconciler had to rescue.
 *
 * Deliberately does NOT record its own heartbeat — nothing watches the watcher,
 * so the response body is the source of truth. Point an uptime monitor at it
 * (with the cron secret) if you want alerting that survives this route dying.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issues = await collectHealthIssues(serviceSupabase);
  const critical = issues.filter((i) => i.severity === 'critical').length;

  let alert: { sent: boolean; reason?: string } = { sent: false, reason: 'nothing to report' };
  if (issues.length > 0) {
    alert = await sendSystemAlert({ issues });
    console.error(
      `[health] ${issues.length} issue(s), ${critical} critical: ` +
        issues.map((i) => i.title).join(' | ')
    );
    if (!alert.sent) {
      console.error(`[health] ALERT NOT DELIVERED: ${alert.reason}`);
    }
  }

  return NextResponse.json({
    healthy: issues.length === 0,
    critical,
    issues,
    alert,
    checkedAt: new Date().toISOString(),
  });
}
