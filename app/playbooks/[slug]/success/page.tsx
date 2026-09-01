import { notFound } from "next/navigation";
import PlaybookSuccess from "@/components/playbooks/PlaybookSuccess";
import { PLAYBOOKS, getPlaybook } from "@/lib/playbooks";

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

// A confirmation page has nothing to offer a search engine and reaching it out
// of context is meaningless, so keep it out of the index.
export const metadata = { robots: { index: false, follow: false } };

export default async function PlaybookSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  return <PlaybookSuccess playbook={playbook} />;
}
