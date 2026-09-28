import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendStudentRegistrationConfirmation } from "@/lib/email";
import { openIntakeFor, daysInMonth } from "@/lib/intakes";

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

/** "@ada.codes", "ada.codes" and "instagram.com/ada.codes/" all store as "ada.codes". */
function handle(value: unknown): string | null {
  const raw = clean(value, 200);
  if (!raw) return null;
  const stripped = raw
    .replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@+/, "");
  return stripped ? stripped.slice(0, 60) : null;
}

function int(value: unknown): number | null {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isInteger(n) ? n : null;
}

/**
 * Registration for new students. The level picks the intake; the intake — not
 * the browser — decides which session the row counts toward, so a form left
 * open over a session change still files the student correctly.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const intake = openIntakeFor(int(body.level) ?? 0);
  if (!intake) {
    return NextResponse.json(
      { error: "Registration for this level isn't open right now." },
      { status: 400 }
    );
  }

  const { turnstileToken } = body;
  if (!(await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : undefined))) {
    return NextResponse.json(
      { error: "Bot verification failed. Please try again." },
      { status: 403 }
    );
  }

  const fullName = clean(body.fullName, 120);
  const phone = clean(body.phone, 40);
  const whatsapp = clean(body.whatsapp, 40);
  const email = clean(body.email, 200);
  const courseOfStudy = clean(body.courseOfStudy, 120);
  const parentName = clean(body.parentName, 120);
  const parentPhone = clean(body.parentPhone, 40);
  const parentEmail = clean(body.parentEmail, 200);
  const birthDay = int(body.birthDay);
  const birthMonth = int(body.birthMonth);

  const missing =
    !fullName ? "Full name" :
    !phone ? "Phone number" :
    !whatsapp ? "WhatsApp number" :
    !email || !email.includes("@") ? "A valid email" :
    !courseOfStudy ? "Course of study" :
    !birthMonth || birthMonth < 1 || birthMonth > 12 ||
    !birthDay || birthDay < 1 || birthDay > daysInMonth(birthMonth) ? "A valid birthday" :
    !parentName ? "Parent/guardian's name" :
    !parentPhone ? "Parent/guardian's phone number" :
    parentEmail && !parentEmail.includes("@") ? "A valid parent/guardian email" :
    null;
  if (missing) {
    return NextResponse.json({ error: `${missing} is required` }, { status: 400 });
  }

  const row = {
    session: intake.session,
    entry_level: intake.level,
    org_id: intake.orgId,
    full_name: fullName!,
    phone: phone!,
    whatsapp: whatsapp!,
    email: email!.toLowerCase(),
    course_of_study: courseOfStudy!,
    instagram: handle(body.instagram),
    tiktok: handle(body.tiktok),
    birth_day: birthDay!,
    birth_month: birthMonth!,
    parent_name: parentName!,
    parent_phone: parentPhone!,
    parent_email: parentEmail?.toLowerCase() ?? null,
    updated_at: new Date().toISOString(),
  };

  // Upsert on (session, entry_level, email): resubmitting corrects the answers
  // rather than failing, and next session's intake is a fresh row.
  const { error } = await supabase
    .from("student_registrations")
    .upsert(row, { onConflict: "session,entry_level,email" });

  if (error) {
    console.error("[student-registrations] Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved registration.
  await sendStudentRegistrationConfirmation({
    to: row.email,
    fullName: row.full_name,
    level: intake.level,
    session: intake.session,
  }).catch((err) => console.error("[student-registrations] confirmation email failed:", err));

  try {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: row.email,
      properties: { name: row.full_name, email: row.email, phone: row.whatsapp },
    });
    posthog.capture({
      distinctId: row.email,
      event: "student_registration_received",
      properties: {
        session: row.session,
        entry_level: row.entry_level,
        course_of_study: row.course_of_study,
        has_instagram: !!row.instagram,
        has_tiktok: !!row.tiktok,
        has_parent_email: !!row.parent_email,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[student-registrations] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true, session: intake.session }, { status: 201 });
}
