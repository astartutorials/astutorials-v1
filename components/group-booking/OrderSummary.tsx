'use client';

'use client';

import { Calendar, User, Info, Lock } from "lucide-react";

interface OrderSummaryProps {
  completed?: boolean;
}

export default function OrderSummary({ completed = false }: OrderSummaryProps) {
  if (completed) {
    return (
      <div className="w-full lg:w-96 pt-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-gray-900">₦1,000</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Service Fee</span>
              <span className="font-bold text-gray-900">₦0.00</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Discount</span>
              <span className="font-bold text-green-500">-₦0.00</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-bold text-lg">Total Paid</span>
              <span className="text-2xl font-bold text-[var(--astar-red)]">₦1,000</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Payment Secure & Verified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-96 pt-12">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="space-y-6">
          <div className="pb-6 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course</p>
            <h3 className="font-bold text-gray-900 text-lg">COS 201 — Data Structures</h3>
          </div>
          
          <div className="pb-6 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tutor</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">J</div>
              <span className="font-medium text-gray-700">John Adeyemi</span>
            </div>
          </div>
          
          <div className="pb-6 border-b border-dashed border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Schedule</p>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Calendar size={16} className="text-gray-400" />
              Thursdays, 8:00 PM
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-500 font-medium">Total to pay</span>
            <span className="text-2xl font-bold text-[var(--astar-red)]">₦1,000</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          By proceeding, you agree to our Terms of Service and Privacy Policy regarding student data.
        </p>
      </div>
    </div>
  );
}
