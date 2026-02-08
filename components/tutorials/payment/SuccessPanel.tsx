import { Check } from "lucide-react";

export default function SuccessPanel() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-[var(--astar-red)]">
        <Check size={26} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">
        Request Submitted!
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Your private tutorial request has been received. Our team will match
        you with a tutor and contact you within 24 hours.
      </p>
      <p className="mt-4 text-xs text-gray-400">
        A confirmation email has been sent to <br />
        <span className="font-semibold text-gray-600">
          offer919@gmail.com
        </span>
      </p>
      <button className="mt-8 rounded-lg bg-[var(--astar-red)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
        Done
      </button>
    </div>
  );
}
