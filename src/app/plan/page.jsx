'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator, StoryContext } from '../page';

const PHASE_STYLES = [
  { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', number: 'bg-blue-600', narrative: 'Quick wins — build momentum and prove value' },
  { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', number: 'bg-purple-600', narrative: 'Core transformation — tackle the big gaps' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', number: 'bg-orange-500', narrative: 'Scale and optimise — full automation maturity' },
];

function scoreColor(score) {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50';
  if (score >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

function impactColor(impact) {
  if (impact === 'High') return 'bg-emerald-100 text-emerald-700';
  if (impact === 'Low') return 'bg-slate-100 text-slate-500';
  return 'bg-amber-100 text-amber-700';
}

function effortColor(effort) {
  if (effort?.includes('1-2 weeks') || effort?.includes('2-4 weeks')) return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-600';
}

export default function PlanPage() {
  const router = useRouter();
  const ran = useRef(false);

  const [process, setProcess] = useState(null);
  const [company, setCompany] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [plan, setPlan] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const p = JSON.parse(sessionStorage.getItem('demo_process') || 'null');
    const d = JSON.parse(sessionStorage.getItem('demo_discovery') || 'null');
    const co = JSON.parse(sessionStorage.getItem('demo_company') || 'null');
    const tech = JSON.parse(sessionStorage.getItem('demo_tech') || '{}');

    if (!p || !d) { router.push('/'); return; }
    setProcess(p);
    setDiscovery(d);
    setCompany(co);

    const cached = sessionStorage.getItem('demo_plan');
    if (cached) {
      setPlan(JSON.parse(cached));
      setPhase('done');
      return;
    }

    generatePlan(p, tech, d);
  }, []);

  async function generatePlan(p, tech, d) {
    try {
      const res = await fetch('/api/demo/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processName: p.name, techStack: tech, discovery: d }),
      });
      if (!res.ok) throw new Error('Plan API error');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      sessionStorage.setItem('demo_plan', JSON.stringify(data));
      setPlan(data);
      setPhase('done');
    } catch (e) {
      setError(e.message || 'Plan generation failed. Please try again.');
      setPhase('error');
    }
  }

  function exportPdf() { window.print(); }

  function exportJson() {
    const data = { exportedAt: new Date().toISOString(), process: process?.name, company: company?.name, discovery, plan };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `levelshift-activation-plan-${Date.now()}.json`;
    a.click();
  }

  function startOver() {
    ['demo_plan', 'demo_discovery', 'demo_tech', 'demo_process', 'demo_company', 'demo_research', 'demo_process_context'].forEach(k => sessionStorage.removeItem(k));
    router.push('/');
  }

  function getFilteredAgents(phaseAgents) {
    if (!activeStageFilter) return phaseAgents;
    return phaseAgents.filter(a => a.stageId === activeStageFilter);
  }

  // Build story context
  const storyItems = [];
  if (process) storyItems.push({ icon: process.emoji || '📋', label: process.name });
  if (company?.name) storyItems.push({ icon: '🏢', label: company.name });
  const techList = typeof window !== 'undefined'
    ? Object.values(JSON.parse(sessionStorage.getItem('demo_tech') || '{}')).flat().filter(t => t && t !== 'None')
    : [];
  if (techList.length > 0) storyItems.push({ icon: '⚙️', label: `${techList.length} tools` });
  if (discovery) storyItems.push({ icon: '🔍', label: `${discovery.overallScore}% coverage` });

  // ── Loading ──
  if (phase === 'loading') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }} className="animate-fade-in-up">
        <StepIndicator current={5} />
        <StoryContext items={storyItems} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--c-puBg)', border: '1px solid var(--c-puBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <div style={{ width: 22, height: 22, border: '2.5px solid var(--c-pu)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p className="section-tag" style={{ marginBottom: 4 }}>Automation Roadmap</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 4 }}>Generating roadmap</h2>
          <p style={{ fontSize: 12, color: 'var(--c-mu)' }}>Structuring a phased implementation plan from assessment findings</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Prioritising gaps by impact and implementation effort', 'Mapping agents to each automation opportunity', 'Structuring a 3-phase deployment timeline'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--c-sf2)', border: '1px solid var(--c-b)', borderRadius: 4 }}>
                <div style={{ width: 12, height: 12, border: '2px solid var(--c-pu)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-mu)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (phase === 'error') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }} className="animate-fade-in-up">
        <StepIndicator current={5} />
        <StoryContext items={storyItems} />
        <div className="card" style={{ padding: 32, textAlign: 'center', marginTop: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--c-rdBg)', border: '1px solid var(--c-rdBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <span style={{ color: 'var(--c-rd)' }}>⚠</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 4 }}>Roadmap generation failed</p>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--c-rd)', marginBottom: 20 }}>{error}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={() => router.push('/discover')}>← Back</button>
            <button
              style={{ padding: '7px 16px', background: 'var(--c-ac)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setPhase('loading'); const p = JSON.parse(sessionStorage.getItem('demo_process')); const t = JSON.parse(sessionStorage.getItem('demo_tech') || '{}'); const d = JSON.parse(sessionStorage.getItem('demo_discovery')); generatePlan(p, t, d); }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const totalAgents = (plan.phases || []).reduce((sum, ph) => sum + (ph.agents || []).length, 0);
  const overallScore = discovery?.overallScore || 0;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <StepIndicator current={5} />
      <StoryContext items={storyItems} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-back" onClick={() => router.push('/discover')}>←</button>
          <div>
            <p className="section-tag" style={{ marginBottom: 2 }}>Automation Roadmap</p>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-tx)', letterSpacing: '-0.01em' }}>
              {company?.name ? `${company.name} — ` : ''}Phased implementation plan
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }} className="no-print">
          <button className="btn-ghost" onClick={exportJson}>↓ JSON</button>
          <button className="btn-ghost" onClick={exportPdf}>↓ PDF</button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--c-mu)', marginBottom: 20, marginLeft: 40, lineHeight: 1.6 }} className="no-print">
        Analysis across {(discovery?.stageScores || []).length} stages of <strong style={{ color: 'var(--c-tx)' }}>{process?.name}</strong>,
        scored against the confirmed technology stack. Delivered as a 3-phase implementation roadmap.
      </p>

      {/* Journey summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 stagger-children">
        {[
          { label: 'Current Coverage', value: `${overallScore}%`, sub: overallScore >= 70 ? 'Strong' : overallScore >= 40 ? 'Developing' : 'Early Stage', color: scoreColor(overallScore) },
          { label: 'Stages Assessed', value: (discovery?.stageScores || []).length, sub: `across ${process?.name}`, color: 'text-slate-700 bg-slate-50' },
          { label: 'AI Agents Planned', value: totalAgents, sub: 'across 3 phases', color: 'text-blue-700 bg-blue-50' },
          { label: 'Time to Value', value: '24 wks', sub: 'full deployment', color: 'text-purple-700 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-slate-200 p-4 text-center ${s.color.split(' ')[1] || 'bg-white'}`}>
            <div className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-[11px] font-medium text-slate-600 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Plan summary — the narrative */}
      {plan.summary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">The big picture</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{plan.summary}</p>
        </div>
      )}

      {/* Stage filter cards */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by stage</h2>
          {activeStageFilter && (
            <button onClick={() => setActiveStageFilter(null)} className="text-[11px] text-blue-600 hover:underline">
              Clear filter
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(discovery?.stageScores || []).map(stage => {
            const isActive = activeStageFilter === stage.stageId;
            const scoreNum = stage.score;
            const barColor = scoreNum >= 70 ? 'bg-emerald-500' : scoreNum >= 40 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <button
                key={stage.stageId}
                onClick={() => setActiveStageFilter(isActive ? null : stage.stageId)}
                className={`flex-shrink-0 w-36 p-3 rounded-xl border-2 text-left transition-all ${
                  isActive ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-base font-black ${scoreNum >= 70 ? 'text-emerald-600' : scoreNum >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {stage.score}%
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    stage.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    stage.priority === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{stage.priority}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 mb-1.5">
                  <div className={`h-1 rounded-full ${barColor}`} style={{ width: `${stage.score}%` }} />
                </div>
                <p className="text-[10px] text-slate-600 font-medium leading-snug line-clamp-2">{stage.stageName}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key AI Insights — collapsible */}
      {(discovery?.insights || []).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <button
            onClick={() => setInsightsExpanded(e => !e)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
          >
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key insights from Chapter 4</h2>
            <span className="text-slate-400 text-xs">{insightsExpanded ? '▲ Collapse' : '▼ Expand'}</span>
          </button>
          {insightsExpanded && (
            <div className="px-5 pb-5 border-t border-slate-100 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {(discovery.insights || []).map((ins, i) => {
                  const colors = {
                    Opportunity: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    Risk: 'bg-red-50 border-red-200 text-red-700',
                    Action: 'bg-blue-50 border-blue-200 text-blue-700',
                    Watch: 'bg-amber-50 border-amber-200 text-amber-700',
                    Insight: 'bg-slate-50 border-slate-200 text-slate-700',
                  };
                  const c = colors[ins.type] || colors.Insight;
                  return (
                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border ${c}`}>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${c}`}>
                        {ins.type.toUpperCase()}
                      </span>
                      <p className="text-xs leading-relaxed">{ins.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-Phase columns — the roadmap */}
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Your 3-phase roadmap</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {(plan.phases || []).map((ph, phIdx) => {
          const style = PHASE_STYLES[phIdx] || PHASE_STYLES[0];
          const agents = getFilteredAgents(ph.agents || []);
          return (
            <div key={ph.number} className={`rounded-2xl border overflow-hidden ${style.border}`}>
              {/* Phase header */}
              <div className={`${style.bg} p-4 text-white`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
                    {ph.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Phase {ph.number}</span>
                </div>
                <h3 className="text-base font-bold">{ph.name}</h3>
                <p className="text-xs opacity-80 mt-0.5">{ph.subtitle}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] opacity-70">⏱ {ph.timeframe}</span>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                    {agents.length} agent{agents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Narrative description */}
              <div className={`px-4 py-3 border-b ${style.border} ${style.light}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{style.narrative}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{ph.description}</p>
              </div>

              {/* Agent cards */}
              <div className={`p-3 space-y-2.5 ${style.light}`}>
                {agents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {activeStageFilter ? 'No agents for this stage in this phase' : 'No agents in this phase'}
                  </p>
                ) : (
                  agents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} style={style} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conclusion CTA */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg no-print">
        <div className="text-center max-w-lg mx-auto">
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Assessment Complete</p>
          <h2 className="text-lg font-bold mb-2">
            {overallScore}% automation coverage — roadmap ready
          </h2>
          <p className="text-violet-100 text-sm mb-5 leading-relaxed">
            {(discovery?.stageScores || []).length} stages assessed across {company?.name ? `${company.name}'s` : 'the'} {process?.name} process.
            {totalAgents} agents scoped across 3 implementation phases.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={exportJson} className="bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors">
              Export Roadmap
            </button>
            <button onClick={() => router.push('/workflow')} className="bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors shadow-sm flex items-center gap-2">
              Agent Workflow →
            </button>
            <button onClick={startOver} className="bg-violet-800/60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-800/80 transition-colors">
              New Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Print-only */}
      <div className="print-only mt-8">
        <h1 className="text-2xl font-bold mb-2">{company?.name ? `${company.name} · ` : ''}{process?.name} — AI Activation Plan</h1>
        <p className="text-sm text-gray-500 mb-4">Generated: {new Date().toLocaleDateString()} · Coverage: {overallScore}%</p>
        <p className="text-sm mb-6">{plan.summary}</p>
        {(plan.phases || []).map(ph => (
          <div key={ph.number} className="mb-6">
            <h2 className="font-bold text-lg mb-1">Phase {ph.number}: {ph.name} ({ph.timeframe})</h2>
            <p className="text-sm text-gray-600 mb-3">{ph.description}</p>
            {(ph.agents || []).map(a => (
              <div key={a.id} className="mb-2 pl-4 border-l-2 border-gray-200">
                <p className="text-sm font-bold">{a.name} <span className="font-normal text-gray-500">· {a.platform} · {a.stageName}</span></p>
                <p className="text-xs text-gray-600">{a.rationale}</p>
                <p className="text-xs text-gray-400">Effort: {a.effort} · Impact: {a.impact}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, style }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-xs font-bold text-slate-800 leading-snug flex-1">{agent.name}</h4>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${style.badge}`}>
          {agent.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {agent.platform && (
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
            {agent.platform}
          </span>
        )}
        {agent.stageName && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
            {agent.stageName}
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">{agent.rationale}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${impactColor(agent.impact)}`}>
          {agent.impact} Impact
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${effortColor(agent.effort)}`}>
          {agent.effort}
        </span>
      </div>
    </div>
  );
}
