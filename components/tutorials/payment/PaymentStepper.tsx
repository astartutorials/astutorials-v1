"use client";

import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  title: string;
  subtitle: string;
}

export default function PaymentStepper({
  steps,
  activeStep,
  completedSteps,
}: {
  steps: StepItem[];
  activeStep: number;
  completedSteps?: number[];
}) {
  const completed = new Set(completedSteps ?? []);

  return (
    <div className="space-y-6">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        const isDone = completed.has(step.id);

        return (
          <div key={step.id} className="flex items-start gap-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                isDone
                  ? "bg-emerald-600 text-white"
                  : isActive
                  ? "bg-[var(--astar-red)] text-white"
                  : "border border-gray-300 text-gray-400"
              }`}
            >
              {isDone ? <Check size={14} /> : step.id}
            </div>
            <div>
              <div
                className={`text-sm font-semibold ${
                  isActive ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-400">{step.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
