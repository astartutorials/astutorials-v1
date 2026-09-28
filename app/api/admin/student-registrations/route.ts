import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SESSION_RE = /^\d{4}\/\d{4}$/;

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
  if (!ctx || !can(ctx.role, "intake:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // The console reads one session at a time; without a session there is no
  // sensible default page, so it is required rather than returning every year.
  const session = req.nextUrl.searchParams.get("session") ?? "";
  if (!SESSION_RE.test(session)) {
    return NextResponse.json({ error: "A session like 2026/2027 is required" }, { status: 400 });
  }

  let query = supabase
    .from("student_registrations")
    .select(
      "id, session, entry_level, full_name, phone, whatsapp, email, course_of_study, instagram, tiktok, birth_day, birth_month, parent_name, parent_phone, parent_email, created_at"
    )
    .eq("session", session)
    .order("created_at", { ascending: false });

  // Unlike the Playbook and BUCC lists, intake rows carry an org_id, so
  // org_admin only ever sees their own organisation's students.
  if (ctx.role !== "super_admin") query = query.eq("org_id", ctx.orgId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
