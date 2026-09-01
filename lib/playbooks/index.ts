import type { Playbook, PlaybookSlug } from "./types";
import { engineering } from "./engineering";
import { law } from "./law";
import { healthSciences } from "./health-sciences";

export type { Playbook, PlaybookSlug, PlaybookTopic, PlaybookSegment } from "./types";
export { isPlaybookOpen, playbookHref } from "./types";

/**
 * Every Playbook, in the order they run.
 *
 * Adding a fourth: write the config beside this file and append it here. The
 * route, the sitemap, the nav, the homepage band, the API and the admin console
 * all iterate this array, so nothing else needs touching.
 *
 * Anticipated but NOT scheduled: an EAH edition (Education, Arts & Humanities)
 * covering Mass Communication, Political Science and International Law &
 * Diplomacy. Three panellists are already identified — Michael (Political
 * Science, President of the Premier Council), MYLA (ILD, General Secretary of
 * BUSA) and a Mass Communication speaker still to be named. It is deliberately
 * absent from the array rather than added disabled: an entry here is a live
 * page, a nav item and a sitemap URL, and there is no date to put on it yet.
 */
export const PLAYBOOKS: Playbook[] = [healthSciences, law, engineering];

export const PLAYBOOK_SLUGS: PlaybookSlug[] = PLAYBOOKS.map((p) => p.slug);

const BY_SLUG = new Map<string, Playbook>(PLAYBOOKS.map((p) => [p.slug, p]));

/**
 * Look a playbook up by URL segment or by the `playbook` column on a
 * registration row. Returns undefined for anything unrecognised — the API route
 * relies on that to reject a made-up slug rather than writing it to the table.
 */
export function getPlaybook(slug: string): Playbook | undefined {
  return BY_SLUG.get(slug);
}
