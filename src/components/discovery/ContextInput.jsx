'use client';

import { useState } from 'react';
import { UploadCloud, Link2, ClipboardList, Star, Check, Loader, CheckCircle2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const METHODS = [
  {
    id: 'upload',
    icon: UploadCloud,
    label: 'Upload Documents',
    desc: 'Process documentation, SOPs, flow diagrams (PDF, Word, Excel)',
    improvement: 20,
    badge: null,
  },
  {
    id: 'api',
    icon: Link2,
    label: 'Connect System',
    desc: 'Link your business system via API for real-time process data',
    improvement: 35,
    badge: { text: 'Most Accurate', color: 'text-[#30D5C8] bg-[#30D5C8]/10 border-[#30D5C8]/30' },
  },
  {
    id: 'questionnaire',
    icon: ClipboardList,
    label: 'Questionnaire',
    desc: 'Answer guided questions about your current process steps',
    improvement: 25,
    badge: { text: 'Recommended', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  },
  {
    id: 'benchmark',
    icon: Star,
    label: 'Industry Templates',
    desc: 'Start from industry best practice templates from our database',
    improvement: 15,
    badge: null,
  },
];

const IMPROVEMENT_MAP = { api: 35, upload: 20, questionnaire: 25, benchmark: 15 };

/* -- Form sub-components --------------------------------------------------- */

function APIForm({ isDark, onSubmit }) {
  const [endpoint, setEndpoint] = useState('');
  const [token,    setToken]    = useState('');
  const [toolName, setToolName] = useState('');
  const [status,   setStatus]   = useState(null);
  const [message,  setMessage]  = useState('');

  async function testConnection() {
    if (!endpoint || !token) return;
    setStatus('testing');
    try {
      const res  = await fetch('/api/demo/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: 'custom', toolName: toolName || 'API', endpoint, token }),
      });
      const data = await res.json();
      setStatus(data.success ? 'ok' : 'error');
      setMessage(data.message || data.error || '');
    } catch {
      setStatus('error');
      setMessage('Connection failed');
    }
  }

  const fields = [
    { label: 'Tool name',              value: toolName, set: setToolName, placeholder: 'e.g. Salesforce' },
    { label: 'API endpoint',           value: endpoint, set: setEndpoint, placeholder: 'https://yourorg.salesforce.com/services/data' },
    { label: 'Bearer token / API key', value: token,    set: setToken,    placeholder: 'Bearer eyJ...' },
  ];

  return (
    <div className="space-y-3">
      {fields.map(({ label, value, set, placeholder }) => (
        <div key={label}>
          <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            {label}
          </label>
          <input
            value={value}
            onChange={e => set(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-xs px-3 py-2 rounded-lg border bg-transparent outline-none font-mono ${
              isDark ? 'border-[#3A3A3C] text-[#F1F1F3] placeholder-[#8E8E93]/40' : 'border-[#D5D0C8] text-[#18181A] placeholder-[#3D3D44]/40'
            }`}
          />
        </div>
      ))}
      <div className="flex items-center space-x-3">
        <button
          onClick={testConnection}
          disabled={!endpoint || !token || status === 'testing'}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
            isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:text-[#F5A623] hover:border-[#F5A623]/40' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#F5A623]'
          }`}
        >
          {status === 'testing' ? <Loader size={11} className="animate-spin" /> : 'Test connection'}
        </button>
        {status === 'ok'    && <span className={`text-xs font-mono flex items-center space-x-1 ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}><Check size={11}/><span>{message}</span></span>}
        {status === 'error' && <span className="text-[#F5A623] text-xs font-mono">{message}</span>}
      </div>
      <button
        onClick={() => onSubmit({ endpoint, token, toolName, connectionStatus: status })}
        className="w-full py-2 rounded-xl bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black text-xs font-semibold cursor-pointer hover:scale-[1.01] transition-all"
      >
        {status === 'ok' ? 'Use live data' : 'Continue without connection test'}
      </button>
    </div>
  );
}

function DocumentForm({ isDark, onSubmit }) {
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('ctx-file-input').click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-[#F5A623] bg-[#F5A623]/5' : isDark ? 'border-[#3A3A3C] hover:border-[#8E8E93]' : 'border-[#D5D0C8] hover:border-[#3D3D44]'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`} />
        {file
          ? <p className={`text-xs font-mono ${isDark ? 'text-[#30D5C8]' : 'text-[#1AB5A8]'}`}>{file.name}</p>
          : <p className={`text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Drop a PDF, CSV, or XLSX -- or click to browse</p>
        }
        <input id="ctx-file-input" type="file" className="hidden" accept=".pdf,.csv,.xlsx,.docx"
          onChange={e => setFile(e.target.files?.[0] || null)} />
      </div>
      <button
        onClick={() => onSubmit({ fileName: file?.name, fileType: file?.type })}
        disabled={!file}
        className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
          file
            ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01]'
            : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
        }`}
      >
        Analyse document
      </button>
    </div>
  );
}

function QuestionnaireForm({ isDark, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const questions = [
    { id: 'team_size',          label: 'How many people are involved in this process?' },
    { id: 'cycle_time',         label: 'What is the typical end-to-end cycle time?' },
    { id: 'improvement_opps',  label: 'What are the biggest improvement opportunities today?' },
    { id: 'automation',         label: 'What percentage is currently automated?' },
    { id: 'volume',             label: 'How many transactions per week?' },
  ];
  const complete = questions.every(q => answers[q.id]?.trim());

  return (
    <div className="space-y-3">
      {questions.map(q => (
        <div key={q.id}>
          <label className={`block text-[11px] mb-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{q.label}</label>
          <input
            value={answers[q.id] || ''}
            onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
            className={`w-full text-xs px-3 py-2 rounded-lg border bg-transparent outline-none ${
              isDark ? 'border-[#3A3A3C] text-[#F1F1F3] placeholder-[#8E8E93]/40' : 'border-[#D5D0C8] text-[#18181A]'
            }`}
          />
        </div>
      ))}
      <button
        onClick={() => onSubmit(answers)}
        disabled={!complete}
        className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
          complete
            ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01]'
            : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
        }`}
      >
        Submit answers
      </button>
    </div>
  );
}

function BenchmarkForm({ isDark, onSubmit }) {
  const INDUSTRIES = ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail', 'Professional Services', 'Energy & Utilities', 'Logistics'];
  const [industry,    setIndustry]    = useState('');
  const [custom,      setCustom]      = useState('');
  const [showCustom,  setShowCustom]  = useState(false);

  const finalIndustry = showCustom ? custom.trim() : industry;
  const ready = finalIndustry.length > 1;

  return (
    <div className="space-y-3">
      <p className={`text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
        We will apply industry-standard templates for your sector. Select your industry for the most accurate baseline.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {INDUSTRIES.map(ind => (
          <button
            key={ind}
            onClick={() => { setIndustry(ind); setShowCustom(false); }}
            className={`text-xs py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
              industry === ind && !showCustom
                ? isDark ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' : 'border-[#D4890A] bg-[#D4890A]/10 text-[#D4890A]'
                : isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#8E8E93]' : 'border-[#D5D0C8] text-[#3D3D44] hover:border-[#3D3D44]'
            }`}
          >
            {ind}
          </button>
        ))}
        <button
          onClick={() => { setShowCustom(true); setIndustry(''); }}
          className={`text-xs py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
            showCustom
              ? isDark ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' : 'border-[#D4890A] bg-[#D4890A]/10 text-[#D4890A]'
              : isDark ? 'border-[#3A3A3C] border-dashed text-[#8E8E93] hover:border-[#8E8E93]' : 'border-[#D5D0C8] border-dashed text-[#3D3D44] hover:border-[#3D3D44]'
          }`}
        >
          + Other
        </button>
      </div>

      {showCustom && (
        <div className={`border-b pb-1.5 transition-all focus-within:border-[#F5A623] ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
          <input
            autoFocus
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="e.g. Legal Services, Agriculture..."
            className={`w-full bg-transparent border-none outline-none text-xs font-sans ${
              isDark ? 'text-white placeholder-[#8E8E93]/40' : 'text-[#18181A] placeholder-[#3D3D44]/40'
            }`}
          />
        </div>
      )}

      <button
        onClick={() => onSubmit({ industry: finalIndustry })}
        disabled={!ready}
        className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
          ready
            ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01]'
            : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
        }`}
      >
        Use template data
      </button>
    </div>
  );
}

/* -- Main export ------------------------------------------------------------ */

export default function ContextInput({ isDark, onConfirm }) {
  const [selectedMethods, setSelectedMethods] = useState(new Set());
  const [confirmed,       setConfirmed]       = useState(false);
  // After clicking Continue, show the first selected method's detailed form
  const [activeFormMethod, setActiveFormMethod] = useState(null);

  function toggleMethod(id) {
    setSelectedMethods(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const selectedCount = selectedMethods.size;
  const totalImprovement = Array.from(selectedMethods).reduce(
    (sum, id) => sum + (IMPROVEMENT_MAP[id] ?? 0),
    0
  );

  function handleContinue() {
    const methods = Array.from(selectedMethods);
    // Show the first method's detailed form
    setActiveFormMethod(methods[0]);
  }

  function handleFormSubmit(data) {
    setConfirmed(true);
    onConfirm({ methods: Array.from(selectedMethods), data });
  }

  if (confirmed) {
    return (
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
        <p className={`font-mono text-xs uppercase tracking-wider ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
          Context received -- starting analysis
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="p-4 pb-3">

        {/* Title */}
        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
          How would you like to define your process?
        </p>
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Select one or more input sources
        </p>

        {/* 2x2 card grid */}
        {!activeFormMethod && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {METHODS.map(m => {
                const Icon     = m.icon;
                const isActive = selectedMethods.has(m.id);
                return (
                  <motion.div
                    key={m.id}
                    onClick={() => toggleMethod(m.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`relative rounded-xl p-4 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#F5A623]/5 border border-[#F5A623]'
                        : isDark
                          ? 'bg-[#1C1C1E] border border-[#3A3A3C] hover:border-[#F5A623]/50'
                          : 'bg-white border border-[#D5D0C8] hover:border-[#F5A623]/50'
                    }`}
                  >
                    {/* Checkmark top-right when selected */}
                    {isActive && (
                      <CheckCircle2
                        size={15}
                        className="absolute top-2 right-2 text-[#F5A623]"
                      />
                    )}

                    {/* Badge top-left (when not selected, so it doesn't clash with checkmark) */}
                    {m.badge && !isActive && (
                      <span className={`absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded border ${m.badge.color}`}>
                        {m.badge.text}
                      </span>
                    )}
                    {m.badge && isActive && (
                      <span className={`absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded border ${m.badge.color}`}>
                        {m.badge.text}
                      </span>
                    )}

                    {/* Icon */}
                    <Icon
                      size={20}
                      className={`mb-2 ${isActive ? 'text-[#F5A623]' : 'text-[#8E8E93]'}`}
                    />

                    {/* Title */}
                    <p className={`text-xs font-semibold leading-tight mb-1 ${isActive ? 'text-[#F5A623]' : isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
                      {m.label}
                    </p>

                    {/* Description */}
                    <p className={`text-[10px] leading-snug mb-2 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                      {m.desc}
                    </p>

                    {/* Improvement badge */}
                    <span className="text-[#30D5C8] text-[10px] font-mono">
                      +{m.improvement}% process understanding
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Total improvement strip */}
            {selectedCount >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#30D5C8]/10 border border-[#30D5C8]/30 rounded-lg p-2 text-[#30D5C8] text-sm text-center mb-3"
              >
                Based on {selectedCount} source{selectedCount > 1 ? 's' : ''} selected: +{totalImprovement}% better process understanding
              </motion.div>
            )}

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={selectedCount === 0}
              className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCount > 0
                  ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black cursor-pointer hover:scale-[1.01]'
                  : isDark
                    ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed'
                    : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
              }`}
            >
              Continue with {selectedCount > 0 ? selectedCount : ''} Source{selectedCount !== 1 ? 's' : ''}
            </button>
          </>
        )}

        {/* Detailed sub-form for the first selected method */}
        {activeFormMethod && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-t pt-4 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                {METHODS.find(m => m.id === activeFormMethod)?.label}
              </p>
              <button
                onClick={() => setActiveFormMethod(null)}
                className={`text-[10px] font-mono underline cursor-pointer ${isDark ? 'text-[#8E8E93] hover:text-[#F1F1F3]' : 'text-[#3D3D44] hover:text-[#18181A]'}`}
              >
                Back
              </button>
            </div>
            {activeFormMethod === 'api'           && <APIForm           isDark={isDark} onSubmit={handleFormSubmit} />}
            {activeFormMethod === 'upload'        && <DocumentForm      isDark={isDark} onSubmit={handleFormSubmit} />}
            {activeFormMethod === 'questionnaire' && <QuestionnaireForm isDark={isDark} onSubmit={handleFormSubmit} />}
            {activeFormMethod === 'benchmark'     && <BenchmarkForm     isDark={isDark} onSubmit={handleFormSubmit} />}
          </motion.div>
        )}

      </div>
    </div>
  );
}
