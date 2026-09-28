import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StudentRegistrationForm from "@/components/register/StudentRegistrationForm";
import { INTAKE_LEVELS, intakeSlug, levelFromSlug } from "@/lib/intakes";

/**
 * One route per entry level, e.g. /register/100-level. The URL stays the same
 * every year — the intake registry decides which session a registration counts
 * toward — so links shared on WhatsApp and printed on flyers never go stale.
 */
export function generateStaticParams() {
  return INTAKE_LEVELS.map((level) => ({ level: intakeSlug(level) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const level = levelFromSlug((await params).level);
  if (!level) return {};

  const title = `${level} Level Registration`;
  const description = `New ${level} level student? Register with A-Star Tutorials so we can support you from your very first semester.`;
  return {
    title,
    description,
    alternates: { canonical: `/register/${intakeSlug(level)}` },
    openGraph: { title: `${title} | A-Star Tutorials`, description, type: "website" },
  };
}

export default async function RegisterPage({ params }: { params: Promise<{ level: string }> }) {
  const level = levelFromSlug((await params).level);
  if (!level) notFound();

  return <StudentRegistrationForm level={level} />;
}
