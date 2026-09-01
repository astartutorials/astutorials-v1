import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { getPlaybook } from "@/lib/playbooks";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  // playbooks:read is held by super_admin and org_admin. playbook_registrations
  // has no org_id, so there is nothing to scope the read to: every org_admin
  // sees the same list for these A-Star events, which is why no org filter
  // follows.
  if (!ctx || !can(ctx.role, "playbooks:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Filtering by playbook is optional — the console asks for one at a time, but
  // an unfiltered read is the export-everything case. An unrecognised slug is
  // rejected rather than silently returning every playbook's rows.
  const requested = req.nextUrl.searchParams.get("playbook");
  if (requested && !getPlaybook(requested)) {
    return NextResponse.json({ error: "Unknown playbook" }, { status: 400 });
  }

  let query = supabase
    .from("playbook_registrations")
    .select(
      "id, playbook, full_name, email, phone, parent_phone, university, level, discipline, challenge_academic, challenge_other, question, heard_via, created_at"
    )
    .order("created_at", { ascending: false });

  if (requested) query = query.eq("playbook", requested);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
