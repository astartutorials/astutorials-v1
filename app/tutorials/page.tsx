'use client';

import { useState, useEffect } from 'react';
import TutorialCard from '@/components/group-tutorials/TutorialCard';
import GroupBookingModal from '@/components/group-tutorials/GroupBookingModal';
import TutorialToggle from '@/components/tutorials/TutorialToggle';
import PricingSection from '@/components/tutorials/PricingSection';
import FeaturesGrid from '@/components/tutorials/FeaturesGrid';
import HowItWorks from '@/components/tutorials/HowItWorks';
import { Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatDay, formatPrice } from '@/lib/format';

type Tutorial = {
    id: string;
    code: string;
    title: string;
    teacher: string;
    description: string;
    date: string | null;
    time: string;
    location: string | null;
    seats_total: number;
    price: number;
    color_scheme: string;
    bookings: { id: string }[];
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function TutorialsPage() {
    const [activeType, setActiveType] = useState<'group' | 'private'>('group');
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('tutorials')
                .select('id, code, title, teacher, description, date, time, location, seats_total, price, color_scheme, bookings(id)')
                .eq('status', 'active')
                .order('date', { ascending: true });
            setTutorials((data as Tutorial[]) ?? []);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
            {selectedTutorial && (
                <GroupBookingModal
                    tutorial={{
                        id: selectedTutorial.id,
                        code: selectedTutorial.code,
                        title: selectedTutorial.title,
                        teacher: selectedTutorial.teacher,
                        day: formatDay(selectedTutorial.date),
                        time: selectedTutorial.time,
                        location: selectedTutorial.location,
                        price: selectedTutorial.price,
                        seatsLeft: selectedTutorial.seats_total - (selectedTutorial.bookings?.length ?? 0),
                    }}
                    onClose={() => setSelectedTutorial(null)}
                />
            )}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10 md:pb-16 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 md:mb-10"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-[var(--astar-navy)] mb-6 md:mb-8 tracking-tight">
                        Tutorials
                    </h1>
                    <div className="mb-6">
                        <TutorialToggle activeType={activeType} onTypeChange={setActiveType} />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeType === 'group' ? (
                        <motion.div
                            key="group"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="w-full"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-sm">Loading tutorials...</span>
                                </div>
                            ) : tutorials.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                                    {tutorials.map((t) => (
                                        <motion.div key={t.id} variants={itemVariants}>
                                            <TutorialCard
                                                id={t.id}
                                                code={t.code}
                                                title={t.title}
                                                teacher={t.teacher}
                                                description={t.description ?? ''}
                                                day={formatDay(t.date)}
                                                time={t.time}
                                                location={t.location}
                                                seatsTotal={t.seats_total}
                                                seatsTaken={t.bookings?.length ?? 0}
                                                price={formatPrice(t.price)}
                                                colorScheme={t.color_scheme}
                                                onBook={() => setSelectedTutorial(t)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-3xl border border-gray-100/50 shadow-sm"
                                >
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                        <Info className="w-8 h-8 text-[var(--astar-red)]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Tutorials</h3>
                                    <p className="text-gray-500 max-w-md">
                                        There are currently no group tutorials scheduled. Check back soon or book a private session.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="private"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-10 md:space-y-14"
                        >
                            <PricingSection />
                            <FeaturesGrid />
                            <HowItWorks />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
