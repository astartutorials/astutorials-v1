import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'bookings:read')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let query = serviceSupabase
    .from("bookings")
    .select("id, full_name, email, phone, course, course_of_study, level, preferred_schedule, notes, amount_paid, payment_status, payment_reference, created_at, tutorials(title, price, org_id)")
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by org for non-super_admin
  const filtered = ctx.role === 'super_admin'
    ? data
    : data?.filter((b: any) => b.tutorials?.org_id === ctx.orgId);

  return NextResponse.json(filtered);
}
