import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const NOTION_DATABASE_ID = "fc8883564840431fa1ed4158744542dd";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function richText(content: string) {
  return [{ text: { content } }];
}

function multiSelect(values: string[]) {
  return values.map((name) => ({ name }));
}

export async function POST(req: NextRequest) {
  const secret = process.env.NOTION_CONNECTION_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Notion not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    fullName,
    email,
    phone,
    educationLevel,
    institution,
    fieldOfStudy,
    coursesCanTeach,
    levelsCanTeach,
    yearsOfExperience,
    teachingMode,
    hasTutoredBefore,
    previousTutoringDescription,
    whyAstar,
    difficultConceptExplanation,
    daysAvailable,
    timeOfDay,
    cvLink,
    linkedinPortfolio,
  } = body as Record<string, unknown>;

  if (!fullName || !String(fullName).trim()) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!email || !String(email).includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const properties: Record<string, unknown> = {
    "Full Name": { title: richText(String(fullName ?? "")) },
    "Email": { email: String(email ?? "") },
    "Phone Number": { phone_number: String(phone ?? "") },
    "Highest Education Level": { select: { name: String(educationLevel ?? "") } },
    "Institution": { rich_text: richText(String(institution ?? "")) },
    "Field of Study or Background": { rich_text: richText(String(fieldOfStudy ?? "")) },
    "Courses Can Teach": { rich_text: richText(String(coursesCanTeach ?? "")) },
    "Levels Can Teach": { multi_select: multiSelect(Array.isArray(levelsCanTeach) ? levelsCanTeach : []) },
    "Years of Experience": { select: { name: String(yearsOfExperience ?? "") } },
    "Teaching Mode": { select: { name: String(teachingMode ?? "") } },
    "Has Tutored Before": { select: { name: String(hasTutoredBefore ?? "") } },
    "Why A-Star?": { rich_text: richText(String(whyAstar ?? "")) },
    "Difficult Concept Explanation": { rich_text: richText(String(difficultConceptExplanation ?? "")) },
    "Days Available": { multi_select: multiSelect(Array.isArray(daysAvailable) ? daysAvailable : []) },
    "Time of Day": { multi_select: multiSelect(Array.isArray(timeOfDay) ? timeOfDay : []) },
    "CV Link": { url: cvLink ? String(cvLink) : null },
    "Application Status": { select: { name: "New" } },
  };

  if (previousTutoringDescription) {
    properties["Previous Tutoring Description"] = {
      rich_text: richText(String(previousTutoringDescription)),
    };
  }

  if (linkedinPortfolio) {
    properties["LinkedIn / Portfolio"] = { url: String(linkedinPortfolio) };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Failed to submit application" },
      { status: 502 }
    );
  }

  // Mirror to Supabase
  const { error: sbError } = await supabase.from("tutor_applications").insert({
    full_name: String(fullName ?? ""),
    email: String(email ?? ""),
    phone: phone ? String(phone) : null,
    education_level: educationLevel ? String(educationLevel) : null,
    institution: institution ? String(institution) : null,
    field_of_study: fieldOfStudy ? String(fieldOfStudy) : null,
    courses_can_teach: coursesCanTeach ? String(coursesCanTeach) : null,
    levels_can_teach: Array.isArray(levelsCanTeach) ? levelsCanTeach.join(", ") : null,
    years_of_experience: yearsOfExperience ? String(yearsOfExperience) : null,
    teaching_mode: teachingMode ? String(teachingMode) : null,
    has_tutored_before: hasTutoredBefore ? String(hasTutoredBefore) : null,
    previous_tutoring_description: previousTutoringDescription ? String(previousTutoringDescription) : null,
    why_astar: whyAstar ? String(whyAstar) : null,
    difficult_concept_explanation: difficultConceptExplanation ? String(difficultConceptExplanation) : null,
    days_available: Array.isArray(daysAvailable) ? daysAvailable.join(", ") : null,
    time_of_day: Array.isArray(timeOfDay) ? timeOfDay.join(", ") : null,
    cv_link: cvLink ? String(cvLink) : null,
    linkedin_portfolio: linkedinPortfolio ? String(linkedinPortfolio) : null,
    status: "new",
  });
  if (sbError) console.error("[tutor-applications] Supabase insert error:", sbError);

  return NextResponse.json({ success: true }, { status: 201 });
}
