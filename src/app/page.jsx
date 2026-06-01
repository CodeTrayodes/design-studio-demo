'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, RefreshCw, Building2, ShieldCheck, BarChart3, Workflow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { useConversation } from '@/hooks/useConversation';
import { fadeUp, staggerContainer } from '@/lib/animations';
import ChatThread from '@/components/discovery/ChatThread';

/* ── Empty-state hero ────────────────────────────────────────────────────── */

const CAPABILITY_PILLS = [
  { icon: Building2,    label: 'Company Profiling'    },
  { icon: Workflow,     label: 'Process Discovery'    },
  { icon: BarChart3,    label: 'Industry Benchmarking'},
  { icon: ShieldCheck,  label: 'Automation Blueprint' },
];

function HeroSection({ isDark, onSubmit }) {
  const [input, setInput] = useState('');
  const inputRef          = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim());
  }

  return (
    <motion.div
      key="hero"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      variants={staggerContainer(0.1)}
      className="flex flex-col items-center justify-center text-center px-4 flex-1"
      style={{ minHeight: 'calc(100vh - 48px)' }}
    >
      {/* Capability pills */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {CAPABILITY_PILLS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border select-none ${
              isDark
                ? 'border-[#3A3A3C] text-[#8E8E93] bg-[#1C1C1E]'
                : 'border-[#D5D0C8] text-[#3D3D44] bg-white'
            }`}
          >
            <Icon size={10} className="text-[#F5A623]" />
            {label}
          </span>
        ))}
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className={`font-serif text-[28px] md:text-[44px] font-normal leading-tight tracking-tight mb-4 max-w-2xl ${
          isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'
        }`}
      >
        Discover your organization's
        <br />
        <span className="text-[#F5A623]">automation opportunity.</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className={`text-sm max-w-md mb-10 leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}
      >
        Enter your company name. LevelShift profiles your organization, maps key processes
        against industry benchmarks, and delivers a configured automation roadmap.
      </motion.p>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mb-6"
      >
        <div className={`relative border-b pb-3 px-1 flex items-center text-xl md:text-2xl font-serif transition-all duration-300 focus-within:border-[#F5A623] ${
          isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'
        }`}>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter company name - e.g. Walmart, Barclays, Bupa..."
              className={`w-full bg-transparent border-none focus:outline-none pr-3 leading-snug ${
                isDark ? 'text-white placeholder-[#8E8E93]/40' : 'text-[#18181A] placeholder-[#3D3D44]/40'
              }`}
            />
            <span className="w-[2px] h-7 bg-[#F5A623] inline-block shadow-[0_0_10px_rgba(245,166,35,0.4)] animate-cursor-blink shrink-0 ml-1" />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-2.5 rounded-xl transition-all duration-300 ml-3 ${
              input.trim()
                ? 'bg-[#F5A623] text-black hover:scale-105 cursor-pointer shadow-md shadow-[#F5A623]/25'
                : `cursor-not-allowed border ${isDark ? 'text-[#8E8E93]/50 bg-[#1C1C1E] border-[#3A3A3C]' : 'text-[#3D3D44]/50 bg-white border-[#D5D0C8]'}`
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>

        <div className={`mt-3 flex items-center space-x-2 text-[10px] font-mono opacity-50 select-none ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          <span className="uppercase tracking-widest font-semibold text-[9px]">STATUS</span>
          <div className="flex space-x-1">
            {[60, 30, 10].map(op => (
              <span key={op} className="w-1 h-1 rounded-full bg-[#F5A623]" style={{ opacity: op / 100 }} />
            ))}
          </div>
          <span className="uppercase tracking-widest">Ready to profile your organization...</span>
        </div>
      </motion.form>

   
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function DiscoveryPage() {
  const { isDark } = useTheme();
  const conv       = useConversation();
  const { confirmCompanyBrief, confirmProcessSelection } = conv;
  const [input, setInput] = useState('');
  const inputRef          = useRef(null);

  const isEmpty = conv.messages.length === 0;

  // Hero submit: company name goes straight to confirmOrg (company-first flow)
  const handleHeroSubmit = useCallback((companyName) => {
    conv.confirmOrg({ companyName: companyName.trim(), industry: '', governance: [] });
  }, [conv]);

  function handleChatSubmit(e) {
    e?.preventDefault();
    if (!input.trim() || conv.streaming) return;
    const text = input.trim();
    setInput('');
    conv.sendMessage(text);
  }

  return (
    <div
      className={`flex flex-col font-sans antialiased transition-colors duration-300 ${
        isDark ? 'bg-[#0B0B0E] text-[#F1F1F3]' : 'bg-[#F3F1EC] text-[#18181A]'
      }`}
      style={{ minHeight: 'calc(100vh - 48px)' }}
    >
      {/* ── Empty: hero centred ── */}
      <AnimatePresence>
        {isEmpty && (
          <HeroSection
            isDark={isDark}
            onSubmit={handleHeroSubmit}
          />
        )}
      </AnimatePresence>

      {/* ── Chat thread ── */}
      {!isEmpty && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 pt-8 pb-44 md:px-6">
            <ChatThread
              messages={conv.messages}
              streaming={conv.streaming}
              isDark={isDark}
              onOrgConfirm={conv.confirmOrg}
              onToolsConfirm={conv.confirmTools}
              onContextConfirm={conv.confirmContext}
              onAnalysisDone={conv.runAnalysis}
              analysisResult={conv.analysisResult}
              analysisApiReady={conv.analysisApiReady}
              onConfirmCompanyBrief={confirmCompanyBrief}
              onConfirmProcessSelection={confirmProcessSelection}
            />
          </div>
        </div>
      )}

      {/* ── Bottom command bar (chat mode only) ── */}
      <AnimatePresence>
        {!isEmpty && (
          <motion.div
            key="cmdbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md ${
              isDark ? 'bg-[#0B0B0E]/95 border-[#1C1C1E]' : 'bg-[#F3F1EC]/98 border-[#E6E2DB]'
            }`}
          >
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={conv.reset}
                  className={`flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                    isDark ? 'text-[#8E8E93] hover:text-[#F5A623]' : 'text-[#3D3D44] hover:text-[#F5A623]'
                  }`}
                >
                  <RefreshCw size={9} /><span>New discovery</span>
                </button>
              </div>

              <form
                onSubmit={handleChatSubmit}
                className={`border-b transition-all duration-300 pb-2 px-1 flex items-center focus-within:border-[#F5A623] ${
                  isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'
                }`}
              >
                <div className="flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Continue the conversation..."
                    disabled={conv.streaming}
                    className={`w-full bg-transparent border-none focus:outline-none leading-snug text-base font-serif ${
                      isDark ? 'text-white placeholder-[#8E8E93]/50' : 'text-[#18181A] placeholder-[#3D3D44]/50'
                    }`}
                  />
                  {conv.streaming && (
                    <div className="flex space-x-1 ml-2 shrink-0">
                      {[0, 0.2, 0.4].map(d => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-heartbeat-glow"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || conv.streaming}
                  className={`p-2 rounded-xl transition-all duration-300 ml-2 ${
                    input.trim() && !conv.streaming
                      ? 'bg-[#F5A623] text-black hover:scale-105 cursor-pointer shadow-md shadow-[#F5A623]/20'
                      : `cursor-not-allowed border ${isDark ? 'text-[#8E8E93]/50 bg-[#1C1C1E] border-[#3A3A3C]' : 'text-[#3D3D44]/50 bg-white border-[#D5D0C8]'}`
                  }`}
                >
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
