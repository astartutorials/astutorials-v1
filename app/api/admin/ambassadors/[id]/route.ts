import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import { sendAmbassadorApproved } from "@/lib/email";
import { proposeReferralCode } from "@/lib/ambassador";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** A code taken by another ambassador or a discount code would credit the wrong person. */
async function codeIsFree(code: string): Promise<boolean> {
  const [{ data: ambassador }, { data: discount }] = await Promise.all([
    supabase.from("ambassador_applications").select("id").eq("referral_code", code).maybeSingle(),
    supabase.from("discount_codes").select("code").eq("code", code).maybeSingle(),
  ]);
  return !ambassador && !discount;
}

/**
 * Approve or reject an application. Approving assigns a referral code and
 * emails it; an approved ambassador keeps their code and can't be moved back.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, "ambassadors:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  let lookup = supabase
    .from("ambassador_applications")
    .select("id, full_name, email, status, org_id")
    .eq("id", id);
  if (ctx.role !== "super_admin") lookup = lookup.eq("org_id", ctx.orgId);
  const { data: app } = await lookup.maybeSingle();

  // Another org's application is reported as missing, not forbidden.
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.status === "approved") {
    return NextResponse.json({ error: "This ambassador is already approved." }, { status: 409 });
  }

  const reviewed = { reviewed_by: user.id, reviewed_at: new Date().toISOString() };

  if (action === "reject") {
    const { error } = await supabase
      .from("ambassador_applications")
      .update({ status: "rejected", ...reviewed })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email ?? "",
      action: "ambassador.rejected",
      targetType: "ambassador_application",
      targetId: id,
      targetLabel: app.full_name,
      orgId: app.org_id,
    });
    return NextResponse.json({ success: true, status: "rejected" });
  }

  // Approve: find a free code, then write it. The unique index is the final
  // word if two approvals race for the same code; retry on a clash.
  let referralCode: string | null = null;
  for (let attempt = 0; attempt < 8 && !referralCode; attempt++) {
    const candidate = proposeReferralCode(app.full_name);
    if (!(await codeIsFree(candidate))) continue;

    const { error } = await supabase
      .from("ambassador_applications")
      .update({ status: "approved", referral_code: candidate, ...reviewed })
      .eq("id", id);
    if (!error) referralCode = candidate;
    else if (error.code !== "23505") return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!referralCode) {
    return NextResponse.json({ error: "Couldn't assign a referral code. Please try again." }, { status: 500 });
  }

  await sendAmbassadorApproved({ to: app.email, fullName: app.full_name, referralCode }).catch((err) =>
    console.error("[ambassadors] approval email failed:", err)
  );

  await logAuditEvent({
    actorId: user.id,
    actorEmail: user.email ?? "",
    action: "ambassador.approved",
    targetType: "ambassador_application",
    targetId: id,
    targetLabel: app.full_name,
    orgId: app.org_id,
    details: { referral_code: referralCode },
  });

  return NextResponse.json({ success: true, status: "approved", referralCode });
}
