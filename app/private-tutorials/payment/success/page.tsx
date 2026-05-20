import SuccessPanel from "@/components/tutorials/payment/SuccessPanel";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full">
        <SuccessPanel />
      </div>
    </div>
  );
}
