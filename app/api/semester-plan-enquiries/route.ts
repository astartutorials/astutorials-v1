import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendSemesterPlanEnquiryNotification } from "@/lib/email";
import { programmeOrgId } from "@/lib/programme-org";
import { SEMESTER_PLANS, SEMESTER_PLAN_SESSION, isSemesterPlanId } from "@/lib/semester-plan";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Trim, collapse to null when empty, and cap so a paste-bomb can't fill the row. */
function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/**
 * A Full Semester Plan enquiry: the student or a parent leaves details instead
 * of paying now, and the team follows up. Paying goes through Paystack as a
 * programme booking; this is only the "call me first" route.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { turnstileToken } = body;
  if (!(await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : undefined))) {
    return NextResponse.json(
      { error: "Bot verification failed. Please try again." },
      { status: 403 }
    );
  }

  const plan = isSemesterPlanId(body.plan) ? body.plan : body.plan === "undecided" ? "undecided" : null;
  const submittedBy = body.submittedBy === "student" || body.submittedBy === "parent" ? body.submittedBy : null;
  const studentName = clean(body.studentName, 120);
  const studentPhone = clean(body.studentPhone, 40);
  const studentEmail = clean(body.studentEmail, 200);
  const courseOfStudy = clean(body.courseOfStudy, 120);
  const parentName = clean(body.parentName, 120);
  const parentPhone = clean(body.parentPhone, 40);
  const parentEmail = clean(body.parentEmail, 200);
  const notes = clean(body.notes, 1000);

  const missing =
    !plan ? "A plan" :
    !submittedBy ? "Who is filling this in" :
    !studentName ? "Student's name" :
    !studentPhone ? "Student's phone number" :
    studentEmail && !studentEmail.includes("@") ? "A valid student email" :
    !courseOfStudy ? "Course of study" :
    !parentName ? "Parent/guardian's name" :
    !parentPhone ? "Parent/guardian's phone number" :
    !parentEmail || !parentEmail.includes("@") ? "A valid parent/guardian email" :
    null;
  if (missing) {
    return NextResponse.json({ error: `${missing} is required` }, { status: 400 });
  }

  const row = {
    session: SEMESTER_PLAN_SESSION,
    org_id: programmeOrgId("semester-plan"),
    plan: plan!,
    submitted_by: submittedBy!,
    student_name: studentName!,
    student_phone: studentPhone!,
    student_email: studentEmail?.toLowerCase() ?? null,
    course_of_study: courseOfStudy!,
    parent_name: parentName!,
    parent_phone: parentPhone!,
    parent_email: parentEmail!.toLowerCase(),
    notes,
  };

  const { error } = await supabase.from("semester_plan_enquiries").insert(row);
  if (error) {
    console.error("[semester-plan-enquiries] Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to send your details. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved enquiry.
  await sendSemesterPlanEnquiryNotification({
    planName: isSemesterPlanId(row.plan) ? SEMESTER_PLANS[row.plan].name : "Undecided",
    submittedBy: row.submitted_by === "parent" ? "Parent/guardian" : "Student",
    studentName: row.student_name,
    studentPhone: row.student_phone,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    courseOfStudy: row.course_of_study,
  }).catch((err) => console.error("[semester-plan-enquiries] notification email failed:", err));

  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: row.student_email ?? row.parent_email ?? row.student_phone,
      event: "semester_plan_enquiry_received",
      properties: { plan: row.plan, submitted_by: row.submitted_by },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[semester-plan-enquiries] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
