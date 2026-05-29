import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { companyName, companyDescription, processId, processName } = await req.json();

    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const isCustom = processId === 'custom';

    const stagesInstruction = isCustom
      ? `"stages": [
    { "id": "cst-1", "name": "Stage 1 Name", "description": "1-2 sentence description of this stage." },
    { "id": "cst-2", "name": "Stage 2 Name", "description": "..." },
    ...
  ],
  NOTE: Generate exactly 5-7 stages that represent the end-to-end lifecycle of the "${processName}" process. Use IDs like "cst-1", "cst-2", etc. Each stage should be a distinct, sequential phase.`
      : '';

    const stagesRule = isCustom
      ? '\n- stages must have exactly 5-7 items with sequential IDs (cst-1, cst-2, ...) covering the full process lifecycle.'
      : '';

    const systemPrompt =
      'You are a senior enterprise analyst with deep knowledge of how companies across every industry run their business processes. You have extensive knowledge of Fortune 500 companies, mid-market firms, and industry leaders — their tech stacks, operational models, pain points, and automation maturity. Return only valid JSON — no markdown, no code fences, no explanation.';

    const userPrompt = `Research "${companyName.trim()}" and how they handle their "${processName}" process.

${companyDescription ? `User context: ${String(companyDescription).slice(0, 1500)}\n` : ''}
Return this exact JSON structure:
{
  "companyProfile": "<2-3 sentences: industry, size, market position>",
  "inferredTechStack": ["<platform 1>", "<platform 2>", "<platform 3>"],
  "processDescription": "<200-300 words describing how ${companyName.trim()} likely runs ${processName} end-to-end: key stages, tools, team structure, pain points, automation maturity>",${isCustom ? `
  ${stagesInstruction}` : ''}
  "keyInsights": [
    "<process maturity insight specific to this company>",
    "<technology usage insight>",
    "<competitive or regulatory pressure insight>",
    "<top automation opportunity>"
  ],
  "industryBenchmark": "<1-2 sentences comparing their automation maturity to peers>",
  "recommendedFocus": ["<focus area 1>", "<focus area 2>", "<focus area 3>"]
}

Rules: be specific to this company; inferredTechStack = 3-6 real enterprise platforms; keyInsights = exactly 4 items; recommendedFocus = exactly 3 items.${stagesRule}`;

    let result;
    try {
      result = await requestLlm({ systemPrompt, userPrompt, maxTokens: isCustom ? 3000 : 2000 });
    } catch (llmErr) {
      console.error('[research] LLM error:', llmErr.message);
      return NextResponse.json(
        { error: `Research failed: ${llmErr.message.slice(0, 200)}` },
        { status: 500 }
      );
    }

    // Ensure required fields exist with sensible defaults
    if (!result.companyProfile) result.companyProfile = `${companyName} is a company running ${processName}.`;
    if (!Array.isArray(result.inferredTechStack)) result.inferredTechStack = [];
    if (!result.processDescription) result.processDescription = '';
    if (!Array.isArray(result.keyInsights)) result.keyInsights = [];
    if (!result.industryBenchmark) result.industryBenchmark = '';
    if (!Array.isArray(result.recommendedFocus)) result.recommendedFocus = [];

    return NextResponse.json(result);
  } catch (err) {
    console.error('[research]', err.message);
    return NextResponse.json({ error: `Research failed: ${err.message.slice(0, 200)}` }, { status: 500 });
  }
}
