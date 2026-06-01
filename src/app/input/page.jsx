'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator, StoryContext } from '@/components/legacy/StepContext';


// â”€â”€ Method definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const METHODS = [
  { id: 'connect',       icon: 'â¬¡', label: 'API Integration',         badge: 'REST / HTTPS',       badgeClass: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Retrieve process metadata directly from an internal system endpoint',    color: 'from-orange-500 to-amber-600'   },
  { id: 'upload',        icon: 'â—ˆ', label: 'Document Upload',          badge: 'PDF Â· DOCX Â· Excel', badgeClass: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Upload SOPs, process maps, or operational spreadsheets (up to 3 files)', color: 'from-purple-500 to-violet-600'  },
  { id: 'questionnaire', icon: 'â—†', label: 'Structured Questionnaire', badge: '8-10 questions',      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',       desc: 'Answer a tailored set of questions covering process stages and tooling', color: 'from-blue-500 to-indigo-600'    },
  { id: 'template',      icon: 'âŠ˜', label: 'Industry Benchmark',       badge: 'Fastest',            badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', desc: 'Start from a researched benchmark of how similar organisations operate', color: 'from-emerald-500 to-teal-600' },
];

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function InputPage() {
  const router = useRouter();
  const [process, setProcess] = useState(null);
  const [company, setCompany] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = JSON.parse(sessionStorage.getItem('demo_process') || 'null');
    if (!p) { router.push('/'); return; }
    setProcess(p);
    setCompany(JSON.parse(sessionStorage.getItem('demo_company') || 'null'));
  }, []);

  function proceed(description, methodLabel) {
    sessionStorage.setItem('demo_process_context', JSON.stringify({ method: selectedMethod, methodLabel, description }));
    sessionStorage.removeItem('demo_discovery');
    sessionStorage.removeItem('demo_plan');
    router.push('/discover');
  }

  if (!process) return null;

  // Build story context
  const storyItems = [{ icon: process.emoji || 'ðŸ“‹', label: process.name }];
  if (company?.name) storyItems.push({ icon: 'ðŸ¢', label: company.name });
  const techList = typeof window !== 'undefined'
    ? Object.values(JSON.parse(sessionStorage.getItem('demo_tech') || '{}')).flat().filter(t => t && t !== 'None')
    : [];
  if (techList.length > 0) storyItems.push({ icon: 'âš™ï¸', label: `${techList.length} tools` });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fade-in-up">
      <StepIndicator current={3} />
      <StoryContext items={storyItems} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button className="btn-back" onClick={() => router.push('/setup')}>â†</button>
        <div>
          <p className="section-tag" style={{ marginBottom: 2 }}>Assessment Context</p>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-tx)', letterSpacing: '-0.01em' }}>
            Provide process context
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--c-mu)', marginBottom: 20, marginLeft: 40, lineHeight: 1.6 }}>
        Select an input method for <strong style={{ color: 'var(--c-tx)' }}>{process.name}</strong>.
        More detailed input produces a higher-fidelity assessment.
      </p>

      {/* Method cards - 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {METHODS.map(m => {
          const active = selectedMethod === m.id;
          return (
            <button
              key={m.id}
              onClick={() => { setSelectedMethod(m.id); setError(''); }}
              style={{
                padding: 16, borderRadius: 6, textAlign: 'left',
                border: active ? '2px solid var(--c-ac)' : '1px solid var(--c-b)',
                background: active ? 'var(--c-acBg)' : 'var(--c-sf)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-base flex-shrink-0`}>
                  {m.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--c-ac)' : 'var(--c-tx)' }}>{m.label}</span>
                    {active && (
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--c-ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeClass}`}>{m.badge}</span>
                  <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginTop: 5, lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Method-specific panels */}
      {selectedMethod === 'connect'       && <ConnectPanel       onSubmit={proceed} submitting={submitting} setSubmitting={setSubmitting} error={error} setError={setError} />}
      {selectedMethod === 'upload'        && <UploadPanel        onSubmit={proceed} submitting={submitting} setSubmitting={setSubmitting} error={error} setError={setError} />}
      {selectedMethod === 'questionnaire' && <QuestionnairePanel process={process} onSubmit={proceed} submitting={submitting} setSubmitting={setSubmitting} error={error} setError={setError} />}
      {selectedMethod === 'template'      && <TemplatePanel      process={process} onSubmit={proceed} submitting={submitting} setSubmitting={setSubmitting} error={error} setError={setError} />}

      {!selectedMethod && (
        <div style={{
          textAlign: 'center', padding: '36px 24px',
          border: '1px dashed var(--c-b2)', borderRadius: 6,
          background: 'var(--c-sf2)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>â˜</div>
          <p style={{ fontSize: 12, color: 'var(--c-mu)', fontWeight: 500 }}>Select a method above to continue</p>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginTop: 4 }}>Each method feeds the AI with context about your process</p>
        </div>
      )}
    </div>
  );
}

// â”€â”€ Connect to System panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ConnectPanel({ onSubmit, submitting, setSubmitting, error, setError }) {
  const [url, setUrl] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [connected, setConnected] = useState(false);

  async function handleConnect() {
    if (!url.startsWith('https://')) { setError('Please enter a valid HTTPS URL.'); return; }
    setConnecting(true);
    setError('');
    setPreviewText('');
    setConnected(false);
    try {
      const res = await fetch('/api/demo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, bearerToken: bearerToken.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreviewText(data.text.slice(0, 500));
      setConnected(true);
    } catch (e) {
      setError(e.message || 'Connection failed. Check the URL and try again.');
    } finally {
      setConnecting(false);
    }
  }

  function handleSubmit() {
    if (!connected || !previewText) { setError('Please connect to an endpoint first.'); return; }
    onSubmit(`API Response from ${url}:\n\n${previewText}`, 'System API');
  }

  return (
    <div className="card animate-fade-in-up" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-sm">ðŸ”Œ</div>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)' }}>Connect to a system endpoint</h2>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-mu)' }}>HTTPS API URL returning process metadata (30s timeout)</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setConnected(false); setPreviewText(''); }}
            placeholder="https://api.yourcompany.com/process/metadata"
            className="form-input"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleConnect}
            disabled={connecting || !url.startsWith('https://')}
            style={{
              padding: '0 16px', background: 'var(--c-tx)', color: 'var(--c-bg)',
              border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0, opacity: (connecting || !url.startsWith('https://')) ? 0.35 : 1,
            }}
          >
            {connecting ? <><div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Connecting...</> : 'Connect'}
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700, color: 'var(--c-dm)', pointerEvents: 'none' }}>Bearer</div>
          <input
            type="password"
            value={bearerToken}
            onChange={e => { setBearerToken(e.target.value); setConnected(false); setPreviewText(''); }}
            placeholder=”Token (optional - leave blank for public endpoints)”
            className="form-input"
            style={{ paddingLeft: 60, fontFamily: 'IBM Plex Mono' }}
          />
        </div>
      </div>

      <div style={{ padding: '10px 14px', background: 'var(--c-sf2)', border: '1px solid var(--c-b)', borderRadius: 4, marginBottom: 14 }}>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700, color: 'var(--c-mu)', marginBottom: 6 }}>How it works</p>
        {['GET request sent to your URL (30s timeout)', 'Bearer token sent as Authorization header if provided', 'JSON or text response used as process context', 'HTTPS only Â· Token is never stored'].map((line, i) => (
          <p key={i} style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginBottom: 2 }}>â†’ {line}</p>
        ))}
      </div>

      {connected && (
        <div className="banner-green animate-slide-down" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fontWeight: 700, color: 'var(--c-gr)' }}>âœ“ Connected</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-mu)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
          </div>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fontWeight: 700, color: 'var(--c-mu)', marginBottom: 4 }}>Response preview:</p>
          <pre style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-tx)', background: 'var(--c-sf)', borderRadius: 3, padding: '8px 10px', border: '1px solid var(--c-b)', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 120, fontSize: 10 }}>
            {previewText}{previewText.length === 500 ? '...' : ''}
          </pre>
        </div>
      )}

      {error && <div className="banner-error animate-slide-down" style={{ marginBottom: 14 }}>âš  {error}</div>}

      <button className="btn-primary" onClick={handleSubmit} disabled={!connected}>
        Run Analysis â†’
      </button>
    </div>
  );
}

// â”€â”€ Upload Documentation panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UploadPanel({ onSubmit, submitting, setSubmitting, error, setError }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  function addFiles(newFiles) {
    const valid = Array.from(newFiles)
      .filter(f => {
        const ok = f.size <= 10 * 1024 * 1024;
        if (!ok) setError(`"${f.name}" exceeds 10 MB and was skipped.`);
        return ok;
      })
      .slice(0, 3 - files.length);
    setFiles(prev => [...prev, ...valid].slice(0, 3));
  }

  async function handleSubmit() {
    if (!files.length) { setError('Please select at least one file.'); return; }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      const res = await fetch('/api/demo/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onSubmit(data.text, 'Document Upload');
    } catch (e) {
      setError(e.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  }

  const fileIcon = name => {
    if (name.endsWith('.pdf')) return 'ðŸ“•';
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'ðŸ“Š';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return 'ðŸ“˜';
    return 'ðŸ“';
  };

  return (
    <div className="card animate-fade-in-up" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm">ðŸ“„</div>
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)' }}>Upload process documentation</h2>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-mu)' }}>SOPs, flowcharts, spreadsheets - up to 3 files, 10 MB each</p>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--c-pu)' : 'var(--c-b2)'}`,
          borderRadius: 5, padding: '28px 20px', textAlign: 'center',
          cursor: 'pointer', background: dragging ? 'var(--c-puBg)' : 'var(--c-sf2)',
          transition: 'border-color 0.15s, background 0.15s', marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>ðŸ“„</div>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-mu)' }}>Drop files here or click to browse</p>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginTop: 3 }}>PDF Â· DOCX Â· Excel Â· TXT Â· max 10 MB Â· up to 3 files</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.docx,.doc,.xlsx,.xls" style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {files.length > 0 && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--c-sf2)', border: '1px solid var(--c-b)', borderRadius: 4 }}>
              <span style={{ fontSize: 16 }}>{fileIcon(f.name)}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--c-tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ color: 'var(--c-dm)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>Ã—</button>
            </div>
          ))}
          {files.length < 3 && (
            <button onClick={() => fileRef.current?.click()} className="btn-ghost" style={{ width: '100%' }}>
              + Add another file ({3 - files.length} remaining)
            </button>
          )}
        </div>
      )}

      {error && <div className="banner-error animate-slide-down" style={{ marginBottom: 14 }}>âš  {error}</div>}

      <button className="btn-primary" onClick={handleSubmit} disabled={uploading || !files.length}>
        {uploading ? (
          <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Extracting &amp; processing...</>
        ) : 'Run Analysis â†’'}
      </button>
    </div>
  );
}

// â”€â”€ Guided Questionnaire panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function QuestionnairePanel({ process, onSubmit, submitting, setSubmitting, error, setError }) {
  const [questions, setQuestions] = useState([]);
  const [loadingQs, setLoadingQs] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoadingQs(true);
    setError('');
    try {
      const res = await fetch('/api/demo/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: process.name,
          answers: [],
          context: `The user is assessing their ${process.name} process to identify AI automation opportunities. Questions should cover: current state, process volume, stakeholders, pain points, regulatory constraints, manual steps, existing tools, automation readiness, and objectives.`
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
    } catch (e) {
      setError('Failed to load questions. ' + (e.message || 'Please try again.'));
    } finally {
      setLoadingQs(false);
    }
  }

  function handleSubmit() {
    const answeredCount = Object.values(answers).filter(v => v?.trim()).length;
    if (answeredCount < Math.ceil(questions.length * 0.5)) {
      setError(`Please answer at least ${Math.ceil(questions.length * 0.5)} questions before continuing.`);
      return;
    }
    const formatted = questions
      .map(q => `Q: ${q.text}\nA: ${answers[q.id]?.trim() || '(not provided)'}`)
      .join('\n\n');
    onSubmit(`${process.name} Process - Questionnaire Responses\n\n${formatted}`, 'Questionnaire');
  }

  if (loadingQs) {
    return (
      <div className="card animate-fade-in-up" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--c-ac)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: 'var(--c-mu)' }}>Generating questions tailored to <strong style={{ color: 'var(--c-tx)' }}>{process.name}</strong>...</p>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginTop: 4 }}>8-10 questions covering objectives, pain points, stakeholders &amp; more</p>
      </div>
    );
  }

  if (!questions.length && !loadingQs) {
    return (
      <div className="card animate-fade-in-up" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--c-mu)', marginBottom: 12 }}>Could not load questions.</p>
        <button onClick={fetchQuestions} style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--c-ac)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Try again</button>
      </div>
    );
  }

  const q = questions[currentQ];
  const answered = Object.values(answers).filter(v => v?.trim()).length;

  return (
    <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
      <div className="progress-track" style={{ borderRadius: 0 }}>
        <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="section-tag">Question {currentQ + 1} of {questions.length}</span>
          <span className="pill pill-blue">{answered} answered</span>
        </div>

        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 14, lineHeight: 1.5 }}>{q?.text}</h2>

        <textarea
          key={q?.id}
          value={answers[q?.id] || ''}
          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
          placeholder={q?.placeholder || 'Type your answer here...'}
          rows={4}
          className="form-input"
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <button className="btn-ghost" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} style={{ opacity: currentQ === 0 ? 0.3 : 1 }}>
            â† Prev
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)} style={{ padding: '7px 16px', background: 'var(--c-ac)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}>Next â†’</button>
          ) : (
            <button onClick={handleSubmit} style={{ padding: '7px 16px', background: 'var(--c-ac)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}>Run Analysis â†’</button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {questions.map((q, i) => (
          <button key={q.id} onClick={() => setCurrentQ(i)} title={`Question ${i + 1}`} style={{
            width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
            background: i === currentQ ? 'var(--c-ac)' : answers[q.id]?.trim() ? 'var(--c-acBd)' : 'var(--c-b2)',
            transform: i === currentQ ? 'scale(1.3)' : 'scale(1)',
            transition: 'all 0.15s',
          }} />
        ))}
      </div>

      {error && <div className="banner-error animate-slide-down" style={{ margin: '0 20px 16px' }}>âš  {error}</div>}
    </div>
  );
}

// â”€â”€ Industry Best Practices (Template) panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TemplatePanel({ process, onSubmit, submitting, setSubmitting, error, setError }) {
  const ran = useRef(false);
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [commonTools, setCommonTools] = useState([]);
  const [keyPainPoints, setKeyPainPoints] = useState([]);
  const [edited, setEdited] = useState('');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    generate();
  }, []); // eslint-disable-line

  async function generate() {
    setPhase('loading');
    setError('');
    try {
      const co = JSON.parse(sessionStorage.getItem('demo_company') || 'null');
      const res = await fetch('/api/demo/best-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processName: process.name, companyContext: co?.name || '' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Server error ${res.status}`);
      setDescription(data.description);
      setEdited(data.description);
      setHighlights(data.highlights || []);
      setCommonTools(data.commonTools || []);
      setKeyPainPoints(data.keyPainPoints || []);
      setPhase('ready');
    } catch (e) {
      setError(e.message || 'Failed to generate best practices. Please try again.');
      setPhase('error');
    }
  }

  function handleSubmit() {
    const desc = edited.trim() || description.trim();
    if (!desc) { setError('Description is empty.'); return; }
    onSubmit(desc, 'Industry Best Practice');
  }

  if (phase === 'loading') {
    return (
      <div className="card animate-fade-in-up" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--c-grBg)', border: '1px solid var(--c-grBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <div style={{ width: 20, height: 20, border: '2.5px solid var(--c-gr)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <p className="section-tag" style={{ marginBottom: 4 }}>Industry Intelligence</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 3 }}>Researching best practices for <span style={{ color: 'var(--c-gr)' }}>{process.name}</span>...</p>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-dm)', marginBottom: 16 }}>Analysing how leading enterprises run this process</p>
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Identifying key stages', 'Mapping common tool stacks', 'Surfacing typical pain points'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--c-sf2)', border: '1px solid var(--c-b)', borderRadius: 4 }}>
              <div style={{ width: 12, height: 12, border: '2px solid var(--c-gr)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--c-mu)' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="card animate-fade-in-up" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--c-rdBg)', border: '1px solid var(--c-rdBd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <span style={{ color: 'var(--c-rd)', fontSize: 16 }}>âš </span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)', marginBottom: 4 }}>Research failed</p>
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--c-rd)', marginBottom: 16 }}>{error}</p>
        <button onClick={generate} style={{ padding: '8px 20px', background: 'var(--c-ac)', color: '#fff', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
      </div>
    );
  }

  /* Strip parenthetical descriptions from tool names - show just the product/brand */
  function cleanToolName(raw) {
    return raw
      .replace(/\s*\(or equivalent[^)]*\)/i, '')
      .replace(/\s*\(or [^)]*\)/i, '')
      .replace(/\s*\([^)]*\)/, '')
      .replace(/\s+or\s+equivalent.*/i, '')
      .replace(/\s+\/\s+similar.*/i, '')
      .trim();
  }

  /* Split "Stage name (parenthetical note)" into name + note */
  function splitStage(raw) {
    const match = raw.match(/^(.*?)\s*\((.*)\)$/s);
    if (match) return { name: match[1].trim(), note: match[2].trim() };
    return { name: raw.trim(), note: '' };
  }

  return (
    <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p className="section-tag" style={{ marginBottom: 2 }}>Process Benchmark</p>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-tx)', letterSpacing: '-0.01em' }}>{process.name}</h2>
        </div>
        <button onClick={generate} className="btn-ghost" style={{ fontSize: 10, padding: '4px 10px', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
            <path d="M9.5 5.5A4 4 0 1 1 5.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7.5 1.5h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Process stages - numbered list, not chips */}
      {highlights.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--c-b)' }}>
          <div style={{ padding: '10px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="section-tag">Process Stages</p>
            <span className="pill pill-blue">{highlights.length} stages</span>
          </div>
          <div style={{ padding: '0 20px 14px' }}>
            {highlights.map((h, i) => {
              const { name, note } = splitStage(h);
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: i < highlights.length - 1 ? '1px solid var(--c-b)' : 'none' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fontWeight: 700, color: 'var(--c-ac)', width: 14, flexShrink: 0, paddingTop: 2 }}>{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-tx)', marginBottom: note ? 2 : 0 }}>{name}</p>
                    {note && (
                      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, color: 'var(--c-mu)', lineHeight: 1.55, marginTop: 2 }}>{note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platforms + Pain Points */}
      {(commonTools.length > 0 || keyPainPoints.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--c-b)' }}>
          {commonTools.length > 0 && (
            <div style={{ padding: '10px 14px', borderRight: '1px solid var(--c-b)' }}>
              <p className="section-tag" style={{ marginBottom: 8 }}>Common Platforms</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {commonTools.map((t, i) => (
                  <span key={i} style={{
                    fontFamily: 'IBM Plex Mono', fontSize: 9, fontWeight: 500,
                    background: 'var(--c-sf2)', color: 'var(--c-tx)',
                    border: '1px solid var(--c-b2)', padding: '2px 7px', borderRadius: 3,
                  }}>
                    {cleanToolName(t)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {keyPainPoints.length > 0 && (
            <div style={{ padding: '10px 14px' }}>
              <p className="section-tag" style={{ marginBottom: 8 }}>Typical Pain Points</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {keyPainPoints.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--c-ac)', marginTop: 4, flexShrink: 0 }} />
                    <p style={{ fontSize: 10, color: 'var(--c-mu)', lineHeight: 1.55 }}>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editable description */}
      <div style={{ padding: 20 }}>
        <label className="form-label" style={{ marginBottom: 8 }}>
          Process Description{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--c-dm)' }}>- review and adjust for your environment</span>
        </label>
        <textarea value={edited} onChange={e => setEdited(e.target.value)} rows={7} className="form-input" style={{ lineHeight: 1.7 }} />
      </div>

      {error && <div className="banner-error animate-slide-down" style={{ margin: '0 20px 16px' }}>âš  {error}</div>}

      <div style={{ padding: '0 20px 20px' }}>
        <button className="btn-primary" onClick={handleSubmit}>
          Run Analysis â†’
        </button>
      </div>
    </div>
  );
}
