'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookingNavbar from "@/components/group-booking/BookingNavbar";
import BookingSidebar from "@/components/group-booking/BookingSidebar";
import PersonalInfoForm from "@/components/group-booking/PersonalInfoForm";
import BookingDetails from "@/components/group-booking/BookingDetails";
import OrderSummary from "@/components/group-booking/OrderSummary";

import BookingSuccess from "@/components/group-booking/BookingSuccess";

export default function ConfirmBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-white">
      <BookingNavbar />
      
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-16">
          <div className="w-full lg:w-64 flex-shrink-0">
            <BookingSidebar currentStep={currentStep} />
          </div>

          {/* Main Content Area */}
          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Dynamic Form Area */}
            <div className="flex-grow overflow-hidden">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookingDetails onNext={() => setCurrentStep(2)} />
                  </motion.div>
                )}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PersonalInfoForm onNext={() => setCurrentStep(3)} />
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookingSuccess />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

     
            <div className="w-full lg:w-auto flex-shrink-0">
              <OrderSummary completed={currentStep === 3} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
