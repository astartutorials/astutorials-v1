'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';

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

const TutorialCard = ({
    id,
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
    let statusColor = "text-gray-500";

    if (fullyBooked) {
        statusText = "FULLY BOOKED";
        statusColor = "text-red-700";
    } else if (percentageTaken >= 90) {
        statusText = "ALMOST FULL";
        statusColor = "text-red-600";
    } else if (percentageTaken >= 75) {
        statusText = "HURRY! FILLING!";
        statusColor = "text-red-500";
    }

    // pastel backgrounds and borders
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
        green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
        pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
        teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600' },
        red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
        cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
    };

    const colors = colorMap[colorScheme] || colorMap.blue;

    return (
        <div
            onClick={fullyBooked ? undefined : onBook}
            className={`relative bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col h-full transition-shadow ${fullyBooked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}`}
        >
            {/* Course Code + Price */}
            <div className="flex items-center justify-between mb-2">
                <span className={`${colors.text} font-bold ${colors.bg} border ${colors.border} px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm`}>
                    {code}
                </span>
                <span className="text-sm md:text-base font-extrabold text-[var(--astar-red)]">{price}</span>
            </div>

            {/* Title & Teacher */}
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">with {teacher}</p>

            {/* Description */}
            <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6 flex-grow leading-relaxed">
                {description}
            </p>

            {/* Schedule */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 text-gray-600 text-xs md:text-sm">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-900" />
                    <span>{day}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-gray-600 text-xs md:text-sm">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-900" />
                    <span>{time}</span>
                </div>
                {location && (
                    <div className="flex items-center gap-2 md:gap-3 text-gray-600 text-xs md:text-sm">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-900 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                )}
            </div>

            {/* Seats */}
            <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className={`text-[10px] md:text-xs font-bold uppercase ${statusColor}`}>
                        {statusText}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-600">
                        {seatsTaken}/{seatsTotal}
                    </span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${percentageTaken}%` }}
                    />
                </div>
            </div>

            {/* CTA */}
            <div className={`block w-full py-2.5 md:py-3 rounded-xl border-2 text-sm md:text-base font-bold text-center transition-all duration-300 ${fullyBooked ? 'border-gray-200 text-gray-400 bg-gray-50' : 'border-slate-100 text-slate-700 hover:border-slate-300 hover:text-slate-900 hover:shadow-lg hover:scale-105 active:scale-100'}`}>
                {fullyBooked ? 'Fully Booked' : 'Reserve Spot'}
            </div>
        </div>
    );
};

export default TutorialCard;
