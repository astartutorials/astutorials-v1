import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendTfaRegistrationConfirmation } from "@/lib/email";
import { BABCOCK_ORG_ID } from "@/lib/programme-org";
import {
  TFA_ATTENDEE_TYPES,
  TFA_QUESTION_TARGETS,
  TFA_ANY_SPEAKER,
  TFA_PARENT_TYPE,
  TFA_HEARD_OPTIONS,
  isTfaOpen,
} from "@/lib/tfa";

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

export async function POST(req: NextRequest) {
  if (!isTfaOpen()) {
    return NextResponse.json({ error: "Registration for this event has closed." }, { status: 410 });
  }

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

  const fullName = clean(body.fullName, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const attendeeType = clean(body.attendeeType, 60);
  const callPhone = clean(body.callPhone, 40);

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
  }
  if (!attendeeType || !(TFA_ATTENDEE_TYPES as readonly string[]).includes(attendeeType)) {
    return NextResponse.json({ error: "Tell us who is registering" }, { status: 400 });
  }
  if (!callPhone) {
    return NextResponse.json({ error: "A phone number for calls is required" }, { status: 400 });
  }

  // A parent registering is the parent, so neither parent field applies to them.
  const isParent = attendeeType === TFA_PARENT_TYPE;
  const parentName = isParent ? null : clean(body.parentName, 120);
  const parentPhone = isParent ? null : clean(body.parentPhone, 40);
  if (!isParent && !parentName) {
    return NextResponse.json({ error: "Parent's / guardian's full name is required" }, { status: 400 });
  }
  if (!isParent && !parentPhone) {
    return NextResponse.json({ error: "Parent's / guardian's phone number is required" }, { status: 400 });
  }

  const courseOfStudy = clean(body.courseOfStudy, 120);
  if (!courseOfStudy) {
    return NextResponse.json({ error: "Department is required" }, { status: 400 });
  }
  const heardVia = clean(body.heardVia, 60);
  if (!heardVia || !TFA_HEARD_OPTIONS.includes(heardVia)) {
    return NextResponse.json({ error: "Tell us how you heard about the event" }, { status: 400 });
  }

  const question = clean(body.question, 1000);
  if (!question) {
    return NextResponse.json({ error: "A question for the speakers is required" }, { status: 400 });
  }
  // An unknown name falls back to the catch-all rather than rejecting the
  // registration over who the question is addressed to.
  const target = clean(body.questionFor, 200);
  const questionFor = target && TFA_QUESTION_TARGETS.includes(target) ? target : TFA_ANY_SPEAKER;

  const row = {
    // The event is at BUTH, for Babcock's freshers: org-scoped like every
    // other org dataset.
    org_id: BABCOCK_ORG_ID,
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    call_phone: callPhone,
    attendee_type: attendeeType,
    course_of_study: courseOfStudy,
    parent_name: parentName,
    parent_phone: parentPhone,
    question,
    question_for: questionFor,
    heard_via: heardVia,
  };

  // Upsert: registering twice updates the answers, it doesn't add a second row.
  const { error } = await supabase
    .from("tfa_registrations")
    .upsert(row, { onConflict: "email" });

  if (error) {
    console.error("[tfa-registrations] Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved registration.
  await sendTfaRegistrationConfirmation({ to: row.email, fullName }).catch((err) =>
    console.error("[tfa-registrations] confirmation email failed:", err)
  );

  try {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: row.email,
      properties: { name: fullName, email: row.email, phone },
    });
    posthog.capture({
      distinctId: row.email,
      event: "tfa_registration_received",
      properties: {
        attendee_type: row.attendee_type,
        course_of_study: row.course_of_study,
        heard_via: row.heard_via,
        has_question: !!row.question,
        question_for: row.question_for,
        has_parent_phone: !!row.parent_phone,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[tfa-registrations] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
