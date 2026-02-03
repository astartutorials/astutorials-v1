'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TutorialCard from '@/components/TutorialCard';
import { Info } from 'lucide-react';

export default function TutorialsPage() {
    const tutorials = [
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
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 md:mb-6">Tutorials</h1>

                    {/* Toggle */}
                    <div className="inline-flex bg-gray-100 p-1 rounded-full mb-6 md:mb-8">
                        <button className="px-4 sm:px-6 py-2 rounded-full bg-white text-blue-900 font-bold shadow-sm text-xs sm:text-sm">
                            Group Tutorials
                        </button>
                        <button className="px-4 sm:px-6 py-2 rounded-full text-gray-500 font-medium text-xs sm:text-sm hover:text-gray-900 transition-colors">
                            Private Tutorials
                        </button>
                    </div>

                    {/* Info Banner */}
                    <div className="flex justify-center px-4">
                        <div className="bg-blue-50 text-blue-900 text-xs sm:text-sm font-medium py-3 px-4 sm:px-6 rounded-xl inline-flex items-center gap-2 max-w-2xl">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 flex-shrink-0" />
                            <span className="text-left">Group Sessions: Join fellow students for ₦1,000 per session. Secure your spot now.</span>
                        </div>
                    </div>
                </div>

                {/* Tutorials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
