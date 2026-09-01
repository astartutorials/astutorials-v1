import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendPlaybookRegistrationConfirmation } from "@/lib/email";
import { getPlaybook } from "@/lib/playbooks";

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
 * One route for all three Playbook webinars. The `playbook` field selects which
 * one, and is validated against the registry in lib/playbooks rather than
 * trusted — an unrecognised slug is a 400, never a row.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const playbook = getPlaybook(typeof body.playbook === "string" ? body.playbook : "");
  if (!playbook) {
    return NextResponse.json({ error: "Unknown playbook" }, { status: 400 });
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

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
  }

  const row = {
    playbook: playbook.slug,
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    parent_phone: clean(body.parentPhone, 40),
    university: clean(body.university, 160),
    level: clean(body.level, 60),
    discipline: clean(body.discipline, 120),
    challenge_academic: clean(body.challengeAcademic, 1000),
    challenge_other: clean(body.challengeOther, 1000),
    question: clean(body.question, 1000),
    heard_via: clean(body.heardVia, 60),
  };

  // Upsert rather than insert: a student who registers twice for the same
  // playbook should update their answers, not hit a duplicate-key error. The
  // conflict target is (playbook, email), so registering for a second playbook
  // is a new row.
  const { error } = await supabase
    .from("playbook_registrations")
    .upsert(row, { onConflict: "playbook,email" });

  if (error) {
    console.error("[playbook-registrations] Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved registration.
  await sendPlaybookRegistrationConfirmation({ to: row.email, fullName, playbook }).catch((err) =>
    console.error("[playbook-registrations] confirmation email failed:", err)
  );

  try {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: row.email,
      properties: { name: fullName, email: row.email, phone },
    });
    posthog.capture({
      distinctId: row.email,
      event: "playbook_registration_received",
      properties: {
        playbook: row.playbook,
        university: row.university,
        level: row.level,
        discipline: row.discipline,
        heard_via: row.heard_via,
        has_academic_challenge: !!row.challenge_academic,
        has_other_challenge: !!row.challenge_other,
        has_question: !!row.question,
        has_parent_phone: !!row.parent_phone,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[playbook-registrations] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
