'use client';

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import TutorialCard from '@/components/group-tutorials/TutorialCard';
import { Info } from 'lucide-react';

export default function TutorialsPage() {
    const tutorials = [
        // ... (tutorials array remains the same)
        {
            code: "COS 201",
            title: "Data Structures",
            teacher: "John Adeyemi",
            description: "Master arrays, linked lists, trees, and graphs with practical examples designed to crack interview questions.",
            day: "Thursdays",
            time: "8:00 PM",
            seatsTotal: 40,
            seatsRemaining: 13,
            price: "1k",
            colorScheme: "blue"
        },
        {
            code: "PHY 101",
            title: "General Physics",
            teacher: "David Eze",
            description: "Understand mechanics, waves, and thermodynamics with hands-on problem solving sessions.",
            day: "Wednesdays",
            time: "7:00 PM",
            seatsTotal: 40,
            seatsRemaining: 15,
            price: "1k",
            colorScheme: "orange"
        },
        {
            code: "STA 112",
            title: "Intro to Statistics",
            teacher: "Dr. Bala",
            description: "Probability theory, distributions, and hypothesis testing explained simply.",
            day: "Fridays",
            time: "4:00 PM",
            seatsTotal: 30,
            seatsRemaining: 20,
            price: "1.5k",
            colorScheme: "purple"
        },
        {
            code: "MTH 101",
            title: "Elementary Mathematics",
            teacher: "Sarah Okonkwo",
            description: "Build a strong foundation in calculus, algebra, and trigonometry. Perfect for freshmen engineering students.",
            day: "Mondays",
            time: "6:00 PM",
            seatsTotal: 40,
            seatsRemaining: 8,
            price: "1k",
            colorScheme: "pink"
        },
        {
            code: "CHM 101",
            title: "General Chemistry",
            teacher: "Grace Nwosu",
            description: "Learn atomic structure, bonding, and reactions with practical applications and lab prep.",
            day: "Tuesdays",
            time: "5:00 PM",
            seatsTotal: 40,
            seatsRemaining: 5,
            price: "1k",
            colorScheme: "green"
        },
        {
            code: "MTH 201",
            title: "Linear Algebra",
            teacher: "Prof. Okafor",
            description: "Matrices, vectors, and linear transformations.",
            day: "Saturdays",
            time: "10:00 AM",
            seatsTotal: 25,
            seatsRemaining: 10,
            price: "1.5k",
            colorScheme: "yellow"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 pt-32 md:pt-40 pb-12 md:pb-20">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-[var(--astar-blue)] mb-6 md:mb-8 font-space tracking-tight">Tutorials</h1>

                    {/* Toggle */}
                    <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-full mb-8 md:mb-10 border border-slate-200">
                        <button className="px-6 sm:px-10 py-3 rounded-full bg-[var(--astar-red)] text-white font-bold shadow-lg shadow-red-200/50 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95">
                            Group Tutorials
                        </button>
                        <button className="px-6 sm:px-10 py-3 rounded-full text-slate-500 font-medium text-xs sm:text-sm hover:text-slate-900 transition-colors">
                            Private Tutorials
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="flex justify-center px-4">
                        <div className="bg-white/80 backdrop-blur-sm border border-blue-100/50 text-slate-700 text-xs sm:text-sm font-medium py-4 px-6 sm:px-8 rounded-2xl inline-flex items-center gap-3 max-w-2xl shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--astar-blue)]" />
                            </div>
                            <span className="text-left leading-relaxed">Group Sessions: Join fellow students for <span className="text-[var(--astar-red)] font-bold">₦1,000</span> per session. Secure your spot now.</span>
                        </div>
                    </div>
                </div>

                {/* Tutorials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {tutorials.map((tutorial, index) => (
                        <TutorialCard
                            key={index}
                            code={tutorial.code}
                            title={tutorial.title}
                            teacher={tutorial.teacher}
                            description={tutorial.description}
                            day={tutorial.day}
                            time={tutorial.time}
                            seatsTotal={tutorial.seatsTotal}
                            seatsTaken={tutorial.seatsTotal - tutorial.seatsRemaining}
                            price={tutorial.price}
                            colorScheme={tutorial.colorScheme}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
