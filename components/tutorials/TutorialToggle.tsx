'use client';

import { motion } from 'framer-motion';

interface TutorialToggleProps {
  activeType: 'group' | 'private';
  onTypeChange: (type: 'group' | 'private') => void;
}

export default function TutorialToggle({ activeType, onTypeChange }: TutorialToggleProps) {
  return (
    <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200 relative shadow-inner">
      <div className="relative flex w-full h-full gap-1">
        {/* Group Button */}
        <button
          onClick={() => onTypeChange('group')}
          className={`relative z-10 px-8 sm:px-12 py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 ${
            activeType === 'group' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {activeType === 'group' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-full bg-[var(--astar-red)] shadow-lg shadow-red-200/50"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-20">Group Tutorials</span>
        </button>

        {/* Private Button */}
        <button
          onClick={() => onTypeChange('private')}
          className={`relative z-10 px-8 sm:px-12 py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 ${
            activeType === 'private' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {activeType === 'private' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-full bg-[var(--astar-red)] shadow-lg shadow-red-200/50"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-20">Private Tutorials</span>
        </button>
      </div>
    </div>
  );
}
