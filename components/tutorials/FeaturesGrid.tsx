"use client";

import { motion } from "framer-motion";
import { GraduationCap, SlidersHorizontal, Calendar, TrendingUp } from "lucide-react";

const features = [
    {
        icon: GraduationCap,
        title: "Dedicated Tutor",
        description: "Work with a tutor selected specifically for your subject needs, ensuring specialized attention.",
        color: "bg-blue-50 text-blue-600",
    },
    {
        icon: SlidersHorizontal,
        title: "Personalized Learning",
        description: "We adapt to your learning style. Focus heavily on topics you find difficult and breeze through what you know.",
        color: "bg-red-50 text-red-600",
    },
    {
        icon: Calendar,
        title: "Flexible Schedule",
        description: "Book sessions at times that work best for you, including weekends and evenings, to fit your busy life.",
        color: "bg-purple-50 text-purple-600",
    },
    {
        icon: TrendingUp, // Using TrendingUp as a proxy for "Faster Progress"
        title: "Faster Progress",
        description: "Cover more ground in less time with direct feedback, immediate corrections, and goal-oriented lessons.",
        color: "bg-green-50 text-green-600",
    },
];

export default function FeaturesGrid() {
    return (
        <section className="max-w-6xl mx-auto px-4 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className={`p-3 rounded-full ${feature.color} shrink-0`}>
                            <feature.icon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--astar-navy)] mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
