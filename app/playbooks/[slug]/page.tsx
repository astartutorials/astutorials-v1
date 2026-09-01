import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlaybookLanding from "@/components/playbooks/PlaybookLanding";
import { PLAYBOOKS, getPlaybook } from "@/lib/playbooks";

/**
 * One route for the whole Playbook series. Adding a fourth webinar is a config
 * file in lib/playbooks and nothing here.
 */
export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

// Anything not in the registry is a 404 rather than a rendered empty page.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) return {};

  const url = `https://astartutorials.com/playbooks/${playbook.slug}`;
  const title = `${playbook.name} — ${playbook.tagline}`;

  return {
    title,
    description: playbook.metaDescription,
    alternates: { canonical: `/playbooks/${playbook.slug}` },
    openGraph: {
      title: `${playbook.name} | A-Star Tutorials`,
      description: playbook.ogDescription,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${playbook.name} | A-Star Tutorials`,
      description: playbook.ogDescription,
    },
  };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  return <PlaybookLanding playbook={playbook} />;
}
