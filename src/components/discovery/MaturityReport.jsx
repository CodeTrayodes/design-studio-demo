'use client';

import { CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaturityReport({ data }) {
  const researchData = (() => {
    try { return JSON.parse(localStorage.getItem('demo_research') || '{}'); }
    catch { return {}; }
  })();

  const processContext = (() => {
    try { return JSON.parse(localStorage.getItem('demo_process') || '{}'); }
    catch { return {}; }
  })();

  const processName = data?.processName || processContext?.processName || 'Process';
  const stageCount = data?.stages?.length ?? 12;

  function openFullAnalysis() {
    window.open('/analysis', '_blank');
  }

  function openRoadmap() {
    window.open('/roadmap', '_blank');
  }

  return (
    <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-6 flex flex-col items-center space-y-5">

      {/* Success state */}
      <div className="flex flex-col items-center space-y-2 pt-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.5 }}
        >
          <CheckCircle2 size={48} className="text-[#30D5C8]" />
        </motion.div>

        <p className="text-[#F1F1F3] text-xl font-semibold text-center">
          Process Discovery Complete
        </p>
        <p className="text-[#8E8E93] text-sm text-center">
          {processName} analysis finished
        </p>
      </div>

      {/* Teaser stats row */}
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <div className="bg-[#2C2C2E] rounded-lg px-3 py-2 text-center text-[#8E8E93] text-xs">
          {stageCount} Process Steps
        </div>
        <div className="bg-[#2C2C2E] rounded-lg px-3 py-2 text-center text-[#8E8E93] text-xs">
          3 Phase Roadmap
        </div>
        <div className="bg-[#2C2C2E] rounded-lg px-3 py-2 text-center text-[#8E8E93] text-xs">
          Automation Ready
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-[#3A3A3C]" />

      {/* Main CTA */}
      <div className="flex flex-col items-center space-y-3 w-full">
        <motion.button
          onClick={openFullAnalysis}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-[#F5A623] text-black font-semibold rounded-xl py-3 px-6 text-sm flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>View Full Analysis</span>
          <ChevronRight size={16} />
        </motion.button>

        {/* Secondary CTA */}
        <button
          onClick={openRoadmap}
          className="text-[#8E8E93] hover:text-[#F1F1F3] text-sm underline cursor-pointer bg-transparent border-none transition-colors"
        >
          View Automation Architecture
        </button>
      </div>
    </div>
  );
}
