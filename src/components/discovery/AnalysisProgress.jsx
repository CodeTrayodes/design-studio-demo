'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = [
  { id: 1,  label: 'Scanning process topology',       duration: 1800 },
  { id: 2,  label: 'Identifying decision gates',       duration: 2000 },
  { id: 3,  label: 'Mapping tool dependencies',        duration: 1900 },
  { id: 4,  label: 'Calculating cycle times',          duration: 2200 },
  { id: 5,  label: 'Detecting automation gaps',        duration: 2000 },
  { id: 6,  label: 'Scoring maturity dimensions',      duration: 2100 },
  { id: 7,  label: 'Benchmarking against industry',    duration: 2400 },
  { id: 8,  label: 'Building agent deployment plan',   duration: 2200 },
  { id: 9,  label: 'Generating optimisation model',    duration: 0    }, // gated on apiReady
];

const LAST = STAGES.length - 1;

export default function AnalysisProgress({ isDark, onComplete, apiReady }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completed,    setCompleted]    = useState([]);

  // Use refs to avoid stale closures in async callbacks
  const apiReadyRef      = useRef(false);
  const lastReachedRef   = useRef(false);
  const completedFlagRef = useRef(false); // prevent double-completion
  const onCompleteRef    = useRef(onComplete);

  // Keep onCompleteRef and apiReadyRef in sync with latest props/values
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    apiReadyRef.current = apiReady;
    // If last stage already reached and API just became ready, complete now
    if (apiReady && lastReachedRef.current) {
      scheduleComplete();
    }
  }, [apiReady]);

  function scheduleComplete() {
    if (completedFlagRef.current) return; // already fired
    completedFlagRef.current = true;
    setCompleted(p => (p.includes(LAST) ? p : [...p, LAST]));
    setTimeout(() => onCompleteRef.current?.(), 600);
  }

  /* ── Timer loop: auto-advances stages 0 → LAST-1 ─────────────────────── */
  useEffect(() => {
    let idx = 0;
    let stageTimer;
    let fallbackTimer;

    function advance() {
      if (idx >= STAGES.length) return;
      setCurrentStage(idx);

      if (idx === LAST) {
        lastReachedRef.current = true;

        // If API already ready when we hit the last stage, complete immediately
        if (apiReadyRef.current) {
          scheduleComplete();
          return;
        }

        // Fallback: force-complete after 60s if API never responds
        fallbackTimer = setTimeout(() => {
          console.warn('[DS] Analysis API timeout — forcing completion');
          scheduleComplete();
        }, 60_000);
        return;
      }

      stageTimer = setTimeout(() => {
        setCompleted(p => [...p, idx]);
        idx++;
        advance();
      }, STAGES[idx].duration);
    }

    advance();
    return () => {
      clearTimeout(stageTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

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
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const isDone    = completed.includes(i);
          const isActive  = currentStage === i && !isDone;
          const isPaused  = isActive && i === LAST && !apiReady;

          return (
            <div key={stage.id} className="flex items-center space-x-3">
              {/* Status dot */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                isDone   ? 'bg-[#30D5C8]'
                : isActive && !isPaused ? 'bg-[#F5A623] animate-pulse'
                : isPaused ? 'bg-[#F5A623]/30'
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
                : isActive && !isPaused ? 'text-[#F5A623]'
                : isPaused ? isDark ? 'text-[#F5A623]/50' : 'text-[#F5A623]/70'
                : isDark  ? 'text-[#8E8E93]/50' : 'text-[#3D3D44]/40'
              }`}>
                {stage.label}
                {isPaused && (
                  <span className={`font-mono text-[10px] ml-2 ${isDark ? 'text-[#8E8E93]/50' : 'text-[#3D3D44]/50'}`}>
                    — awaiting results...
                  </span>
                )}
              </span>

              {isActive && !isPaused && (
                <div className="flex space-x-0.5 shrink-0">
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
