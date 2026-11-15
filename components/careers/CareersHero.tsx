export default function CareersHero() {
    return (
        <section className="text-center max-w-2xl mx-auto mb-8">
            {/* CSS fade (.hero-in), not framer-motion: visible on first paint. */}
            <div className="hero-in">
                <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--astar-red)] text-brand-ink text-sm font-medium mb-6">
                    We are hiring!
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-fg mb-6 tracking-tight">
                    Be part of our mission
                </h1>

                <p className="text-fg-muted text-lg leading-relaxed">
                    Join us in building a supportive and inspiring learning community.
                </p>
            </div>
        </section>
    );
}
