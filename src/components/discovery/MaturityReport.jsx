'use client';

import { ExternalLink, FileText, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaturityReport({ data, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}
    >
      <div className="p-5">
        {/* Status */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#30D5C8] shadow-[0_0_8px_rgba(48,213,200,0.6)]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#30D5C8]">
            Analysis Ready
          </span>
        </div>

        <h3 className={`font-serif text-xl mb-1 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
          {data.processName}
        </h3>
        <p className={`text-xs font-mono mb-5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Overall maturity&nbsp;&nbsp;
          <span className="text-[#F5A623] font-semibold">{data.overallMaturity?.toFixed(1)} / 5.0</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open('/analysis', '_blank', 'noopener')}
            className="w-full py-3 bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/15 cursor-pointer"
          >
            <FileText size={15} />
            Open Full Analysis Report
            <ExternalLink size={13} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open('/roadmap', '_blank', 'noopener')}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border transition-all ${
              isDark
                ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#F5A623]/40 hover:text-[#F5A623]'
                : 'border-[#D5D0C8] text-[#3D3D44] hover:border-[#F5A623]/40 hover:text-[#F5A623]'
            }`}
          >
            <Map size={13} />
            View Automation Roadmap
            <ExternalLink size={12} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
