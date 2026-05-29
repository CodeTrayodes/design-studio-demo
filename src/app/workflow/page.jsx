'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  useReactFlow,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ── Colours per phase ─────────────────────────────────────────────────────────
const PHASE_META = [
  { color: '#3b82f6', light: '#eff6ff', border: '#bfdbfe', label: 'Phase 1' },
  { color: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', label: 'Phase 2' },
  { color: '#f97316', light: '#fff7ed', border: '#fed7aa', label: 'Phase 3' },
];

const handleStyle = { width: 8, height: 8, border: '2px solid #94a3b8', background: '#fff' };

// ── Custom nodes ──────────────────────────────────────────────────────────────

function TriggerNode({ data }) {
  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 shadow-md px-4 py-3 min-w-[180px]" style={{ background: '#f0fdf4' }}>
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-base">▶</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Trigger</p>
          <p className="text-[13px] font-bold text-emerald-900 leading-tight">{data.label}</p>
        </div>
      </div>
    </div>
  );
}

function OrchestratorNode({ data, selected }) {
  return (
    <div className={`rounded-2xl border-2 shadow-md px-4 py-3 min-w-[220px] transition-all ${selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-300'}`} style={{ background: '#fffbeb' }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" id="left" position={Position.Left} style={handleStyle} />
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
          <span className="text-white text-base">◈</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Orchestrator</p>
          <p className="text-[13px] font-bold text-amber-900 leading-tight">{data.label}</p>
        </div>
      </div>
      <p className="text-[10px] text-amber-700 mt-1.5 leading-relaxed line-clamp-2">{data.description}</p>
    </div>
  );
}

function AgentNode({ data, selected }) {
  const pm = PHASE_META[(data.phase || 1) - 1] || PHASE_META[0];
  return (
    <div className={`rounded-xl border-2 shadow px-3 py-2.5 w-[190px] transition-all cursor-pointer ${selected ? 'ring-2' : 'hover:shadow-md'}`}
      style={{ background: pm.light, borderColor: selected ? pm.color : pm.border, ringColor: pm.color }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: pm.color }}>
          <span className="text-white text-[10px]">⚡</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: pm.color }}>{pm.label}</p>
          <p className="text-[12px] font-bold text-slate-800 leading-snug">{data.label}</p>
        </div>
      </div>
      {data.platform && (
        <span className="inline-block text-[9px] font-semibold bg-white border rounded-full px-1.5 py-px text-slate-500 mb-1 border-slate-200">{data.platform}</span>
      )}
      {data.stageName && (
        <p className="text-[10px] text-slate-500 leading-snug truncate">{data.stageName}</p>
      )}
    </div>
  );
}

function HumanNode({ data, selected }) {
  return (
    <div className={`rounded-xl border-2 shadow px-3 py-2.5 min-w-[170px] transition-all ${selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-orange-300'}`} style={{ background: '#fff7ed' }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">👤</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">Human Gate</p>
          <p className="text-[12px] font-bold text-orange-900">{data.label}</p>
        </div>
      </div>
      <p className="text-[10px] text-orange-700 mt-1">{data.description}</p>
    </div>
  );
}

function MemoryNode({ data }) {
  return (
    <div className="rounded-xl border-2 border-indigo-200 shadow px-3 py-2.5 min-w-[150px]" style={{ background: '#eef2ff' }}>
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">🧠</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Memory</p>
          <p className="text-[12px] font-bold text-indigo-900">{data.label}</p>
        </div>
      </div>
    </div>
  );
}

function CompleteNode({ data }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 shadow px-4 py-3 min-w-[180px]">
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-base">✓</span>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Complete</p>
          <p className="text-[13px] font-bold text-slate-800">{data.label}</p>
        </div>
      </div>
    </div>
  );
}

const NODE_TYPES = { trigger: TriggerNode, orchestrator: OrchestratorNode, agent: AgentNode, human: HumanNode, memory: MemoryNode, complete: CompleteNode };

// ── Graph builder ─────────────────────────────────────────────────────────────

function buildEdge(id, source, target, opts = {}) {
  return {
    id, source, target,
    type: 'smoothstep',
    animated: opts.animated ?? false,
    style: { stroke: opts.color || '#94a3b8', strokeWidth: opts.width || 1.5, strokeDasharray: opts.dashed ? '5 4' : undefined },
    markerEnd: opts.noArrow ? undefined : { type: MarkerType.ArrowClosed, color: opts.color || '#94a3b8', width: 14, height: 14 },
    label: opts.label,
    labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 600 },
    labelBgStyle: { fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 },
    ...opts.extra,
  };
}

function buildGraph(plan, processName) {
  const nodes = [];
  const edges = [];

  const phases = (plan.phases || []).filter(p => (p.agents || []).length > 0);
  const maxAgentsPerPhase = Math.max(...phases.map(p => (p.agents || []).length), 1);
  const SPACING_X = 210;
  const totalWidth = (maxAgentsPerPhase - 1) * SPACING_X;
  const cx = totalWidth / 2;

  // Trigger
  nodes.push({ id: 'trigger', type: 'trigger', position: { x: cx - 90, y: 0 }, data: { label: processName || 'Process Request' } });

  // Orchestrator
  nodes.push({
    id: 'orchestrator', type: 'orchestrator',
    position: { x: cx - 110, y: 130 },
    data: {
      label: 'Orchestration Agent',
      description: 'Plans execution, routes tasks to specialised agents, tracks progress.',
      inputs: ['Process Request', 'Session Context'],
      outputs: ['Task Assignments', 'Aggregated Results'],
      steps: ['Parse request', 'Build execution plan', 'Dispatch to agents', 'Aggregate results'],
    },
  });
  edges.push(buildEdge('e-trig-orch', 'trigger', 'orchestrator', { color: '#22c55e', width: 2 }));

  // Memory node
  nodes.push({ id: 'memory', type: 'memory', position: { x: cx - 350, y: 200 }, data: { label: 'Context Memory', description: 'Shared state and session context.' } });
  edges.push(buildEdge('e-mem-orch', 'memory', 'orchestrator', { dashed: true, color: '#818cf8', noArrow: false, animated: true, extra: { sourceHandle: null, targetHandle: 'left' } }));

  let prevIds = ['orchestrator'];
  let currentY = 300;

  phases.forEach((phase, phIdx) => {
    const agents = phase.agents || [];
    const pm = PHASE_META[phIdx] || PHASE_META[0];
    const phStartX = cx - ((agents.length - 1) * SPACING_X) / 2;
    const agentIds = [];

    agents.forEach((agent, ai) => {
      const nodeId = `agent-${phIdx}-${ai}`;
      agentIds.push(nodeId);
      nodes.push({
        id: nodeId, type: 'agent',
        position: { x: phStartX + ai * SPACING_X - 95, y: currentY },
        data: {
          label: agent.name,
          platform: agent.platform,
          stageName: agent.stageName,
          rationale: agent.rationale,
          impact: agent.impact,
          effort: agent.effort,
          phase: phIdx + 1,
          category: agent.category,
          inputs: [`${agent.stageName || 'Stage'} Data`, `${agent.platform || 'System'} Records`],
          outputs: [`Processed ${agent.stageName || 'Result'}`, 'Next Stage Trigger'],
          steps: [
            `Receive ${agent.stageName || 'stage'} data from upstream`,
            `Query ${agent.platform || 'system'} via API`,
            'Apply AI rules and business logic',
            `Produce ${agent.stageName || 'result'} output`,
          ],
        },
      });
      prevIds.forEach(src => {
        edges.push(buildEdge(`e-${src}-${nodeId}`, src, nodeId, { color: pm.color, width: 1.5 }));
      });
    });

    currentY += 185;

    if (phIdx < phases.length - 1) {
      const humanId = `human-${phIdx}`;
      nodes.push({
        id: humanId, type: 'human',
        position: { x: cx - 85, y: currentY },
        data: { label: `Phase ${phIdx + 2} Approval`, description: `Review Phase ${phIdx + 1} results before advancing.`, inputs: ['Phase results', 'Coverage metrics'], outputs: ['Approval token', 'Next phase trigger'] },
      });
      agentIds.forEach(aid => {
        edges.push(buildEdge(`e-${aid}-${humanId}`, aid, humanId, { color: '#f97316', width: 1.5 }));
      });
      prevIds = [humanId];
      currentY += 130;
    } else {
      prevIds = agentIds;
    }
  });

  // Complete
  nodes.push({ id: 'complete', type: 'complete', position: { x: cx - 90, y: currentY }, data: { label: 'Process Automated' } });
  prevIds.forEach(src => {
    edges.push(buildEdge(`e-${src}-complete`, src, 'complete', { color: '#22c55e', width: 2 }));
  });

  return { nodes, edges };
}

// ── Detail panel ──────────────────────────────────────────────────────────────

const TYPE_LABEL = { trigger: 'Trigger', orchestrator: 'Orchestrator', agent: 'AI Agent', human: 'Human Gate', memory: 'Memory Store', complete: 'Completion' };
const TYPE_COLOR = { trigger: '#22c55e', orchestrator: '#f59e0b', agent: '#3b82f6', human: '#f97316', memory: '#8b5cf6', complete: '#64748b' };

function DetailPanel({ node, onClose }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-sm font-bold text-slate-600 mb-1">Select a node</p>
        <p className="text-xs text-slate-400 leading-relaxed">Click any node on the canvas to inspect its configuration and steps.</p>
        <div className="mt-5 space-y-1.5 w-full text-left">
          {[['⚡', '#3b82f6', 'AI Agent', 'Automated task executor'],
            ['◈', '#f59e0b', 'Orchestrator', 'Routes and plans tasks'],
            ['👤', '#f97316', 'Human Gate', 'Approval checkpoint'],
            ['🧠', '#8b5cf6', 'Memory', 'Shared context store'],
          ].map(([icon, color, label, hint]) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm">
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0" style={{ background: color }}><span className="text-white">{icon}</span></div>
              <span className="text-[11px] font-semibold text-slate-600">{label}</span>
              <span className="text-[10px] text-slate-400 ml-auto">{hint}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const d = node.data || {};
  const color = TYPE_COLOR[node.type] || '#64748b';
  const typeLabel = TYPE_LABEL[node.type] || 'Node';
  const phaseIdx = (d.phase || 1) - 1;
  const pm = PHASE_META[phaseIdx] || PHASE_META[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white mb-1">{typeLabel}</span>
            <p className="text-sm font-bold text-white leading-tight">{d.label}</p>
            {d.platform && <p className="text-[11px] text-white/70 mt-0.5">{d.platform}{d.stageName ? ` · ${d.stageName}` : ''}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex-shrink-0">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {/* Rationale / description */}
        {(d.rationale || d.description) && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
            <p className="text-[12px] text-slate-700 leading-relaxed bg-white rounded-xl p-3 border border-slate-100 shadow-sm">{d.rationale || d.description}</p>
          </div>
        )}

        {/* Phase badge + impact */}
        {node.type === 'agent' && (d.impact || d.effort) && (
          <div className="flex gap-2 flex-wrap">
            {d.impact && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: pm.light, color: pm.color, border: `1px solid ${pm.border}` }}>{d.impact} Impact</span>}
            {d.effort && <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">{d.effort}</span>}
          </div>
        )}

        {/* Steps */}
        {(d.steps || []).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Execution Steps</p>
            <div className="space-y-2">
              {d.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-px shadow-sm" style={{ background: color }}>{i + 1}</div>
                  <p className="text-[11px] text-slate-600 leading-snug bg-white rounded-lg p-2 border border-slate-100 shadow-sm flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inputs */}
        {(d.inputs || []).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Inputs</p>
            <div className="space-y-1">
              {d.inputs.map((inp, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                  <span className="text-blue-400 text-xs">→</span>
                  <span className="text-[11px] text-blue-800 font-medium">{inp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs */}
        {(d.outputs || []).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Outputs</p>
            <div className="space-y-1">
              {d.outputs.map((out, i) => (
                <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                  <span className="text-emerald-500 text-xs">✓</span>
                  <span className="text-[11px] text-emerald-800 font-medium">{out}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Canvas wrapper ────────────────────────────────────────────────────────────

function Canvas({ nodes, edges, onNodesChange, onNodeClick }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodes.length) setTimeout(() => fitView({ padding: 0.12 }), 80);
  }, [nodes.length]); // eslint-disable-line

  return (
    <ReactFlow
      nodes={nodes} edges={edges}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      fitView fitViewOptions={{ padding: 0.12 }}
      nodesDraggable={false}
      minZoom={0.1} maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e2e8f0" />
    </ReactFlow>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function WorkflowInner() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [processName, setProcessName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agentCount, setAgentCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const plan = JSON.parse(sessionStorage.getItem('demo_plan') || 'null');
    const proc = JSON.parse(sessionStorage.getItem('demo_process') || 'null');
    const co   = JSON.parse(sessionStorage.getItem('demo_company') || 'null');

    if (!plan) { router.push('/plan'); return; }

    const pName = proc?.name || 'Process';
    setProcessName(pName);
    if (co?.name) setCompanyName(co.name);

    const totalAgents = (plan.phases || []).reduce((s, p) => s + (p.agents || []).length, 0);
    setAgentCount(totalAgents);

    try {
      const { nodes: n, edges: e } = buildGraph(plan, pName);
      setNodes(n);
      setEdges(e);
      setLoaded(true);
    } catch (err) {
      setError('Failed to build workflow graph.');
    }
  }, []); // eslint-disable-line

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const totalNodes = nodes.filter(n => n.type === 'agent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', margin: '-2rem -1.5rem', background: '#f8fafc', overflow: 'hidden' }}>

      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 flex items-center gap-3 flex-shrink-0 shadow-sm" style={{ height: 54 }}>
        <button onClick={() => router.push('/plan')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-indigo-50">
          ← Back
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <span className="text-white text-xs">⬡</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">Agentic Workflow</h1>
          {processName && <p className="text-[10px] text-slate-400">{companyName ? `${companyName} · ` : ''}{processName}</p>}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Stats */}
          {loaded && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="text-blue-500">⚡</span>{totalNodes} agents</span>
              <span className="flex items-center gap-1"><span className="text-orange-400">👤</span>{nodes.filter(n => n.type === 'human').length} gates</span>
            </div>
          )}
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          {/* Legend */}
          <div className="hidden md:flex items-center gap-2.5">
            {[['#22c55e','Trigger'], ['#f59e0b','Orch.'], ['#3b82f6','Agent'], ['#f97316','Human'], ['#8b5cf6','Memory']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                <span className="text-[9px] text-slate-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body: canvas + detail panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Building agent graph…</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
              <div className="text-center">
                <p className="text-sm font-bold text-red-600 mb-2">⚠ {error}</p>
                <button onClick={() => router.push('/plan')} className="text-xs text-indigo-600 underline">Back to plan</button>
              </div>
            </div>
          )}
          {loaded && <Canvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onNodeClick={handleNodeClick} />}

          {/* Phase legend overlay */}
          {loaded && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm px-3 py-2">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phases</p>
              <div className="flex flex-col gap-1">
                {PHASE_META.map((pm, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: pm.color }} />
                    <span className="text-[9px] text-slate-500 font-medium">{pm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Click hint */}
          {loaded && !selectedNode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/75 backdrop-blur-sm rounded-full px-3 py-1.5">
              <p className="text-[10px] text-white/80 font-medium">Click any node to inspect</p>
            </div>
          )}
        </div>

        {/* Right detail panel */}
        <div className="w-72 flex-shrink-0 border-l border-slate-100 bg-white overflow-hidden flex flex-col shadow-lg">
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowInner />
    </ReactFlowProvider>
  );
}
