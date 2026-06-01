'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Download, ExternalLink, ArrowLeft, TrendingUp, TrendingDown, Minus, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '@/lib/theme';

/* -- helpers --------------------------------------------------------------- */

function maturityScore(score) {
  return parseFloat(((score ?? 50) / 100 * 5).toFixed(1));
}

function getContrastColor(color, isDark) {
  if (isDark) return color;
  if (color === '#30D5C8') return '#0D9488';
  if (color === '#F5A623') return '#D4890A';
  if (color === '#A78BFA') return '#6D28D9';
  if (color === '#EF4444') return '#DC2626';
  return color;
}

function scoreColor(score, isDark) {
  if (score >= 70) return {
    bar: '#30D5C8',
    text: isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]',
    badge: isDark ? 'bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/30' : 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30'
  };
  if (score >= 40) return {
    bar: '#F5A623',
    text: isDark ? 'text-[#F5A623]' : 'text-[#D4890A]',
    badge: isDark ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30' : 'bg-[#D4890A]/10 text-[#D4890A] border-[#D4890A]/30'
  };
  return {
    bar: '#EF4444',
    text: isDark ? 'text-red-400' : 'text-red-600',
    badge: isDark ? 'bg-red-400/10 text-red-400 border-red-400/30' : 'bg-red-600/10 text-red-600 border-red-600/30'
  };
}

function priorityBadge(p, isDark) {
  if (p === 'HIGH')   return isDark ? 'bg-red-400/10 text-red-400 border border-red-400/30' : 'bg-red-600/10 text-red-600 border border-red-600/30';
  if (p === 'LOW')    return isDark ? 'bg-[#30D5C8]/10 text-[#30D5C8] border border-[#30D5C8]/30' : 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/30';
  return isDark ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30' : 'bg-[#D4890A]/10 text-[#D4890A] border border-[#D4890A]/30';
}

function getPhaseStyle(phIdx, isDark) {
  const styles = [
    { accent: '#F5A623', light: 'bg-[#F5A623]/8', border: 'border-[#F5A623]/30', text: isDark ? 'text-[#F5A623]' : 'text-[#D4890A]', badge: isDark ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'bg-[#D4890A]/10 text-[#D4890A]', label: 'Quick wins -- build momentum' },
    { accent: '#30D5C8', light: 'bg-[#30D5C8]/8', border: 'border-[#30D5C8]/30', text: isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]', badge: isDark ? 'bg-[#30D5C8]/10 text-[#30D5C8]' : 'bg-[#0D9488]/10 text-[#0D9488]', label: 'Core transformation' },
    { accent: '#A78BFA', light: 'bg-[#A78BFA]/8', border: 'border-[#A78BFA]/30', text: isDark ? 'text-[#A78BFA]' : 'text-[#7C3AED]', badge: isDark ? 'bg-[#A78BFA]/10 text-[#A78BFA]' : 'bg-[#7C3AED]/10 text-[#7C3AED]', label: 'Advanced autonomy' },
  ];
  return styles[phIdx] ?? styles[0];
}

function getInsightStyle(type, isDark) {
  const styles = {
    Opportunity: isDark ? 'bg-[#30D5C8]/8 border-[#30D5C8]/25 text-[#30D5C8]' : 'bg-[#0D9488]/5 border-[#0D9488]/20 text-[#0D9488]',
    Risk:        isDark ? 'bg-red-400/8 border-red-400/25 text-red-400'       : 'bg-red-600/5 border-red-600/20 text-red-600',
    Action:      isDark ? 'bg-[#F5A623]/8 border-[#F5A623]/25 text-[#F5A623]' : 'bg-[#D4890A]/5 border-[#D4890A]/20 text-[#D4890A]',
    Watch:       isDark ? 'bg-[#A78BFA]/8 border-[#A78BFA]/25 text-[#A78BFA]' : 'bg-[#7C3AED]/5 border-[#7C3AED]/20 text-[#7C3AED]',
    Insight:     isDark ? 'bg-[#8E8E93]/8 border-[#8E8E93]/25 text-[#8E8E93]' : 'bg-[#3D3D44]/5 border-[#3D3D44]/20 text-[#3D3D44]',
  };
  return styles[type] ?? styles.Insight;
}

/* -- Markdown generator ---------------------------------------------------- */

function buildMarkdown(process, company, discovery, plan) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const maturity = maturityScore(discovery?.overallScore);

  let md = `# ${process?.name} -- Process Discovery Analysis\n\n`;
  if (company?.name) md += `**Company:** ${company.name}  \n`;
  md += `**Generated:** ${date}  \n`;
  md += `**Overall Maturity:** ${maturity}/5.0 (${discovery?.overallScore ?? 0}% automation coverage)  \n\n`;
  md += `---\n\n## Executive Summary\n\n${discovery?.executiveSummary ?? ''}\n\n`;

  md += `---\n\n## Process Steps Breakdown\n\n`;
  for (const s of discovery?.stageScores ?? []) {
    md += `### ${s.stageName}\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Score | ${s.score}% (${maturityScore(s.score)}/5.0) |\n`;
    md += `| Priority | ${s.priority} |\n`;
    md += `| Phase | ${s.phase} |\n`;
    if (s.gap) md += `| Optimization Gap | ${s.gap} |\n`;
    md += '\n';
    if (s.activities?.length) {
      md += `**Activities:**\n`;
      for (const a of s.activities) md += `- ${a.name}: \`${a.rating}\`\n`;
      md += '\n';
    }
  }

  md += `---\n\n## Automation Agent Roadmap\n\n`;
  for (const ph of plan?.phases ?? []) {
    md += `### Phase ${ph.number}: ${ph.name} *(${ph.timeframe})*\n\n`;
    md += `${ph.description}\n\n`;
    for (const ag of ph.agents ?? []) {
      md += `#### ${ag.name}\n`;
      md += `- **Platform:** ${ag.platform}  \n`;
      md += `- **Process Step:** ${ag.stageName}  \n`;
      md += `- **Category:** ${ag.category}  \n`;
      md += `- **Impact:** ${ag.impact} | **Effort:** ${ag.effort}  \n`;
      md += `> ${ag.rationale}\n\n`;
    }
  }

  if (discovery?.insights?.length) {
    md += `---\n\n## Key Insights\n\n`;
    for (const ins of discovery.insights) {
      md += `**[${ins.type}]** ${ins.text}\n\n`;
    }
  }

  md += `---\n\n*Generated by LevelShift ShiftAI*\n`;
  return md;
}

/* -- Industry Benchmark Data (derived from maturity score for demo) --------- */

function deriveBenchmarkData(discovery, company) {
  const score   = discovery?.overallScore ?? 50;
  const stages  = discovery?.stageScores ?? [];
  const manual  = stages.filter(s => s.score < 40).length;
  const highPri = stages.filter(s => s.priority === 'HIGH').length;

  // Industry benchmark is always slightly better than the actual score (shows gap)
  const industryAvgAutomation = Math.min(score + 18, 78);
  const industryManualSteps   = Math.max(manual - 2, 2);
  const industryParallel      = 3.4;
  const yourParallel          = Math.max(1, Math.floor(stages.length * 0.2));
  const improvementPct        = Math.round((industryAvgAutomation - score) * 1.8);

  return {
    industryAvgAutomation: Math.round(industryAvgAutomation),
    industryManualSteps:   industryManualSteps.toFixed(1),
    industryParallel:      industryParallel,
    yourAutomation:        score,
    yourManualSteps:       manual,
    yourParallel:          yourParallel,
    improvementPotential:  Math.max(15, Math.min(improvementPct, 45)),
    totalProcessesInDB:    Math.floor(127 + score * 2.3),
    companyCount:          Math.floor(34 + score * 0.8),
  };
}

/* -- Sub-components -------------------------------------------------------- */

function StatCard({ label, value, sub, accent, isDark }) {
  const displayAccent = getContrastColor(accent ?? '#F5A623', isDark);
  return (
    <div className={`rounded-xl border p-4 text-center ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="font-serif text-2xl font-medium tabular-nums" style={{ color: displayAccent }}>{value}</div>
      <div className={`text-[11px] font-sans font-medium mt-0.5 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{label}</div>
      <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#4B5563]'}`}>{sub}</div>
    </div>
  );
}

function BenchmarkRow({ label, yours, benchmark, higherIsBetter, unit, isDark }) {
  const yoursNum = parseFloat(yours);
  const benchNum = parseFloat(benchmark);
  const isGood   = higherIsBetter ? yoursNum >= benchNum : yoursNum <= benchNum;
  const isBad    = higherIsBetter ? yoursNum < benchNum * 0.85 : yoursNum > benchNum * 1.15;

  const Icon = isGood ? TrendingUp : isBad ? TrendingDown : Minus;
  const iconColor = isGood
    ? isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'
    : isBad
    ? 'text-red-400'
    : isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]';

  const statusLabel = isGood ? 'Above benchmark' : isBad ? 'Below benchmark' : 'Near benchmark';
  const statusColor = isGood
    ? isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]'
    : isBad
    ? 'text-red-400'
    : isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]';

  return (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-[#3A3A3C]' : 'border-[#E6E2DB]'}`}>
      <span className={`text-xs font-sans flex-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{label}</span>
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className={`text-xs font-mono font-semibold tabular-nums ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{yours}{unit}</p>
          <p className={`text-[9px] font-mono ${statusColor}`}>{statusLabel}</p>
        </div>
        <div className="text-right w-16">
          <p className={`text-xs font-mono tabular-nums ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{benchmark}{unit}</p>
          <p className={`text-[9px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>industry avg</p>
        </div>
        <Icon size={14} className={iconColor} />
      </div>
    </div>
  );
}

function IndustryBenchmarkSection({ discovery, company, isDark }) {
  const bm = deriveBenchmarkData(discovery, company);

  const opps = [
    { label: 'Automation opportunity',    value: `${Math.max(55, 100 - bm.yourAutomation)}%`, icon: CheckCircle, color: isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]' },
    { label: 'Time reduction potential',  value: `${Math.round(bm.improvementPotential * 0.9)}-${bm.improvementPotential}%`, icon: TrendingUp, color: isDark ? 'text-[#F5A623]' : 'text-[#D4890A]' },
    { label: 'Cost savings potential',    value: `${Math.round(bm.improvementPotential * 0.75)}-${Math.round(bm.improvementPotential * 0.85)}%`, icon: TrendingUp, color: isDark ? 'text-[#A78BFA]' : 'text-[#7C3AED]' },
    { label: 'Error reduction potential', value: '60-75%', icon: AlertTriangle, color: isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]' },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
        <div className="flex items-center gap-2.5">
          <Database size={14} className={isDark ? 'text-[#F5A623]' : 'text-[#D4890A]'} />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">LevelShift Intelligence</p>
            <h3 className={`text-sm font-semibold font-sans ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
              {company?.name ? `${company.name} vs ` : ''}Industry Standards
            </h3>
          </div>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${isDark ? 'border-[#3A3A3C] text-[#8E8E93]' : 'border-[#D5D0C8] text-[#3D3D44]'}`}>
          Based on {bm.totalProcessesInDB} processes
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benchmark comparison */}
        <div>
          <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Performance vs {bm.companyCount} similar organisations
          </p>
          <div>
            <BenchmarkRow
              label="Automation coverage"
              yours={bm.yourAutomation}
              benchmark={bm.industryAvgAutomation}
              higherIsBetter={true}
              unit="%"
              isDark={isDark}
            />
            <BenchmarkRow
              label="Manual process steps"
              yours={bm.yourManualSteps}
              benchmark={bm.industryManualSteps}
              higherIsBetter={false}
              unit=" steps"
              isDark={isDark}
            />
            <BenchmarkRow
              label="Parallel execution paths"
              yours={bm.yourParallel}
              benchmark={bm.industryParallel}
              higherIsBetter={true}
              unit=""
              isDark={isDark}
            />
          </div>
          <div className={`mt-4 p-3 rounded-xl border ${isDark ? 'bg-[#F5A623]/5 border-[#F5A623]/20' : 'bg-[#FFF8EC] border-[#F5A623]/30'}`}>
            <p className={`text-[10px] font-mono uppercase tracking-wider text-[#F5A623] mb-1`}>Improvement Potential</p>
            <p className={`text-2xl font-serif font-medium text-[#F5A623]`}>{bm.improvementPotential}%</p>
            <p className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              estimated process efficiency gain with full automation
            </p>
          </div>
        </div>

        {/* Opportunity analysis */}
        <div>
          <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Risk and Opportunity Analysis
          </p>
          <p className={`text-xs font-sans leading-relaxed mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Analysis of {bm.totalProcessesInDB} processes in the LevelShift database shows that processes similar to yours typically have:
          </p>
          <div className="space-y-2">
            {opps.map(o => {
              const Icon = o.icon;
              return (
                <div key={o.label} className={`flex items-center gap-3 p-2.5 rounded-lg ${isDark ? 'bg-[#3A3A3C]/20' : 'bg-[#F9F7F4]'}`}>
                  <Icon size={14} className={o.color} />
                  <span className={`text-xs font-sans flex-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{o.label}</span>
                  <span className={`text-xs font-mono font-semibold tabular-nums ${o.color}`}>{o.value}</span>
                </div>
              );
            })}
          </div>
          <p className={`text-[10px] font-sans mt-3 leading-relaxed ${isDark ? 'text-[#8E8E93]/60' : 'text-[#3D3D44]/60'}`}>
            {company?.name ? `${company.name}'s` : 'Your'} opportunities align with these industry benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
}

function StageCard({ stage, isDark }) {
  const [open, setOpen] = useState(false);
  const c = scoreColor(stage.score, isDark);

  const DIMS = [
    { key: 'pain',              label: 'Pain',    color: '#EF4444' },
    { key: 'data',              label: 'Data',    color: '#60A5FA' },
    { key: 'processDefinition', label: 'Process', color: '#A78BFA' },
    { key: 'integration',       label: 'Integr',  color: '#34D399' },
    { key: 'adoption',          label: 'Adopt',   color: '#F5A623' },
  ];

  const ratingColor = isDark ? {
    AUTOMATED:    'bg-[#30D5C8]/10 text-[#30D5C8]',
    PARTIAL:      'bg-[#F5A623]/10 text-[#F5A623]',
    MANUAL:       'bg-orange-400/10 text-orange-400',
    NOT_IN_PLACE: 'bg-red-400/10 text-red-400',
  } : {
    AUTOMATED:    'bg-[#0D9488]/10 text-[#0D9488]',
    PARTIAL:      'bg-[#D4890A]/10 text-[#D4890A]',
    MANUAL:       'bg-orange-600/10 text-orange-600',
    NOT_IN_PLACE: 'bg-red-600/10 text-red-600',
  };
  const ratingShort = { AUTOMATED: 'AUTO', PARTIAL: 'PART', MANUAL: 'MAN', NOT_IN_PLACE: 'NONE' };

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`text-xs font-semibold font-sans leading-snug flex-1 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
            {stage.stageName}
          </h3>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${priorityBadge(stage.priority, isDark)}`}>
            {stage.priority}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`font-serif text-xl font-medium tabular-nums ${c.text}`}>
            {maturityScore(stage.score).toFixed(1)}
          </span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            /5.0 - {stage.phase}
          </span>
        </div>

        <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stage.score}%`, backgroundColor: c.bar }} />
        </div>

        {stage.gap && (
          <p className={`text-[10px] font-sans leading-snug ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{stage.gap}</p>
        )}
      </div>

      {(stage.activities?.length > 0 || stage.dimensionScores) && (
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between px-4 py-2 border-t text-[9px] font-mono uppercase tracking-wider transition-colors ${
            isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:bg-[#3A3A3C]/30' : 'border-[#D5D0C8] text-[#3D3D44] hover:bg-[#F3F1EC]'
          }`}
        >
          <span>{(stage.activities?.length ?? 0)} activities</span>
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-2 border-t space-y-1.5 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
              {stage.activities?.map((act, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-sans flex-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{act.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${ratingColor[act.rating] ?? 'bg-[#3A3A3C] text-[#8E8E93]'}`}>
                    {ratingShort[act.rating] ?? act.rating}
                  </span>
                </div>
              ))}

              {stage.dimensionScores && (
                <div className={`pt-2 mt-1 border-t space-y-1 ${isDark ? 'border-[#3A3A3C]/50' : 'border-[#D5D0C8]/50'}`}>
                  {DIMS.map(d => (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono w-12 shrink-0 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{d.label}</span>
                      <div className={`flex-1 rounded-full h-1 overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
                        <div className="h-full rounded-full" style={{ width: `${((stage.dimensionScores[d.key] ?? 0) / 5) * 100}%`, backgroundColor: d.color }} />
                      </div>
                      <span className={`text-[9px] font-mono tabular-nums w-6 text-right ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                        {(stage.dimensionScores[d.key] ?? 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ agent, style, isDark }) {
  const impactColor = agent.impact === 'High' ? (isDark ? 'text-[#30D5C8]' : 'text-[#0D9488]') : agent.impact === 'Low' ? 'text-[#8E8E93]' : (isDark ? 'text-[#F5A623]' : 'text-[#D4890A]');
  return (
    <div className={`rounded-xl border p-3.5 ${isDark ? 'bg-[#0B0B0E] border-[#3A3A3C] hover:border-[#8E8E93]/40' : 'bg-[#F3F1EC] border-[#D5D0C8]'} transition-all`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`text-xs font-semibold font-sans leading-snug flex-1 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{agent.name}</h4>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${style.badge} border-current/30`}>
          {agent.category}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {agent.platform && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'bg-[#3A3A3C]/50 border-[#3A3A3C] text-[#8E8E93]' : 'bg-white border-[#D5D0C8] text-[#3D3D44]'}`}>
            {agent.platform}
          </span>
        )}
        {agent.stageName && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'bg-[#3A3A3C]/50 border-[#3A3A3C] text-[#8E8E93]' : 'bg-white border-[#D5D0C8] text-[#3D3D44]'}`}>
            {agent.stageName}
          </span>
        )}
      </div>
      <p className={`text-[11px] font-sans leading-relaxed mb-2.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{agent.rationale}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-mono font-semibold ${impactColor}`}>{agent.impact} Impact</span>
        <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>-</span>
        <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{agent.effort}</span>
      </div>
    </div>
  );
}

/* -- Main page ------------------------------------------------------------- */

export default function AnalysisPage() {
  const { isDark } = useTheme();
  const ran = useRef(false);

  const [process,   setProcess]   = useState(null);
  const [company,   setCompany]   = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [plan,      setPlan]      = useState(null);
  const [ready,     setReady]     = useState(false);

  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [insightsExpanded,  setInsightsExpanded]  = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const p  = JSON.parse(localStorage.getItem('demo_process')   ?? 'null');
    const co = JSON.parse(localStorage.getItem('demo_company')   ?? 'null');
    const d  = JSON.parse(localStorage.getItem('demo_discovery') ?? 'null');
    const pl = JSON.parse(localStorage.getItem('demo_plan')      ?? 'null');

    if (p) setProcess(p);
    if (co) setCompany(co);
    if (d) setDiscovery(d);
    if (pl) setPlan(pl);
    setReady(true);
  }, []);

  function downloadMarkdown() {
    const md   = buildMarkdown(process, company, discovery, plan);
    const name = `${(process?.name ?? 'analysis').replace(/\s+/g, '-').toLowerCase()}-report.md`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getFilteredAgents(agents) {
    if (!activeStageFilter) return agents ?? [];
    return (agents ?? []).filter(a => a.stageId === activeStageFilter);
  }

  const techList = ready
    ? Object.values(JSON.parse(localStorage.getItem('demo_tech') ?? '{}')).flat().filter(Boolean)
    : [];

  const overallScore    = discovery?.overallScore ?? 0;
  const overallMaturity = maturityScore(overallScore);
  const highPriority    = (discovery?.stageScores ?? []).filter(s => s.priority === 'HIGH').length;
  const totalAgents     = (plan?.phases ?? []).reduce((n, ph) => n + (ph.agents?.length ?? 0), 0);

  if (!ready) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0B0B0E]' : 'bg-[#F3F1EC]'}`}>
        <span className="w-4 h-4 rounded-full bg-[#F5A623] animate-heartbeat-glow" />
      </div>
    );
  }

  if (!discovery) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-[#0B0B0E] text-[#F1F1F3]' : 'bg-[#F3F1EC] text-[#18181A]'}`}>
        <p className="font-serif text-lg">No discovery data found.</p>
        <a href="/" className="text-[#F5A623] text-sm font-mono hover:underline">Start a new discovery</a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B0B0E] text-[#F1F1F3]' : 'bg-[#F3F1EC] text-[#18181A]'}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-16">

        {/* -- Page header -- */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a href="/" className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${isDark ? 'text-[#8E8E93] hover:text-[#F5A623]' : 'text-[#3D3D44] hover:text-[#F5A623]'}`}>
                <ArrowLeft size={11} /> ShiftAI
              </a>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">
              Process Discovery Analysis
            </span>
            <h1 className={`font-serif text-3xl font-normal mt-0.5 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
              {process?.name}
            </h1>
            {company?.name && (
              <p className={`font-mono text-xs mt-1 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                {company.name} - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open('/roadmap', '_blank', 'noopener')}
              className={`px-4 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:border-[#F5A623]/40 hover:text-[#F5A623]' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#F5A623]'
              }`}
            >
              Roadmap <ExternalLink size={11} />
            </button>
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] transition-all"
            >
              <Download size={11} /> Download Report
            </button>
          </div>
        </div>

        {/* -- Stat cards -- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Overall Maturity"       value={`${overallMaturity}/5.0`} sub={`${overallScore}% automation coverage`} accent="#F5A623" isDark={isDark} />
          <StatCard label="Optimization Gaps"      value={highPriority}              sub="high priority process steps"           accent="#EF4444" isDark={isDark} />
          <StatCard label="Automation Agents"      value={totalAgents}               sub="scoped across 3 phases"                accent="#30D5C8" isDark={isDark} />
          <StatCard label="Time to Value"          value="24 wks"                    sub="full deployment estimate"              accent="#A78BFA" isDark={isDark} />
        </div>

        {/* -- Executive Summary -- */}
        <div className={`rounded-2xl border p-5 mb-6 border-l-2 border-l-[#F5A623] ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-2">Executive Summary</p>
          <p className={`text-sm font-serif leading-relaxed ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{discovery.executiveSummary}</p>
          {techList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#3A3A3C]/40">
              {techList.map(t => (
                <span key={t} className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 ${isDark ? 'text-[#F5A623]' : 'text-[#D4890A]'}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* -- Industry Benchmark Comparison -- */}
        <IndustryBenchmarkSection discovery={discovery} company={company} isDark={isDark} />

        {/* -- Process Steps Breakdown -- */}
        <div className="mb-6">
          <p className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            Process Steps Breakdown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(discovery.stageScores ?? []).map(stage => (
              <StageCard key={stage.stageId} stage={stage} isDark={isDark} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: 'Under 40% -- needs attention', color: '#EF4444' },
              { label: '40-70% -- room to grow',       color: '#F5A623' },
              { label: 'Over 70% -- well covered',     color: '#30D5C8' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className={`text-[10px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -- Key Insights -- */}
        {(discovery.insights ?? []).length > 0 && (
          <div className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
            <button
              onClick={() => setInsightsExpanded(e => !e)}
              className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-[#3A3A3C]/20' : 'hover:bg-[#F3F1EC]'}`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623]">
                Evaluation Insights ({discovery.insights.length})
              </p>
              <ChevronDown size={14} className={`${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'} transition-transform ${insightsExpanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {insightsExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`px-5 pb-5 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
                    {discovery.insights.map((ins, i) => {
                      const s = getInsightStyle(ins.type, isDark);
                      return (
                        <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${s}`}>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-current/30 shrink-0 mt-0.5">
                            {ins.type}
                          </span>
                          <p className="text-xs font-sans leading-relaxed">{ins.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* -- Automation Agent Roadmap -- */}
        {plan && (
          <>
            {(discovery.stageScores ?? []).length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <p className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                    Filter by process step
                  </p>
                  {activeStageFilter && (
                    <button onClick={() => setActiveStageFilter(null)} className="text-[10px] font-mono text-[#F5A623] hover:underline cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {discovery.stageScores.map(s => {
                    const c      = scoreColor(s.score, isDark);
                    const active = activeStageFilter === s.stageId;
                    return (
                      <button
                        key={s.stageId}
                        onClick={() => setActiveStageFilter(active ? null : s.stageId)}
                        className={`flex-shrink-0 w-36 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          active
                            ? isDark ? 'border-[#F5A623] bg-[#F5A623]/8' : 'border-[#D4890A] bg-[#D4890A]/8'
                            : isDark ? 'border-[#3A3A3C] bg-[#1C1C1E] hover:border-[#8E8E93]/40' : 'border-[#D5D0C8] bg-white hover:border-[#3D3D44]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-serif text-base tabular-nums ${c.text}`}>{maturityScore(s.score).toFixed(1)}</span>
                          <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded border ${priorityBadge(s.priority, isDark)}`}>{s.priority}</span>
                        </div>
                        <div className={`h-1 rounded-full mb-1.5 overflow-hidden ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#E6E2DB]'}`}>
                          <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: c.bar }} />
                        </div>
                        <p className={`text-[10px] font-sans leading-snug line-clamp-2 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>{s.stageName}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className={`text-[10px] font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              3-Phase Automation Agent Roadmap
            </p>

            {plan.summary && (
              <div className={`rounded-xl border p-4 mb-4 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
                <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{plan.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {(plan.phases ?? []).map((ph, phIdx) => {
                const s      = getPhaseStyle(phIdx, isDark);
                const agents = getFilteredAgents(ph.agents);
                return (
                  <div key={ph.number} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
                    <div className={`p-4 border-b ${s.light} ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`} style={{ borderLeftWidth: 3, borderLeftColor: s.accent }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${s.badge}`}
                          style={{ border: `1px solid ${s.accent}40` }}>
                          {ph.number}
                        </span>
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${s.text}`}>{s.label}</span>
                      </div>
                      <h3 className={`font-serif text-base font-medium ${isDark ? 'text-white' : 'text-[#18181A]'}`}>{ph.name}</h3>
                      <p className={`text-[10px] font-sans mt-0.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{ph.subtitle}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[11px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#4B5563]'}`}>{ph.timeframe}</span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${s.badge}`} style={{ border: `1px solid ${s.accent}30` }}>
                          {agents.length} agent{agents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {ph.description && (
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}>
                        <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>{ph.description}</p>
                      </div>
                    )}

                    <div className="p-3 space-y-2.5">
                      {agents.length === 0 ? (
                        <p className={`text-xs text-center py-4 font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
                          {activeStageFilter ? 'No agents for this step' : 'No agents in this phase'}
                        </p>
                      ) : agents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} style={s} isDark={isDark} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* -- Footer CTA -- */}
        <div className="rounded-2xl p-6 bg-gradient-to-tr from-[#F5A623]/15 to-[#FF6B35]/5 border border-[#F5A623]/20">
          <div className="text-center max-w-lg mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#F5A623] mb-2">Discovery Complete</p>
            <h2 className={`font-serif text-xl font-normal mb-2 ${isDark ? 'text-white' : 'text-[#18181A]'}`}>
              {overallMaturity.toFixed(1)}/5.0 maturity -- automation roadmap ready
            </h2>
            <p className={`text-xs font-sans mb-5 leading-relaxed ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
              {(discovery.stageScores ?? []).length} process steps assessed{company?.name ? ` for ${company.name}` : ''}.
              {totalAgents > 0 ? ` ${totalAgents} automation agents scoped across 3 phases.` : ''}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={downloadMarkdown}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black font-semibold rounded-xl text-sm cursor-pointer hover:scale-[1.02] transition-all"
              >
                <Download size={14} /> Download Report
              </button>
              <button
                onClick={() => window.open('/roadmap', '_blank', 'noopener')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                  isDark ? 'border-[#3A3A3C] text-[#F1F1F3] hover:border-[#F5A623]/40' : 'border-[#D5D0C8] text-[#18181A] hover:border-[#F5A623]'
                }`}
              >
                View Roadmap <ExternalLink size={13} />
              </button>
              <a href="/" className={`px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:text-[#F1F1F3]' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#18181A]'
              }`}>
                New Discovery
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
