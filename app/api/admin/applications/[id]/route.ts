import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserRole, can } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";
import {
  sendApplicationShortlisted,
  sendApplicationRejected,
  sendApplicationAccepted,
} from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "accepted"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'applications:update')) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: application, error: fetchErr } = await supabase
    .from("tutor_applications")
    .select("full_name, email, status")
    .eq("id", id)
    .single();

  if (fetchErr || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("tutor_applications")
    .update({ status: body.status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email on status transitions that notify the applicant
  if (body.status === "shortlisted" && application.status !== "shortlisted") {
    await sendApplicationShortlisted({ to: application.email, fullName: application.full_name });
  } else if (body.status === "rejected" && application.status !== "rejected") {
    await sendApplicationRejected({ to: application.email, fullName: application.full_name });
  } else if (body.status === "accepted" && application.status !== "accepted") {
    await sendApplicationAccepted({ to: application.email, fullName: application.full_name });
  }

  await logAuditEvent({
    actorId: user.id,
    actorEmail: user.email ?? '',
    action: 'application.status_changed',
    targetType: 'application',
    targetId: id,
    targetLabel: application.full_name,
    details: { from: application.status, to: body.status },
  });

  return NextResponse.json({ success: true });
}
