"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingSection() {
    return (
        <section className="text-center max-w-3xl mx-auto mb-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--astar-navy)] mb-6">
                    Tailored One-on-One Excellence
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Accelerate your academic journey with a dedicated tutor. Focus on
                    specific problem areas or advance at your own speed with a
                    curriculum designed just for you.
                </p>

                <div className="flex items-baseline justify-center gap-2 mb-8">
                    <span className="text-4xl md:text-5xl font-bold text-[#335C98]">₦5,000</span>
                    <span className="text-gray-500 text-lg">/ session</span>
                </div>

                <Link
                    href="https://wa.me/2349160465678?text=Hello,%20I%20am%20interested%20in%20requesting%20a%20private%20tutorial."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--astar-red)] text-white px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    Request Private Tutorial <ArrowRight size={20} />
                </Link>
            </motion.div>
        </section>
    );
}
