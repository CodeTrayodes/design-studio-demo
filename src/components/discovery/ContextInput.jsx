'use client';

import { useState } from 'react';
import { Upload, Link2, FileText, BarChart3, Check, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const METHODS = [
  { id: 'api',           icon: Link2,     label: 'API Integration',          desc: 'Connect your tool endpoint + token for live telemetry' },
  { id: 'document',      icon: Upload,    label: 'Document Upload',          desc: 'Upload process maps, SOPs, or export files' },
  { id: 'questionnaire', icon: FileText,  label: 'Structured Questionnaire', desc: 'Answer targeted questions about your process' },
  { id: 'benchmark',     icon: BarChart3, label: 'Industry Benchmark',       desc: 'Use pre-built benchmarks for your industry & process' },
];

/* ── Form sub-components ─────────────────────────────────────────────────── */

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
        {status === 'ok'    && <span className="text-[#30D5C8] text-xs font-mono flex items-center space-x-1"><Check size={11}/><span>{message}</span></span>}
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
          : <p className={`text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Drop a PDF, CSV, or XLSX — or click to browse</p>
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
    { id: 'team_size',  label: 'How many people are involved in this process?' },
    { id: 'cycle_time', label: 'What is the typical end-to-end cycle time?'    },
    { id: 'pain_point', label: 'What is the biggest pain point today?'         },
    { id: 'automation', label: 'What percentage is currently automated?'       },
    { id: 'volume',     label: 'How many transactions per week?'               },
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
  const [industry, setIndustry] = useState('');
  const [custom,   setCustom]   = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const finalIndustry = showCustom ? custom.trim() : industry;
  const ready = finalIndustry.length > 1;

  return (
    <div className="space-y-3">
      <p className={`text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
        We will apply industry-standard benchmarks for your sector. Select your industry for the most accurate baseline.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {INDUSTRIES.map(ind => (
          <button
            key={ind}
            onClick={() => { setIndustry(ind); setShowCustom(false); }}
            className={`text-xs py-2 px-3 rounded-lg border text-left transition-all cursor-pointer ${
              industry === ind && !showCustom
                ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
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
              ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
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
        Use benchmark data
      </button>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */

export default function ContextInput({ isDark, onConfirm }) {
  const [selected,  setSelected]  = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm(data) {
    setConfirmed(true);
    onConfirm(selected, data);
  }

  if (confirmed) {
    return (
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
        <p className="text-[#30D5C8] font-mono text-xs uppercase tracking-wider">Context received — starting analysis</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="p-4 pb-3">
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Select input method
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {METHODS.map(m => {
            const Icon   = m.icon;
            const active = selected === m.id;
            return (
              <motion.button
                key={m.id}
                onClick={() => setSelected(m.id)}
                whileHover={{ scale: 1.01 }}
                className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#F5A623] bg-[#F5A623]/8'
                    : isDark ? 'border-[#3A3A3C] hover:border-[#8E8E93]' : 'border-[#D5D0C8] hover:border-[#3D3D44]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#F5A623]' : isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'} />
                <div>
                  <p className={`text-xs font-semibold ${active ? 'text-[#F5A623]' : isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
                    {m.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{m.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-t pt-4 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}
          >
            {selected === 'api'           && <APIForm           isDark={isDark} onSubmit={handleConfirm} />}
            {selected === 'document'      && <DocumentForm      isDark={isDark} onSubmit={handleConfirm} />}
            {selected === 'questionnaire' && <QuestionnaireForm isDark={isDark} onSubmit={handleConfirm} />}
            {selected === 'benchmark'     && <BenchmarkForm     isDark={isDark} onSubmit={handleConfirm} />}
          </motion.div>
        )}
      </div>
    </div>
  );
}
