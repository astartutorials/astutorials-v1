import PaymentShell from "@/components/tutorials/payment/PaymentShell";
import PaymentStepper, {
  StepItem,
} from "@/components/tutorials/payment/PaymentStepper";
import SuccessPanel from "@/components/tutorials/payment/SuccessPanel";
import { CheckCircle2, Info } from "lucide-react";

const steps: StepItem[] = [
  { id: 1, title: "Booking Details", subtitle: "Course selection" },
  { id: 2, title: "Personal Info", subtitle: "Student details" },
  { id: 3, title: "Payment", subtitle: "Secure checkout" },
];

export default function SuccessPage() {
  return (
    <PaymentShell
      sidebar={
        <PaymentStepper steps={steps} activeStep={3} completedSteps={[1, 2, 3]} />
      }
      summary={
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-gray-400">
              Course
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              COS 201 — Data Structures
            </div>

            <div className="mt-4 text-[11px] uppercase tracking-widest text-gray-400">
              Tutor
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              John Adeyemi
            </div>

            <div className="mt-4 text-[11px] uppercase tracking-widest text-gray-400">
              Schedule
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              Thursday, 8:00 PM
            </div>

            <div className="my-4 border-t border-dashed border-gray-200" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Paid</span>
              <span className="text-base font-semibold text-gray-900">
                NGN 1,000
              </span>
            </div>

            <div className="mt-4 inline-flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={14} />
                Status
              </span>
              <span>PAID</span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              By proceeding, you agree to our Terms of Service and Privacy
              Policy regarding student data.
            </span>
          </div>
        </div>
      }
    >
      <SuccessPanel />
    </PaymentShell>
  );
}
