import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";

const supabase = createClient(
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
  if (!ctx || !can(ctx.role, 'feedback:read')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("id, full_name, email, rating, comment, created_at, tutorials(title, org_id)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = ctx.role !== 'super_admin' && ctx.orgId
    ? (data ?? []).filter((f) => (f as { tutorials?: { org_id?: string } | null }).tutorials?.org_id === ctx.orgId)
    : data;

  return NextResponse.json(filtered);
}
