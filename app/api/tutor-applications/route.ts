import { NextRequest, NextResponse } from "next/server";

const NOTION_DATABASE_ID = "fc8883564840431fa1ed4158744542dd";

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
    subjectsCanTeach,
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

  const properties: Record<string, unknown> = {
    "Full Name": { title: richText(String(fullName ?? "")) },
    "Email": { email: String(email ?? "") },
    "Phone Number": { phone_number: String(phone ?? "") },
    "Highest Education Level": { select: { name: String(educationLevel ?? "") } },
    "Institution": { rich_text: richText(String(institution ?? "")) },
    "Field of Study or Background": { rich_text: richText(String(fieldOfStudy ?? "")) },
    "Subjects Can Teach": { rich_text: richText(String(subjectsCanTeach ?? "")) },
    "Levels Can Teach": { multi_select: multiSelect(Array.isArray(levelsCanTeach) ? levelsCanTeach : []) },
    "Years of Experience": { select: { name: String(yearsOfExperience ?? "") } },
    "Teaching Mode": { select: { name: String(teachingMode ?? "") } },
    "Has Tutored Before": { select: { name: String(hasTutoredBefore ?? "") } },
    "Why A-Star?": { rich_text: richText(String(whyAstar ?? "")) },
    "Difficult Concept Explanation": { rich_text: richText(String(difficultConceptExplanation ?? "")) },
    "Days Available": { multi_select: multiSelect(Array.isArray(daysAvailable) ? daysAvailable : []) },
    "Time of Day": { multi_select: multiSelect(Array.isArray(timeOfDay) ? timeOfDay : []) },
    "CV Link": { url: String(cvLink ?? "") },
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

  return NextResponse.json({ success: true }, { status: 201 });
}
