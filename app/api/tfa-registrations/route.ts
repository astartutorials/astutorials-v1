import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendTfaRegistrationConfirmation } from "@/lib/email";
import { BABCOCK_ORG_ID } from "@/lib/programme-org";
import { TFA_ATTENDEE_TYPES, isTfaOpen } from "@/lib/tfa";

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

  const row = {
    // The event is at BUTH, for Babcock's freshers: org-scoped like every
    // other org dataset.
    org_id: BABCOCK_ORG_ID,
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    attendee_type: attendeeType,
    course_of_study: clean(body.courseOfStudy, 120),
    parent_phone: clean(body.parentPhone, 40),
    question: clean(body.question, 1000),
    heard_via: clean(body.heardVia, 60),
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
        has_parent_phone: !!row.parent_phone,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[tfa-registrations] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
