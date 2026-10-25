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
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Same people, same data as Student Intake: 100L students and their
  // parents' contact details, scoped to an org. So it reuses intake:read
  // rather than adding a grant.
  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, "intake:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let query = supabase
    .from("semester_plan_enquiries")
    .select(
      "id, session, plan, submitted_by, student_name, student_phone, student_email, course_of_study, parent_name, parent_phone, parent_email, notes, created_at"
    )
    .order("created_at", { ascending: false });

  if (ctx.role !== "super_admin") query = query.eq("org_id", ctx.orgId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
