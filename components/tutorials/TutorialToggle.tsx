'use client';

import { motion } from 'framer-motion';

interface TutorialToggleProps {
  activeType: 'group' | 'private';
  onTypeChange: (type: 'group' | 'private') => void;
}

export default function TutorialToggle({ activeType, onTypeChange }: TutorialToggleProps) {
  return (
    <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200 relative">
      <div className="relative flex w-full h-full">
        {/* Sliding Background */}
        <motion.div
          className="absolute h-full rounded-full bg-[var(--astar-red)] shadow-lg shadow-red-200/50"
          initial={false}
          animate={{
            x: activeType === 'group' ? 0 : '100%',
            width: activeType === 'group' ? '50%' : '50%',
          }}
          transition={{
            type: "spring" as const,
            stiffness: 400,
            damping: 30
          }}
        />

        {/* Group Button */}
        <button
          onClick={() => onTypeChange('group')}
          className={`relative z-10 px-8 sm:px-12 py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 ${
            activeType === 'group' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Group Tutorials
        </button>

        {/* Private Button */}
        <button
          onClick={() => onTypeChange('private')}
          className={`relative z-10 px-8 sm:px-12 py-3 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 ${
            activeType === 'private' ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Private Tutorials
        </button>
      </div>
    </div>
  );
}
