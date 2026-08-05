import type { SupabaseClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';

/**
 * Heartbeats and health checks for the things that fail silently.
 *
 * Everything here rides on the existing audit_logs table rather than a new
 * one — no migration, and the trail lives next to the events it describes.
 */

export const SYSTEM_ACTOR_ID = '00000000-0000-0000-0000-000000000000';

/** Jobs expected to check in. Names are written to audit_logs.target_label. */
export const MONITORED_JOBS = {
  'expire-tutorials': { label: 'Nightly tutorial expiry', staleAfterHours: 48 },
  'reconcile-payments': { label: 'Payment reconciler', staleAfterHours: 48 },
  'paystack-webhook': { label: 'Paystack webhook', staleAfterHours: 24 * 7 },
} as const;

export type MonitoredJob = keyof typeof MONITORED_JOBS;

export interface HealthIssue {
  severity: 'critical' | 'warning';
  title: string;
  detail: string;
}

/**
 * Records that a job ran. Fire-and-forget via logAuditEvent, so a failed
 * heartbeat can never break the job it is measuring.
 */
export async function recordHeartbeat(job: MonitoredJob, details?: Record<string, unknown>) {
  await logAuditEvent({
    actorId: SYSTEM_ACTOR_ID,
    actorEmail: 'system',
    action: 'system.heartbeat',
    targetType: 'job',
    targetLabel: job,
    details,
  });
}

async function lastHeartbeatAt(
  supabase: SupabaseClient,
  job: MonitoredJob
): Promise<Date | null> {
  const { data } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('action', 'system.heartbeat')
    .eq('target_label', job)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.created_at ? new Date(data.created_at) : null;
}

function hoursSince(d: Date, now: Date): number {
  return (now.getTime() - d.getTime()) / (1000 * 60 * 60);
}

/**
 * Returns everything currently wrong. An empty array means healthy.
 *
 * A job that has never checked in is reported too — today's outage was two
 * crons that had never once run successfully, which a "stale since last run"
 * check would have missed entirely.
 */
export async function collectHealthIssues(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  // 1. Jobs that have gone quiet.
  for (const [job, cfg] of Object.entries(MONITORED_JOBS)) {
    const last = await lastHeartbeatAt(supabase, job as MonitoredJob);

    if (!last) {
      issues.push({
        severity: 'critical',
        title: `${cfg.label} has never run`,
        detail:
          `No heartbeat has ever been recorded for "${job}". If it was deployed ` +
          `more than a day ago, it is not being invoked at all.`,
      });
      continue;
    }

    const age = hoursSince(last, now);
    if (age > cfg.staleAfterHours) {
      issues.push({
        severity: 'critical',
        title: `${cfg.label} has stopped running`,
        detail:
          `Last check-in was ${Math.floor(age)}h ago (${last.toISOString()}), ` +
          `past the ${cfg.staleAfterHours}h threshold.`,
      });
    }
  }

  // 2. Payments the reconciler had to rescue. Each one is a student who paid
  //    and got nothing until the nightly job caught it.
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: rescued } = await supabase
    .from('audit_logs')
    .select('target_label, created_at')
    .eq('action', 'booking.reconciled')
    .gte('created_at', since);

  if (rescued && rescued.length > 0) {
    const refs = rescued.map((r: { target_label: string }) => r.target_label).join(', ');
    issues.push({
      severity: 'warning',
      title: `${rescued.length} payment(s) had to be recovered in the last 24h`,
      detail:
        `The webhook and the browser callback both failed to record: ${refs}. ` +
        `The money is safe and the bookings exist, but students waited for the ` +
        `nightly job instead of getting an instant confirmation.`,
    });
  }

  return issues;
}
