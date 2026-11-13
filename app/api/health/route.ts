import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 5000;

/**
 * For an outside uptime monitor: 200 when the site is up and can reach the
 * database, 503 when it can't. Public and deliberately vague: it says
 * nothing about which job or table is unhappy. The detailed checks (stale
 * crons and the like) stay in /api/cron/health-check, behind the cron secret.
 */
export async function GET() {
  const started = Date.now();
  const timeout = new Promise<{ error: Error }>((resolve) =>
    setTimeout(() => resolve({ error: new Error('timeout') }), TIMEOUT_MS)
  );

  let dbOk = false;
  try {
    const { error } = await Promise.race([
      supabase.from('organisations').select('id', { head: true, count: 'exact' }).limit(1),
      timeout,
    ]);
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  return NextResponse.json(
    { ok: dbOk, database: dbOk ? 'up' : 'down', ms: Date.now() - started },
    { status: dbOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
