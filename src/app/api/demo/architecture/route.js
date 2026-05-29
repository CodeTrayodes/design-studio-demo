import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { industry, assessment } = await req.json();

    const result = await requestLlm({
      systemPrompt:
        'You are an AI architecture designer specialising in agentic enterprise systems. Design practical, implementable architectures. Return only valid JSON — no markdown, no explanation.',
      userPrompt: `Design an agentic AI architecture for this ${industry} process.

Process summary: ${String(assessment.executiveSummary || '').slice(0, 600)}
Key pain points: ${(assessment.painPoints || []).slice(0, 3).join('; ')}
Automation opportunities: ${(assessment.automationOpportunities || []).slice(0, 3).join('; ')}

Return JSON with exactly these fields:
{
  "agents": [
    {
      "id": "agent-1",
      "name": "Agent Name",
      "role": "One-line role description",
      "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"]
    }
  ],
  "flows": [
    { "from": "agent-1", "to": "agent-2", "label": "short label (2-4 words)" }
  ],
  "humanGates": [
    {
      "id": "gate-1",
      "label": "Gate Name",
      "trigger": "when this happens",
      "afterAgent": "agent-id"
    }
  ],
  "escalationRules": ["rule 1", "rule 2", "rule 3"],
  "technologyStack": ["tool or API 1", "tool 2", "tool 3", "tool 4"]
}

Rules:
- Use exactly 3-4 agents
- agents[].id must be "agent-1", "agent-2" etc
- flows connect agents sequentially with descriptive labels
- Include 1-2 humanGates at high-stakes decision points (compliance, large value, exceptions)
- humanGates[].afterAgent must match an existing agent id`,
      maxTokens: 1800,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[architecture]', err.message);
    return NextResponse.json({ error: 'Architecture generation failed. Please try again.' }, { status: 500 });
  }
}
