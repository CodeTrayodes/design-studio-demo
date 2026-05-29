import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { industry, assessment, architecture } = await req.json();
    const agentList = (architecture?.agents || []).map(a => `${a.id} (${a.name})`).join(', ');

    const result = await requestLlm({
      systemPrompt:
        'You are a business process analyst. Decompose business processes into clear, ordered, actionable subprocesses. Return only valid JSON — no markdown, no explanation.',
      userPrompt: `Decompose this ${industry} process into 10-12 ordered subprocesses.

Process summary: ${String(assessment.executiveSummary || '').slice(0, 500)}
Available AI agents: ${agentList}

Return JSON:
{
  "subprocesses": [
    {
      "id": "sp-1",
      "name": "Short descriptive name",
      "description": "2-3 sentences explaining what this subprocess does, why it matters, and what triggers it.",
      "sequence": 1,
      "inputs": ["input or trigger 1", "input 2"],
      "outputs": ["output or deliverable 1"],
      "successCriteria": "One measurable success criterion",
      "estimatedDuration": "X hours",
      "agentIds": ["agent-1"],
      "status": "UNASSIGNED",
      "owner": null
    }
  ]
}

Rules:
- sequence must be 1 to N in order
- agentIds must reference valid agent ids from: ${(architecture?.agents || []).map(a => a.id).join(', ')}
- Cover the full process end-to-end with no gaps
- Each subprocess name must be unique and clear`,
      maxTokens: 4000,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[subprocesses]', err.message);
    return NextResponse.json({ error: 'Subprocess decomposition failed. Please try again.' }, { status: 500 });
  }
}
