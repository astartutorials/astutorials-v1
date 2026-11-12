import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_FIELDS =
  "id, full_name, email, phone, call_phone, institution, matric_number, course_of_study, level, social_handle, instagram_handle, tiktok_handle, motivation, heard_via, status, referral_code, reviewed_at, created_at";
// Money: payout details and commissions need payments:read on top.
const BANK_FIELDS = "bank_name, bank_account_number, bank_account_name";

export interface AmbassadorEarnings {
  referrals: number;
  /** Commission not yet paid out. */
  owed: number;
  paid: number;
}

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, "ambassadors:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const seesMoney = can(ctx.role, "payments:read");

  let query = supabase
    .from("ambassador_applications")
    .select(seesMoney ? `${BASE_FIELDS}, ${BANK_FIELDS}` : BASE_FIELDS)
    .order("created_at", { ascending: false });

  if (ctx.role !== "super_admin") query = query.eq("org_id", ctx.orgId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as unknown as { id: string }[];

  if (!seesMoney || rows.length === 0) return NextResponse.json(rows);

  const { data: redemptions, error: redErr } = await supabase
    .from("referral_redemptions")
    .select("ambassador_id, commission, paid_out_at")
    .in("ambassador_id", rows.map((r) => r.id));
  if (redErr) return NextResponse.json({ error: redErr.message }, { status: 500 });

  const earnings = new Map<string, AmbassadorEarnings>();
  for (const r of redemptions ?? []) {
    const e = earnings.get(r.ambassador_id) ?? { referrals: 0, owed: 0, paid: 0 };
    e.referrals += 1;
    if (r.paid_out_at) e.paid += r.commission;
    else e.owed += r.commission;
    earnings.set(r.ambassador_id, e);
  }

  return NextResponse.json(
    rows.map((r) => ({ ...r, earnings: earnings.get(r.id) ?? { referrals: 0, owed: 0, paid: 0 } }))
  );
}
