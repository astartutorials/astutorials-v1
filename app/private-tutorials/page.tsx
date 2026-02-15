"use client";

import { useState } from "react";
import TutorialsHero from "@/components/tutorials/TutorialsHero";
import PricingSection from "@/components/tutorials/PricingSection";
import FeaturesGrid from "@/components/tutorials/FeaturesGrid";
import HowItWorks from "@/components/tutorials/HowItWorks";
import { motion, AnimatePresence } from "framer-motion";

export default function TutorialsPage() {
    const [activeTab, setActiveTab] = useState<"group" | "private">("private");

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans pt-24 md:pt-32 pb-20">
            <TutorialsHero activeTab={activeTab} onChangeTab={setActiveTab} />

            <AnimatePresence mode="wait">
                {activeTab === "private" ? (
                    <motion.div
                        key="private"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <PricingSection />
                        <FeaturesGrid />
                        <HowItWorks />
                    </motion.div>
                ) : (
                    <motion.div
                        key="group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-20"
                    >
                        <h2 className="text-2xl font-bold text-gray-400 mb-4">Group Tutorials</h2>
                        <p className="text-gray-500">Coming soon! Stay tuned for collaborative learning opportunities.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
