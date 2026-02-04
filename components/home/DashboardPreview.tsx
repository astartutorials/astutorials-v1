
export default function DashboardPreview() {
  return (
    <div className="w-full px-4 md:px-6 mb-32">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-2xl md:rounded-[2.5rem] bg-orange-50/50 p-4 md:p-12 lg:p-16 border border-orange-100/50 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 bg-red-100/30 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200/50 bg-white">
             <img src="https://placehold.co/2400x1350/fafafa/e5e5e5/png?text=Student+Dashboard+Platform" alt="Platform Dashboard" className="w-full h-auto object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
