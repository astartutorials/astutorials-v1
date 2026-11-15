'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TutorialCard from '@/components/group-tutorials/TutorialCard';
import GroupBookingModal from '@/components/group-tutorials/GroupBookingModal';
import TutorialToggle from '@/components/tutorials/TutorialToggle';
import PricingSection from '@/components/tutorials/PricingSection';
import FeaturesGrid from '@/components/tutorials/FeaturesGrid';
import HowItWorks from '@/components/tutorials/HowItWorks';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDay, formatPrice } from '@/lib/format';
import posthog from '@/lib/analytics';

export type Tutorial = {
    id: string;
    code: string;
    title: string;
    teacher: string;
    description: string;
    date: string | null;
    time: string;
    location: string | null;
    seats_total: number;
    seats_booked: number;
    price: number;
    color_scheme: string;
    org_id: string | null;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

/**
 * The tutorials page, drawn from a list the server already fetched
 * (app/tutorials/page.tsx), so the cards are in the first HTML instead of
 * popping in after a browser-side fetch and shoving the footer down.
 */
function TutorialsView({ tutorials, initialType }: { tutorials: Tutorial[]; initialType: 'group' | 'private' }) {
    const [activeType, setActiveType] = useState<'group' | 'private'>(initialType);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

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
                        seatsLeft: selectedTutorial.seats_total - selectedTutorial.seats_booked,
                    }}
                    onClose={() => setSelectedTutorial(null)}
                />
            )}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10 md:pb-16 w-full">
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-4xl md:text-6xl font-bold text-fg mb-6 md:mb-8 tracking-tight">
                        Tutorials
                    </h1>
                    <div className="mb-6">
                        <TutorialToggle activeType={activeType} onTypeChange={setActiveType} />
                    </div>
                </div>

                {/* initial={false}: on first load the content is simply there, not
                    faded in after the JavaScript runs. Switching tabs still animates. */}
                <AnimatePresence mode="wait" initial={false}>
                    {activeType === 'group' ? (
                        <motion.div
                            key="group"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="w-full"
                        >
                            {tutorials.length > 0 ? (
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
                                                seatsTaken={t.seats_booked}
                                                price={formatPrice(t.price)}
                                                colorScheme={t.color_scheme}
                                                onBook={() => {
                                                    posthog.capture('group_booking_modal_opened', {
                                                        tutorial_id: t.id,
                                                        tutorial_code: t.code,
                                                        tutorial_title: t.title,
                                                        teacher: t.teacher,
                                                        price: t.price,
                                                        seats_left: t.seats_total - t.seats_booked,
                                                    });
                                                    setSelectedTutorial(t);
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center text-center py-20 px-4 bg-surface-raised rounded-3xl border border-line-subtle/50 shadow-sm"
                                >
                                    <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center mb-6">
                                        <Info className="w-8 h-8 text-brand-ink" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-fg mb-2">No Active Tutorials</h3>
                                    <p className="text-fg-subtle max-w-md">
                                        There are currently no group tutorials scheduled. Check back soon or book a private session.
                                    </p>
                                </motion.div>
                            )}
                            <div className="mt-16 md:mt-24">
                                <HowItWorks variant="group" />
                            </div>
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
                            <PricingSection orgId={tutorials[0]?.org_id ?? undefined} />
                            <FeaturesGrid />
                            <HowItWorks variant="private" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

/** Opens on the Private tab for /tutorials?type=private. */
function WithTypeFromUrl({ tutorials }: { tutorials: Tutorial[] }) {
    const type = useSearchParams().get('type') === 'private' ? 'private' : 'group';
    return <TutorialsView tutorials={tutorials} initialType={type} />;
}

export default function TutorialsClient({ tutorials }: { tutorials: Tutorial[] }) {
    // The fallback is the full Group view, so the page's first HTML already
    // has the tutorial cards in it, not an empty box.
    return (
        <Suspense fallback={<TutorialsView tutorials={tutorials} initialType="group" />}>
            <WithTypeFromUrl tutorials={tutorials} />
        </Suspense>
    );
}
