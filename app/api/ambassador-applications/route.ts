import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendAmbassadorApplicationReceived } from "@/lib/email";
import { BABCOCK_ORG_ID } from "@/lib/programme-org";
import { AMBASSADOR_LEVELS, AMBASSADOR_HEARD_OPTIONS } from "@/lib/ambassador";

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
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { turnstileToken } = body;
  if (!(await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : undefined))) {
    return NextResponse.json({ error: "Bot verification failed. Please try again." }, { status: 403 });
  }

  const fullName = clean(body.fullName, 120);
  const email = clean(body.email, 200)?.toLowerCase() ?? null;
  const phone = clean(body.phone, 40);
  const courseOfStudy = clean(body.courseOfStudy, 120);
  const level = clean(body.level, 10);
  const motivation = clean(body.motivation, 1500);
  const socialHandle = clean(body.socialHandle, 200);
  const heardVia = clean(body.heardVia, 60);

  if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
  if (!courseOfStudy) return NextResponse.json({ error: "Department is required" }, { status: 400 });
  if (!level || !(AMBASSADOR_LEVELS as readonly string[]).includes(level)) {
    return NextResponse.json({ error: "Choose your level" }, { status: 400 });
  }
  if (!motivation) {
    return NextResponse.json({ error: "Tell us how you'd spread the word" }, { status: 400 });
  }
  if (heardVia && !AMBASSADOR_HEARD_OPTIONS.includes(heardVia)) {
    return NextResponse.json({ error: "Tell us how you heard about the programme" }, { status: 400 });
  }

  // Insert, not upsert: a second application must not overwrite one an admin
  // has already reviewed (or reset an approved ambassador to pending).
  const { error } = await supabase.from("ambassador_applications").insert({
    // Babcock is the test market; org-scoped like every other student dataset.
    org_id: BABCOCK_ORG_ID,
    full_name: fullName,
    email,
    phone,
    course_of_study: courseOfStudy,
    level,
    social_handle: socialHandle,
    motivation,
    heard_via: heardVia,
  });

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "You've already applied with this email. We'll be in touch." },
      { status: 409 }
    );
  }
  if (error) {
    console.error("[ambassador-applications] insert error:", error);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved application.
  await sendAmbassadorApplicationReceived({ to: email, fullName }).catch((err) =>
    console.error("[ambassador-applications] confirmation email failed:", err)
  );

  try {
    const posthog = getPostHogClient();
    posthog.identify({ distinctId: email, properties: { name: fullName, email, phone } });
    posthog.capture({
      distinctId: email,
      event: "ambassador_application_received",
      properties: { level, course_of_study: courseOfStudy, heard_via: heardVia, has_social: !!socialHandle },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[ambassador-applications] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
