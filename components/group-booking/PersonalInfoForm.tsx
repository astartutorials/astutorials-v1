'use client';

import { Lock } from "lucide-react";

interface PersonalInfoFormProps {
  onNext?: () => void;
}

export default function PersonalInfoForm({ onNext }: PersonalInfoFormProps) {
  return (
    <div className="w-full max-w-2xl pt-8 lg:pt-12 px-0 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Student Information</h1>
        <p className="text-gray-500">Please fill in the details of the student attending the tutorial.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if(onNext) onNext(); }}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <input 
              type="email" 
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Course of Study</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Student ID</label>
            <input 
              type="text" 
              placeholder="e.g. 19/1234"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
        </div>

        <div className="pt-8">
          <button 
            type="submit" 
            className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 flex items-center justify-center gap-2"
          >
            Pay via Paystack
            <Lock size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
