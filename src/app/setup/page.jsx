'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TECH_CATEGORIES } from '@/lib/processes';
import { StepIndicator, StoryContext } from '@/components/legacy/StepContext';

function buildAiSelections(inferredTechStack) {
  const result = {};
  if (!Array.isArray(inferredTechStack)) return result;
  for (const cat of TECH_CATEGORIES) {
    const matched = cat.options.filter(opt =>
      opt !== 'None' && inferredTechStack.some(t =>
        t.toLowerCase().includes(opt.toLowerCase()) ||
        opt.toLowerCase().includes(t.toLowerCase())
      )
    );
    if (matched.length > 0) result[cat.id] = matched;
  }
  return result;
}

export default function SetupPage() {
  const router = useRouter();
  const [process, setProcess]   = useState(null);
  const [selected, setSelected] = useState({});
  const [aiRec, setAiRec]       = useState({});
  const [company, setCompany]   = useState(null);

  useEffect(() => {
    const p = JSON.parse(sessionStorage.getItem('demo_process') || 'null');
    if (!p) { router.push('/'); return; }
    setProcess(p);
    setCompany(JSON.parse(sessionStorage.getItem('demo_company') || 'null'));
    const savedTech = JSON.parse(sessionStorage.getItem('demo_tech') || 'null');
    if (savedTech) {
      setSelected(savedTech);
    } else {
      const research = JSON.parse(sessionStorage.getItem('demo_research') || 'null');
      if (research?.inferredTechStack?.length) {
        const aiSel = buildAiSelections(research.inferredTechStack);
        setSelected(aiSel);
        setAiRec(aiSel);
      }
    }
  }, []);

  function toggle(catId, option) {
    setSelected(prev => {
      const current = prev[catId] || [];
      if (option === 'None') return { ...prev, [catId]: ['None'] };
      const withoutNone = current.filter(x => x !== 'None');
      const exists = withoutNone.includes(option);
      return { ...prev, [catId]: exists ? withoutNone.filter(x => x !== option) : [...withoutNone, option] };
    });
  }

  function isSelected(catId, option) { return (selected[catId] || []).includes(option); }
  function isAiRec(catId, option)    { return (aiRec[catId] || []).includes(option); }

  function proceed() {
    const prev = sessionStorage.getItem('demo_tech');
    const next = JSON.stringify(selected);
    sessionStorage.setItem('demo_tech', next);
    if (prev !== next) {
      sessionStorage.removeItem('demo_discovery');
      sessionStorage.removeItem('demo_plan');
    }
    router.push('/input');
  }

  const totalSelected = Object.values(selected).flat().filter(v => v !== 'None').length;
  const canProceed    = totalSelected > 0 || Object.values(selected).some(arr => arr.includes('None'));
  const hasAiRec      = Object.values(aiRec).flat().length > 0;

  if (!process) return null;

  const storyItems = [{ icon: process.emoji, label: process.name }];
  if (company?.name) storyItems.push({ icon: 'ðŸ¢', label: company.name });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fade-in-up">
      <StepIndicator current={2} />
      <StoryContext items={storyItems} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-back" onClick={() => router.push('/')}>â†</button>
          <div>
            <p className="section-tag" style={{ marginBottom: 2 }}>Technology Stack</p>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-tx)', letterSpacing: '-0.01em' }}>
              {company?.name ? `${company.name} â€” ` : ''}Technology profile
            </h1>
          </div>
        </div>
        {totalSelected > 0 && (
          <span className="pill pill-blue">
            {totalSelected} selected
          </span>
        )}
      </div>

      {/* Pre-filled notice */}
      {hasAiRec && (
        <div className="banner-info animate-slide-down" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
          <span style={{ flexShrink: 0, fontSize: 12, marginTop: 1 }}>â“˜</span>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-ac)', lineHeight: 1.6 }}>
            Pre-filled based on the {company?.name} profile. Review and adjust to match your actual environment.
          </p>
        </div>
      )}

      {/* Category grid */}
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
        {TECH_CATEGORIES.map((cat, catIdx) => {
          const catCount = (selected[cat.id] || []).filter(v => v !== 'None').length;
          return (
            <div
              key={cat.id}
              style={{
                padding: '16px 20px',
                borderBottom: catIdx < TECH_CATEGORIES.length - 1 ? '1px solid var(--c-b)' : 'none',
              }}
            >
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-mu)' }}>
                  {cat.label}
                </span>
                {catCount > 0 && (
                  <span className="pill pill-blue" style={{ marginLeft: 'auto' }}>
                    {catCount} selected
                  </span>
                )}
              </div>

              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.options.map(opt => {
                  const sel    = isSelected(cat.id, opt);
                  const ai     = isAiRec(cat.id, opt);
                  const isNone = opt === 'None';
                  return (
                    <button
                      key={opt}
                      onClick={() => toggle(cat.id, opt)}
                      className={`tech-chip ${isNone ? 'tech-chip-none' : ''} ${sel ? 'tech-chip-selected' : ''}`}
                    >
                      {sel && !isNone && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span>{opt}</span>
                      {ai && !isNone && (
                        <span className="ai-badge">AI</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {totalSelected > 0 && (
        <div className="panel animate-slide-down" style={{ padding: 16, marginBottom: 16 }}>
          <p className="section-tag" style={{ marginBottom: 10 }}>
            Your technology toolkit Â· {totalSelected} tools
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TECH_CATEGORIES.map(cat =>
              (selected[cat.id] || []).filter(v => v !== 'None').map(tool => (
                <span
                  key={`${cat.id}-${tool}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 500,
                    background: 'var(--c-sf2)', border: '1px solid var(--c-b2)',
                    color: 'var(--c-tx)', padding: '3px 10px', borderRadius: 3,
                  }}
                >
                  {tool}
                  {isAiRec(cat.id, tool) && (
                    <span style={{ fontSize: 8, fontWeight: 700, background: 'var(--c-puBg)', color: 'var(--c-pu)', padding: '1px 4px', borderRadius: 2 }}>AI</span>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={proceed} disabled={!canProceed}>
        {canProceed ? 'Continue to Context â†’' : 'Select at least one tool to continue'}
      </button>

    </div>
  );
}
