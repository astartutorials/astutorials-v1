import { CheckCircle2, Info } from "lucide-react";

export default function OrderSummaryCard({
  service,
  duration,
  total,
  status,
  note,
  highlight,
}: {
  service: string;
  duration?: string;
  total: string;
  status?: "PAID" | "PENDING";
  note?: string;
  highlight?: "info" | "success";
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-widest text-gray-400">
          Service
        </div>
        <div className="mt-1 text-sm font-semibold text-gray-900">
          {service}
        </div>

        {duration && (
          <>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-gray-400">
              Duration
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-900">
              {duration}
            </div>
          </>
        )}

        <div className="my-4 border-t border-dashed border-gray-200" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {status === "PAID" ? "Total Paid" : "Total to pay"}
          </span>
          <span className="text-base font-semibold text-gray-900">{total}</span>
        </div>

        {status && (
          <div
            className={`mt-4 inline-flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
              status === "PAID"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={14} />
              Status
            </span>
            <span>{status}</span>
          </div>
        )}
      </div>

      {note && (
        <div
          className={`flex gap-3 rounded-xl px-4 py-3 text-xs leading-relaxed ${
            highlight === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
