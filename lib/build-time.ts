/**
 * When this build was made, identical in server and client bundles (set in
 * next.config.ts). The programme hooks use it as their server snapshot: a
 * programme that had already closed when the site was built is left out of
 * the static HTML, instead of being rendered and then removed in the browser
 * (which downloaded its flyer for nothing). One still open at build time is
 * rendered as before, and the visitor's clock takes over after hydration.
 *
 * Unset (tests, scripts): the epoch, which counts every programme as open,
 * the old behaviour.
 */
export const BUILD_TIME = new Date(Number(process.env.NEXT_PUBLIC_BUILD_TIME ?? 0));
