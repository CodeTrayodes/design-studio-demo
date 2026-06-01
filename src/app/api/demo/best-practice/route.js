import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { processName, industry, companyName, governance, companyContext } = await req.json();

    if (!processName || processName.trim().length < 2) {
      return NextResponse.json({ error: 'Process name is required.' }, { status: 400 });
    }

    const industryLabel = industry || 'enterprise';
    const processLabel = processName.trim();

    // Simulate benchmark database counts (deterministic based on process name length for demo)
    const processCount = 100 + (processLabel.length * 3) % 80;
    const companyCount = 70 + (processLabel.length * 2) % 50;

    const systemPrompt =
      `You are a senior enterprise process consultant specializing in process discovery and analysis. You are analyzing a ${industryLabel} company's ${processLabel} process against industry best practices. Based on ${processCount} similar processes and ${companyCount} companies in the LevelShift process database, you provide structured, data-driven analysis. Your assessments are honest: most companies have a mix of automated steps, partially-automated steps, and fully manual steps. Real organisations have data silos, manual handoffs, spreadsheet workarounds, and compliance gaps even with expensive tooling. Return only valid JSON -- no markdown, no code fences, no explanation.`;

    const userPrompt = `Perform a structured process discovery and analysis for the "${processLabel}" process at ${companyName ? `"${companyName}"` : 'a typical large enterprise'} in the ${industryLabel} industry.

${companyContext ? `Company context: ${String(companyContext).slice(0, 500)}\n` : ''}${governance ? `Governance context: ${String(governance).slice(0, 300)}\n` : ''}

This is NOT a best-case or aspirational description. It should reflect the REAL situation at an average large ${industryLabel} company: a mix of automated, partially-automated, and manual activities. Most process steps will have some manual work, spreadsheet usage, email handoffs, or system integration gaps. Even process steps with ERP/CRM tools typically have data quality issues, exception handling done manually, and reporting done in Excel.

Return this exact JSON structure:
{
  "summary": "<2-3 sentence executive summary of the ${processLabel} process discovery findings, mentioning the ${industryLabel} industry context and overall maturity level>",
  "description": "<400-500 word honest current-state description of how ${industryLabel} companies ACTUALLY run ${processLabel} today. Include: key process steps in order, which steps are mostly automated vs mostly manual, specific improvement opportunities (e.g. 'approvals done via email', 'reconciliation in Excel', 'no real-time visibility'), typical team structure and handoff points, common tools used BUT also their limitations in practice, volume and cycle time challenges, and regulatory/compliance overhead that causes manual work. Make it sound like a real internal discovery -- not a vendor white paper.>",
  "currentState": ["<concrete observation about current process step 1>", "<observation 2>", "<observation 3>", "<observation 4>", "<observation 5>"],
  "industryBestPractice": ["<how leading ${industryLabel} companies approach ${processLabel} -- best practice 1>", "<best practice 2>", "<best practice 3>", "<best practice 4>"],
  "gaps": ["<specific gap between current state and best practice 1>", "<gap 2>", "<gap 3>", "<gap 4>"],
  "highlights": ["<process step 1>", "<process step 2>", "<process step 3>", "<process step 4>", "<process step 5>"],
  "commonTools": ["<platform 1>", "<platform 2>", "<platform 3>", "<platform 4>"],
  "keyImprovementOpportunities": ["<specific improvement opportunity 1 -- be concrete>", "<opportunity 2 -- be concrete>", "<opportunity 3 -- be concrete>"],
  "optimizationOpportunities": ["<optimization opportunity with metric, e.g. '35% reduction in cycle time through automated approvals'>", "<opportunity 2 with metric>", "<opportunity 3 with metric>", "<opportunity 4 with metric>"],
  "benchmark": "<one of: Above Average, Average, Below Average -- based on estimated maturity vs ${industryLabel} peers>",
  "benchmarkData": {
    "processCount": ${processCount},
    "companyCount": ${companyCount},
    "industryAvgSla": "<realistic SLA for ${processLabel} in ${industryLabel}, e.g. '2.3 days'>",
    "industryAvgAutomation": <integer 0-100 representing average automation % for ${processLabel} in ${industryLabel}>
  }
}

Rules:
- summary must be 2-3 sentences, executive-level
- description must be 400-500 words, honest and realistic (not aspirational)
- At least half the process steps should have clear manual steps or automation gaps described
- currentState = exactly 5 concrete observations about how the process actually operates today
- industryBestPractice = exactly 4 approaches used by leading ${industryLabel} companies
- gaps = exactly 4 gaps between current state and best practice
- highlights = exactly 5 key process steps for ${processLabel}
- commonTools = 3-5 real enterprise platforms, but note that having a tool does not mean a step is fully automated
- keyImprovementOpportunities = exactly 3 concrete, specific improvement opportunities that are common even at well-resourced companies
- optimizationOpportunities = exactly 4 opportunities, each including a quantified metric or percentage
- benchmark must be one of: "Above Average", "Average", "Below Average"
- benchmarkData.industryAvgSla must be a realistic string like "2.3 days" or "4 hours"
- benchmarkData.industryAvgAutomation must be an integer between 20 and 85`;

    let result;
    try {
      result = await requestLlm({ systemPrompt, userPrompt, maxTokens: 2500 });
    } catch (llmErr) {
      console.error('[best-practice] LLM error:', llmErr.message);
      return NextResponse.json(
        { error: `Process discovery generation failed: ${llmErr.message.slice(0, 200)}` },
        { status: 500 }
      );
    }

    if (!result.summary) result.summary = `Process discovery analysis for ${processLabel} in the ${industryLabel} industry.`;
    if (!result.description) result.description = `${processLabel} is a critical enterprise process.`;
    if (!Array.isArray(result.currentState)) result.currentState = [];
    if (!Array.isArray(result.industryBestPractice)) result.industryBestPractice = [];
    if (!Array.isArray(result.gaps)) result.gaps = [];
    if (!Array.isArray(result.highlights)) result.highlights = [];
    if (!Array.isArray(result.commonTools)) result.commonTools = [];
    if (!Array.isArray(result.keyImprovementOpportunities)) result.keyImprovementOpportunities = [];
    if (!Array.isArray(result.optimizationOpportunities)) result.optimizationOpportunities = [];
    if (!result.benchmark) result.benchmark = 'Average';
    if (!result.benchmarkData || typeof result.benchmarkData !== 'object') {
      result.benchmarkData = {
        processCount,
        companyCount,
        industryAvgSla: 'N/A',
        industryAvgAutomation: 50,
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[best-practice]', err.message);
    return NextResponse.json({ error: `Generation failed: ${err.message.slice(0, 200)}` }, { status: 500 });
  }
}
