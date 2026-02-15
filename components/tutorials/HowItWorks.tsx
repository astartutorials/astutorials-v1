"use client";

import { motion } from "framer-motion";

const steps = [
    {
        id: 1,
        title: "Submit Request",
        description: "Fill out a short form detailing your subject, preferred times, and academic goals.",
    },
    {
        id: 2,
        title: "Get Matched",
        description: "We assess your needs and pair you with an expert tutor who fits your profile perfectly.",
    },
    {
        id: 3,
        title: "Start Learning",
        description: "Begin your sessions, access resources, and track your progress with your tutor.",
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-[#EEF2FF] py-20 rounded-3xl mx-4 md:mx-8 mb-20">
            <div className="max-w-5xl mx-auto text-center px-4">
                <h2 className="text-3xl font-bold text-[var(--astar-navy)] mb-4">How It Works</h2>
                <p className="text-gray-600 mb-16">Three simple steps to start your private learning journey</p>

                <div className="relative">
                    {/* Connecting Line - Only visible on md+ screens */}
                    <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-0.5 bg-blue-100 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center text-3xl font-bold text-[#335C98] mb-6">
                                    {step.id}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--astar-navy)] mb-3">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
