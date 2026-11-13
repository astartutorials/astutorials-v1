/** The balance is looked up on each visit; hold the card's shape while it loads. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16" aria-busy="true">
      <div className="bg-surface-raised rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-pulse">
        <div className="bg-[var(--astar-red)]/80 px-8 py-6">
          <div className="h-3 w-32 rounded bg-white/40" />
          <div className="mt-3 h-6 w-56 rounded bg-white/50" />
        </div>
        <div className="px-8 py-7 space-y-4">
          <div className="h-4 w-3/4 rounded bg-surface-sunken" />
          <div className="h-4 w-1/2 rounded bg-surface-sunken" />
          <div className="h-24 rounded-xl bg-surface-sunken" />
          <div className="h-12 rounded-xl bg-surface-sunken" />
        </div>
        <span className="sr-only">Loading your payment…</span>
      </div>
    </div>
  );
}
