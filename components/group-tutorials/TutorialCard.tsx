'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import Tilt from "@/components/shared/fun/Tilt";

/** Up to this many seats, show a seat map; beyond it the squares get too small. */
const SEAT_MAP_MAX = 60;

interface TutorialCardProps {
    id: string;
    code: string;
    title: string;
    teacher: string;
    description: string;
    day: string;
    time: string;
    location?: string | null;
    seatsTaken: number;
    seatsTotal: number;
    price: string;
    colorScheme?: string;
    onBook: () => void;
}

function formatTime(time: string) {
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h)) return time;
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

const TutorialCard = ({
    code,
    title,
    teacher,
    description,
    day,
    time,
    location,
    seatsTaken,
    seatsTotal,
    price,
    colorScheme = 'blue',
    onBook,
}: TutorialCardProps) => {
    const seatsLeft = seatsTotal - seatsTaken;
    const fullyBooked = seatsLeft <= 0;
    const percentageTaken = Math.min((seatsTaken / seatsTotal) * 100, 100);

    let statusText = "SEATS REMAINING";
    let statusColor = "text-fg-subtle";

    if (fullyBooked) {
        statusText = "FULLY BOOKED";
        statusColor = "text-red-700 dark:text-red-300";
    } else if (percentageTaken >= 90) {
        statusText = "ALMOST FULL";
        statusColor = "text-red-600 dark:text-red-400";
    } else if (percentageTaken >= 75) {
        statusText = "HURRY! FILLING!";
        statusColor = "text-red-500";
    }

    // pastel backgrounds and borders
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-600 dark:text-blue-400' },
        orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-600 dark:text-orange-400' },
        green: { bg: 'bg-green-500/10', border: 'border-green-500/25', text: 'text-green-600 dark:text-green-400' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-600 dark:text-purple-400' },
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/25', text: 'text-pink-600 dark:text-pink-400' },
        yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', text: 'text-yellow-600 dark:text-yellow-400' },
        indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/25', text: 'text-indigo-600 dark:text-indigo-400' },
        teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/25', text: 'text-teal-600 dark:text-teal-400' },
        red: { bg: 'bg-brand-soft', border: 'border-brand-soft-border', text: 'text-red-600 dark:text-red-400' },
        cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', text: 'text-cyan-600 dark:text-cyan-400' },
    };

    const colors = colorMap[colorScheme] || colorMap.blue;

    return (
        <Tilt max={fullyBooked ? 0 : 6} className="h-full [&>div]:h-full">
        <div
            onClick={fullyBooked ? undefined : onBook}
            className={`group relative bg-surface-raised rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-line-subtle flex flex-col h-full transition-shadow ${fullyBooked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
        >
            {/* Course Code + Price */}
            <div className="flex items-center justify-between mb-2">
                <span className={`${colors.text} font-bold ${colors.bg} border ${colors.border} px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm`}>
                    {code}
                </span>
                <span className="text-sm md:text-base font-extrabold text-brand-ink">{price}</span>
            </div>

            {/* Title & Teacher */}
            <h3 className="text-lg md:text-xl font-bold text-fg mb-1">{title}</h3>
            <p className="text-fg-faint text-xs md:text-sm mb-3 md:mb-4">with {teacher}</p>

            {/* Description */}
            <p className="text-fg-subtle text-xs md:text-sm mb-4 md:mb-6 flex-grow leading-relaxed whitespace-pre-line">
                {description}
            </p>

            {/* Schedule */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 text-fg-muted text-xs md:text-sm">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-ink" />
                    <span>{day}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-fg-muted text-xs md:text-sm">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-ink" />
                    <span>{formatTime(time)}</span>
                </div>
                {location && (
                    <div className="flex items-center gap-2 md:gap-3 text-fg-muted text-xs md:text-sm">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-ink flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                )}
            </div>

            {/* Seats */}
            <div className="relative mb-4 md:mb-6">
                {!fullyBooked && seatsLeft <= 5 && (
                    <span className="absolute -top-7 right-0 font-hand text-lg font-bold text-[var(--astar-red)] rotate-[-6deg]">
                        only {seatsLeft} left!
                    </span>
                )}
                <div className="flex justify-between items-end mb-2">
                    <span className={`text-[10px] md:text-xs font-bold uppercase ${statusColor}`}>
                        {statusText}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-fg-muted">
                        {seatsTaken}/{seatsTotal}
                    </span>
                </div>
                {seatsTotal <= SEAT_MAP_MAX ? (
                    // A little classroom: one square per seat. On hover, the next
                    // free seat lights up as "yours".
                    <div className="flex flex-wrap gap-1" aria-hidden>
                        {Array.from({ length: seatsTotal }, (_, i) => {
                            const taken = i < seatsTaken;
                            const yours = !taken && i === seatsTaken;
                            return (
                                <span
                                    key={i}
                                    className={`h-2.5 w-2.5 rounded-[3px] transition-all duration-300 ${
                                        taken
                                            ? 'bg-red-600'
                                            : yours
                                            ? 'bg-surface-inset group-hover:bg-[var(--astar-navy)] dark:group-hover:bg-white group-hover:scale-125 group-hover:animate-pulse'
                                            : 'bg-surface-inset'
                                    }`}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="w-full bg-surface-inset h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${percentageTaken}%` }}
                        />
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className={`block w-full py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold text-center transition-all duration-300 ${fullyBooked ? 'bg-surface-inset text-fg-faint cursor-not-allowed' : 'bg-[var(--astar-red)] text-white hover:bg-brand-hover hover:shadow-lg hover:scale-105 active:scale-100'}`}>
                {fullyBooked ? 'Fully Booked' : 'Reserve Spot'}
            </div>
        </div>
        </Tilt>
    );
};

export default TutorialCard;
