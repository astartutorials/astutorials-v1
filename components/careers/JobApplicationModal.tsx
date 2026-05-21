"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckCircle, AlertCircle, ArrowRight, MapPin, Clock } from "lucide-react";
import { JobPosition } from "./JobCard";
import posthog from "posthog-js";

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobPosition;
}

function BulletList({ text }: { text: string }) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    return (
        <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
            {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                    <span>{line}</span>
                </li>
            ))}
        </ul>
    );
}

export default function JobApplicationModal({ isOpen, onClose, job }: JobApplicationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
                        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#2d4a7c] to-[#3d5a8c] text-white px-6 sm:px-8 py-6 sm:py-8">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wide">
                                                {job.category}
                                            </span>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white transition-colors p-1 -mt-1 -mr-1"
                                            aria-label="Close modal"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">{job.title}</h2>
                                    <div className="flex flex-wrap gap-3 text-xs text-white/80">
                                        {job.location && (
                                            <span className="flex items-center gap-1.5"><MapPin size={13} />{job.location}</span>
                                        )}
                                        {job.type && (
                                            <span className="flex items-center gap-1.5"><Clock size={13} />{job.type}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 sm:px-8 py-6 sm:py-8 max-h-[60vh] overflow-y-auto space-y-8">
                                    {/* About the Role */}
                                    {job.description && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <FileText className="text-[var(--astar-red)]" size={20} />
                                                <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">About the Role</h3>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
                                        </section>
                                    )}

                                    {/* Key Responsibilities */}
                                    {job.responsibilities && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <CheckCircle className="text-[var(--astar-red)]" size={20} />
                                                <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">Key Responsibilities</h3>
                                            </div>
                                            <BulletList text={job.responsibilities} />
                                        </section>
                                    )}

                                    {/* Requirements */}
                                    {job.requirements && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <AlertCircle className="text-[var(--astar-red)]" size={20} />
                                                <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">Requirements</h3>
                                            </div>
                                            <BulletList text={job.requirements} />
                                        </section>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">
                                    {job.applicationLink ? (
                                        <a
                                            href={job.applicationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto px-6 py-2.5 bg-[var(--astar-red)] text-white font-semibold hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            onClick={() => posthog.capture("job_application_link_clicked", {
                                                job_title: job.title,
                                                job_category: job.category,
                                                job_location: job.location ?? null,
                                                job_type: job.type ?? null,
                                            })}
                                        >
                                            Apply Now <ArrowRight size={16} />
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400">Application link coming soon.</span>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
