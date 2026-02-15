"use client";

import { motion } from "framer-motion";

interface JobFiltersProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function JobFilters({
    categories,
    activeCategory,
    onSelectCategory,
}: JobFiltersProps) {
    return (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                            ? "bg-[#335C98] text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
