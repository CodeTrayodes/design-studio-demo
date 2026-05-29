'use client';

import { ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const EFFORT_COLOR = { low: 'text-[#30D5C8]', medium: 'text-[#F5A623]', high: 'text-red-400' };
const IMPACT_COLOR = { low: 'text-[#8E8E93]', medium: 'text-[#F5A623]', high: 'text-[#30D5C8]' };

function MaturityBar({ value, isDark }) {
  const pct   = Math.min(100, (value / 5) * 100);
  const color = value < 2 ? '#EF4444' : value < 3.5 ? '#F5A623' : '#30D5C8';
  return (
    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function MaturityReport({ data, isDark }) {
  function openRoadmap() {
    window.open('/roadmap', '_blank', 'noopener');
  }

  function openFullAnalysis() {
    window.open('/analysis', '_blank', 'noopener');
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      {/* Header */}
      <div className={`p-5 border-b ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">
          Process Maturity Assessment
        </span>
        <h3 className={`font-serif text-xl mt-0.5 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
          {data.processName}
        </h3>

        <div className="flex items-end justify-between mt-4">
          <div>
            <p className={`text-[10px] font-mono uppercase ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Overall Maturity</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="font-serif text-3xl text-[#F5A623] font-medium">
                {data.overallMaturity?.toFixed(1)}
              </span>
              <span className={`text-sm ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>/ 5.0</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-[10px] font-mono uppercase ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Weekly Leakage</p>
            <p className="font-serif text-lg text-[#F5A623] mt-0.5">{data.estimatedWeeklyLeak}</p>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mt-3 font-sans line-clamp-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          {data.summary}
        </p>
      </div>

      {/* Stage scores */}
      <div className="p-5">
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Stage-by-stage breakdown
        </p>
        <div className="space-y-4">
          {data.stages?.slice(0, 4).map((stage, i) => (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex items-baseline justify-between mb-1.5">
                <span className={`text-xs font-sans font-medium truncate mr-2 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
                  {stage.name}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[10px] font-mono ${EFFORT_COLOR[stage.effort] ?? 'text-[#8E8E93]'}`}>
                    {stage.effort}
                  </span>
                  <span className={`text-[11px] font-mono font-semibold tabular-nums ${
                    stage.maturity < 2 ? 'text-red-400' : stage.maturity < 3.5 ? 'text-[#F5A623]' : 'text-[#30D5C8]'
                  }`}>
                    {stage.maturity?.toFixed(1)}
                  </span>
                </div>
              </div>
              <MaturityBar value={stage.maturity} isDark={isDark} />
            </motion.div>
          ))}
          {(data.stages?.length ?? 0) > 4 && (
            <p className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              +{data.stages.length - 4} more stages in full analysis
            </p>
          )}
        </div>

        {data.topBottleneck && (
          <div className={`mt-4 p-3 rounded-xl border ${isDark ? 'bg-[#F5A623]/5 border-[#F5A623]/20' : 'bg-[#FFF8EC] border-[#F5A623]/30'}`}>
            <span className="text-[10px] font-mono text-[#F5A623] uppercase tracking-wider">Primary bottleneck</span>
            <p className={`text-xs mt-1 font-sans ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
              {data.topBottleneck}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-5 flex flex-col space-y-2">
          <motion.button
            onClick={openFullAnalysis}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#F5A623]/15 cursor-pointer"
          >
            <FileText size={14} />
            <span>View Full Analysis</span>
            <ExternalLink size={13} />
          </motion.button>
          <motion.button
            onClick={openRoadmap}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer border transition-all ${
              isDark
                ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#F5A623]/40 hover:text-[#F5A623]'
                : 'border-[#D5D0C8] text-[#3D3D44] hover:border-[#F5A623]/40 hover:text-[#F5A623]'
            }`}
          >
            <span>View Roadmap</span>
            <ExternalLink size={12} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
