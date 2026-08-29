import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendBuccRegistrationConfirmation } from "@/lib/email";

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
    full_name: fullName,
    email: email.toLowerCase(),
    phone,
    parent_phone: clean(body.parentPhone, 40),
    level: clean(body.level, 60),
    programme: clean(body.programme, 120),
    concern: clean(body.concern, 1000),
    question: clean(body.question, 1000),
    heard_via: clean(body.heardVia, 60),
  };

  // Upsert rather than insert: a student who registers twice should update their
  // answers, not take a second seat or hit a duplicate-key error.
  const { error } = await supabase
    .from("bucc_registrations")
    .upsert(row, { onConflict: "email" });

  if (error) {
    console.error("[bucc-registrations] Supabase upsert error:", error);
    return NextResponse.json({ error: "Failed to register. Please try again." }, { status: 500 });
  }

  // Neither the email nor the analytics call may sink a saved registration.
  await sendBuccRegistrationConfirmation({ to: row.email, fullName }).catch((err) =>
    console.error("[bucc-registrations] confirmation email failed:", err)
  );

  try {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: row.email,
      properties: { name: fullName, email: row.email, phone },
    });
    posthog.capture({
      distinctId: row.email,
      event: "bucc_registration_received",
      properties: {
        level: row.level,
        programme: row.programme,
        heard_via: row.heard_via,
        has_concern: !!row.concern,
        has_question: !!row.question,
        has_parent_phone: !!row.parent_phone,
      },
    });
    await posthog.shutdown();
  } catch (err) {
    console.error("[bucc-registrations] PostHog capture failed:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
