"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import JobCard, { type JobPosition } from "@/components/careers/JobCard";

/** The open positions, from a list the server already fetched (app/careers/page.tsx). */
export default function CareersList({ jobs }: { jobs: JobPosition[] }) {
    return (
        <motion.div layout className="flex flex-col gap-4">
            {/* initial={false}: on first load the cards are simply there, not
                faded in after the JavaScript runs. */}
            <AnimatePresence mode="popLayout" initial={false}>
                {jobs.length > 0 ? (
                    jobs.map((job) => <JobCard key={job.id} job={job} />)
                ) : (
                    <div className="text-center py-16 px-4">
                        <p className="text-fg-subtle mb-6">No open positions at the moment.</p>
                        <p className="text-fg-muted font-semibold mb-4">Interested in joining as a tutor?</p>
                        <Link
                            href="/apply"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--astar-red)] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all"
                        >
                            Apply Now <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
