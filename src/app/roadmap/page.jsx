'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Download, X, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// ─── Constants ───────────────────────────────────────────────────────────────

const PHASE_COLORS = { 1: '#F5A623', 2: '#30D5C8', 3: '#A78BFA' };
const PHASE_NAMES  = { 1: 'Quick Wins', 2: 'Core Transformation', 3: 'Advanced Autonomy' };

const PHASE_CFG = {
  1: { color: '#F5A623', label: 'Phase 1 — Quick Wins',          tint: 'rgba(245,166,35,0.04)'  },
  2: { color: '#30D5C8', label: 'Phase 2 — Core Transformation', tint: 'rgba(48,213,200,0.04)'  },
  3: { color: '#A78BFA', label: 'Phase 3 — Advanced Autonomy',   tint: 'rgba(167,139,250,0.04)' },
};

function getContrastColor(color, isDark) {
  if (isDark) return color;
  if (color === '#30D5C8') return '#0D9488'; // Darker teal
  if (color === '#F5A623') return '#D4890A'; // Darker orange/amber
  if (color === '#A78BFA') return '#6D28D9'; // Darker purple/violet
  if (color === '#EF4444') return '#DC2626'; // Darker red
  return color;
}

function stageColor(score) {
  if (score >= 70) return '#30D5C8';
  if (score >= 40) return '#F5A623';
  return '#EF4444';
}

function priorityColor(p) {
  if (p === 'HIGH') return '#EF4444';
  if (p === 'LOW')  return '#30D5C8';
  return '#F5A623';
}

function impactColor(i) {
  if (i === 'High') return '#30D5C8';
  if (i === 'Low')  return '#8E8E93';
  return '#F5A623';
}

function priorityBadgeInlineStyle(p, isDark) {
  if (p === 'HIGH') return { background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)', color: isDark ? '#EF4444' : '#DC2626', border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}` };
  if (p === 'LOW')  return { background: isDark ? 'rgba(48,213,200,0.12)' : 'rgba(13,148,136,0.06)', color: isDark ? '#30D5C8' : '#0D9488', border: `1px solid ${isDark ? 'rgba(48,213,200,0.3)' : 'rgba(13,148,136,0.2)'}` };
  return { background: isDark ? 'rgba(245,166,35,0.12)' : 'rgba(212,137,10,0.06)', color: isDark ? '#F5A623' : '#D4890A', border: `1px solid ${isDark ? 'rgba(245,166,35,0.3)' : 'rgba(212,137,10,0.2)'}` };
}

// ─── Node Types (defined OUTSIDE component to avoid ReactFlow recreation) ────

function StageNode({ data, selected }) {
  const { isDark } = useTheme();
  const c   = stageColor(data.score ?? 50);
  const mat = ((data.score ?? 50) / 100 * 5).toFixed(1);

  return (
    <div
      style={{
        width: 210,
        background: isDark ? '#1C1C1E' : '#FFFFFF',
        border: `1px solid ${selected ? c : (isDark ? '#3A3A3C' : '#D5D0C8')}`,
        borderLeft: `3px solid ${c}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: selected
          ? `0 0 0 2px ${c}40, 0 4px 20px ${c}25`
          : `0 2px 8px rgba(0,0,0,${isDark ? '0.4' : '0.06'})`,
        transition: 'box-shadow 0.15s',
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Left}
        style={{ background: c, width: 8, height: 8, border: `2px solid ${isDark ? '#1C1C1E' : '#fff'}` }} />
      <Handle type="source" position={Position.Right}
        style={{ background: isDark ? '#3A3A3C' : '#D5D0C8', width: 8, height: 8, border: `2px solid ${isDark ? '#1C1C1E' : '#fff'}` }} />
      <Handle type="source" id="bottom" position={Position.Bottom}
        style={{ background: c, width: 8, height: 8, border: `2px solid ${isDark ? '#1C1C1E' : '#fff'}` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#F1F1F3' : '#18181A', lineHeight: 1.3, flex: 1, fontFamily: 'Inter, sans-serif' }}>
          {data.stageName}
        </span>
        <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', ...priorityBadgeInlineStyle(data.priority, isDark) }}>
          {data.priority}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 7 }}>
        <span style={{ fontSize: 22, fontFamily: '"Cormorant Garamond", Georgia, serif', color: getContrastColor(c, isDark), fontWeight: 500, lineHeight: 1 }}>
          {mat}
        </span>
        <span style={{ fontSize: 10, color: isDark ? '#8E8E93' : '#3D3D44', fontFamily: 'JetBrains Mono, monospace' }}>/5.0</span>
      </div>

      <div style={{ height: 3, background: isDark ? '#3A3A3C' : '#E6E2DB', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${data.score ?? 50}%`, height: '100%', background: c, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function AgentNode({ data, selected }) {
  const { isDark } = useTheme();
  const pc = PHASE_COLORS[data.phaseNumber] ?? '#F5A623';
  const ic = impactColor(data.impact);

  return (
    <div
      style={{
        width: 200,
        background: isDark ? '#0B0B0E' : '#F8F6F2',
        border: `1px solid ${selected ? pc : (isDark ? '#3A3A3C' : '#D5D0C8')}`,
        borderTop: `2px solid ${pc}`,
        borderRadius: 10,
        padding: '9px 12px',
        boxShadow: selected
          ? `0 0 0 2px ${pc}40, 0 4px 16px ${pc}20`
          : `0 2px 6px rgba(0,0,0,${isDark ? '0.5' : '0.05'})`,
        transition: 'box-shadow 0.15s',
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top}
        style={{ background: pc, width: 7, height: 7, border: `2px solid ${isDark ? '#0B0B0E' : '#F8F6F2'}` }} />

      <div style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#F1F1F3' : '#18181A', marginBottom: 6, lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
        {data.name}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
        {data.platform && (
          <span style={{ fontSize: 9, background: isDark ? 'rgba(58,58,60,0.5)' : 'rgba(255,255,255,0.8)', color: isDark ? '#8E8E93' : '#3D3D44', padding: '2px 6px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${isDark ? '#3A3A3C' : '#D5D0C8'}` }}>
            {data.platform}
          </span>
        )}
        {data.category && (
          <span style={{ fontSize: 9, background: `${pc}18`, color: getContrastColor(pc, isDark), padding: '2px 6px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${pc}30` }}>
            {data.category}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: getContrastColor(ic, isDark), fontFamily: 'JetBrains Mono, monospace' }}>{data.impact}</span>
        <span style={{ fontSize: 9, color: isDark ? '#3A3A3C' : '#D5D0C8' }}>·</span>
        <span style={{ fontSize: 9, color: isDark ? '#8E8E93' : '#3D3D44', fontFamily: 'JetBrains Mono, monospace' }}>
          {(data.effort ?? '').split(' ').slice(0, 2).join(' ')}
        </span>
      </div>
    </div>
  );
}

function SwimlaneNode({ data }) {
  const { isDark } = useTheme();
  const pc = PHASE_COLORS[data.phaseNumber] ?? '#F5A623';
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        background: isDark ? `${pc}06` : `${pc}05`,
        border: `1px dashed ${pc}30`,
        borderLeft: `2px solid ${pc}45`,
        borderRadius: 14,
        pointerEvents: 'none',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'center center',
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          color: isDark ? `${pc}65` : `${getContrastColor(pc, isDark)}a0`,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Phase {data.phaseNumber} · {PHASE_NAMES[data.phaseNumber]}
      </div>
    </div>
  );
}

const NODE_TYPES = {
  stageNode:    StageNode,
  agentNode:    AgentNode,
  swimlaneNode: SwimlaneNode,
};

// ─── Layout builder ──────────────────────────────────────────────────────────

function buildFlow(stages, plan) {
  const nodes = [];
  const edges = [];

  if (!stages.length) return { nodes, edges };

  const stageIndexMap = {};
  stages.forEach((s, i) => { stageIndexMap[s.stageId] = i; });

  // Stage nodes: y=60, x = index * 260
  stages.forEach((s, i) => {
    nodes.push({
      id:       s.stageId,
      type:     'stageNode',
      position: { x: i * 260, y: 60 },
      data:     s,
      zIndex:   1,
    });
  });

  // Stage-to-stage edges
  stages.slice(0, -1).forEach((_, i) => {
    edges.push({
      id:     `s2s-${i}`,
      source: stages[i].stageId,
      target: stages[i + 1].stageId,
      type:   'straight',
      style:  { stroke: '#3A3A3C', strokeWidth: 1.5 },
    });
  });

  // Compute max stack per phase
  function getMaxStack(phNumber) {
    const ph = (plan?.phases ?? []).find(p => p.number === phNumber);
    if (!ph || !(ph.agents ?? []).length) return 1;
    const cnt = {};
    (ph.agents ?? []).forEach((ag, i) => {
      const key = stageIndexMap[ag.stageId] !== undefined ? ag.stageId : `__fallback_${i}`;
      cnt[key] = (cnt[key] ?? 0) + 1;
    });
    return Math.max(1, ...Object.values(cnt));
  }

  const maxPhase1Stack = getMaxStack(1);
  const maxPhase2Stack = getMaxStack(2);

  // phaseBaseY per spec:
  //   phase1: 60 + 120 + 60 = 240
  //   phase2: phase1 + maxPhase1Stack * 170 + 60
  //   phase3: phase2 + maxPhase2Stack * 170 + 60
  const phaseBaseY = {
    1: 240,
    2: 240 + maxPhase1Stack * 170 + 60,
  };
  phaseBaseY[3] = phaseBaseY[2] + maxPhase2Stack * 170 + 60;

  const totalW = stages.length * 260 + 80;

  // Swimlane + agent nodes per phase
  (plan?.phases ?? []).forEach(ph => {
    const baseY   = phaseBaseY[ph.number] ?? phaseBaseY[1];
    const maxStack = getMaxStack(ph.number);
    const swimH   = maxStack * 170 + 60;
    const pc      = PHASE_COLORS[ph.number] ?? '#F5A623';

    // Swimlane background
    nodes.unshift({
      id:        `swim-${ph.number}`,
      type:      'swimlaneNode',
      position:  { x: -40, y: baseY - 20 },
      data:      { phaseNumber: ph.number, width: totalW + 40, height: swimH },
      zIndex:    -1,
      selectable: false,
      draggable:  false,
    });

    // Agent nodes
    const stackCounters = {};
    let fallbackIdx = 0;

    (ph.agents ?? []).forEach((ag, agIdx) => {
      let colIndex;
      if (stageIndexMap[ag.stageId] !== undefined) {
        colIndex = stageIndexMap[ag.stageId];
      } else {
        colIndex = stages.length + fallbackIdx;
        fallbackIdx++;
      }

      const stackIdx = stackCounters[colIndex] ?? 0;
      stackCounters[colIndex] = stackIdx + 1;

      const nid = `ag-${ph.number}-${agIdx}`;
      nodes.push({
        id:       nid,
        type:     'agentNode',
        position: { x: colIndex * 260 + 5, y: baseY + stackIdx * 170 },
        data:     { ...ag, phaseNumber: ph.number },
        zIndex:   1,
      });

      // Stage → agent edge
      if (stageIndexMap[ag.stageId] !== undefined) {
        edges.push({
          id:           `e-${nid}`,
          source:       ag.stageId,
          target:       nid,
          type:         'smoothstep',
          animated:     ph.number === 1,
          sourceHandle: 'bottom',
          style:        { stroke: pc, strokeWidth: 1.5, opacity: 0.7 },
          markerEnd:    { type: MarkerType.ArrowClosed, color: pc, width: 12, height: 12 },
        });
      }
    });
  });

  return { nodes, edges };
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function InlineRow({ label, value, isDark, color }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#8E8E93' : '#4B5563', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: color ?? (isDark ? '#F1F1F3' : '#18181A'), textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function DetailPanel({ node, isDark, onClose }) {
  if (!node) return null;
  const isAgent = node.type === 'agentNode';
  const isStage = node.type === 'stageNode';
  if (!isAgent && !isStage) return null;

  const d      = node.data;
  const accent = isAgent ? (PHASE_COLORS[d.phaseNumber] ?? '#F5A623') : stageColor(d.score ?? 50);
  const displayAccent = getContrastColor(accent, isDark);

  return (
    <motion.div
      key={node.id}
      initial={{ x: 290, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 290, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      style={{
        position: 'fixed',
        right: 0,
        top: 52,
        bottom: 0,
        width: 280,
        background: isDark ? '#1C1C1E' : '#FFFFFF',
        borderLeft: `1px solid ${isDark ? '#3A3A3C' : '#D5D0C8'}`,
        borderTopLeftRadius: 16,
        overflowY: 'auto',
        zIndex: 50,
        boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.5)' : '-4px 0 24px rgba(0,0,0,0.08)',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{ height: 3, background: accent }} />
      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ flex: 1, marginRight: 8 }}>
            <span style={{ display: 'block', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: displayAccent, marginBottom: 3 }}>
              {isStage ? 'Process Stage' : `Phase ${d.phaseNumber} Agent`}
            </span>
            <span style={{ display: 'block', fontSize: 15, fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, color: isDark ? '#F1F1F3' : '#18181A', lineHeight: 1.3 }}>
              {isStage ? d.stageName : d.name}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#8E8E93' : '#6B6B73', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ height: 1, background: isDark ? '#3A3A3C' : '#E6E2DB', marginBottom: 12 }} />

        {isStage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 28, fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, color: displayAccent, lineHeight: 1 }}>
                {((d.score ?? 50) / 100 * 5).toFixed(1)}
              </span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: isDark ? '#8E8E93' : '#4B5563' }}>/5.0 maturity</span>
            </div>
            <div style={{ height: 4, background: isDark ? '#3A3A3C' : '#E6E2DB', borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
              <div style={{ width: `${d.score ?? 50}%`, height: '100%', background: accent, borderRadius: 2 }} />
            </div>
            <InlineRow label="Coverage" value={`${d.score ?? 50}%`} isDark={isDark} color={displayAccent} />
            <InlineRow label="Priority" value={d.priority} isDark={isDark} color={getContrastColor(priorityColor(d.priority), isDark)} />
            <InlineRow label="Phase Assigned" value={d.phase} isDark={isDark} />
            {d.gap && (
              <div>
                <span style={{ display: 'block', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#8E8E93' : '#4B5563', marginBottom: 5 }}>
                  Gap / Recommendation
                </span>
                <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', lineHeight: 1.65, color: isDark ? '#8E8E93' : '#27272A', margin: 0 }}>
                  {d.gap}
                </p>
              </div>
            )}
          </div>
        )}

        {isAgent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InlineRow label="Platform"  value={d.platform}  isDark={isDark} />
            <InlineRow label="Category"  value={d.category}  isDark={isDark} color={displayAccent} />
            <InlineRow label="Phase"     value={`Phase ${d.phaseNumber} — ${PHASE_NAMES[d.phaseNumber] ?? ''}`} isDark={isDark} color={displayAccent} />
            <InlineRow label="Stage"     value={d.stageName} isDark={isDark} />
            <InlineRow label="Impact"    value={d.impact}    isDark={isDark} color={getContrastColor(impactColor(d.impact), isDark)} />
            <InlineRow label="Effort"    value={d.effort}    isDark={isDark} />
            {d.rationale && (
              <div>
                <span style={{ display: 'block', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#8E8E93' : '#4B5563', marginBottom: 5 }}>
                  Rationale
                </span>
                <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', lineHeight: 1.65, color: isDark ? '#8E8E93' : '#27272A', margin: 0 }}>
                  {d.rationale}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const { isDark, toggle } = useTheme();
  const ran = useRef(false);

  const [process,   setProcess]   = useState(null);
  const [company,   setCompany]   = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [plan,      setPlan]      = useState(null);
  const [status,    setStatus]    = useState('loading');

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode]  = useState(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    try {
      const p  = JSON.parse(localStorage.getItem('demo_process')   ?? 'null');
      const co = JSON.parse(localStorage.getItem('demo_company')   ?? 'null');
      const d  = JSON.parse(localStorage.getItem('demo_discovery') ?? 'null');
      const pl = JSON.parse(localStorage.getItem('demo_plan')      ?? 'null');
      if (!d) { setStatus('nodata'); return; }
      setProcess(p);
      setCompany(co);
      setDiscovery(d);
      setPlan(pl);
      const { nodes: n, edges: e } = buildFlow(d.stageScores ?? [], pl);
      setNodes(n);
      setEdges(e);
      setStatus('ready');
    } catch {
      setStatus('nodata');
    }
  }, []);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'swimlaneNode') return;
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  function downloadMarkdown() {
    let md = `# ${process?.name ?? 'Process'} — AI Activation Roadmap\n\n`;
    if (company?.name) md += `**Company:** ${company.name}  \n`;
    md += `**Coverage:** ${discovery?.overallScore ?? 0}%  \n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}  \n\n---\n\n`;
    if (plan?.summary) md += `## Overview\n\n${plan.summary}\n\n---\n\n`;
    (plan?.phases ?? []).forEach(ph => {
      md += `## Phase ${ph.number}: ${ph.name} *(${ph.timeframe ?? ''})*\n\n${ph.description ?? ''}\n\n`;
      (ph.agents ?? []).forEach(ag => {
        md += `### ${ag.name}\n- **Platform:** ${ag.platform}\n- **Stage:** ${ag.stageName}\n- **Impact:** ${ag.impact} | **Effort:** ${ag.effort}\n> ${ag.rationale}\n\n`;
      });
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(process?.name ?? 'roadmap').replace(/\s+/g, '-').toLowerCase()}-roadmap.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const canvasBg     = isDark ? '#0B0B0E' : '#F3F1EC';
  const dotColor     = isDark ? '#2A2A2C' : '#C8C4BC';
  const controlsBd   = isDark ? '#3A3A3C' : '#D5D0C8';
  const overallScore = discovery?.overallScore ?? 0;
  const totalAgents  = (plan?.phases ?? []).reduce((n, ph) => n + (ph.agents?.length ?? 0), 0);

  // ── Loading ──
  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', background: canvasBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#F5A623', display: 'inline-block', animation: 'rfPing 1s ease-in-out infinite' }} />
          </div>
          <p style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#F5A623', margin: '0 0 6px' }}>
            Building Roadmap
          </p>
          <p style={{ fontSize: 13, fontFamily: '"Cormorant Garamond", serif', color: isDark ? '#8E8E93' : '#3D3D44', margin: 0 }}>
            Loading your process data...
          </p>
        </div>
      </div>
    );
  }

  // ── No data ──
  if (status === 'nodata') {
    return (
      <div style={{ height: '100vh', background: canvasBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center', padding: 32, borderRadius: 16, border: `1px solid ${isDark ? '#3A3A3C' : '#D5D0C8'}`, background: isDark ? '#1C1C1E' : '#FFFFFF' }}>
          <p style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#F5A623', margin: '0 0 8px' }}>
            No Roadmap Data
          </p>
          <p style={{ fontSize: 15, fontFamily: '"Cormorant Garamond", serif', color: isDark ? '#F1F1F3' : '#18181A', margin: '0 0 16px' }}>
            Complete a discovery session first.
          </p>
          <a href="/" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#F5A623', textDecoration: 'none' }}>
            ← Back to Discovery Studio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: canvasBg, overflow: 'hidden' }}>

      {/* ── Sticky Header (48px) ── */}
      <div
        style={{
          height: 48,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: isDark ? '#1C1C1E' : '#FFFFFF',
          borderBottom: `1px solid ${controlsBd}`,
          zIndex: 40,
          gap: 12,
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <a
            href="/plan"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#8E8E93' : '#4B5563', textDecoration: 'none', flexShrink: 0 }}
          >
            <ArrowLeft size={11} /> Plan
          </a>
          <span style={{ color: isDark ? '#3A3A3C' : '#D5D0C8', fontSize: 14, flexShrink: 0 }}>|</span>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 8, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#F5A623', lineHeight: 1 }}>
              AI Activation Roadmap
            </span>
            <span style={{ display: 'block', fontSize: 13, fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, color: isDark ? '#F1F1F3' : '#18181A', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {process?.name ?? 'Roadmap'}{company?.name ? ` — ${company.name}` : ''}
            </span>
          </div>
        </div>

        {/* Center stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'Coverage', value: `${overallScore}%`, color: stageColor(overallScore) },
            { label: 'Stages',   value: (discovery?.stageScores ?? []).length, color: isDark ? '#F1F1F3' : '#18181A' },
            { label: 'Agents',   value: totalAgents, color: '#30D5C8' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, color: getContrastColor(s.color, isDark), lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? '#8E8E93' : '#4B5563', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={toggle}
            style={{ background: 'none', border: `1px solid ${controlsBd}`, borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: isDark ? '#8E8E93' : '#3D3D44', display: 'flex', alignItems: 'center' }}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button
            onClick={downloadMarkdown}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg, #F5A623, #FF6B35)', color: '#000', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, cursor: 'pointer' }}
          >
            <Download size={11} /> Download MD
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable={true}
          nodesConnectable={false}
          style={{ background: canvasBg }}
          minZoom={0.15}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} color={dotColor} gap={20} size={1} />

          <Controls
            showInteractive={false}
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: `1px solid ${controlsBd}`,
              borderRadius: 10,
              boxShadow: 'none',
            }}
          />

          <MiniMap
            nodeColor={n => {
              if (n.type === 'swimlaneNode') return isDark ? '#2A2A2C' : '#E6E2DB';
              if (n.type === 'agentNode') return PHASE_COLORS[n.data?.phaseNumber] ?? '#F5A623';
              return stageColor(n.data?.score ?? 50);
            }}
            style={{
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              border: `1px solid ${controlsBd}`,
              borderRadius: 10,
            }}
            maskColor={isDark ? 'rgba(11,11,14,0.65)' : 'rgba(243,241,236,0.65)'}
          />

          {/* Phase legend */}
          <Panel position="top-left">
            <div
              style={{
                background: isDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.92)',
                border: `1px solid ${controlsBd}`,
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                backdropFilter: 'blur(8px)',
              }}
            >
              {[1, 2, 3].map(ph => (
                <div key={ph} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLORS[ph], flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: getContrastColor(PHASE_COLORS[ph], isDark), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Ph{ph} · {PHASE_NAMES[ph]}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: controlsBd, margin: '2px 0' }} />
              {[
                { color: '#30D5C8', label: '≥70% coverage' },
                { color: '#F5A623', label: '40–70%' },
                { color: '#EF4444', label: '<40%' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 3, borderRadius: 1, background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: isDark ? '#8E8E93' : '#4B5563' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </ReactFlow>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              key={selectedNode.id}
              node={selectedNode}
              isDark={isDark}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes rfPing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        .react-flow__controls button {
          background: ${isDark ? '#1C1C1E' : '#FFFFFF'} !important;
          border-color: ${isDark ? '#3A3A3C' : '#D5D0C8'} !important;
          fill: ${isDark ? '#8E8E93' : '#3D3D44'} !important;
        }
        .react-flow__controls button:hover {
          background: ${isDark ? '#2A2A2C' : '#F3F1EC'} !important;
        }
      `}</style>
    </div>
  );
}
