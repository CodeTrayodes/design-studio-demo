'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PROCESSES } from '@/lib/processes';

/* Spinner rendered as a CSS-class element so @keyframes spin is guaranteed to apply */
function Spinner({ size = 22, thickness = 2.5 }) {
  return (
    <div
      className="animate-spin"
      style={{
        width: size, height: size,
        border: `${thickness}px solid var(--c-ac)`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
  );
}

/* ─── Shared: Step indicator ─────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: 'Scope',    path: '/'         },
  { num: 2, label: 'Stack',    path: '/setup'    },
  { num: 3, label: 'Context',  path: '/input'    },
  { num: 4, label: 'Analysis', path: '/discover' },
  { num: 5, label: 'Report',   path: '/plan'     },
];

export function StepIndicator({ current }) {
  const router = useRouter();
  return (
    <div className="step-row no-print">
      {STEPS.map((step, i) => {
        const done   = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => done && router.push(step.path)}
              className={`step-pill ${active ? 'step-pill-active' : done ? 'step-pill-done' : 'step-pill-future'}`}
            >
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fontWeight: 700 }}>
                {done ? '✓' : step.num}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${done ? 'step-line-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Shared: Assessment context breadcrumb ──────────────────────────────── */
export function StoryContext({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="story-row animate-slide-down">
      <span className="story-label">Assessment</span>
      <span style={{ color: 'var(--c-dm)', fontSize: 11 }}>·</span>
      {items.map((item, i) => (
        <span key={i} className="story-chip">
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Home Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  const router  = useRouter();
  const ran     = useRef(false);

  const [processId, setProcessId]                   = useState('');
  const [customProcessName, setCustomProcessName]   = useState('');
  const [companyName, setCompanyName]               = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [phase, setPhase]                           = useState('form');
  const [researchProgress, setResearchProgress]     = useState(0);
  const [isLongRunning, setIsLongRunning]           = useState(false);
  const [error, setError]                           = useState('');
  const [activeSession, setActiveSession]           = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const p    = JSON.parse(sessionStorage.getItem('demo_process')   || 'null');
    const co   = JSON.parse(sessionStorage.getItem('demo_company')   || 'null');
    const tech = JSON.parse(sessionStorage.getItem('demo_tech')      || 'null');
    const disc = JSON.parse(sessionStorage.getItem('demo_discovery') || 'null');
    const plan = JSON.parse(sessionStorage.getItem('demo_plan')      || 'null');
    if (p) {
      let step = 1; let resumePath = '/setup';
      if (plan)      { step = 5; resumePath = '/plan';     }
      else if (disc) { step = 4; resumePath = '/discover'; }
      else if (tech) { step = 3; resumePath = '/input';    }
      setActiveSession({ process: p, company: co, step, resumePath });
      setProcessId(p.id || 'custom');
      if (p.id === 'custom') setCustomProcessName(p.name || '');
      if (co?.name)        setCompanyName(co.name);
      if (co?.description) setCompanyDescription(co.description);
    }
  }, []);

  function getProcess() {
    if (!processId) return null;
    if (processId === 'custom') {
      if (!customProcessName.trim()) return null;
      return {
        id: 'custom', name: customProcessName.trim(), emoji: '✏️',
        tagline: 'Custom business process', timeEstimate: '10 minutes',
        exampleFinding: '', whatYouDiscover: [], stages: [],
      };
    }
    return PROCESSES[processId] || null;
  }

  const process    = getProcess();
  const canResearch = !!process && companyName.trim().length >= 2;

  async function runResearch() {
    if (!canResearch) return;
    setPhase('researching');
    setError('');
    setResearchProgress(0);
    setIsLongRunning(false);
    ['demo_company','demo_research','demo_process_context','demo_discovery','demo_plan','demo_tech']
      .forEach(k => sessionStorage.removeItem(k));
    sessionStorage.setItem('demo_process', JSON.stringify(process));

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setInterval(() => {
      setResearchProgress(p => { if (p >= 90) { clearInterval(timer); return 90; } return p + Math.random() * 14; });
    }, 600);

    /* Show "still working" hint after 20 s */
    const longRunTimer = setTimeout(() => setIsLongRunning(true), 20000);
    /* Hard abort after 120 s */
    const abortTimer   = setTimeout(() => controller.abort(), 120000);

    try {
      const res = await fetch('/api/demo/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:        companyName.trim(),
          companyDescription: companyDescription.trim(),
          processId:          process.id,
          processName:        process.name,
        }),
        signal: controller.signal,
      });
      clearInterval(timer);
      clearTimeout(longRunTimer);
      clearTimeout(abortTimer);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);
      const company = { name: companyName.trim(), description: companyDescription.trim() };
      sessionStorage.setItem('demo_company',  JSON.stringify(company));
      sessionStorage.setItem('demo_research', JSON.stringify(data));
      sessionStorage.setItem('demo_process_context', JSON.stringify({
        method: 'research', methodLabel: 'AI Company Research',
        description: data.processDescription,
      }));
      if (process.id === 'custom' && data.stages?.length) {
        sessionStorage.setItem('demo_process', JSON.stringify({ ...process, stages: data.stages }));
      }
      sessionStorage.removeItem('demo_discovery');
      sessionStorage.removeItem('demo_plan');
      router.push('/setup');
    } catch (e) {
      clearInterval(timer);
      clearTimeout(longRunTimer);
      clearTimeout(abortTimer);
      if (e.name === 'AbortError') {
        setError('The request timed out. The AI service may be busy — please try again.');
      } else {
        setError(e.message || 'Research failed. Please try again.');
      }
      setPhase('form');
    }
  }

  function cancelResearch() {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setPhase('form');
    setIsLongRunning(false);
  }

  function clearSession() {
    ['demo_company','demo_research','demo_process_context','demo_discovery','demo_plan','demo_tech','demo_process']
      .forEach(k => sessionStorage.removeItem(k));
    setActiveSession(null);
    setPhase('form');
    setProcessId('');
    setCustomProcessName('');
    setCompanyName('');
    setCompanyDescription('');
    setError('');
  }

  const STEP_LABELS = ['', 'Scope', 'Stack', 'Context', 'Analysis', 'Report'];

  /* ── Profiling state ───────────────────────────────────────────────────── */
  if (phase === 'researching') {
    const steps = [
      { label: 'Company profile — industry, scale, market position', done: researchProgress > 20 },
      { label: 'Technology landscape and platform usage',            done: researchProgress > 40 },
      { label: `Process mapping for ${process?.name}`,              done: researchProgress > 60 },
      { label: 'Automation opportunity identification',              done: researchProgress > 80 },
    ];
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }} className="animate-fade-in-up">
        <StepIndicator current={1} />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: 'var(--c-acBg)', border: '1px solid var(--c-acBd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Spinner size={22} thickness={2.5} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 6 }}>
            Profiling {companyName}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--c-mu)', lineHeight: 1.6 }}>
            Generating a readiness profile for{' '}
            <strong style={{ color: 'var(--c-tx)' }}>{process?.name}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="section-tag">Progress</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, color: 'var(--c-ac)' }}>
              {Math.round(researchProgress)}%
            </span>
          </div>
          <div className="progress-track" style={{ marginBottom: 20 }}>
            <div className="progress-fill" style={{ width: `${researchProgress}%` }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {s.done
                  ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--c-grBg)', color: 'var(--c-gr)', border: '1px solid var(--c-grBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>✓</span>
                  : <Spinner size={18} thickness={2} />
                }
                <span style={{ fontSize: 11, color: s.done ? 'var(--c-mu)' : 'var(--c-dm)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {isLongRunning && (
          <div className="banner-info animate-slide-down" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ flexShrink: 0 }}>ⓘ</span>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-ac)', lineHeight: 1.6, flex: 1 }}>
              Still working — the AI service is taking longer than usual. This can take up to 2 minutes.
            </p>
          </div>
        )}

        <button
          className="btn-ghost"
          onClick={cancelResearch}
          style={{ width: '100%', fontSize: 11, color: 'var(--c-mu)' }}
        >
          Cancel
        </button>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }} className="animate-fade-in-up">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="section-tag" style={{ marginBottom: 10 }}>Automation Readiness Assessment</p>
        <h1 style={{ fontSize: 24, fontWeight: 300, color: 'var(--c-tx)', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
          From process to roadmap<br />in minutes
        </h1>
        <p style={{ fontSize: 13, color: 'var(--c-mu)', lineHeight: 1.6, maxWidth: 420 }}>
          Select a business process and organisation, and receive a structured
          automation maturity report with a phased implementation roadmap.
        </p>
      </div>

      <StepIndicator current={1} />

      {/* Resume session */}
      {activeSession && phase === 'form' && (
        <div className="banner-green animate-slide-down" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.process.name}{activeSession.company?.name ? ` — ${activeSession.company.name}` : ''}
            </p>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-gr)' }}>
              In progress · {STEP_LABELS[activeSession.step]} complete
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px' }} onClick={clearSession}>
              Discard
            </button>
            <button
              onClick={() => router.push(activeSession.resumePath)}
              style={{ padding: '4px 12px', background: 'var(--c-gr)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>

        {/* Process */}
        <div style={{ marginBottom: 18 }}>
          <label className="form-label">
            Process <span style={{ color: 'var(--c-rd)' }}>*</span>
          </label>
          <div className="form-select-wrap">
            <select
              value={processId}
              onChange={e => { setProcessId(e.target.value); setCustomProcessName(''); setError(''); }}
              className="form-select"
            >
              <option value="">Select a process…</option>
              {Object.values(PROCESSES).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="custom">Other — specify below</option>
            </select>
            <svg className="form-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {processId && processId !== 'custom' && PROCESSES[processId] && (
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginTop: 5 }}>
              {PROCESSES[processId].tagline}
            </p>
          )}
        </div>

        {/* Custom process name */}
        {processId === 'custom' && (
          <div style={{ marginBottom: 18 }} className="animate-fade-in-up">
            <label className="form-label">
              Process Name <span style={{ color: 'var(--c-rd)' }}>*</span>
            </label>
            <input
              type="text"
              value={customProcessName}
              onChange={e => setCustomProcessName(e.target.value)}
              placeholder="e.g. Procure to Pay, Record to Report, Issue to Resolution"
              className="form-input"
              maxLength={100}
              autoFocus
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--c-b)' }} />
          <span className="section-tag">Organisation</span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-b)' }} />
        </div>

        {/* Company name */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">
            Name <span style={{ color: 'var(--c-rd)' }}>*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={e => { setCompanyName(e.target.value); setError(''); }}
            placeholder="e.g. Allianz, Walmart, JPMorgan Chase"
            className="form-input"
            maxLength={200}
            onKeyDown={e => e.key === 'Enter' && canResearch && runResearch()}
          />
        </div>

        {/* Company description */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">
            Additional Context{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--c-dm)' }}>
              optional
            </span>
          </label>
          <textarea
            value={companyDescription}
            onChange={e => setCompanyDescription(e.target.value)}
            placeholder="Industry, headcount, current systems, known pain points…"
            rows={3}
            className="form-input"
            maxLength={2000}
          />
        </div>

        {error && (
          <div className="banner-error animate-slide-down" style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <button className="btn-primary" onClick={runResearch} disabled={!canResearch}>
          Begin Assessment →
        </button>
      </div>

      {/* What the assessment covers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Company profile',     desc: 'Industry, scale, market position' },
          { label: 'Technology landscape', desc: 'Current platforms and tooling'   },
          { label: 'Process mapping',      desc: 'Current-state process analysis'  },
          { label: 'Gap identification',   desc: 'Automation opportunity scoring'  },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 2 }}>{item.label}</p>
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, color: 'var(--c-dm)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
