"use client";

import { motion } from "framer-motion";

export default function CareersHero() {
    return (
        <section className="text-center max-w-2xl mx-auto mb-12">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="inline-block px-4 py-1.5 rounded-full border border-[var(--astar-red)] text-[var(--astar-red)] text-sm font-medium mb-6">
                    We are hiring!
                </span>

                <h1 className="text-4xl md:text-5xl font-bold text-[var(--astar-navy)] mb-6 tracking-tight">
                    Be part of our mission
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed">
                    Join us in building a supportive and inspiring learning community.
                </p>
            </motion.div>
        </section>
    );
}
