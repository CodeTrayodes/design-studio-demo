'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ExternalLink, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme';

const PHASE_STYLES = [
  { accent: '#F5A623', light: 'bg-[#F5A623]/8', border: 'border-[#F5A623]/30', text: 'text-[#F5A623]', badge: 'bg-[#F5A623]/10 text-[#F5A623]', label: 'Quick wins — build momentum' },
  { accent: '#30D5C8', light: 'bg-[#30D5C8]/8', border: 'border-[#30D5C8]/30', text: 'text-[#30D5C8]', badge: 'bg-[#30D5C8]/10 text-[#30D5C8]', label: 'Core transformation' },
  { accent: '#A78BFA', light: 'bg-[#A78BFA]/8', border: 'border-[#A78BFA]/30', text: 'text-[#A78BFA]', badge: 'bg-[#A78BFA]/10 text-[#A78BFA]', label: 'Advanced autonomy' },
];

function maturityScore(score) {
  return parseFloat(((score ?? 50) / 100 * 5).toFixed(1));
}

function scoreBarColor(score) {
  if (score >= 70) return '#30D5C8';
  if (score >= 40) return '#F5A623';
  return '#EF4444';
}

function priorityBadge(p) {
  if (p === 'HIGH')   return 'bg-red-400/10 text-red-400 border-red-400/30';
  if (p === 'LOW')    return 'bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/30';
  return 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30';
}

function AgentCard({ agent, style, isDark }) {
  const impactColor = agent.impact === 'High' ? 'text-[#30D5C8]' : agent.impact === 'Low' ? 'text-[#8E8E93]' : 'text-[#F5A623]';
  return (
    <div className={`rounded-xl border p-3.5 transition-all ${isDark ? 'bg-[#0B0B0E] border-[#3A3A3C] hover:border-[#8E8E93]/40' : 'bg-[#F3F1EC] border-[#D5D0C8] hover:border-[#3D3D44]'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-xs font-semibold font-sans leading-snug flex-1 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{agent.name}</h4>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${style.badge} border-current/30`}>
          {agent.category}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {agent.platform && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'bg-[#3A3A3C]/50 border-[#3A3A3C] text-[#8E8E93]' : 'bg-white border-[#D5D0C8] text-[#3D3D44]'}`}>
            {agent.platform}
          </span>
        )}
        {agent.stageName && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'bg-[#3A3A3C]/50 border-[#3A3A3C] text-[#8E8E93]' : 'bg-white border-[#D5D0C8] text-[#3D3D44]'}`}>
            {agent.stageName}
          </span>
        )}
      </div>
      <p className={`text-[11px] font-sans leading-relaxed mb-2.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{agent.rationale}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-mono font-semibold ${impactColor}`}>{agent.impact} Impact</span>
        <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>·</span>
        <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{agent.effort}</span>
      </div>
    </div>
  );
}

export default function PlanPage() {
  const router   = useRouter();
  const { isDark } = useTheme();
  const ran      = useRef(false);

  const [process,  setProcess]  = useState(null);
  const [company,  setCompany]  = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [plan,     setPlan]     = useState(null);
  const [pagePhase, setPagePhase] = useState('loading');
  const [error,    setError]    = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [insightsExpanded,  setInsightsExpanded]  = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const p  = JSON.parse(sessionStorage.getItem('demo_process')   ?? 'null');
    const d  = JSON.parse(sessionStorage.getItem('demo_discovery') ?? 'null');
    const co = JSON.parse(sessionStorage.getItem('demo_company')   ?? 'null');
    const tech = JSON.parse(sessionStorage.getItem('demo_tech')    ?? '{}');

    if (!p || !d) { router.push('/'); return; }
    setProcess(p);
    setDiscovery(d);
    setCompany(co);

    const cached = sessionStorage.getItem('demo_plan');
    if (cached) {
      setPlan(JSON.parse(cached));
      setPagePhase('done');
      return;
    }

    generatePlan(p, tech, d);
  }, []);

  async function generatePlan(p, tech, d) {
    try {
      const res  = await fetch('/api/demo/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processName: p.name, techStack: tech, discovery: d }),
      });
      if (!res.ok) throw new Error('Plan API error');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      sessionStorage.setItem('demo_plan', JSON.stringify(data));
      setPlan(data);
      setPagePhase('done');
    } catch (e) {
      setError(e.message || 'Plan generation failed.');
      setPagePhase('error');
    }
  }

  function downloadMarkdown() {
    const techList = Object.values(JSON.parse(sessionStorage.getItem('demo_tech') ?? '{}')).flat().filter(Boolean);
    let md = `# ${process?.name} — AI Activation Roadmap\n\n`;
    if (company?.name) md += `**Company:** ${company.name}  \n`;
    md += `**Coverage:** ${discovery?.overallScore ?? 0}%  \n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}  \n\n---\n\n`;
    if (plan?.summary) md += `## Overview\n\n${plan.summary}\n\n---\n\n`;
    for (const ph of plan?.phases ?? []) {
      md += `## Phase ${ph.number}: ${ph.name} *(${ph.timeframe})*\n\n${ph.description}\n\n`;
      for (const a of ph.agents ?? []) {
        md += `### ${a.name}\n- **Platform:** ${a.platform}\n- **Stage:** ${a.stageName}\n- **Impact:** ${a.impact} | **Effort:** ${a.effort}\n> ${a.rationale}\n\n`;
      }
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${(process?.name ?? 'plan').replace(/\s+/g, '-').toLowerCase()}-roadmap.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function getFilteredAgents(agents) {
    if (!activeStageFilter) return agents ?? [];
    return (agents ?? []).filter(a => a.stageId === activeStageFilter);
  }

  const techList = typeof window !== 'undefined'
    ? Object.values(JSON.parse(sessionStorage.getItem('demo_tech') ?? '{}')).flat().filter(t => t && t !== 'None')
    : [];

  const overallScore = discovery?.overallScore ?? 0;
  const totalAgents  = (plan?.phases ?? []).reduce((n, ph) => n + (ph.agents?.length ?? 0), 0);

  /* ── Loading ── */
  if (pagePhase === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0B0E]' : 'bg-[#F3F1EC]'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F5A623]" />
            </span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-1">Generating Roadmap</p>
          <p className={`text-sm font-serif ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Structuring your 3-phase implementation plan...
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (pagePhase === 'error') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0B0E] text-[#F1F1F3]' : 'bg-[#F3F1EC] text-[#18181A]'}`}>
        <div className={`rounded-2xl border p-8 max-w-sm text-center ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
          <p className="text-[#F5A623] font-mono text-xs uppercase tracking-widest mb-2">Error</p>
          <p className={`text-sm mb-4 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{error}</p>
          <button onClick={() => router.push('/')} className="text-xs font-mono text-[#F5A623] hover:underline">
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B0B0E] text-[#F1F1F3]' : 'bg-[#F3F1EC] text-[#18181A]'}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-16">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <button onClick={() => router.push('/')} className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 mb-1 transition-colors ${isDark ? 'text-[#8E8E93] hover:text-[#F5A623]' : 'text-[#3D3D44] hover:text-[#F5A623]'}`}>
              <ArrowLeft size={11} /> Discovery Studio
            </button>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">AI Activation Roadmap</span>
            <h1 className={`font-serif text-3xl font-normal mt-0.5 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
              {process?.name}
            </h1>
            {company?.name && (
              <p className={`font-mono text-xs mt-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                {company.name} · 3-phase implementation plan
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open('/analysis', '_blank', 'noopener')}
              className={`px-4 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#F5A623]/40 hover:text-[#F5A623]' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#F5A623]'}`}
            >
              Full Analysis <ExternalLink size={11} />
            </button>
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] transition-all"
            >
              <Download size={11} /> Download
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Current Coverage', value: `${overallScore}%`, sub: overallScore >= 70 ? 'Strong' : overallScore >= 40 ? 'Developing' : 'Early stage', accent: scoreBarColor(overallScore) },
            { label: 'Stages Assessed',  value: (discovery?.stageScores ?? []).length, sub: process?.name,  accent: '#F1F1F3' },
            { label: 'AI Agents Planned', value: totalAgents, sub: 'across 3 phases', accent: '#30D5C8' },
            { label: 'Time to Value',    value: '24 wks',    sub: 'full deployment',  accent: '#A78BFA' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
              <div className="font-serif text-2xl font-medium tabular-nums" style={{ color: s.accent }}>{s.value}</div>
              <div className={`text-[11px] font-sans font-medium mt-0.5 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{s.label}</div>
              <div className={`text-[10px] font-mono mt-0.5 truncate ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Plan summary ── */}
        {plan.summary && (
          <div className={`rounded-2xl border p-5 mb-6 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-2">The big picture</p>
            <p className={`text-sm font-serif leading-relaxed ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{plan.summary}</p>
          </div>
        )}

        {/* ── Stage filter ── */}
        {(discovery?.stageScores ?? []).length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <p className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Filter by stage</p>
              {activeStageFilter && (
                <button onClick={() => setActiveStageFilter(null)} className="text-[10px] font-mono text-[#F5A623] hover:underline cursor-pointer">Clear</button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {discovery.stageScores.map(s => {
                const barColor = scoreBarColor(s.score);
                const active   = activeStageFilter === s.stageId;
                return (
                  <button
                    key={s.stageId}
                    onClick={() => setActiveStageFilter(active ? null : s.stageId)}
                    className={`flex-shrink-0 w-36 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[#F5A623] bg-[#F5A623]/8'
                        : isDark ? 'border-[#3A3A3C] bg-[#1C1C1E] hover:border-[#8E8E93]/40' : 'border-[#D5D0C8] bg-white hover:border-[#3D3D44]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif text-base tabular-nums" style={{ color: barColor }}>{maturityScore(s.score).toFixed(1)}</span>
                      <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded border ${priorityBadge(s.priority)}`}>{s.priority}</span>
                    </div>
                    <div className={`h-1 rounded-full mb-1.5 overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: barColor }} />
                    </div>
                    <p className={`text-[10px] font-sans line-clamp-2 leading-snug ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{s.stageName}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Key Insights ── */}
        {(discovery?.insights ?? []).length > 0 && (
          <div className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
            <button
              onClick={() => setInsightsExpanded(e => !e)}
              className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-[#3A3A3C]/20' : 'hover:bg-[#F3F1EC]'}`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">
                Key Insights ({discovery.insights.length})
              </p>
              <ChevronDown size={14} className={`transition-transform ${insightsExpanded ? 'rotate-180' : ''} ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`} />
            </button>
            <AnimatePresence>
              {insightsExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`px-5 pb-5 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
                    {discovery.insights.map((ins, i) => {
                      const colors = {
                        Opportunity: 'bg-[#30D5C8]/8 border-[#30D5C8]/25 text-[#30D5C8]',
                        Risk:        'bg-red-400/8 border-red-400/25 text-red-400',
                        Action:      'bg-[#F5A623]/8 border-[#F5A623]/25 text-[#F5A623]',
                        Watch:       'bg-[#A78BFA]/8 border-[#A78BFA]/25 text-[#A78BFA]',
                        Insight:     `bg-[#8E8E93]/8 border-[#8E8E93]/25 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`,
                      };
                      const c = colors[ins.type] ?? colors.Insight;
                      return (
                        <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${c}`}>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-current/30 shrink-0">{ins.type}</span>
                          <p className="text-xs font-sans leading-relaxed">{ins.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── 3-Phase Roadmap ── */}
        <p className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          3-Phase AI Activation Roadmap
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {(plan.phases ?? []).map((ph, phIdx) => {
            const s      = PHASE_STYLES[phIdx] ?? PHASE_STYLES[0];
            const agents = getFilteredAgents(ph.agents);
            return (
              <div key={ph.number} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
                <div className={`p-4 border-b ${s.light} ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`} style={{ borderLeftWidth: 3, borderLeftColor: s.accent }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${s.badge}`}>
                      {ph.number}
                    </span>
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${s.text}`}>{s.label}</span>
                  </div>
                  <h3 className={`font-serif text-base font-medium ${isDark ? 'text-white' : 'text-[#18181A]'}`}>{ph.name}</h3>
                  <p className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{ph.subtitle}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{ph.timeframe}</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${s.badge}`}>
                      {agents.length} agent{agents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {ph.description && (
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
                    <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{ph.description}</p>
                  </div>
                )}

                <div className="p-3 space-y-2.5">
                  {agents.length === 0 ? (
                    <p className={`text-xs text-center py-4 font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                      {activeStageFilter ? 'No agents for this stage' : 'No agents in this phase'}
                    </p>
                  ) : agents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} style={s} isDark={isDark} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer CTA ── */}
        <div className="rounded-2xl p-6 bg-gradient-to-tr from-[#F5A623]/15 to-[#FF6B35]/5 border border-[#F5A623]/20">
          <div className="text-center max-w-lg mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-2">Assessment Complete</p>
            <h2 className={`font-serif text-xl font-normal mb-2 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
              {overallScore}% automation coverage — roadmap ready
            </h2>
            <p className={`text-xs font-sans mb-5 leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              {(discovery?.stageScores ?? []).length} stages assessed{company?.name ? ` for ${company.name}` : ''}.
              {totalAgents > 0 ? ` ${totalAgents} agents scoped across 3 phases.` : ''}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold rounded-xl text-sm cursor-pointer hover:scale-[1.02] transition-all"
              >
                <Download size={14} /> Download Roadmap
              </button>
              <button
                onClick={() => window.open('/analysis', '_blank', 'noopener')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${isDark ? 'border-[#3A3A3C] text-[#F1F1F3] hover:border-[#F5A623]/40' : 'border-[#D5D0C8] text-[#18181A] hover:border-[#F5A623]'}`}
              >
                Full Analysis <ExternalLink size={13} />
              </button>
              <button
                onClick={() => router.push('/')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:text-[#F1F1F3]' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#18181A]'}`}
              >
                New Audit
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
