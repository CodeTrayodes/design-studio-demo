'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = [
  { id: 1, label: 'Scanning process topology',     duration: 2200 },
  { id: 2, label: 'Identifying decision gates',     duration: 2800 },
  { id: 3, label: 'Mapping tool dependencies',      duration: 2400 },
  { id: 4, label: 'Calculating cycle times',        duration: 3000 },
  { id: 5, label: 'Benchmarking against industry',  duration: 2600 },
  { id: 6, label: 'Generating optimisation model',  duration: 0    }, // gated on apiReady
];

const LAST = STAGES.length - 1;

export default function AnalysisProgress({ isDark, onComplete, apiReady }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completed,    setCompleted]    = useState([]);
  // tracks whether the last stage has been reached by the timer loop
  const lastReached = useRef(false);

  /* ── Timer loop: runs stages 0 → LAST-1 automatically ─────────────────── */
  useEffect(() => {
    let idx = 0;
    let timer;

    function advance() {
      if (idx >= STAGES.length) return;

      setCurrentStage(idx);

      if (idx === LAST) {
        // Last stage: mark as reached, completion gated on apiReady
        lastReached.current = true;
        return;
      }

      timer = setTimeout(() => {
        setCompleted(p => [...p, idx]);
        idx++;
        advance();
      }, STAGES[idx].duration);
    }

    advance();
    return () => clearTimeout(timer);
  }, []);

  /* ── Gate last stage completion on apiReady ─────────────────────────── */
  useEffect(() => {
    if (!apiReady) return;
    if (!lastReached.current) return;              // timer hasn't reached last stage yet
    if (completed.includes(LAST)) return;          // already completed

    const t = setTimeout(() => {
      setCompleted(p => [...p, LAST]);
      setTimeout(() => onComplete?.(), 500);
    }, 600);

    return () => clearTimeout(t);
  }, [apiReady, currentStage]); // re-check when currentStage changes (fast API case)

  const progress = Math.round((completed.length / STAGES.length) * 100);

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">
          Deep Process Analysis
        </span>
        <span className={`text-[10px] font-mono tabular-nums ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-1 rounded-full mb-5 overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-[#F5A623] to-[#FF6B35] rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-2.5">
        {STAGES.map((stage, i) => {
          const isDone   = completed.includes(i);
          const isActive = currentStage === i && !isDone;
          const isPaused = isActive && i === LAST && !apiReady;

          return (
            <div key={stage.id} className="flex items-center space-x-3">
              {/* Status dot */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                isDone   ? 'bg-[#30D5C8]'
                : isActive ? (isPaused ? 'bg-[#F5A623]/50' : 'bg-[#F5A623] animate-pulse')
                : isDark  ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'
              }`}>
                {isDone
                  ? <Check size={10} className="text-black" />
                  : isActive
                  ? <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  : <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#8E8E93]' : 'bg-[#3D3D44]'}`} />
                }
              </div>

              <span className={`text-xs font-sans flex-1 transition-colors ${
                isDone   ? isDark ? 'text-[#30D5C8]' : 'text-[#1AB5A8]'
                : isActive ? 'text-[#F5A623]'
                : isDark  ? 'text-[#8E8E93]/60' : 'text-[#3D3D44]/50'
              }`}>
                {stage.label}
                {isPaused && (
                  <span className="text-[#8E8E93] text-[10px] font-mono ml-2">— awaiting data...</span>
                )}
              </span>

              {isActive && !isPaused && (
                <div className="flex space-x-0.5">
                  {[0, 0.2, 0.4].map(d => (
                    <span
                      key={d}
                      className="w-1 h-1 rounded-full bg-[#F5A623] animate-heartbeat-glow"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
