'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, RefreshCw, Building2, Shield, Star, ChevronRight, ExternalLink, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { useConversation } from '@/hooks/useConversation';
import { PROCESSES } from '@/lib/processes';
import { PROCESS_TEMPLATES } from '@/lib/processTemplates';
import { fadeUp, staggerContainer } from '@/lib/animations';
import ChatThread from '@/components/discovery/ChatThread';

/* -- Static process metadata for display ----------------------------------- */

const PROCESS_META = {
  'lead-to-cash':        { tagline: 'From first contact to closed deal',              color: '#F5A623' },
  'hire-to-retire':      { tagline: 'From talent sourcing to offboarding',            color: '#A78BFA' },
  'procure-to-pay':      { tagline: 'From requisition to supplier payment',           color: '#30D5C8' },
  'order-to-cash':       { tagline: 'From customer order to revenue recognition',     color: '#60A5FA' },
  'record-to-report':    { tagline: 'From transaction capture to financial close',    color: '#34D399' },
  'issue-to-resolution': { tagline: 'From incident detection to customer resolution', color: '#F87171' },
};

// LevelShift database stats (demo data)
const PROCESS_STATS = {
  'lead-to-cash':        { companies: 312, avgAutomation: 64, templates: 47 },
  'hire-to-retire':      { companies: 198, avgAutomation: 58, templates: 31 },
  'procure-to-pay':      { companies: 276, avgAutomation: 71, templates: 42 },
  'order-to-cash':       { companies: 241, avgAutomation: 67, templates: 39 },
  'record-to-report':    { companies: 187, avgAutomation: 62, templates: 28 },
  'issue-to-resolution': { companies: 223, avgAutomation: 73, templates: 35 },
};

/* -- State 1: Company Name Input ------------------------------------------- */

function CompanyInputHero({ isDark, onSubmit }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  }

  return (
    <motion.div
      key="company-input"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
      variants={staggerContainer(0.1)}
      className="flex flex-col items-center justify-center text-center px-4 flex-1"
      style={{ minHeight: 'calc(100vh - 48px)' }}
    >
      <motion.div variants={fadeUp} className="mb-5">
        <span className={`text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${
          isDark ? 'border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5' : 'border-[#D4890A]/30 text-[#D4890A] bg-[#D4890A]/5'
        }`}>
          Process Intelligence Platform
        </span>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className={`font-serif text-[30px] md:text-[44px] font-normal leading-tight tracking-tight mb-3 max-w-2xl ${
          isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'
        }`}
      >
        Which organisation are we
        <br />
        <span className="text-[#F5A623]">discovering today?</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className={`text-sm max-w-sm mb-10 leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}
      >
        ShiftAI maps your workflows, identifies optimization gaps, and scopes automation agents -- in under three minutes.
      </motion.p>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mb-8"
      >
        <div className={`relative border-b pb-3 px-1 flex items-center text-xl md:text-2xl font-serif transition-all duration-300 focus-within:border-[#F5A623]/60 ${
          isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'
        }`}>
          <Building2 size={20} className={`mr-3 shrink-0 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`} />
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. Pfizer, Walmart, JPMorgan, Siemens..."
              className={`w-full bg-transparent border-none focus:outline-none pr-3 leading-snug ${
                isDark ? 'text-white placeholder-[#8E8E93]/40' : 'text-[#18181A] placeholder-[#3D3D44]/40'
              }`}
            />
            <span className="w-[2px] h-7 bg-[#F5A623] inline-block shadow-[0_0_10px_rgba(245,166,35,0.4)] animate-cursor-blink shrink-0 ml-1" />
          </div>
          <button
            type="submit"
            disabled={!value.trim()}
            className={`p-2.5 rounded-xl transition-all duration-300 ml-3 ${
              value.trim()
                ? 'bg-[#F5A623] text-black hover:scale-105 cursor-pointer shadow-md shadow-[#F5A623]/25'
                : `cursor-not-allowed border ${isDark ? 'text-[#8E8E93]/50 bg-[#1C1C1E] border-[#3A3A3C]' : 'text-[#3D3D44]/50 bg-white border-[#D5D0C8]'}`
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>

        <div className={`mt-3 flex items-center space-x-2 text-[10px] font-mono opacity-50 select-none ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          <Shield size={9} />
          <span>Company data sourced from public records -- nothing is stored</span>
        </div>
      </motion.form>

      <motion.div variants={fadeUp} className={`text-[11px] font-mono ${isDark ? 'text-[#8E8E93]/50' : 'text-[#3D3D44]/50'}`}>
        847 pre-built processes across 234 organisations and 18 industries
      </motion.div>
    </motion.div>
  );
}

/* -- State 2: Profiling Spinner ------------------------------------------- */

function ProfilingHero({ isDark, companyName }) {
  const steps = [
    'Scanning public company records',
    'Identifying industry profile',
    'Mapping governance frameworks',
    'Generating process recommendations',
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(p => Math.min(p + 1, steps.length - 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="profiling"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center px-4 flex-1"
      style={{ minHeight: 'calc(100vh - 48px)' }}
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] flex items-center justify-center mb-6 shadow-lg shadow-[#F5A623]/25">
        <Building2 size={24} className="text-black" />
      </div>
      <h2 className={`font-serif text-2xl mb-2 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
        Profiling <span className="text-[#F5A623]">{companyName}</span>
      </h2>
      <p className={`text-xs font-mono mb-10 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
        Researching industry, governance frameworks, and process landscape...
      </p>
      <div className="space-y-3 w-full max-w-xs text-left">
        {steps.map((step, i) => {
          const isDone   = i < current;
          const isActive = i === current;
          return (
            <div key={i} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                isDone   ? 'bg-[#30D5C8]'
                : isActive ? 'bg-[#F5A623] animate-pulse'
                : isDark  ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'
              }`}>
                {isDone && <span className="text-black text-[8px] font-bold">+</span>}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span className={`text-xs font-sans transition-colors ${
                isDone   ? isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'
                : isActive ? isDark ? 'text-[#F5A623]' : 'text-[#D4890A]'
                : isDark  ? 'text-[#8E8E93]/40' : 'text-[#3D3D44]/40'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* -- State 3: Profiled -- Company card + Process Selection ----------------- */

function ProfiledHero({ isDark, profile, onProcessSelect, onCustomProcess }) {
  const [customInput, setCustomInput] = useState('');
  const templates = PROCESS_TEMPLATES.filter(p => p.id !== 'custom');
  const recommendedIds = (profile.recommendedProcesses ?? []).map(p => p.id);
  const getRecommendedReason = id => profile.recommendedProcesses?.find(p => p.id === id)?.reason;

  function getStats(id) {
    return PROCESS_STATS[id] ?? { companies: 124, avgAutomation: 61, templates: 22 };
  }

  return (
    <motion.div
      key="profiled"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto px-4 py-8"
    >
      {/* Company Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border p-5 mb-7 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-1.5">Organisation Profile</p>
            <h2 className={`font-serif text-2xl font-normal ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
              {profile.companyName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]' : 'bg-[#D4890A]/10 border-[#D4890A]/30 text-[#D4890A]'
              }`}>
                {profile.industry}
              </span>
              {profile.companyType && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#3A3A3C] border-[#3A3A3C] text-[#8E8E93]' : 'bg-[#F3F1EC] border-[#D5D0C8] text-[#3D3D44]'
                }`}>
                  {profile.companyType}
                </span>
              )}
              {profile.employeeCount && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                  isDark ? 'bg-[#3A3A3C] border-[#3A3A3C] text-[#8E8E93]' : 'bg-[#F3F1EC] border-[#D5D0C8] text-[#3D3D44]'
                }`}>
                  {profile.employeeCount}
                </span>
              )}
            </div>
          </div>

          {/* Tech stack tags */}
          {(profile.inferredTechStack ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {profile.inferredTechStack.slice(0, 5).map(tool => (
                <span
                  key={tool.name ?? tool}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-[#3A3A3C]/50 border-[#3A3A3C] text-[#8E8E93]' : 'bg-white border-[#D5D0C8] text-[#3D3D44]'
                  }`}
                >
                  {tool.name ?? tool}
                </span>
              ))}
            </div>
          )}
        </div>

        {profile.companySummary && (
          <p className={`text-xs font-sans leading-relaxed mt-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            {profile.companySummary}
          </p>
        )}

        {/* Governance & Compliance Badges */}
        {(profile.governanceFrameworks ?? []).length > 0 && (
          <div className={`mt-4 pt-3 border-t ${isDark ? 'border-[#3A3A3C]' : 'border-[#E6E2DB]'}`}>
            <p className={`text-[9px] font-mono uppercase tracking-widest mb-2.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              Governance & Compliance Frameworks
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.governanceFrameworks.map(gf => (
                <div
                  key={gf.name}
                  title={gf.relevance}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-help ${
                    isDark ? 'bg-[#30D5C8]/5 border-[#30D5C8]/20 hover:bg-[#30D5C8]/10' : 'bg-[#0D9488]/5 border-[#0D9488]/20 hover:bg-[#0D9488]/8'
                  } transition-colors`}
                >
                  <Shield size={9} className={isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'} />
                  <span className={`text-[10px] font-mono font-semibold ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
                    {gf.name}
                  </span>
                  <span className={`text-[9px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                    via {gf.source}
                  </span>
                </div>
              ))}
            </div>
            {profile.dataSource && (
              <p className={`text-[9px] font-mono mt-2 ${isDark ? 'text-[#8E8E93]/50' : 'text-[#3D3D44]/50'}`}>
                Sources: {profile.dataSource}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Process Selection Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-5 text-center"
      >
        <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Key Processes in {profile.industry}
        </p>
        <h3 className={`font-serif text-2xl font-normal ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
          Which process do you want to discover and optimize?
        </h3>
        {profile.companyType && (
          <p className={`text-xs mt-1 font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Recommended for {profile.companyType}:
          </p>
        )}
      </motion.div>

      {/* LevelShift Template Info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`rounded-xl border p-3 mb-5 flex items-center justify-between gap-4 ${
          isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center shrink-0">
            <Star size={14} className="text-[#F5A623]" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
              LevelShift Process Templates
            </p>
            <p className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              847 pre-built processes from 234 companies across 18 industries
            </p>
          </div>
        </div>
        <div className={`text-[10px] font-mono shrink-0 px-2 py-1 rounded-lg border ${
          isDark ? 'border-[#3A3A3C] text-[#8E8E93]' : 'border-[#D5D0C8] text-[#3D3D44]'
        }`}>
          {profile.industry} benchmarks loaded
        </div>
      </motion.div>

      {/* Process Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4"
      >
        {templates.map(p => {
          const isRecommended = recommendedIds.includes(p.id);
          const reason = getRecommendedReason(p.id);
          const s = getStats(p.id);
          const meta = PROCESS_META[p.id];

          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProcessSelect(p)}
              className={`text-left rounded-xl border p-4 transition-all cursor-pointer relative ${
                isRecommended
                  ? isDark
                    ? 'border-[#F5A623]/40 bg-[#F5A623]/5 hover:border-[#F5A623]/70 hover:bg-[#F5A623]/8'
                    : 'border-[#D4890A]/30 bg-[#D4890A]/4 hover:border-[#D4890A]/50'
                  : isDark
                    ? 'border-[#3A3A3C] bg-[#1C1C1E] hover:border-[#8E8E93]/50'
                    : 'border-[#D5D0C8] bg-white hover:border-[#3D3D44]/50'
              }`}
            >
              {isRecommended && (
                <div className="absolute top-3 right-3">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-[#F5A623]/15 text-[#F5A623]' : 'bg-[#D4890A]/10 text-[#D4890A]'
                  }`}>
                    <Star size={7} fill="currentColor" />
                    RECOMMENDED
                  </span>
                </div>
              )}

              {/* Color accent bar */}
              {meta && (
                <div
                  className="w-5 h-1 rounded-full mb-3"
                  style={{ backgroundColor: meta.color + '80' }}
                />
              )}

              <p className={`text-sm font-semibold mb-0.5 pr-20 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
                {p.name}
              </p>
              {meta && (
                <p className={`text-[10px] font-sans mb-2 leading-snug ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                  {meta.tagline}
                </p>
              )}
              {isRecommended && reason && (
                <p className={`text-[10px] font-sans italic mb-2 leading-snug ${isDark ? 'text-[#F5A623]/70' : 'text-[#D4890A]/80'}`}>
                  {reason}
                </p>
              )}

              <div className={`flex items-center gap-3 pt-2 border-t ${isDark ? 'border-[#3A3A3C]' : 'border-[#E6E2DB]'}`}>
                <span className={`text-[9px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                  {s.companies} orgs
                </span>
                <span className={`text-[9px] font-mono ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
                  {s.avgAutomation}% avg automation
                </span>
                <span className={`text-[9px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                  {s.templates} templates
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Custom Process Input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`rounded-xl border p-4 transition-colors duration-200 focus-within:border-[#F5A623]/35 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}
      >
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Custom Process Discovery
        </p>
        <div className={`flex items-center gap-2 border-b pb-2 ${
          isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'
        }`}>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customInput.trim() && onCustomProcess(customInput.trim())}
            placeholder="e.g. Lead to Order, Claims Processing, Patient Onboarding..."
            className={`flex-1 bg-transparent border-none outline-none focus:outline-none ring-0 focus:ring-0 text-sm font-serif ${
              isDark ? 'text-white placeholder-[#8E8E93]/40' : 'text-[#18181A] placeholder-[#3D3D44]/40'
            }`}
          />
          <button
            onClick={() => customInput.trim() && onCustomProcess(customInput.trim())}
            disabled={!customInput.trim()}
            className={`p-1.5 rounded-lg transition-all outline-none focus:outline-none ${
              customInput.trim()
                ? 'bg-[#F5A623] text-black cursor-pointer hover:scale-105'
                : `cursor-not-allowed ${isDark ? 'text-[#8E8E93]/30' : 'text-[#3D3D44]/30'}`
            }`}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -- Main page ------------------------------------------------------------- */

export default function DiscoveryPage() {
  const { isDark }   = useTheme();
  const conv         = useConversation();
  const [input, setInput]                 = useState('');
  const inputRef                          = useRef(null);

  // Hero state machine: 'company-input' | 'profiling' | 'profiled'
  const [heroState,    setHeroState]    = useState('company-input');
  const [companyName,  setCompanyName]  = useState('');
  const [companyProfile, setCompanyProfile] = useState(null);

  const isEmpty = conv.messages.length === 0;

  /* -- Company research (called from hero) ---------------------------------- */
  async function handleCompanySubmit(name) {
    setCompanyName(name);
    setHeroState('profiling');

    try {
      const res = await fetch('/api/demo/company', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Research failed');
      setCompanyProfile(data);
      setHeroState('profiled');
    } catch (err) {
      console.error('[ShiftAI] Company research failed:', err);
      // Graceful fallback profile
      setCompanyProfile({
        companyName: name,
        industry: 'Enterprise',
        companyType: 'Large Enterprise',
        companySummary: `${name} is a leading enterprise organisation.`,
        governanceFrameworks: [{ name: 'SOC 2 Type II', source: 'AICPA', relevance: 'Standard for enterprise data security.' }],
        inferredTechStack: [],
        recommendedProcesses: [],
        dataSource: 'Public records',
      });
      setHeroState('profiled');
    }
  }

  /* -- Process selected from profiled state --------------------------------- */
  function handleProcessSelect(templateObj) {
    const processId  = templateObj.id;
    const processObj = PROCESSES[processId] ?? {
      id:     processId,
      name:   templateObj.name,
      stages: [],
    };
    conv.initWithCompany(companyName, processId, processObj, companyProfile);
  }

  /* -- Custom process name typed by user ----------------------------------- */
  function handleCustomProcess(name) {
    const processObj = { id: 'custom', name, stages: [] };
    conv.initWithCompany(companyName, 'custom', processObj, companyProfile);
  }

  /* -- Chat submit (bottom bar) -------------------------------------------- */
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
      {/* -- Hero (empty state) -- */}
      <AnimatePresence mode="wait">
        {isEmpty && heroState === 'company-input' && (
          <CompanyInputHero
            key="company-input"
            isDark={isDark}
            onSubmit={handleCompanySubmit}
          />
        )}
        {isEmpty && heroState === 'profiling' && (
          <ProfilingHero
            key="profiling"
            isDark={isDark}
            companyName={companyName}
          />
        )}
        {isEmpty && heroState === 'profiled' && companyProfile && (
          <div key="profiled" className="flex-1 overflow-y-auto">
            <ProfiledHero
              isDark={isDark}
              profile={companyProfile}
              onProcessSelect={handleProcessSelect}
              onCustomProcess={handleCustomProcess}
            />
          </div>
        )}
      </AnimatePresence>

      {/* -- Chat thread -- */}
      {!isEmpty && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 pt-8 pb-44 md:px-6">
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
            />
          </div>
        </div>
      )}

      {/* -- Bottom command bar (chat mode only) -- */}
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
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => { conv.reset(); setHeroState('company-input'); setCompanyName(''); setCompanyProfile(null); }}
                  className={`flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                    isDark ? 'text-[#8E8E93] hover:text-[#F5A623]' : 'text-[#3D3D44] hover:text-[#F5A623]'
                  }`}
                >
                  <RefreshCw size={9} /><span>New Discovery</span>
                </button>
              </div>

              <form
                onSubmit={handleChatSubmit}
                className={`border-b transition-all duration-300 pb-2 px-1 flex items-center focus-within:border-[#F5A623]/60 ${
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
