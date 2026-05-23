import { createClient } from '@supabase/supabase-js';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface AuditEventParams {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  orgId?: string | null;
  details?: Record<string, unknown>;
}

// Fire-and-forget — never throws; audit failures must not break the primary action.
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await serviceSupabase.from('audit_logs').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      target_label: params.targetLabel ?? null,
      org_id: params.orgId ?? null,
      details: params.details ?? null,
    });
  } catch {
    // intentionally swallowed
  }
}
