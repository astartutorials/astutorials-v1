"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";

export interface JobPosition {
    id: string;
    title: string;
    category: string;
    description: string;
    type: string;
    location: string;
}

export default function JobCard({ job }: { job: JobPosition }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group mb-4"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--astar-navy)] mb-3">
                        {job.title}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
                        {job.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600">
                            <MapPin size={14} />
                            {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600">
                            <Clock size={14} />
                            {job.type}
                        </span>
                    </div>
                </div>

                <Link
                    href="/careers/apply"
                    className="flex items-center gap-2 text-sm font-bold text-[var(--astar-navy)] group-hover:text-[var(--astar-red)] transition-colors mt-4 md:mt-2"
                >
                    Apply <ArrowUpRight size={18} />
                </Link>
            </div>
        </motion.div>
    );
}
