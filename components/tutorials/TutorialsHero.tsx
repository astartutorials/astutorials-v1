"use client";

import { motion } from "framer-motion";

interface TutorialsHeroProps {
    activeTab: "group" | "private";
    onChangeTab: (tab: "group" | "private") => void;
}

export default function TutorialsHero({ activeTab, onChangeTab }: TutorialsHeroProps) {
    return (
        <section className="text-center pt-12 pb-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-[#335C98] mb-8"
            >
                Tutorials
            </motion.h1>

            <div className="flex justify-center mb-12">
                <div className="bg-[#E2E8F0] p-1 rounded-full inline-flex relative">
                    {/* Moving background pill */}
                    <motion.div
                        className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                        initial={false}
                        animate={{
                            x: activeTab === "group" ? 0 : "100%",
                            width: "50%"
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => onChangeTab("group")}
                        className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === "group" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Group Tutorials
                    </button>

                    <button
                        onClick={() => onChangeTab("private")}
                        className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === "private" ? "text-[var(--astar-red)]" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Private Tutorials
                    </button>
                </div>
            </div>
        </section>
    );
}
