'use client';

import { Calendar, Clock, DollarSign, Upload, Eye, Bell } from "lucide-react";

export default function CreateTutorialPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create New Tutorial</h1>
          <p className="text-gray-500">Set up a new group session for students.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-sm">
            AD
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: General Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  i
                </div>
                <h3 className="font-bold text-red-600 text-lg">General Info</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Course Code</label>
                  <input type="text" placeholder="e.g. MATH101" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-800 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Tutorial Title</label>
                  <input type="text" placeholder="e.g. Advanced Calculus Review" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-800 text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Topics to be Covered</label>
                <textarea 
                  rows={8}
                  placeholder="List the main topics that will be discussed in this session..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-800 resize-none text-sm"
                />
                <div className="text-right text-[10px] text-gray-400 font-medium">0/500 characters</div>
              </div>
            </div>

            {/* Upload Materials */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Upload Materials (Optional)</label>
              <div className="border border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-center hover:border-[var(--astar-red)] hover:bg-red-50/10 transition-colors cursor-pointer group bg-gray-50/30">
                <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center mb-2 group-hover:bg-[var(--astar-red)] transition-colors">
                  <Upload size={18} />
                </div>
                <p className="text-xs text-gray-500 font-medium">Drag & drop files or <span className="text-[var(--astar-red)]">browse</span></p>
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Capacity */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-6 h-6 rounded-md flex items-center justify-center text-red-600">
                  <Calendar size={20} />
                </div>
                <h3 className="font-bold text-red-600 text-lg">Schedule & Capacity</h3>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Date</label>
                  <div className="relative group">
                    <Calendar 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--astar-red)] transition-colors cursor-pointer" 
                      size={16} 
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) input.showPicker();
                      }}
                    />
                    <input 
                      type="date" 
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer" 
                      onClick={(e) => e.currentTarget.showPicker()}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Time</label>
                   <div className="relative group">
                    <Clock 
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--astar-red)] transition-colors cursor-pointer" 
                      size={16} 
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) input.showPicker();
                      }}
                    />
                    <input 
                      type="time" 
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer" 
                      onClick={(e) => e.currentTarget.showPicker()}
                    />
                  </div>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Available Slots</label>
                  <div className="relative">
                    <input type="number" placeholder="20" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">students</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">Price per Student</label>
                   <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">₦</span>
                    <input type="number" placeholder="1000" className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Tutor Assignment</label>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="Enter tutor name..." 
                     className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-800 text-sm" 
                   />
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-blue-50/50 rounded-xl p-5 flex items-center justify-between border border-blue-100">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                   <Eye size={16} />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">Visibility</h4>
                   <p className="text-[10px] text-gray-500">Tutorial will be visible to all students immediately.</p>
                 </div>
               </div>
               <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input type="checkbox" id="toggle" className="peer absolute opacity-0 w-0 h-0" defaultChecked />
                  <label htmlFor="toggle" className="block w-12 h-7 bg-[#1E293B] rounded-full cursor-pointer transition-colors relative before:content-[''] before:absolute before:top-1 before:left-1 before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-5 shadow-inner"></label>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-12 pt-6 border-t border-gray-50">
          <button className="px-8 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
           Draft
          </button>
          <button className="px-8 py-3.5 rounded-xl bg-[#C1121F] text-white font-bold text-sm shadow-xl shadow-red-500/10 hover:shadow-red-500/20 transition-all">
            Publish 
          </button>
        </div>
      </div>
    </div>
  );
}
