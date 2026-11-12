import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Marks every unpaid commission for one ambassador as paid, after the team has
 * sent the money. Payouts themselves happen outside the site (bank transfer).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Recording a payout is both managing ambassadors and handling money.
  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, "ambassadors:manage") || !can(ctx.role, "payments:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let lookup = supabase.from("ambassador_applications").select("id, full_name, org_id").eq("id", id);
  if (ctx.role !== "super_admin") lookup = lookup.eq("org_id", ctx.orgId);
  const { data: ambassador } = await lookup.maybeSingle();
  if (!ambassador) return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });

  const { data: paid, error } = await supabase
    .from("referral_redemptions")
    .update({ paid_out_at: new Date().toISOString(), paid_out_by: user.id })
    .eq("ambassador_id", id)
    .is("paid_out_at", null)
    .select("commission");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = (paid ?? []).reduce((sum, r) => sum + r.commission, 0);
  if ((paid ?? []).length > 0) {
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email ?? "",
      action: "ambassador.paid_out",
      targetType: "ambassador_application",
      targetId: id,
      targetLabel: ambassador.full_name,
      orgId: ambassador.org_id,
      details: { referrals: (paid ?? []).length, amount: total },
    });
  }

  return NextResponse.json({ success: true, referrals: (paid ?? []).length, amount: total });
}
