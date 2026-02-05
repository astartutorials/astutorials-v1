'use client';

import { useState } from "react";
import { X, Calendar, Clock, DollarSign, Upload, Users, Eye } from "lucide-react";

interface CreateTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTutorialModal({ isOpen, onClose }: CreateTutorialModalProps) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Tutorial</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: General Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[var(--astar-red)]">
                  <span className="font-bold text-sm">i</span>
                </div>
                <h3 className="font-bold text-[var(--astar-red)] text-lg">General Info</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Course Code</label>
                  <input type="text" placeholder="e.g. MATH101" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tutorial Title</label>
                  <input type="text" placeholder="e.g. Adv Calculus" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Topics to be Covered</label>
                <textarea 
                  rows={6}
                  placeholder="List the main topics that will be discussed..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800 resize-none"
                />
                <div className="text-right text-xs text-gray-400">0/500 characters</div>
              </div>
            </div>

            {/* Upload Materials */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Upload Materials (Optional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[var(--astar-red)] hover:bg-red-50/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={20} className="text-gray-400 group-hover:text-[var(--astar-red)]" />
                </div>
                <p className="text-sm text-gray-500"><span className="text-[var(--astar-red)] font-bold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, PPTX up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Config */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[var(--astar-red)]">
                  <Calendar size={16} />
                </div>
                <h3 className="font-bold text-[var(--astar-red)] text-lg">Schedule & Capacity</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="date" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Time</label>
                   <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="time" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800" />
                  </div>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Available Slots</label>
                  <div className="relative">
                    <input type="number" placeholder="20" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">students</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Price per Student</label>
                   <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="number" placeholder="1000" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tutor Assignment</label>
                <div className="relative">
                   <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white appearance-none">
                      <option value="">Select a tutor...</option>
                      <option value="john">John Adeyemi</option>
                      <option value="sarah">Sarah Smith</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   <Eye size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">Visibility</h4>
                   <p className="text-xs text-gray-500">Tutorial will be visible to all students immediately.</p>
                 </div>
               </div>
               <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                  <input type="checkbox" id="toggle" className="peer absolute opacity-0 w-0 h-0" defaultChecked />
                  <label htmlFor="toggle" className="block w-12 h-7 bg-gray-300 rounded-full cursor-pointer peer-checked:bg-[#1E293B] transition-colors relative before:content-[''] before:absolute before:top-1 before:left-1 before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-5 shadow-inner"></label>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white z-10 px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
          <button className="px-6 py-3 rounded-lg bg-[var(--astar-red)] text-white font-bold text-sm shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all">
            Publish Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
