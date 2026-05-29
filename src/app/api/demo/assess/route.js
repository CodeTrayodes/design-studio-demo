import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { industry, processDescription } = await req.json();

    const result = await requestLlm({
      systemPrompt:
        'You are a senior business process analyst specialising in AI automation for financial services. Provide structured, actionable, plain-language assessments. Return only valid JSON — no markdown, no explanation.',
      userPrompt: `Analyse this ${industry} process and produce a complete structured assessment.

Process description:
${String(processDescription).slice(0, 4000)}

Return JSON with exactly these fields (all required):
{
  "executiveSummary": "600-700 word plain-language summary. Cover: what the process does, current state, key findings, and the opportunity for AI automation.",
  "objectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "currentStateAnalysis": "2-3 paragraphs describing how the process currently works, its maturity, and key inefficiencies.",
  "painPoints": ["specific pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"],
  "automationOpportunities": ["opportunity 1 with expected benefit", "opportunity 2", "opportunity 3", "opportunity 4", "opportunity 5"],
  "regulatoryRequirements": ["regulatory requirement 1", "requirement 2", "requirement 3"],
  "riskLevel": "Medium",
  "automationScore": 72
}

Rules:
- riskLevel must be exactly "Low", "Medium", or "High"
- automationScore must be an integer between 0 and 100
- All arrays must have the specified number of items
- Use plain, non-technical business language`,
      maxTokens: 2800,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[assess]', err.message);
    return NextResponse.json({ error: 'Assessment failed. Please try again.' }, { status: 500 });
  }
}
