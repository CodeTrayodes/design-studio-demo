'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const INDUSTRY_LABELS = {
  underwriting: 'Underwriting',
  claims: 'Claims Processing',
  loans: 'Loan Origination',
  custom: 'Custom Process',
};

const ROLES = ['Manager', 'Senior Manager', 'Director', 'VP', 'Lead', 'Specialist', 'Analyst', 'Coordinator'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function saveSubprocesses(sps) {
  sessionStorage.setItem('demo_subprocesses', JSON.stringify(sps));
}

function riskColor(level) {
  if (level === 'Low') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (level === 'High') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

function statusBadge(status) {
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function statusDot(status) {
  if (status === 'APPROVED') return 'bg-emerald-500';
  if (status === 'PENDING') return 'bg-amber-400';
  return 'bg-red-400';
}

// ── Architecture diagram ──────────────────────────────────────────────────────

function ArchDiagram({ architecture }) {
  const agents = architecture?.agents || [];
  const flows = architecture?.flows || [];
  const gates = architecture?.humanGates || [];

  const AGENT_W = 148;
  const AGENT_H = 68;
  const GATE_S = 48;
  const GAP = 56;
  const CY = 80;

  // Build sequence: agents interleaved with gates
  const sequence = [];
  agents.forEach((agent, i) => {
    sequence.push({ type: 'agent', data: agent });
    if (i < agents.length - 1) {
      const gate = gates.find(g => g.afterAgent === agent.id);
      if (gate) sequence.push({ type: 'gate', data: gate });
    }
  });

  let x = 16;
  const positioned = sequence.map(el => {
    const w = el.type === 'agent' ? AGENT_W : GATE_S;
    const y = el.type === 'agent' ? CY - AGENT_H / 2 : CY - GATE_S / 2;
    const item = { ...el, x, y, w, cx: x + w / 2, cy: CY };
    x += w + GAP;
    return item;
  });

  const svgW = x - GAP + 16;
  const svgH = 175;

  const AGENT_COLORS = [
    ['#dbeafe', '#2563eb'],
    ['#dcfce7', '#16a34a'],
    ['#fef3c7', '#d97706'],
    ['#f3e8ff', '#9333ea'],
    ['#fee2e2', '#dc2626'],
  ];

  let agentIdx = 0;
  const colorMap = {};
  agents.forEach(a => { colorMap[a.id] = AGENT_COLORS[agentIdx++ % AGENT_COLORS.length]; });

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ minWidth: svgW }}>
          {/* Arrows between adjacent elements */}
          {positioned.map((el, i) => {
            if (i === positioned.length - 1) return null;
            const next = positioned[i + 1];
            const x1 = el.x + el.w;
            const x2 = next.x;
            const y1 = CY;
            const flow = flows.find(f => f.from === el.data?.id);
            return (
              <g key={`arr-${i}`}>
                <line x1={x1} y1={y1} x2={x2 - 6} y2={y1} stroke="#cbd5e1" strokeWidth={1.5} />
                <polygon
                  points={`${x2 - 6},${y1 - 4} ${x2},${y1} ${x2 - 6},${y1 + 4}`}
                  fill="#cbd5e1"
                />
                {flow?.label && (
                  <text x={(x1 + x2) / 2} y={y1 - 10} textAnchor="middle" fontSize={9} fill="#94a3b8">
                    {flow.label.slice(0, 18)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Elements */}
          {positioned.map((el, i) => {
            if (el.type === 'agent') {
              const [fill, stroke] = colorMap[el.data.id] || ['#f1f5f9', '#64748b'];
              return (
                <g key={el.data.id}>
                  <rect x={el.x} y={el.y} width={AGENT_W} height={AGENT_H} rx={10}
                    fill={fill} stroke={stroke} strokeWidth={1.5} />
                  <text x={el.cx} y={el.y + 26} textAnchor="middle" fontSize={11} fontWeight="700"
                    fill="#1e293b" fontFamily="system-ui">
                    {el.data.name?.slice(0, 18) || `Agent ${i + 1}`}
                  </text>
                  <text x={el.cx} y={el.y + 42} textAnchor="middle" fontSize={9} fill="#64748b"
                    fontFamily="system-ui">
                    {el.data.role?.slice(0, 22) || ''}
                  </text>
                </g>
              );
            } else {
              const hs = GATE_S / 2;
              return (
                <g key={el.data.id}>
                  <polygon
                    points={`${el.cx},${el.cy - hs} ${el.cx + hs},${el.cy} ${el.cx},${el.cy + hs} ${el.cx - hs},${el.cy}`}
                    fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5}
                  />
                  <text x={el.cx} y={el.cy + 3} textAnchor="middle" fontSize={8} fontWeight="700"
                    fill="#92400e" fontFamily="system-ui">
                    ✓
                  </text>
                  <text x={el.cx} y={el.cy + 60} textAnchor="middle" fontSize={8} fill="#92400e"
                    fontFamily="system-ui">
                    {el.data.label?.slice(0, 14) || 'Review'}
                  </text>
                </g>
              );
            }
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3.5 bg-blue-100 border border-blue-500 rounded" /> AI Agent
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-500" style={{ transform: 'rotate(45deg)' }} /> Human Gate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t border-slate-300" /> Data Flow
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const ran = useRef(false);

  const [industry, setIndustry] = useState('');
  const [phase, setPhase] = useState('assessing'); // assessing | architecting | decomposing | done | error
  const [assessment, setAssessment] = useState(null);
  const [architecture, setArchitecture] = useState(null);
  const [subprocesses, setSubprocesses] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assessment');

  // Subprocess UI
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // { step: 'assign'|'summary', spId, summary?, ownerForm? }
  const [ownerForm, setOwnerForm] = useState({ name: '', role: 'Manager', email: '' });
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState('');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const ind = sessionStorage.getItem('demo_industry') || '';
    const input = JSON.parse(sessionStorage.getItem('demo_input') || '{}');
    setIndustry(ind);

    if (!input?.processDescription) {
      router.push('/');
      return;
    }

    // Check for cached results
    const cached = sessionStorage.getItem('demo_subprocesses');
    if (cached && sessionStorage.getItem('demo_assessment') && sessionStorage.getItem('demo_architecture')) {
      setAssessment(JSON.parse(sessionStorage.getItem('demo_assessment')));
      setArchitecture(JSON.parse(sessionStorage.getItem('demo_architecture')));
      setSubprocesses(JSON.parse(cached));
      setPhase('done');
      return;
    }

    runPipeline(ind, input.processDescription);
  }, []);

  const runPipeline = useCallback(async (ind, desc) => {
    const label = INDUSTRY_LABELS[ind] || ind;
    try {
      setPhase('assessing');
      const ar = await fetch('/api/demo/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: label, processDescription: desc }),
      });
      if (!ar.ok) throw new Error('Assessment API error');
      const a = await ar.json();
      if (a.error) throw new Error(a.error);
      setAssessment(a);
      sessionStorage.setItem('demo_assessment', JSON.stringify(a));

      setPhase('architecting');
      const archR = await fetch('/api/demo/architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: label, assessment: a }),
      });
      if (!archR.ok) throw new Error('Architecture API error');
      const arch = await archR.json();
      if (arch.error) throw new Error(arch.error);
      setArchitecture(arch);
      sessionStorage.setItem('demo_architecture', JSON.stringify(arch));

      setPhase('decomposing');
      const spR = await fetch('/api/demo/subprocesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: label, assessment: a, architecture: arch }),
      });
      if (!spR.ok) throw new Error('Subprocesses API error');
      const sp = await spR.json();
      if (sp.error) throw new Error(sp.error);
      const sps = sp.subprocesses || [];
      setSubprocesses(sps);
      saveSubprocesses(sps);

      setPhase('done');
      setActiveTab('assessment');
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }, []);

  // ── Subprocess actions ──────────────────────────────────────────────────────

  function openAssignModal(spId) {
    setOwnerForm({ name: '', role: 'Manager', email: '' });
    setModal({ step: 'assign', spId });
  }

  async function handleAssign() {
    if (!ownerForm.name.trim()) return;
    setGeneratingSummary(true);
    try {
      const sp = subprocesses.find(s => s.id === modal.spId);
      const arch = JSON.parse(sessionStorage.getItem('demo_architecture') || '{}');
      const res = await fetch('/api/demo/approval-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subprocess: sp, architecture: arch }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setModal(m => ({ ...m, step: 'summary', summary: data, ownerForm: { ...ownerForm } }));
    } catch (e) {
      alert('Could not generate approval summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  }

  function confirmPending() {
    const updated = subprocesses.map(s =>
      s.id === modal.spId
        ? { ...s, status: 'PENDING', owner: { ...modal.ownerForm }, assignedAt: new Date().toISOString(), approvalSummary: modal.summary }
        : s
    );
    setSubprocesses(updated);
    saveSubprocesses(updated);
    setModal(null);
  }

  function approveSubprocess(spId) {
    const updated = subprocesses.map(s =>
      s.id === spId
        ? { ...s, status: 'APPROVED', approvedAt: new Date().toISOString() }
        : s
    );
    setSubprocesses(updated);
    saveSubprocesses(updated);
  }

  function requestChanges(spId, feedback) {
    const updated = subprocesses.map(s =>
      s.id === spId
        ? { ...s, status: 'UNASSIGNED', owner: null, feedback: feedback || undefined }
        : s
    );
    setSubprocesses(updated);
    saveSubprocesses(updated);
    setPendingFeedback('');
  }

  function reassign(spId) {
    const updated = subprocesses.map(s =>
      s.id === spId ? { ...s, status: 'UNASSIGNED', owner: null } : s
    );
    setSubprocesses(updated);
    saveSubprocesses(updated);
  }

  // ── Export ──────────────────────────────────────────────────────────────────

  function exportJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      industry: INDUSTRY_LABELS[industry] || industry,
      assessment,
      architecture,
      subprocesses,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levelshift-assessment-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    window.print();
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const filteredSps = subprocesses.filter(sp => {
    const matchName = sp.name.toLowerCase().includes(filter.toLowerCase());
    const matchStatus = statusFilter === 'all' || sp.status === statusFilter;
    return matchName && matchStatus;
  });

  const counts = {
    total: subprocesses.length,
    unassigned: subprocesses.filter(s => s.status === 'UNASSIGNED').length,
    pending: subprocesses.filter(s => s.status === 'PENDING').length,
    approved: subprocesses.filter(s => s.status === 'APPROVED').length,
  };

  const allApproved = counts.total > 0 && counts.approved === counts.total;
  const industryLabel = INDUSTRY_LABELS[industry] || industry || '—';

  // ── Loading state ──────────────────────────────────────────────────────────

  if (phase !== 'done' && phase !== 'error') {
    const steps = [
      { key: 'assessing', label: 'Generating assessment', icon: '📊' },
      { key: 'architecting', label: 'Designing AI architecture', icon: '🤖' },
      { key: 'decomposing', label: 'Decomposing subprocesses', icon: '📋' },
    ];
    const currentIdx = steps.findIndex(s => s.key === phase);

    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Analysing your process</h2>
        <p className="text-sm text-slate-400 mb-8">This takes 15-45 seconds depending on the LLM response time</p>

        <div className="space-y-2 text-left">
          {steps.map((step, i) => {
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <div key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isDone ? 'border-emerald-200 bg-emerald-50' :
                  isActive ? 'border-blue-200 bg-blue-50' :
                  'border-slate-100 bg-slate-50 opacity-40'
                }`}
              >
                <span className="text-xl">{step.icon}</span>
                <span className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                {isDone && <span className="ml-auto text-emerald-500 text-sm">✓</span>}
                {isActive && (
                  <div className="ml-auto w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          Start over
        </button>
      </div>
    );
  }

  // ── Done state ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 no-print">
        <div>
          <button onClick={() => router.push('/')} className="text-xs text-slate-400 hover:text-slate-600 mb-2 block">
            ← Start over
          </button>
          <h1 className="text-xl font-bold text-slate-800">{industryLabel} — Process Assessment</h1>
          <p className="text-xs text-slate-400 mt-0.5">Generated by AI · session only · no data saved</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={exportJson}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            ↓ JSON
          </button>
          <button onClick={exportPdf}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            ↓ PDF
          </button>
        </div>
      </div>

      {allApproved && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-emerald-800">All subprocesses approved!</p>
            <p className="text-xs text-emerald-600">The full process decomposition has been reviewed and approved by all process owners.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl no-print">
        {[
          { key: 'assessment', label: '📊 Assessment' },
          { key: 'architecture', label: '🤖 AI Architecture' },
          { key: 'subprocesses', label: `📋 Subprocesses (${counts.total})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ASSESSMENT TAB ── */}
      {activeTab === 'assessment' && assessment && (
        <div className="space-y-4">
          {/* Score cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold mb-2 ${riskColor(assessment.riskLevel)}`}>
                {assessment.riskLevel} Risk
              </div>
              <p className="text-xs text-slate-400">Risk Level</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-4xl font-black text-blue-600 mb-1">{assessment.automationScore}</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${assessment.automationScore}%` }} />
              </div>
              <p className="text-xs text-slate-400">Automation Score / 100</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-4xl font-black text-slate-700 mb-1">{counts.total}</div>
              <p className="text-xs text-slate-400">Subprocesses Identified</p>
            </div>
          </div>

          {/* Executive Summary */}
          <Section title="Executive Summary">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{assessment.executiveSummary}</p>
          </Section>

          {/* Pain Points + Opportunities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Section title="Pain Points">
              <ul className="space-y-2">
                {(assessment.painPoints || []).map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="Automation Opportunities">
              <ul className="space-y-2">
                {(assessment.automationOpportunities || []).map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Regulatory */}
          {(assessment.regulatoryRequirements || []).length > 0 && (
            <Section title="Regulatory Requirements">
              <div className="flex flex-wrap gap-2">
                {assessment.regulatoryRequirements.map((r, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                    {r}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ── ARCHITECTURE TAB ── */}
      {activeTab === 'architecture' && architecture && (
        <div className="space-y-4">
          <Section title="Agent Flow Diagram">
            <ArchDiagram architecture={architecture} />
          </Section>

          <Section title="AI Agents">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(architecture.agents || []).map((agent, i) => (
                <div key={agent.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.role}</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {(agent.responsibilities || []).map((r, j) => (
                      <li key={j} className="text-xs text-slate-500 flex items-start gap-1.5">
                        <span className="text-slate-300 mt-0.5">·</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(architecture.escalationRules || []).length > 0 && (
              <Section title="Escalation Rules">
                <ul className="space-y-1.5">
                  {architecture.escalationRules.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">▲</span> {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {(architecture.technologyStack || []).length > 0 && (
              <Section title="Technology Stack">
                <div className="flex flex-wrap gap-2">
                  {architecture.technologyStack.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      )}

      {/* ── SUBPROCESSES TAB ── */}
      {activeTab === 'subprocesses' && (
        <div>
          {/* Status summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Unassigned', count: counts.unassigned, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Pending', count: counts.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Approved', count: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border border-slate-200 rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search subprocesses..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'UNASSIGNED', label: 'Unassigned' },
                { key: 'PENDING', label: 'Pending' },
                { key: 'APPROVED', label: 'Approved' },
              ].map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    statusFilter === f.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subprocess cards */}
          <div className="space-y-3">
            {filteredSps.map(sp => (
              <SubprocessCard
                key={sp.id}
                sp={sp}
                architecture={architecture}
                onAssign={() => openAssignModal(sp.id)}
                onApprove={() => approveSubprocess(sp.id)}
                onRequestChanges={(feedback) => requestChanges(sp.id, feedback)}
                onReassign={() => reassign(sp.id)}
                onViewSummary={() => setModal({ step: 'viewSummary', spId: sp.id, summary: sp.approvalSummary })}
              />
            ))}
            {filteredSps.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                No subprocesses match your filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Assign owner form */}
            {modal.step === 'assign' && (
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Assign Process Owner</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {subprocesses.find(s => s.id === modal.spId)?.name}
                    </p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-slate-300 hover:text-slate-600 text-xl leading-none">×</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Owner Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerForm.name}
                      onChange={e => setOwnerForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      value={ownerForm.role}
                      onChange={e => setOwnerForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    >
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={ownerForm.email}
                      onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="owner@company.com"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!ownerForm.name.trim() || generatingSummary}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {generatingSummary
                      ? <><SmallSpinner /> Generating summary...</>
                      : 'Assign & Generate Summary →'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Approval summary */}
            {(modal.step === 'summary' || modal.step === 'viewSummary') && modal.summary && (
              <div className="p-7 max-h-[80vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Approval Summary</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {subprocesses.find(s => s.id === modal.spId)?.name}
                    </p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-slate-300 hover:text-slate-600 text-xl leading-none">×</button>
                </div>

                {modal.ownerForm && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">
                      {modal.ownerForm.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{modal.ownerForm.name}</p>
                      <p className="text-xs text-slate-400">{modal.ownerForm.role}{modal.ownerForm.email ? ` · ${modal.ownerForm.email}` : ''}</p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {modal.summary.summary}
                  </p>
                </div>

                {modal.summary.keyDecisions?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Decisions for Owner</p>
                    <ul className="space-y-1.5">
                      {modal.summary.keyDecisions.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-blue-500 mt-0.5">▸</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {modal.summary.expectedImpact && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                    <p className="text-xs font-bold text-blue-700 mb-1">Expected Impact</p>
                    <p className="text-xs text-blue-600">{modal.summary.expectedImpact}</p>
                  </div>
                )}

                {modal.step === 'summary' && (
                  <>
                    {/* Request changes input */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Feedback / Change Request (optional)
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        value={pendingFeedback}
                        onChange={e => setPendingFeedback(e.target.value)}
                        placeholder="Any adjustments needed? (max 200 chars)"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          requestChanges(modal.spId, pendingFeedback);
                          setModal(null);
                        }}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={confirmPending}
                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600"
                      >
                        Mark as Pending →
                      </button>
                    </div>
                  </>
                )}

                {modal.step === 'viewSummary' && (
                  <button onClick={() => setModal(null)}
                    className="w-full py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                    Close
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print view */}
      <div className="print-only mt-8 space-y-6">
        <h1 className="text-2xl font-bold">{industryLabel} — Process Assessment</h1>
        <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
        {assessment && (
          <>
            <div>
              <h2 className="font-bold text-lg mb-2">Executive Summary</h2>
              <p className="text-sm leading-relaxed">{assessment.executiveSummary}</p>
            </div>
            <div>
              <h2 className="font-bold text-lg mb-2">Risk: {assessment.riskLevel} · Automation Score: {assessment.automationScore}/100</h2>
            </div>
            <div>
              <h2 className="font-bold text-lg mb-2">Subprocesses</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>#</th>
                    <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Subprocess</th>
                    <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {subprocesses.map(sp => (
                    <tr key={sp.id}>
                      <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{sp.sequence}</td>
                      <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{sp.name}</td>
                      <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{sp.status}</td>
                      <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{sp.owner?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Subprocess card ──────────────────────────────────────────────────────────

function SubprocessCard({ sp, architecture, onAssign, onApprove, onRequestChanges, onReassign, onViewSummary }) {
  const [expanded, setExpanded] = useState(false);
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [changeText, setChangeText] = useState('');

  const agentNames = (sp.agentIds || [])
    .map(id => architecture?.agents?.find(a => a.id === id)?.name)
    .filter(Boolean);

  return (
    <div className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
      sp.status === 'APPROVED' ? 'border-emerald-200' :
      sp.status === 'PENDING' ? 'border-amber-200' :
      'border-slate-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {sp.sequence}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800">{sp.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusBadge(sp.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(sp.status)}`} />
                {sp.status === 'UNASSIGNED' ? 'Unassigned' : sp.status === 'PENDING' ? 'Pending Approval' : 'Approved'}
              </span>
            </div>

            <p className={`text-xs text-slate-500 mt-1 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {sp.description}
            </p>
            <button onClick={() => setExpanded(e => !e)}
              className="text-[11px] text-blue-500 hover:text-blue-700 mt-0.5">
              {expanded ? 'Show less' : 'Show more'}
            </button>

            {/* Agent tags + duration */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {agentNames.map(n => (
                <span key={n} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                  {n}
                </span>
              ))}
              {sp.estimatedDuration && (
                <span className="text-[10px] text-slate-400">⏱ {sp.estimatedDuration}</span>
              )}
            </div>

            {/* Owner info */}
            {sp.owner && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                  {sp.owner.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-slate-600 font-medium">{sp.owner.name}</span>
                <span className="text-[11px] text-slate-400">{sp.owner.role}</span>
                {sp.approvedAt && (
                  <span className="text-[11px] text-emerald-600">
                    · Approved {new Date(sp.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {sp.feedback && (
              <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                Feedback: {sp.feedback}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {sp.status === 'UNASSIGNED' && (
            <button onClick={onAssign}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
              Assign Owner
            </button>
          )}

          {sp.status === 'PENDING' && (
            <>
              <button onClick={onApprove}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors">
                Approve ✓
              </button>
              {sp.approvalSummary && (
                <button onClick={onViewSummary}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
                  View Summary
                </button>
              )}
              <button onClick={() => setShowChangeInput(s => !s)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                Request Changes
              </button>
              <button onClick={onReassign}
                className="px-3.5 py-1.5 text-slate-400 text-xs hover:text-slate-600 transition-colors">
                Reassign
              </button>
            </>
          )}

          {sp.status === 'APPROVED' && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>✓</span> Locked — approved
            </span>
          )}
        </div>

        {showChangeInput && sp.status === 'PENDING' && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              maxLength={200}
              value={changeText}
              onChange={e => setChangeText(e.target.value)}
              placeholder="Briefly describe the change needed..."
              className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              onClick={() => { onRequestChanges(changeText); setShowChangeInput(false); setChangeText(''); }}
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SmallSpinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
}
