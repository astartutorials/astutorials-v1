"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Users, Play } from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="w-full px-2 md:px-6 mb-24">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl md:rounded-[2.5rem] bg-orange-50/50 p-6 md:p-12 lg:p-16 border border-orange-100/50 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-2/3 bg-red-100/30 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 rounded-2xl md:rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200/50 bg-white">
             {/* Main Preview Image */}
             <img src="/images/dashboard-preview.png" alt="A-Star Student Collaboration" className="w-full h-auto object-cover" loading="lazy" />

             {/* Floating UI Badges */}
             
             {/* Assignment Badge */}
             <motion.div 
               initial={{ opacity: 0, y: 10, x: -10 }}
               whileInView={{ opacity: 1, y: 0, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="absolute top-3 left-3 md:top-12 md:left-12 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 z-20"
             >
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                 <CheckCircle2 className="w-5 h-5 text-red-600" />
               </div>
               <div>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Assignment</p>
                 <p className="text-sm font-semibold text-gray-900 leading-tight">Physics 101 Notes Uploaded</p>
               </div>
             </motion.div>

             {/* Live Session Badge */}
             <motion.div 
               initial={{ opacity: 0, y: -10, x: 10 }}
               whileInView={{ opacity: 1, y: 0, x: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="absolute bottom-3 right-3 md:bottom-12 md:right-12 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 z-20"
             >
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               </div>
               <div>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Live Now</p>
                 <p className="text-sm font-semibold text-gray-900 leading-tight">CSC 201 Group Revision</p>
               </div>
             </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
