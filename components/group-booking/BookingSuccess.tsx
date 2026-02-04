'use client';

import { Check, Video } from "lucide-react";
import Link from "next/link";

export default function BookingSuccess() {
  return (
    <div className="w-full max-w-2xl pt-8 lg:pt-12 px-0 lg:px-8 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
          <Check size={24} strokeWidth={4} />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Successful!</h1>
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
        Your session for <span className="font-bold text-gray-900">COS 201 — Data Structures</span> has been confirmed. 
        A receipt and confirmation details have been sent to your email.
      </p>

      {/* Session Details Card */}
      <div className="w-full bg-gray-50 rounded-xl p-8 mb-10 text-left border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Session Details</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Tutor</span>
            <span className="text-gray-900 font-bold">John Adeyemi</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Date</span>
            <span className="text-gray-900 font-bold">Thursday, Oct 24, 2023</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Time</span>
            <span className="text-gray-900 font-bold">8:00 PM - 10:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Platform</span>
            <div className="flex items-center gap-2 text-gray-900 font-bold">
              <Video size={16} />
              Google Meet
            </div>
          </div>
        </div>
      </div>

      <Link 
        href="/dashboard" 
        className="px-12 py-4 rounded-xl btn-primary shadow-xl shadow-red-500/20 font-bold text-lg hover:-translate-y-0.5 transition-all"
      >
        Join our Group
      </Link>
    </div>
  );
}
