import { CheckCircle } from "lucide-react";
import Link from "next/link";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=2349160465678&text=Hello%2C+I+am+interested+in+requesting+a+private+tutorial.&type=phone_number&app_absent=0";

export default function SuccessPanel() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Received!</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 leading-relaxed">
        Your payment was successful. Chat with us on WhatsApp to schedule your private tutorial session.
      </p>
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all"
      >
        Open WhatsApp
      </Link>
    </div>
  );
}
