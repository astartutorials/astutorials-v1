/**
 * The default link-preview image: the new logo on the brand background,
 * 1200x630 (the size WhatsApp, X, LinkedIn and Slack expect). Pages with their
 * own flyer (TFA, BUCC) keep theirs.
 *
 * Next.js replaces, not merges, a page's `openGraph` / `twitter` metadata, so
 * any page that sets its own must include these images again or it previews
 * with no image at all.
 */
export const OG_IMAGE = {
  url: "/brand/og.png",
  width: 1200,
  height: 630,
  alt: "A-Star Tutorials",
};
