"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CareersHero from "@/components/careers/CareersHero";
import JobCard, { JobPosition } from "@/components/careers/JobCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CareersPage() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from("careers")
                .select("id, title, category, description, type, location, responsibilities, requirements, application_link")
                .eq("status", "active")
                .order("created_at", { ascending: false });
            setJobs(
                (data ?? []).map((d) => ({
                    ...d,
                    applicationLink: d.application_link,
                })) as JobPosition[]
            );
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans pt-24 md:pt-32 pb-14 px-4 md:px-8">
            <div className="max-w-5xl mx-auto w-full">
                <CareersHero />

                {loading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Loading positions...</span>
                    </div>
                ) : (
                    <motion.div layout className="flex flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16 px-4"
                                >
                                    <p className="text-gray-500 mb-6">No open positions at the moment.</p>
                                    <p className="text-gray-700 font-semibold mb-4">
                                        Interested in joining as a tutor?
                                    </p>
                                    <Link
                                        href="/apply"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--astar-red)] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all"
                                    >
                                        Apply Now <ArrowRight size={16} />
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
