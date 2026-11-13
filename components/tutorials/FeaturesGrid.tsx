import { CalendarClock, GraduationCap, MessagesSquare, Target } from "lucide-react";
import Words from "@/components/shared/Words";

/**
 * Why go private: four cards in the same style as How it works below them
 * (2026-11-13). Replaced generic cards with four different icon colours and
 * claims that weren't specific to A-Star ("Faster Progress").
 */
const features = [
    {
        icon: GraduationCap,
        title: "A tutor who did well in your course",
        description: "We match you with a student who excelled in the same course at Babcock and knows what your lecturer tests.",
    },
    {
        icon: Target,
        title: "Your weak spots first",
        description: "Spend the session on the topics you find hard, not the ones you already know.",
    },
    {
        icon: CalendarClock,
        title: "Around your timetable",
        description: "Sessions are set at times that suit you, including evenings and weekends, and agreed on WhatsApp.",
    },
    {
        icon: MessagesSquare,
        title: "Ask anything",
        description: "One-on-one, so you can stop and ask, get corrected on the spot, and leave knowing what to do next.",
    },
];

export default function FeaturesGrid() {
    return (
        <section className="max-w-6xl mx-auto px-4">
            <div className="max-w-2xl mb-8 md:mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-ink mb-3">Why go private</p>
                <h2 className="reveal-words text-3xl md:text-4xl font-bold tracking-tight text-fg">
                    <Words text="Built around one student: you." />
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {features.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="reveal flex flex-col rounded-3xl border border-line-subtle bg-surface-raised p-6">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
                            <Icon size={20} />
                        </span>
                        <h3 className="mt-5 text-lg font-bold leading-snug text-fg">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-fg-subtle">{description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
