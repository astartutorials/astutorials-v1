'use client';

import { Search, Plus, Bell, ChevronRight, Calculator, FlaskConical, Gavel, Scale, TrendingUp, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const tutorials = [

  {
    id: 1,
    code: "CS-101",
    sub: "Lab A",
    title: "Introduction to Algorithms",
    date: "Oct 26, 2023",
    time: "10:00 AM",
    status: "Scheduled",
    statusColor: "bg-green-100 text-green-700",
    icon: Calculator,
    iconColor: "bg-blue-100 text-blue-600"
  },
  {
    id: 2,
    code: "MATH-202",
    sub: "Hall B",
    title: "Linear Algebra II",
    date: "Oct 26, 2023",
    time: "02:00 PM",
    status: "Scheduled",
    statusColor: "bg-green-100 text-green-700",
    icon: Calculator,
    iconColor: "bg-purple-100 text-purple-600"
  },
  {
    id: 3,
    code: "PHY-101",
    sub: "Lab C",
    title: "Classical Mechanics",
    date: "Oct 27, 2023",
    time: "09:00 AM",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-700",
    icon: FlaskConical,
    iconColor: "bg-orange-100 text-orange-600"
  },
  {
    id: 4,
    code: "HIS-200",
    sub: "Room 304",
    title: "Modern European History",
    date: "Oct 25, 2023",
    time: "11:30 AM",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-700",
    icon: Scale,
    iconColor: "bg-teal-100 text-teal-600"
  },
  {
    id: 5,
    code: "BUS-305",
    sub: "Hall A",
    title: "Corporate Finance",
    date: "Oct 25, 2023",
    time: "03:00 PM",
    status: "Completed",
    statusColor: "bg-gray-100 text-gray-700",
    icon: Building2,
    iconColor: "bg-indigo-100 text-indigo-600"
  }
];

export default function AdminTutorialsPage() {
  const router = useRouter();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-startGap-4 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Tutorial Management</h1>
          <p className="text-gray-500 text-sm md:text-base">View scheduled tutorials and manage student attendance records.</p>
        </div>
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-sm">
            AD
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search course code, title..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>
        
        <button 
          onClick={() => router.push('/admin/create-tutorial')}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--astar-red)] text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all w-full md:w-auto"
        >
          <Plus size={20} />
          Schedule Tutorial
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2">Course Code</div>
              <div className="col-span-4">Tutorial Title</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Attendance</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
              {tutorials.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => router.push(`/admin/tutorials/${item.id}`)}
                  className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  
                  {/* Course Code */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconColor}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.code}</h4>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="col-span-4">
                    <span className="font-semibold text-gray-700 text-sm">{item.title}</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-gray-600 font-medium">
                    {item.date}
                  </div>

                  {/* Time */}
                  <div className="col-span-2 text-sm text-gray-600 font-medium">
                    {item.time}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Attendance arrow */}
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
           <span>Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">5</span> of <span className="font-bold text-gray-900">24</span> sessions</span>
           <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 transition-colors">Previous</button>
             <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors">Next</button>
           </div>
        </div>
      </div>


    </div>
  );
}
