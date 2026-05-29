'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator, StoryContext } from '@/components/legacy/StepContext';

function scoreColor(score) {
  if (score >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-500', card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
  if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' };
  return { text: 'text-red-600', bg: 'bg-red-500', card: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700' };
}

function priorityBadge(priority) {
  if (priority === 'HIGH') return 'bg-red-100 text-red-700';
  if (priority === 'LOW') return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}

export default function DiscoverPage() {
  const router = useRouter();
  const ran = useRef(false);

  const [process, setProcess] = useState(null);
  const [company, setCompany] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [discovery, setDiscovery] = useState(null);
  const [error, setError] = useState('');
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [expandedStage, setExpandedStage] = useState(null);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const p = JSON.parse(sessionStorage.getItem('demo_process') || 'null');
    const tech = JSON.parse(sessionStorage.getItem('demo_tech') || '{}');
    const ctx = JSON.parse(sessionStorage.getItem('demo_process_context') || 'null');
    const co = JSON.parse(sessionStorage.getItem('demo_company') || 'null');
    const research = JSON.parse(sessionStorage.getItem('demo_research') || 'null');

    if (!p) { router.push('/'); return; }
    setProcess(p);
    setCompany(co);

    let processContext = ctx?.description || '';
    if (co?.name) processContext = `Company: ${co.name}. ${processContext}`;
    if (research?.processDescription) processContext += `\n\nAI Research findings:\n${research.processDescription}`;
    if (research?.industryBenchmark) processContext += `\nIndustry benchmark: ${research.industryBenchmark}`;

    const cached = sessionStorage.getItem('demo_discovery');
    if (cached) {
      const d = JSON.parse(cached);
      setDiscovery(d);
      setPhase('done');
      animateScore(d.overallScore);
      return;
    }

    // Animate stage progress during loading
    let stageIdx = 0;
    const stageTimer = setInterval(() => {
      stageIdx++;
      setStageProgress(stageIdx);
      if (stageIdx >= (p.stages?.length || 7)) clearInterval(stageTimer);
    }, 1200);

    runDiscovery(p, tech, processContext).finally(() => clearInterval(stageTimer));
  }, []);

  async function runDiscovery(p, tech, processContext) {
    try {
      const res = await fetch('/api/demo/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processName: p.name, stages: p.stages, techStack: tech, processContext }),
      });
      if (!res.ok) throw new Error('Discovery API error');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      sessionStorage.setItem('demo_discovery', JSON.stringify(data));
      setDiscovery(data);
      setPhase('done');
      animateScore(data.overallScore);
    } catch (e) {
      setError(e.message || 'Discovery failed. Please try again.');
      setPhase('error');
    }
  }

  function animateScore(target) {
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(current);
      if (current >= target) clearInterval(timer);
    }, 25);
  }

  function goToPlan() {
    router.push('/plan');
  }

  function retryDiscovery() {
    setPhase('loading');
    setStageProgress(0);
    const p = JSON.parse(sessionStorage.getItem('demo_process'));
    const t = JSON.parse(sessionStorage.getItem('demo_tech') || '{}');
    const c = JSON.parse(sessionStorage.getItem('demo_process_context') || 'null');
    const co = JSON.parse(sessionStorage.getItem('demo_company') || 'null');
    const r = JSON.parse(sessionStorage.getItem('demo_research') || 'null');
    let ctx = c?.description || '';
    if (co?.name) ctx = `Company: ${co.name}. ${ctx}`;
    if (r?.processDescription) ctx += `\n\nAI Research findings:\n${r.processDescription}`;
    runDiscovery(p, t, ctx);
  }

  // Build story context
  const storyItems = [];
  if (process) storyItems.push({ icon: process.emoji || 'ðŸ“‹', label: process.name });
  if (company?.name) storyItems.push({ icon: 'ðŸ¢', label: company.name });
  const techList = typeof window !== 'undefined'
    ? Object.values(JSON.parse(sessionStorage.getItem('demo_tech') || '{}')).flat().filter(t => t && t !== 'None')
    : [];
  if (techList.length > 0) storyItems.push({ icon: 'âš™ï¸', label: `${techList.length} tools` });

  // â”€â”€ Loading â”€â”€
  if (phase === 'loading') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }} className="animate-fade-in-up">
        <StepIndicator current={4} />
        <StoryContext items={storyItems} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--c-puBg)', border: '1px solid var(--c-puBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <div style={{ width: 22, height: 22, border: '2.5px solid var(--c-pu)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
          <p className="section-tag" style={{ marginBottom: 4 }}>Automation Analysis</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 4 }}>Scoring each process stage</h2>
          <p style={{ fontSize: 12, color: 'var(--c-mu)', lineHeight: 1.6 }}>
            Evaluating {company?.name ? <><strong style={{ color: 'var(--c-tx)' }}>{company.name}</strong>&apos;s</> : 'your'} technology coverage across{' '}
            <strong style={{ color: 'var(--c-tx)' }}>{process?.name}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="section-tag">Scanning stages</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, color: 'var(--c-pu)' }}>
              {Math.min(stageProgress, process?.stages?.length || 7)} / {process?.stages?.length || 7}
            </span>
          </div>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(process?.stages || []).map((stage, i) => {
              const done    = i < stageProgress;
              const active  = i === stageProgress;
              return (
                <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 4, background: done ? 'var(--c-grBg)' : 'var(--c-sf2)', border: `1px solid ${done ? 'var(--c-grBd)' : 'var(--c-b)'}` }}>
                  {done ? (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--c-grBg)', color: 'var(--c-gr)', border: '1px solid var(--c-grBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>âœ“</span>
                  ) : active ? (
                    <div style={{ width: 18, height: 18, border: '2px solid var(--c-pu)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--c-b2)', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 11, color: done ? 'var(--c-mu)' : active ? 'var(--c-pu)' : 'var(--c-dm)' }}>{stage.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // â”€â”€ Error â”€â”€
  if (phase === 'error') {
    return (
      <div className="max-w-md mx-auto animate-fade-in-up">
        <StepIndicator current={4} />
        <StoryContext items={storyItems} />
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <span className="text-2xl">âš ï¸</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Discovery hit a roadblock</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/input')} className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              â† Back to tools
            </button>
            <button onClick={retryDiscovery} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!discovery) return null;

  const overallColors = scoreColor(discovery.overallScore);
  const highPriority = (discovery.stageScores || []).filter(s => s.priority === 'HIGH').length;
  const stagesCount = (discovery.stageScores || []).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <StepIndicator current={4} />
      <StoryContext items={storyItems} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button className="btn-back" onClick={() => router.push('/input')}>â†</button>
        <div>
          <p className="section-tag" style={{ marginBottom: 2 }}>Automation Analysis</p>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-tx)', letterSpacing: '-0.01em' }}>
            {company?.name ? `${company.name} â€” ` : ''}Coverage assessment
          </h1>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--c-mu)', marginBottom: 20, marginLeft: 40, lineHeight: 1.6 }}>
        {stagesCount} stages of <strong style={{ color: 'var(--c-tx)' }}>{process?.name}</strong> scored against{' '}
        {techList.length > 0
          ? <><strong style={{ color: 'var(--c-tx)' }}>{techList.length} tools</strong> in the confirmed stack</>
          : 'the confirmed technology stack'
        }.
      </p>

      {/* Hero score card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-shrink-0 text-center min-w-[120px]">
            <div className={`text-5xl font-black ${overallColors.text} leading-none tracking-tight`}>
              {animatedScore}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">Automation Coverage</div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${overallColors.bg}`}
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>

          <div className="flex-1 border-l border-slate-100 pl-6 hidden sm:block">
            <p className="text-sm text-slate-600 leading-relaxed">{discovery.executiveSummary}</p>
            {techList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {techList.map(t => (
                  <span key={t} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex sm:flex-col gap-2">
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-black text-red-600">{highPriority}</div>
              <div className="text-[9px] text-red-400 font-medium uppercase">Critical gaps</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
              <div className="text-xl font-black text-slate-700">{stagesCount}</div>
              <div className="text-[9px] text-slate-400 font-medium uppercase">Stages scanned</div>
            </div>
          </div>
        </div>

        {/* Mobile summary */}
        <div className="sm:hidden mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">{discovery.executiveSummary}</p>
        </div>
      </div>

      {/* Stage heatmap */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">The full picture â€” stage by stage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 stagger-children">
          {(discovery.stageScores || []).map(stage => {
            const c = scoreColor(stage.score);
            const isOpen = expandedStage === stage.stageId;
            const ratingColors = {
              AUTOMATED:     'bg-emerald-100 text-emerald-700',
              PARTIAL:       'bg-amber-100 text-amber-700',
              MANUAL:        'bg-orange-100 text-orange-700',
              NOT_IN_PLACE:  'bg-red-100 text-red-700',
            };
            const ratingLabels = { AUTOMATED: 'AUTO', PARTIAL: 'PART', MANUAL: 'MAN', NOT_IN_PLACE: 'NONE' };
            return (
              <div key={stage.stageId} className={`rounded-xl border transition-all ${c.card}`}>
                {/* Header row */}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-[11px] font-bold text-slate-800 leading-snug flex-1">{stage.stageName}</h3>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${priorityBadge(stage.priority)}`}>
                      {stage.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-black ${c.text}`}>{stage.score}%</span>
                    {stage.phase && (
                      <span className="text-[9px] text-slate-400 font-medium">{stage.phase}</span>
                    )}
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5 mb-2.5">
                    <div className={`h-1.5 rounded-full ${c.bg}`} style={{ width: `${stage.score}%` }} />
                  </div>

                  {stage.gap && (
                    <p className="text-[10px] text-slate-600 leading-snug border-t border-white/50 pt-2">
                      {stage.gap}
                    </p>
                  )}
                </div>

                {/* Activity drill-down toggle */}
                {(stage.activities || []).length > 0 && (
                  <button
                    onClick={() => setExpandedStage(isOpen ? null : stage.stageId)}
                    className="w-full flex items-center justify-between px-3.5 py-2 border-t border-white/50 text-[9px] font-bold text-slate-400 hover:bg-white/30 transition-colors"
                  >
                    <span>{stage.activities.length} activities rated</span>
                    <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>â–¾</span>
                  </button>
                )}

                {/* Activity breakdown */}
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-white/30 space-y-1.5">
                    {(stage.activities || []).map((act, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600 leading-snug flex-1">{act.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ratingColors[act.rating] || 'bg-slate-100 text-slate-500'}`}>
                          {ratingLabels[act.rating] || act.rating}
                        </span>
                      </div>
                    ))}
                    {/* Dimension scores mini-bar */}
                    {stage.dimensionScores && (
                      <div className="pt-2 mt-1 border-t border-white/40 space-y-1">
                        {[
                          { key: 'pain',              label: 'Pain',    color: 'bg-red-400' },
                          { key: 'data',              label: 'Data',    color: 'bg-blue-400' },
                          { key: 'processDefinition', label: 'Process', color: 'bg-purple-400' },
                          { key: 'integration',       label: 'Integr',  color: 'bg-indigo-400' },
                          { key: 'adoption',          label: 'Adopt',   color: 'bg-emerald-400' },
                        ].map(d => (
                          <div key={d.key} className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 w-10 flex-shrink-0">{d.label}</span>
                            <div className="flex-1 bg-white/50 rounded-full h-1">
                              <div className={`h-1 rounded-full ${d.color}`} style={{ width: `${((stage.dimensionScores[d.key] || 0) / 5) * 100}%` }} />
                            </div>
                            <span className="text-[9px] text-slate-400 w-5 text-right">{(stage.dimensionScores[d.key] || 0).toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /> &lt;40% â€” needs attention</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 40â€“70% â€” room to grow</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;70% â€” well covered</div>
        </div>
      </div>

      {/* Key AI insights */}
      {(discovery.insights || []).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <button
            onClick={() => setExpandedInsights(e => !e)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
          >
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              What the AI noticed ({(discovery.insights || []).length} insights)
            </h2>
            <span className={`text-slate-400 text-xs transition-transform ${expandedInsights ? 'rotate-180' : ''}`}>â–¾</span>
          </button>
          {expandedInsights && (
            <div className="px-5 pb-4 border-t border-slate-100 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {(discovery.insights || []).map((ins, i) => {
                  const icons = { Opportunity: 'ðŸŸ¢', Risk: 'ðŸ”´', Action: 'ðŸ”µ', Watch: 'ðŸŸ¡', Insight: 'âšª' };
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs flex-shrink-0 mt-0.5">{icons[ins.type] || 'âšª'}</span>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{ins.type}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{ins.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Narrative transition CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Analysis Complete</p>
            <h2 className="text-base font-bold mb-1">
              {discovery.overallScore >= 70
                ? 'Strong coverage â€” optimisation opportunities identified'
                : discovery.overallScore >= 40
                ? 'Developing maturity â€” clear automation pathway available'
                : 'Significant headroom â€” high-value opportunities scoped'}
            </h2>
            <p className="text-purple-100 text-sm">
              A phased implementation roadmap with scoped agents for each gap.
            </p>
          </div>
          <button
            onClick={goToPlan}
            className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-purple-50 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
          >
            View Roadmap â†’
          </button>
        </div>
      </div>
    </div>
  );
}
