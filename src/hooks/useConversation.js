'use client';

import { useState, useCallback, useRef } from 'react';
import { PROCESSES } from '@/lib/processes';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function detectProcessId(text) {
  const t = text.toLowerCase();
  if (t.includes('lead to cash') || t.includes('lead-to-cash') || t.includes('l2c'))         return 'lead-to-cash';
  if (t.includes('hire to retire') || t.includes('hire-to-retire') || t.includes('h2r'))     return 'hire-to-retire';
  if (t.includes('procure to pay') || t.includes('procure-to-pay') || t.includes('p2p'))     return 'procure-to-pay';
  if (t.includes('order to cash') || t.includes('order-to-cash') || t.includes('o2c'))       return 'order-to-cash';
  if (t.includes('record to report') || t.includes('record-to-report') || t.includes('r2r')) return 'record-to-report';
  if (t.includes('issue to resolution'))                                                       return 'issue-to-resolution';
  return null;
}

function leakFromMaturity(m) {
  if (m < 2)   return '~$85K / wk';
  if (m < 2.5) return '~$62K / wk';
  if (m < 3)   return '~$45K / wk';
  if (m < 3.5) return '~$28K / wk';
  if (m < 4)   return '~$14K / wk';
  return '~$6K / wk';
}

function transformDiscovery(processName, discovery) {
  const overallMaturity = parseFloat(((discovery.overallScore ?? 50) / 100 * 5).toFixed(1));

  const stages = (discovery.stageScores ?? []).map(s => ({
    name:           s.stageName,
    maturity:       parseFloat(((s.score ?? 50) / 100 * 5).toFixed(1)),
    effort:         s.priority === 'HIGH' ? 'high' : s.priority === 'MEDIUM' ? 'medium' : 'low',
    impact:         s.phase   === 'Phase 1' ? 'high' : s.phase === 'Phase 2' ? 'medium' : 'low',
    recommendation: s.gap || 'Automation opportunities identified across this stage',
  }));

  const worst = [...stages].sort((a, b) => a.maturity - b.maturity)[0];

  return {
    processName,
    overallMaturity,
    estimatedWeeklyLeak: leakFromMaturity(overallMaturity),
    summary: discovery.executiveSummary ?? '',
    stages,
    topBottleneck: worst ? `${worst.name} — ${worst.recommendation}` : null,
  };
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

export function useConversation() {
  const [messages,        setMessages]        = useState([]);
  const [streaming,       setStreaming]        = useState(false);
  const [analysisResult,  setAnalysisResult]  = useState(null);
  const [analysisApiReady, setAnalysisApiReady] = useState(false);
  const [sessionId]                            = useState(uid);

  // stage: idle | awaiting_company | researching | tool_selection | context_input | analyzing | complete
  const stage   = useRef('idle');
  const context = useRef({ processId: null, processObj: null, companyName: null });

  /* ── helpers ─────────────────────────────────────────────────────────── */

  function addMessage(msg) {
    setMessages(prev => [...prev, { id: uid(), ...msg }]);
  }

  function addTyping() {
    const id = uid();
    setMessages(prev => [...prev, { id, role: 'assistant', content: '' }]);
    return id;
  }

  function resolveTyping(id, content) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  }

  /* ── background analysis (called immediately when context is confirmed) ── */

  async function runAnalysisBackground(process, tech, ctx) {
    try {
      const discoverRes = await fetch('/api/demo/discover', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processName:    process.name,
          stages:         process.stages ?? [],
          techStack:      tech,
          processContext: ctx?.data ? JSON.stringify(ctx.data) : '',
        }),
      });

      const discovery = await discoverRes.json();
      if (discoverRes.ok && !discovery.error) {
        sessionStorage.setItem('demo_discovery', JSON.stringify(discovery));

        const planRes = await fetch('/api/demo/plan', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processName: process.name, techStack: tech, discovery }),
        });
        const plan = await planRes.json();
        if (plan && !plan.error) sessionStorage.setItem('demo_plan', JSON.stringify(plan));

        const report = transformDiscovery(process.name, discovery);
        setAnalysisResult(report);
      }
    } catch (err) {
      console.error('Background analysis error:', err);
    } finally {
      setAnalysisApiReady(true);
    }
  }

  /* ── research ────────────────────────────────────────────────────────── */

  async function doResearch() {
    const { processId, processObj, companyName } = context.current;
    stage.current = 'researching';
    setStreaming(true);

    const typId = addTyping();

    try {
      const res = await fetch('/api/demo/research', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyDescription: '',
          processId:   processId ?? 'custom',
          processName: processObj?.name ?? processId ?? 'Custom Process',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Research failed');

      const finalProcess = processObj
        ? (processId === 'custom' && data.stages?.length ? { ...processObj, stages: data.stages } : processObj)
        : { id: processId ?? 'custom', name: data.processDescription ?? 'Custom Process', stages: data.stages ?? [] };

      context.current.processObj = finalProcess;

      sessionStorage.setItem('demo_process',  JSON.stringify(finalProcess));
      sessionStorage.setItem('demo_company',  JSON.stringify({ name: companyName }));
      sessionStorage.setItem('demo_research', JSON.stringify(data));

      const snippet = data.companyProfile?.summary
        ? `I've built a profile for **${companyName}**. ${data.companyProfile.summary}`.slice(0, 200)
        : `Profile complete for **${companyName}**. Now let's map your tech stack.`;

      resolveTyping(typId, `${snippet} Let me understand which tools your team uses.`);
      addMessage({ role: 'assistant', type: 'tool-selection' });
      stage.current = 'tool_selection';
    } catch (err) {
      resolveTyping(typId, `Something went wrong during research: ${err.message}. Please try again.`);
      stage.current = 'idle';
    } finally {
      setStreaming(false);
    }
  }

  /* ── public API ──────────────────────────────────────────────────────── */

  const sendMessage = useCallback(async (text, opts = {}) => {
    if (streaming) return;

    addMessage({ role: 'user', content: text });
    setStreaming(true);

    const cur = stage.current;

    if (cur === 'idle') {
      const detectedId = opts.processId ?? detectProcessId(text);
      context.current.processId  = detectedId;
      context.current.processObj = detectedId ? (PROCESSES[detectedId] ?? null) : null;

      const companyMatch = text.match(/(?:for|at|of)\s+([A-Z][A-Za-z0-9\s&,.']{1,40})(?:\b|$)/);
      const companyGuess = companyMatch?.[1]?.trim();

      if (companyGuess) {
        context.current.companyName = companyGuess;
        setStreaming(false);
        const processLabel = context.current.processObj?.name ?? 'that process';
        addMessage({
          role: 'assistant',
          content: `I'll audit the **${processLabel}** process for **${companyGuess}**. Profiling now — this usually takes about 20 seconds.`,
        });
        await doResearch();
      } else {
        setStreaming(false);
        const processLabel = context.current.processObj?.name ?? 'that process';
        stage.current = 'awaiting_company';
        addMessage({
          role: 'assistant',
          content: `Great — auditing **${processLabel}** end-to-end. Which company are we assessing today?`,
        });
      }
    } else if (cur === 'awaiting_company') {
      context.current.companyName = text.trim();
      setStreaming(false);
      addMessage({
        role: 'assistant',
        content: `Profiling **${text.trim()}** — pulling company data and process benchmarks. Give me ~20 seconds.`,
      });
      await doResearch();
    } else {
      setStreaming(false);
      addMessage({
        role: 'assistant',
        content: "I'm working through the analysis. Complete the steps above and I'll continue after.",
      });
    }
  }, [streaming]);

  const confirmTools = useCallback((tools) => {
    const names = Object.values(tools).flat().join(', ');
    addMessage({ role: 'user', content: `Using: ${names || 'no specific tools'}` });
    sessionStorage.setItem('demo_tech', JSON.stringify(tools));
    addMessage({
      role: 'assistant',
      content: `Stack noted. To produce the highest-fidelity assessment, provide a bit more context about your current process.`,
    });
    addMessage({ role: 'assistant', type: 'context-input' });
    stage.current = 'context_input';
  }, []);

  const confirmContext = useCallback((method, data) => {
    const labels = {
      api: 'Live API data connected',
      document: 'Document uploaded',
      questionnaire: 'Questionnaire answers submitted',
      benchmark: 'Industry benchmark selected',
    };
    addMessage({ role: 'user', content: labels[method] ?? 'Context provided' });

    const ctxPayload = { method, data };
    sessionStorage.setItem('demo_process_context', JSON.stringify(ctxPayload));

    addMessage({
      role: 'assistant',
      content: 'Running deep process analysis across all stages. This typically takes 20–30 seconds.',
    });
    addMessage({ role: 'assistant', type: 'analysis' });
    stage.current = 'analyzing';

    // Kick off API calls immediately in the background — progress animation runs in parallel
    const process = context.current.processObj;
    const tech    = JSON.parse(sessionStorage.getItem('demo_tech') ?? '{}');
    if (process) {
      runAnalysisBackground(process, tech, ctxPayload);
    } else {
      setAnalysisApiReady(true);
    }
  }, []);

  const runAnalysis = useCallback(() => {
    // Called by AnalysisProgress.onComplete — data is already in state
    addMessage({ role: 'assistant', type: 'report' });
    stage.current = 'complete';
  }, []);

  const reset = useCallback(() => {
    ['demo_process','demo_company','demo_research','demo_tech','demo_process_context','demo_discovery','demo_plan']
      .forEach(k => sessionStorage.removeItem(k));
    setMessages([]);
    setAnalysisResult(null);
    setAnalysisApiReady(false);
    setStreaming(false);
    stage.current   = 'idle';
    context.current = { processId: null, processObj: null, companyName: null };
  }, []);

  return {
    messages,
    streaming,
    analysisResult,
    analysisApiReady,
    sessionId,
    sendMessage,
    confirmTools,
    confirmContext,
    runAnalysis,
    reset,
  };
}
