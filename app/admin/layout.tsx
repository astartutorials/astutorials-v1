/**
 * The admin dashboard is deliberately light-only — dark mode ships on the
 * public site. `theme-light` re-declares the light tokens for this subtree, so
 * a visitor who has chosen dark on the public site does not drag a half-themed
 * palette into /admin, where the components still use literal light colours.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-light min-h-screen bg-astar-bg text-fg">{children}</div>
  );
}
