"use client";

import { useState } from "react";
import CareersHero from "@/components/careers/CareersHero";
import JobCard, { JobPosition } from "@/components/careers/JobCard";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data matching the design
const JOBS: JobPosition[] = [
    {
        id: "1",
        title: "Math Tutor (High School Level)",
        category: "Tutoring",
        description: "We're seeking an experienced Math Tutor to help high school students master Algebra, Calculus, and Geometry concepts.",
        type: "Part-time",
        location: "100% Remote",
    },
    {
        id: "2",
        title: "Graphic Designer",
        category: "Marketing",
        description: "Join our creative team to design educational materials, social media assets, and marketing collateral that inspires learning.",
        type: "Full-time",
        location: "Hybrid",
    },
    {
        id: "3",
        title: "Academic Coordinator",
        category: "Operations",
        description: "We need an organized individual to manage tutor schedules, coordinate with parents, and ensure smooth operational flow.",
        type: "Full-time",
        location: "On-site",
    },
    {
        id: "4",
        title: "Physics Tutor",
        category: "Tutoring",
        description: "Passionate about Physics? Join us to teach mechanics, thermodynamics, and electromagnetism to eager learners.",
        type: "Contract",
        location: "100% Remote",
    },
];

const CATEGORIES = ["View all", "Tutoring", "Content Creation", "Admin", "Marketing", "Operations"];

export default function CareersPage() {
    const [activeCategory, setActiveCategory] = useState("View all");

    const filteredJobs = activeCategory === "View all"
        ? JOBS
        : JOBS.filter(job => job.category === activeCategory);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans pt-32 md:pt-40 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <CareersHero />


                <motion.div layout className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-gray-500 py-12"
                            >
                                No open positions in this category at the moment.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
