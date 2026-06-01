'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Link2, FileText, BarChart3, Check, Loader, Plus, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const METHODS = [
  { id: 'api',           icon: Link2,     label: 'API Integration',       desc: 'Connect live system endpoints for real telemetry data' },
  { id: 'document',      icon: Upload,    label: 'Document Upload',        desc: 'Upload process maps, SOPs, or exported data files' },
  { id: 'questionnaire', icon: FileText,  label: 'Process Questionnaire', desc: 'Answer structured questions across 5 discovery dimensions' },
  { id: 'benchmark',     icon: BarChart3, label: 'Industry Benchmark',    desc: 'Apply pre-built benchmarks for your sector and process' },
];

/* -- Custom themed select dropdown ----------------------------------------- */

function CustomSelect({ value, onChange, options, placeholder, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-colors outline-none focus:outline-none ${
          isDark
            ? 'bg-[#0B0B0E] border-[#3A3A3C] text-[#F1F1F3] hover:border-[#8E8E93]/50'
            : 'bg-white border-[#D5D0C8] text-[#18181A] hover:border-[#3D3D44]/50'
        }`}
      >
        <span className={value ? '' : isDark ? 'text-[#8E8E93]/50' : 'text-[#3D3D44]/40'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-50 left-0 right-0 mt-1 rounded-lg border shadow-xl overflow-hidden ${
              isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8] shadow-black/10'
            }`}
          >
            {options.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    opt.value === value
                      ? isDark ? 'bg-[#F5A623]/15 text-[#F5A623]' : 'bg-[#D4890A]/10 text-[#D4890A]'
                      : isDark ? 'text-[#F1F1F3] hover:bg-[#3A3A3C]/60' : 'text-[#18181A] hover:bg-[#F3F1EC]'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -- Tool options for API connections --------------------------------------- */

const API_TOOLS = [
  { value: 'salesforce',  label: 'Salesforce (CRM)',               placeholder: 'https://yourorg.salesforce.com/services/data/v58.0' },
  { value: 'dynamics365', label: 'Microsoft Dynamics 365 (ERP/CRM)', placeholder: 'https://yourorg.crm.dynamics.com/api/data/v9.2' },
  { value: 'sap',         label: 'SAP S/4HANA (ERP)',              placeholder: 'https://yourorg.s4hana.cloud.sap/sap/opu/odata' },
  { value: 'oracle',      label: 'Oracle ERP Cloud (ERP)',         placeholder: 'https://yourorg.oraclecloud.com/fscmRestApi/resources' },
  { value: 'boomi',       label: 'Boomi (Integration)',            placeholder: 'https://api.boomi.com/api/rest/v1/youraccountId' },
  { value: 'mulesoft',    label: 'MuleSoft Anypoint (Integration)', placeholder: 'https://anypoint.mulesoft.com/mocking/api/v1' },
  { value: 'workday',     label: 'Workday (HRMS)',                 placeholder: 'https://wd2-impl-services1.workday.com/ccx/api' },
  { value: 'servicenow',  label: 'ServiceNow (ITSM)',              placeholder: 'https://yourorg.service-now.com/api/now' },
  { value: 'custom',      label: 'Custom API (Other)',             placeholder: 'https://your-api-endpoint.com' },
];

/* -- Multi-API Form --------------------------------------------------------- */

function APIForm({ isDark, onSubmit }) {
  const [connections, setConnections] = useState([{ id: 1, tool: '', endpoint: '', token: '', status: null, message: '' }]);
  const [nextId, setNextId] = useState(2);

  function addConnection() {
    setConnections(p => [...p, { id: nextId, tool: '', endpoint: '', token: '', status: null, message: '' }]);
    setNextId(p => p + 1);
  }

  function removeConnection(id) {
    setConnections(p => p.filter(c => c.id !== id));
  }

  function updateConn(id, field, value) {
    setConnections(p => p.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  async function testConnection(id) {
    const conn = connections.find(c => c.id === id);
    if (!conn?.endpoint || !conn?.token) return;
    updateConn(id, 'status', 'testing');
    try {
      const res  = await fetch('/api/demo/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: 'custom', toolName: conn.tool || 'API', endpoint: conn.endpoint, token: conn.token }),
      });
      const data = await res.json();
      updateConn(id, 'status', data.success ? 'ok' : 'error');
      updateConn(id, 'message', data.message || data.error || '');
    } catch {
      updateConn(id, 'status', 'error');
      updateConn(id, 'message', 'Connection failed');
    }
  }

  const canSubmit = connections.some(c => c.endpoint);

  return (
    <div className="space-y-3">
      {connections.map((conn, idx) => {
        const toolMeta = API_TOOLS.find(t => t.value === conn.tool);
        return (
          <div key={conn.id} className={`rounded-xl border p-4 space-y-3 ${isDark ? 'bg-[#0B0B0E] border-[#3A3A3C]' : 'bg-[#F9F7F4] border-[#D5D0C8]'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                Integration {idx + 1}
              </span>
              {connections.length > 1 && (
                <button
                  onClick={() => removeConnection(conn.id)}
                  className={`p-1 rounded transition-colors cursor-pointer outline-none ${isDark ? 'text-[#8E8E93] hover:text-red-400' : 'text-[#3D3D44] hover:text-red-600'}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Platform</label>
              <CustomSelect
                value={conn.tool}
                onChange={v => { updateConn(conn.id, 'tool', v); updateConn(conn.id, 'endpoint', ''); }}
                options={API_TOOLS}
                placeholder="Select a platform..."
                isDark={isDark}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>API Endpoint</label>
              <input
                value={conn.endpoint}
                onChange={e => updateConn(conn.id, 'endpoint', e.target.value)}
                placeholder={toolMeta?.placeholder ?? 'https://your-api-endpoint.com'}
                className={`w-full text-xs px-3 py-2 rounded-lg border bg-transparent outline-none focus:outline-none font-mono ${
                  isDark ? 'border-[#3A3A3C] text-[#F1F1F3] placeholder-[#8E8E93]/40' : 'border-[#D5D0C8] text-[#18181A] placeholder-[#3D3D44]/40'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-mono uppercase tracking-wider mb-1.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>Bearer Token / API Key</label>
              <input
                type="password"
                value={conn.token}
                onChange={e => updateConn(conn.id, 'token', e.target.value)}
                placeholder="Bearer eyJ... or your API key"
                className={`w-full text-xs px-3 py-2 rounded-lg border bg-transparent outline-none focus:outline-none font-mono ${
                  isDark ? 'border-[#3A3A3C] text-[#F1F1F3] placeholder-[#8E8E93]/40' : 'border-[#D5D0C8] text-[#18181A] placeholder-[#3D3D44]/40'
                }`}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => testConnection(conn.id)}
                disabled={!conn.endpoint || !conn.token || conn.status === 'testing'}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer outline-none focus:outline-none ${
                  isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:text-[#F5A623] hover:border-[#F5A623]/40' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#F5A623]'
                }`}
              >
                {conn.status === 'testing' ? <Loader size={11} className="animate-spin" /> : 'Test connection'}
              </button>
              {conn.status === 'ok' && (
                <span className={`text-xs font-mono flex items-center gap-1 ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
                  <Check size={11} /><span>{conn.message || 'Connected'}</span>
                </span>
              )}
              {conn.status === 'error' && (
                <span className="text-[#F5A623] text-xs font-mono">{conn.message || 'Connection failed'}</span>
              )}
            </div>
          </div>
        );
      })}

      <button
        onClick={addConnection}
        className={`w-full py-2 rounded-xl border-2 border-dashed text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all outline-none ${
          isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#F5A623]/40 hover:text-[#F5A623]' : 'border-[#D5D0C8] text-[#3D3D44] hover:border-[#F5A623]/40 hover:text-[#F5A623]'
        }`}
      >
        <Plus size={12} /> Add another integration
      </button>

      <button
        onClick={() => onSubmit({ connections: connections.map(c => ({ tool: c.tool, endpoint: c.endpoint, status: c.status })) })}
        disabled={!canSubmit}
        className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
          canSubmit
            ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01]'
            : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
        }`}
      >
        {connections.some(c => c.status === 'ok') ? 'Use live data' : 'Continue with configured integrations'}
      </button>
    </div>
  );
}

/* -- Document Upload Form --------------------------------------------------- */

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
          dragging ? 'border-[#F5A623]/60 bg-[#F5A623]/5' : isDark ? 'border-[#3A3A3C] hover:border-[#8E8E93]/50' : 'border-[#D5D0C8] hover:border-[#3D3D44]/50'
        }`}
      >
        <Upload size={22} className={`mx-auto mb-2 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`} />
        {file
          ? <p className={`text-xs font-mono ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>{file.name}</p>
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

/* -- Structured Questionnaire (5 Discovery Dimensions) --------------------- */

const QUESTIONNAIRE = [
  {
    dimension: 'Pain & Impact',
    weight: '30%',
    color: '#EF4444',
    questions: [
      { id: 'cycle_time',   label: 'How long does this process take end-to-end today?', options: ['Less than 1 day', '1-3 business days', '1-2 weeks', 'More than 2 weeks', 'Variable / unknown'] },
      { id: 'error_rate',   label: 'What is the typical error or rework rate?',          options: ['Less than 5% -- mostly clean', '5-15% -- occasional rework', '15-30% -- frequent corrections', 'Over 30% -- chronic issues'] },
      { id: 'manual_effort',label: 'How much of this process is manually executed?',    options: ['Mostly automated (under 20% manual)', 'Mix of automated and manual', 'Mostly manual (over 60%)', 'Entirely manual'] },
    ],
  },
  {
    dimension: 'Data Readiness',
    weight: '25%',
    color: '#60A5FA',
    questions: [
      { id: 'data_location',label: 'Where does the core data for this process live?',         options: ['Structured systems (CRM, ERP, HRMS)', 'Mix of systems and spreadsheets', 'Primarily spreadsheets or email', 'No formal system -- paper or ad hoc'] },
      { id: 'data_access',  label: 'Is your process data accessible via API or exports?',     options: ['Yes -- full API access available', 'Partial -- some systems have APIs', 'Export only -- no API access', 'No structured access at all'] },
    ],
  },
  {
    dimension: 'Process Definition',
    weight: '20%',
    color: '#A78BFA',
    questions: [
      { id: 'documentation',label: 'Is this process formally documented with SOPs and SLAs?', options: ['Fully documented and enforced', 'Partially documented -- some gaps', 'Informal documentation only', 'Not documented -- tribal knowledge'] },
      { id: 'consistency',  label: 'How consistently is the process followed?',               options: ['Always -- standard is enforced', 'Usually -- minor deviations', 'Sometimes -- significant variation', 'Rarely -- everyone does it differently'] },
    ],
  },
  {
    dimension: 'Integration Landscape',
    weight: '15%',
    color: '#34D399',
    questions: [
      { id: 'integration_state', label: 'How integrated are your systems for this process?', options: ['Fully integrated -- data flows automatically', 'Partially integrated -- some manual handoffs', 'Mostly manual -- limited integrations', 'No integrations -- all manual transfers'] },
    ],
  },
  {
    dimension: 'Adoption Readiness',
    weight: '10%',
    color: '#F5A623',
    questions: [
      { id: 'leadership_buy_in', label: 'How open is leadership to AI-assisted automation?',         options: ['Very open -- actively seeking automation', 'Somewhat open -- willing to pilot', 'Neutral -- needs a business case', 'Resistant -- skeptical of automation'] },
      { id: 'team_readiness',    label: 'Would the team act on system-generated recommendations?',   options: ['Yes -- full trust in system output', 'Mostly -- with some oversight', 'Uncertain -- needs to see results first', 'Unlikely -- prefer manual control'] },
    ],
  },
];

function QuestionnaireForm({ isDark, onSubmit }) {
  const [answers,     setAnswers]     = useState({});
  const [expandedDim, setExpandedDim] = useState(0);

  const allQuestions  = QUESTIONNAIRE.flatMap(d => d.questions);
  const answeredCount = allQuestions.filter(q => answers[q.id]).length;
  const complete      = answeredCount === allQuestions.length;

  function setAnswer(dimIdx, id, value) {
    setAnswers(p => ({ ...p, [id]: value }));
    const dim = QUESTIONNAIRE[dimIdx];
    const allInDimAnswered = dim.questions.every(q => q.id === id ? true : !!answers[q.id]);
    if (allInDimAnswered && dimIdx < QUESTIONNAIRE.length - 1) {
      setTimeout(() => setExpandedDim(dimIdx + 1), 280);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-3">
        <p className={`text-[10px] font-mono shrink-0 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          {answeredCount} of {allQuestions.length} answered
        </p>
        <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
          <div
            className="h-full rounded-full bg-[#F5A623] transition-all duration-500"
            style={{ width: `${(answeredCount / allQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {QUESTIONNAIRE.map((dim, dimIdx) => {
        const dimAnswered = dim.questions.every(q => answers[q.id]);
        const isExpanded  = expandedDim === dimIdx;
        return (
          <div key={dim.dimension} className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
            <button
              onClick={() => setExpandedDim(isExpanded ? -1 : dimIdx)}
              className={`w-full flex items-center justify-between p-3 text-left cursor-pointer transition-colors ${
                isExpanded ? isDark ? 'bg-[#3A3A3C]/30' : 'bg-[#F3F1EC]' : isDark ? 'hover:bg-[#3A3A3C]/20' : 'hover:bg-[#F9F7F4]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dim.color }} />
                <span className={`text-xs font-semibold ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{dim.dimension}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${isDark ? 'border-[#3A3A3C] text-[#8E8E93]' : 'border-[#D5D0C8] text-[#3D3D44]'}`}>
                  {dim.weight}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {dimAnswered && <Check size={12} className={isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'} />}
                <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`} />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`px-3 pb-3 pt-1 space-y-3 border-t ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
                    {dim.questions.map(q => (
                      <div key={q.id}>
                        <label className={`block text-[11px] mb-1.5 leading-snug ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{q.label}</label>
                        <div className="grid gap-1">
                          {q.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setAnswer(dimIdx, q.id, opt)}
                              className={`text-left text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                                answers[q.id] === opt
                                  ? isDark ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' : 'border-[#D4890A] bg-[#D4890A]/10 text-[#D4890A]'
                                  : isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#8E8E93]/60 hover:text-[#F1F1F3]' : 'border-[#D5D0C8] text-[#3D3D44] hover:border-[#3D3D44]'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <button
        onClick={() => onSubmit(answers)}
        disabled={!complete}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all mt-1 ${
          complete
            ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01]'
            : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
        }`}
      >
        {complete ? 'Submit process questionnaire' : `${allQuestions.length - answeredCount} question${allQuestions.length - answeredCount !== 1 ? 's' : ''} remaining`}
      </button>
    </div>
  );
}

/* -- Industry Benchmark Form ----------------------------------------------- */

function BenchmarkForm({ isDark, onSubmit }) {
  const INDUSTRIES = ['Technology / SaaS', 'Financial Services', 'Healthcare & Life Sciences', 'Manufacturing', 'Retail & E-commerce', 'Professional Services', 'Energy & Utilities', 'Logistics & Supply Chain'];
  const [industry,   setIndustry]   = useState('');
  const [custom,     setCustom]     = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const finalIndustry = showCustom ? custom.trim() : industry;
  const ready = finalIndustry.length > 1;

  return (
    <div className="space-y-3">
      <p className={`text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
        We will apply industry-standard benchmarks for your sector. Select your industry for the most accurate baseline comparison.
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
        <div className={`border-b pb-1.5 transition-all focus-within:border-[#F5A623]/50 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
          <input
            autoFocus
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="e.g. Legal Services, Agriculture, Government..."
            className={`w-full bg-transparent border-none outline-none focus:outline-none text-xs font-sans ${
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
        Apply benchmark data
      </button>
    </div>
  );
}

/* -- Form router ------------------------------------------------------------ */

function MethodForm({ methodId, isDark, onSubmit }) {
  if (methodId === 'api')           return <APIForm           isDark={isDark} onSubmit={onSubmit} />;
  if (methodId === 'document')      return <DocumentForm      isDark={isDark} onSubmit={onSubmit} />;
  if (methodId === 'questionnaire') return <QuestionnaireForm isDark={isDark} onSubmit={onSubmit} />;
  if (methodId === 'benchmark')     return <BenchmarkForm     isDark={isDark} onSubmit={onSubmit} />;
  return null;
}

/* -- Main export ------------------------------------------------------------ */

export default function ContextInput({ isDark, onConfirm }) {
  // Multi-select: array of selected method IDs
  const [selected,   setSelected]   = useState([]);
  // Track which methods have been submitted
  const [submitted,  setSubmitted]  = useState({});
  // Final confirmed state
  const [confirmed,  setConfirmed]  = useState(false);

  function toggleMethod(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  }

  function handleMethodSubmit(methodId, data) {
    setSubmitted(prev => ({ ...prev, [methodId]: data }));
  }

  function handleConfirmAll() {
    setConfirmed(true);
    // Combine all submitted data, prioritise by method hierarchy
    const primaryMethod = ['api', 'document', 'questionnaire', 'benchmark'].find(m => submitted[m]);
    onConfirm(primaryMethod ?? selected[0], submitted);
  }

  const anySubmitted = Object.keys(submitted).length > 0;

  if (confirmed) {
    return (
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
        <p className={`font-mono text-xs uppercase tracking-wider ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
          Process context received -- starting deep analysis
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="p-4 pb-3">
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Process Definition Methods
        </p>
        <p className={`text-[11px] mb-4 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          Select one or more -- forms expand inline below
        </p>

        {/* Method selector grid -- all 4 always visible, multi-select */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {METHODS.map(m => {
            const Icon     = m.icon;
            const active   = selected.includes(m.id);
            const done     = !!submitted[m.id];
            return (
              <motion.button
                key={m.id}
                onClick={() => toggleMethod(m.id)}
                whileHover={{ scale: 1.01 }}
                className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  done
                    ? isDark ? 'border-[#30D5C8]/40 bg-[#30D5C8]/5' : 'border-[#0D9488]/30 bg-[#0D9488]/5'
                    : active
                    ? isDark ? 'border-[#F5A623]/60 bg-[#F5A623]/8' : 'border-[#D4890A]/50 bg-[#D4890A]/6'
                    : isDark ? 'border-[#3A3A3C] hover:border-[#8E8E93]/60' : 'border-[#D5D0C8] hover:border-[#3D3D44]'
                }`}
              >
                {done && (
                  <div className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${isDark ? 'bg-[#30D5C8]' : 'bg-[#0D9488]'}`}>
                    <Check size={9} className="text-black" />
                  </div>
                )}
                <Icon
                  size={16}
                  className={
                    done   ? isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'
                    : active ? isDark ? 'text-[#F5A623]' : 'text-[#D4890A]'
                    : isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'
                  }
                />
                <div>
                  <p className={`text-xs font-semibold ${
                    done   ? isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'
                    : active ? isDark ? 'text-[#F5A623]' : 'text-[#D4890A]'
                    : isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'
                  }`}>
                    {m.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{m.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Expanded forms for each selected method -- stacked */}
        <AnimatePresence>
          {selected.map(methodId => {
            const meta = METHODS.find(m => m.id === methodId);
            return (
              <motion.div
                key={methodId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className={`border rounded-xl mb-3 overflow-hidden ${
                  submitted[methodId]
                    ? isDark ? 'border-[#30D5C8]/30' : 'border-[#0D9488]/30'
                    : isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'
                }`}>
                  {/* Form header */}
                  <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                    isDark ? 'bg-[#3A3A3C]/20 border-[#3A3A3C]' : 'bg-[#F9F7F4] border-[#D5D0C8]'
                  }`}>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                      {meta?.label}
                    </span>
                    {submitted[methodId] && (
                      <span className={`text-[9px] font-mono flex items-center gap-1 ${isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'}`}>
                        <Check size={9} /> Saved
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <MethodForm
                      methodId={methodId}
                      isDark={isDark}
                      onSubmit={(data) => handleMethodSubmit(methodId, data)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Global confirm button -- only shows when at least one form is done */}
        <AnimatePresence>
          {anySubmitted && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              onClick={handleConfirmAll}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.01] transition-all cursor-pointer"
            >
              Run Discovery with {Object.keys(submitted).length} source{Object.keys(submitted).length !== 1 ? 's' : ''}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
