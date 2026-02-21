"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, FileText, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { JobPosition } from "./JobCard";

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobPosition;
}

export default function JobApplicationModal({ isOpen, onClose, job }: JobApplicationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
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
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{job.title}</h2>
                                </div>

                                {/* Content */}
                                <div className="px-6 sm:px-8 py-6 sm:py-8 max-h-[60vh] overflow-y-auto">
                                    {/* About the Role */}
                                    <section className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="text-[var(--astar-red)]" size={20} />
                                            <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">About the Role</h3>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                            As a Senior Frontend Developer at A-Star, you will be responsible for architecting and building the client-side
                                            of our web applications. You will work closely with our product and design teams to translate
                                            requirements into high-quality, responsive, and interactive user experiences. We value clean code,
                                            performance, and accessibility.
                                        </p>
                                    </section>

                                    {/* Key Responsibilities */}
                                    <section className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle className="text-[var(--astar-red)]" size={20} />
                                            <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">Key Responsibilities</h3>
                                        </div>
                                        <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Develop new user-facing features using React.js and Tailwind CSS.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Build reusable code and libraries for future use.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Optimize applications for maximum speed and scalability.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Collaborate with backend developers and designers to improve usability.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Participate in code reviews and mentor junior developers.</span>
                                            </li>
                                        </ul>
                                    </section>

                                    {/* Requirements */}
                                    <section className="mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertCircle className="text-[var(--astar-red)]" size={20} />
                                            <h3 className="text-lg sm:text-xl font-bold text-[var(--astar-navy)]">Requirements</h3>
                                        </div>
                                        <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>5+ years of experience in frontend development.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Thorough understanding of React.js and its core principles.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Experience with popular React.js workflows (such as Flux or Redux).</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--astar-red)] flex-shrink-0" />
                                                <span>Familiarity with RESTful APIs and modern frontend build pipelines and tools.</span>
                                            </li>
                                        </ul>
                                    </section>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            // Replace with your actual Google Form URL
                                            window.open("https://forms.gle.com/your-form-url", "_blank");
                                        }}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-[var(--astar-red)] text-white font-semibold hover:bg-[#c8102e] rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        Apply
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
