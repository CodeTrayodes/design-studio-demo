'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const INDUSTRY_LABELS = {
  underwriting: 'Underwriting',
  claims: 'Claims Processing',
  loans: 'Loan Origination',
  custom: 'Custom Process',
};

const TEMPLATES = {
  underwriting: {
    label: 'Insurance Underwriting',
    description:
      'The underwriting process begins with receiving a policy application from a broker or directly from the applicant. Underwriters assess the risk profile of the applicant, verify identity and documentation, review credit and claims history, calculate an appropriate premium, make a coverage decision, and issue the policy. Key pain points include manual data entry from paper applications, inconsistent risk scoring across underwriters, slow turnaround times, and compliance documentation overhead. The process involves multiple stakeholders: applicants, brokers, underwriters, compliance officers, and policy administrators.',
    highlights: ['Risk Assessment', 'Premium Calculation', 'Document Verification', 'Policy Issuance', 'Compliance Review'],
  },
  claims: {
    label: 'Claims Processing',
    description:
      'The claims processing workflow starts with a policyholder submitting a claim via phone, web portal, or mobile app. The claim is triaged and assigned to an adjuster. The adjuster investigates by collecting evidence, contacting relevant parties, and reviewing the policy terms. A liability decision is made, a settlement amount is calculated, and payment is disbursed. The process includes fraud detection checks and regulatory reporting. Pain points include slow intake processing, manual document handling, lack of real-time status updates for claimants, and long cycle times from first notice of loss to settlement.',
    highlights: ['Claim Intake', 'Triage & Assignment', 'Investigation', 'Liability Decision', 'Settlement & Payment'],
  },
  loans: {
    label: 'Loan Origination',
    description:
      'The loan origination process covers the complete lifecycle from application submission to funding. Applicants submit financial information, employment details, and supporting documents. Credit checks and bureau pulls are conducted. Income and employment are verified. Property appraisals are ordered for secured loans. Underwriters review the full package and make a credit decision. Approved loans go through a closing process with legal document signing, followed by fund disbursement. Key challenges include manual document collection, long verification cycles, applicant drop-off due to friction, and compliance with lending regulations.',
    highlights: ['Application Intake', 'Credit Assessment', 'Document Verification', 'Underwriting Decision', 'Closing & Funding'],
  },
  custom: null,
};

export default function InputPage() {
  const { method } = useParams();
  const router = useRouter();

  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Questionnaire
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loadingQs, setLoadingQs] = useState(false);

  // Upload
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Connect
  const [apiUrl, setApiUrl] = useState('');

  // Template
  const [selectedTmpl, setSelectedTmpl] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  useEffect(() => {
    const ind = sessionStorage.getItem('demo_industry') || '';
    setIndustry(ind);
    if (ind && ind !== 'custom') setSelectedTmpl(ind);

    if (method === 'questionnaire' && ind) {
      fetchQuestions(ind);
    }
  }, [method]);

  async function fetchQuestions(ind) {
    setLoadingQs(true);
    setError('');
    try {
      const res = await fetch('/api/demo/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: INDUSTRY_LABELS[ind] || ind }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
    } catch (e) {
      setError(e.message || 'Failed to load questions. Please refresh the page.');
    } finally {
      setLoadingQs(false);
    }
  }

  function goToResults(processDescription) {
    sessionStorage.setItem('demo_input', JSON.stringify({ method, processDescription }));
    router.push('/results');
  }

  // ── Questionnaire submit ──
  async function submitQuestionnaire() {
    if (!questions.length) return;
    const answeredCount = Object.values(answers).filter(v => v?.trim()).length;
    if (answeredCount < Math.floor(questions.length * 0.5)) {
      setError('Please answer at least half of the questions before continuing.');
      return;
    }
    const formatted = questions
      .map(q => `Q: ${q.text}\nA: ${answers[q.id] || '(not provided)'}`)
      .join('\n\n');
    goToResults(`${INDUSTRY_LABELS[industry] || industry} Process — Questionnaire Responses:\n\n${formatted}`);
  }

  // ── Upload submit ──
  async function submitUpload() {
    if (files.length === 0) { setError('Please select at least one file.'); return; }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      const res = await fetch('/api/demo/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      goToResults(data.text);
    } catch (e) {
      setError(e.message || 'Upload failed. Please try again.');
      setLoading(false);
    }
  }

  // ── Connect submit ──
  async function submitConnect() {
    if (!apiUrl.startsWith('https://')) { setError('Please enter a valid HTTPS URL.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/demo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: apiUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      goToResults(`API Response from ${apiUrl}:\n\n${data.text}`);
    } catch (e) {
      setError(e.message || 'Connection failed.');
      setLoading(false);
    }
  }

  // ── Template submit ──
  function submitTemplate() {
    if (selectedTmpl === 'custom' || industry === 'custom') {
      if (!customDesc.trim() || customDesc.trim().length < 50) {
        setError('Please describe your process in at least 50 characters.');
        return;
      }
      goToResults(customDesc.trim());
    } else {
      const tmpl = TEMPLATES[selectedTmpl] || TEMPLATES[industry];
      if (!tmpl) { setError('Please select a template.'); return; }
      goToResults(tmpl.description);
    }
  }

  const industryLabel = INDUSTRY_LABELS[industry] || industry || '—';
  const methodLabel = { template: 'Template', questionnaire: 'Questionnaire', upload: 'Upload', connect: 'Connect' }[method] || method;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button onClick={() => router.push('/')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">{industryLabel}</span>
          <span className="text-slate-300 text-xs">›</span>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">{methodLabel}</span>
        </div>
      </div>

      {/* ── QUESTIONNAIRE ── */}
      {method === 'questionnaire' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loadingQs ? (
            <div className="p-12 text-center">
              <Spinner />
              <p className="text-sm text-slate-400 mt-3">Generating questions for {industryLabel}...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No questions loaded.</p>
              <button onClick={() => fetchQuestions(industry)} className="mt-3 text-sm text-blue-600 hover:underline">
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="h-1 bg-slate-100">
                <div
                  className="h-1 bg-blue-500 transition-all"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-slate-300">
                    {Object.values(answers).filter(v => v?.trim()).length} answered
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-800 mb-5 leading-snug">
                  {questions[currentQ]?.text}
                </h2>

                <textarea
                  value={answers[questions[currentQ]?.id] || ''}
                  onChange={e =>
                    setAnswers(prev => ({ ...prev, [questions[currentQ]?.id]: e.target.value }))
                  }
                  placeholder={questions[currentQ]?.placeholder || 'Type your answer here...'}
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-3.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 placeholder:text-slate-300"
                />

                <div className="flex items-center justify-between mt-5">
                  <button
                    onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                    disabled={currentQ === 0}
                    className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  >
                    ← Previous
                  </button>

                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQ(q => q + 1)}
                      className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={submitQuestionnaire}
                      className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Analyse Process →
                    </button>
                  )}
                </div>
              </div>

              {/* Question dots nav */}
              <div className="px-8 pb-6 flex gap-1.5 flex-wrap">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentQ
                        ? 'bg-blue-600'
                        : answers[q.id]?.trim()
                        ? 'bg-blue-200'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── UPLOAD ── */}
      {method === 'upload' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Upload process documentation</h2>
          <p className="text-sm text-slate-400 mb-6">Supports PDF, TXT, DOCX — up to 3 files, 10 MB each</p>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setDragging(false);
              const dropped = Array.from(e.dataTransfer.files).slice(0, 3 - files.length);
              setFiles(prev => [...prev, ...dropped].slice(0, 3));
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm font-medium text-slate-600">Drop files here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, TXT, DOCX — max 10 MB per file</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.doc"
              className="hidden"
              onChange={e => {
                const sel = Array.from(e.target.files || []).slice(0, 3 - files.length);
                setFiles(prev => [...prev, ...sel].slice(0, 3));
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-lg">{f.name.endsWith('.pdf') ? '📕' : '📝'}</span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{f.name}</span>
                  <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-300 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={submitUpload}
            disabled={loading || files.length === 0}
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner sm /> Extracting & analysing...</> : 'Analyse Documents →'}
          </button>
        </div>
      )}

      {/* ── CONNECT ── */}
      {method === 'connect' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Connect to a system endpoint</h2>
          <p className="text-sm text-slate-400 mb-6">
            Paste an HTTPS API URL that returns process metadata. The demo will fetch it and analyse the response.
          </p>

          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            API Endpoint URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://api.yourcompany.com/process-data"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 placeholder:text-slate-300"
          />

          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-1">What happens</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>→ A GET request is made to your URL (30s timeout)</li>
              <li>→ The JSON or text response is passed to the AI</li>
              <li>→ Only HTTPS endpoints are supported</li>
              <li>→ No credentials or auth headers are sent</li>
            </ul>
          </div>

          <button
            onClick={submitConnect}
            disabled={loading || !apiUrl.startsWith('https://')}
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner sm /> Connecting...</> : 'Connect & Analyse →'}
          </button>
        </div>
      )}

      {/* ── TEMPLATE ── */}
      {method === 'template' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Select an industry template</h2>
          <p className="text-sm text-slate-400 mb-6">
            Pre-built best-practice descriptions — select one and the AI will analyse it immediately.
          </p>

          <div className="space-y-3 mb-6">
            {Object.entries(TEMPLATES)
              .filter(([, v]) => v !== null)
              .map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedTmpl(key); setCustomDesc(''); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTmpl === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className={`text-sm font-semibold mb-1 ${selectedTmpl === key ? 'text-blue-700' : 'text-slate-800'}`}>
                        {tmpl.label}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tmpl.highlights.map(h => (
                          <span key={h} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {h}
                          </span>
                        ))}
                      </div>
                      {selectedTmpl === key && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                          {tmpl.description}
                        </p>
                      )}
                    </div>
                    {selectedTmpl === key && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}

            {/* Custom option */}
            <button
              onClick={() => setSelectedTmpl('custom')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedTmpl === 'custom' || industry === 'custom'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-dashed border-slate-200 hover:border-blue-200'
              }`}
            >
              <div className={`text-sm font-semibold mb-0.5 ${selectedTmpl === 'custom' ? 'text-blue-700' : 'text-slate-600'}`}>
                Custom Process
              </div>
              <div className="text-xs text-slate-400">Describe your own business process</div>
            </button>
          </div>

          {(selectedTmpl === 'custom' || industry === 'custom') && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Describe your process
              </label>
              <textarea
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
                placeholder="Describe your business process — what it does, key steps, stakeholders, current pain points, and tools used..."
                rows={6}
                className="w-full border border-slate-200 rounded-lg p-3.5 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 placeholder:text-slate-300"
              />
              <p className="text-[11px] text-slate-400 mt-1">{customDesc.length} characters (minimum 50)</p>
            </div>
          )}

          <button
            onClick={submitTemplate}
            disabled={
              !selectedTmpl ||
              ((selectedTmpl === 'custom' || industry === 'custom') && customDesc.trim().length < 50)
            }
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Analyse with AI →
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function Spinner({ sm }) {
  return (
    <div
      className={`border-2 border-white border-t-transparent rounded-full animate-spin ${sm ? 'w-4 h-4' : 'w-6 h-6'}`}
    />
  );
}
