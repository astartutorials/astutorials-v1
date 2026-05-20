'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import BookingNavbar from "@/components/group-booking/BookingNavbar";
import BookingSidebar from "@/components/group-booking/BookingSidebar";
import BookingDetails from "@/components/group-booking/BookingDetails";
import PersonalInfoForm from "@/components/group-booking/PersonalInfoForm";
import OrderSummary from "@/components/group-booking/OrderSummary";
import { supabase } from "@/lib/supabase";

export type Tutorial = {
  id: string;
  code: string;
  title: string;
  teacher: string;
  date: string | null;
  time: string;
  price: number;
};

function ConfirmBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push("/tutorials"); return; }
    supabase
      .from("tutorials")
      .select("id, code, title, teacher, date, time, price")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) { router.push("/tutorials"); return; }
        setTutorial(data as Tutorial);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center gap-2 text-gray-400">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Loading tutorial details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--astar-bg)]">
      <BookingNavbar />
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-16">
          <div className="w-full lg:w-64 flex-shrink-0">
            <BookingSidebar currentStep={currentStep} />
          </div>

          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16">
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
                    <BookingDetails tutorial={tutorial} onNext={() => setCurrentStep(2)} />
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
                    <PersonalInfoForm tutorial={tutorial} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full lg:w-auto flex-shrink-0">
              <OrderSummary tutorial={tutorial} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center gap-2 text-gray-400">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Loading tutorial details...</span>
      </div>
    }>
      <ConfirmBookingContent />
    </Suspense>
  );
}
