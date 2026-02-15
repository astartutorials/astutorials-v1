'use client';

import { Calendar } from "lucide-react";

interface BookingDetailsProps {
  onNext: () => void;
}

export default function BookingDetails({ onNext }: BookingDetailsProps) {
  return (
    <div className="w-full max-w-2xl pt-8 lg:pt-12 px-0 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Confirm Your Booking</h1>
        <p className="text-gray-500">Please review the tutorial details below.</p>
      </div>

      <div className="space-y-10">
        {/* Course Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Course</h3>
          <p className="text-2xl font-medium text-gray-900">COS 201 — Data Structures</p>
        </div>

        {/* Tutor Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tutor</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm">
              JA
            </div>
            <span className="text-xl font-medium text-gray-900">John Adeyemi</span>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Schedule</h3>
          <div className="flex items-center gap-3 text-gray-900">
            <Calendar className="w-6 h-6 text-gray-800" />
            <span className="text-xl font-medium">Thursdays, 8:00 PM</span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-8">
          <button 
            onClick={onNext}
            className="px-10 py-4 rounded-full bg-[var(--astar-red)] text-white font-bold text-lg shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all"
          >
            Continue to Information
          </button>
        </div>
      </div>
    </div>
  );
}
