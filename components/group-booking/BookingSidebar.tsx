'use client';

import { Check } from "lucide-react";

interface BookingSidebarProps {
  currentStep: number;
}

export default function BookingSidebar({ currentStep }: BookingSidebarProps) {
  const steps = [
    {
      id: 1,
      title: "Booking Details",
      subtitle: "Course selection",
    },
    {
      id: 2,
      title: "Personal Info",
      subtitle: "Student details",
    },
    {
      id: 3,
      title: "Payment",
      subtitle: "Secure checkout",
    }
  ];

  const getStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (

    <>
      {/* Desktop Vertical Sidebar */}
      <div className="hidden lg:flex flex-col gap-8 pr-12 border-r border-gray-100 min-h-[calc(100vh-80px)] pt-12">
        {steps.map((step, index) => {
          const status = getStatus(step.id);
          
          return (
            <div key={step.id} className="flex gap-4 relative">
              {/* Vertical line connector */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[15px] top-10 bottom-[-20px] w-[2px] bg-gray-100" />
              )}
              
              <div className="relative z-10">
                {status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <Check size={16} strokeWidth={3} />
                  </div>
                ) : status === 'current' ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--astar-red)] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-red-500/30">
                    {step.id}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">
                    {step.id}
                  </div>
                )}
              </div>
              
              <div className={`${status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                <h3 className={`font-bold text-sm ${status === 'current' ? 'text-gray-900' : (status === 'completed' ? 'text-green-600' : 'text-gray-400')}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Horizontal Sidebar */}
      <div className="lg:hidden w-full py-6 mb-6">
        <div className="flex items-center justify-between relative px-4">
          {/* Horizontal Line Background */}
          <div className="absolute left-6 right-6 top-[15px] h-[2px] bg-gray-100 -z-10" />

          {steps.map((step) => {
             const status = getStatus(step.id);
             return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className="relative z-10 bg-white p-1">
                  {status === 'completed' ? (
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : status === 'current' ? (
                    <div className="w-7 h-7 rounded-full bg-[var(--astar-red)] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-red-500/30">
                      {step.id}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                      {step.id}
                    </div>
                  )}
                </div>
              </div>
             );
          })}
        </div>
        
        {/* Active Step Label for Mobile */}
        <div className="text-center mt-3">
          <h3 className="font-bold text-gray-900 text-sm">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-xs text-gray-500">
            {steps[currentStep - 1].subtitle}
          </p>
        </div>
      </div>
    </>
  );
}
