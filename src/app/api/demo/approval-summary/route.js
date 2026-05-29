import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { subprocess, architecture } = await req.json();
    const agentInfo = (architecture?.agents || [])
      .filter(a => (subprocess.agentIds || []).includes(a.id))
      .map(a => `${a.name}: ${a.role}`)
      .join(', ');

    const result = await requestLlm({
      systemPrompt:
        'You are a business analyst writing clear, concise one-page approval summaries for business process owners. Write in plain English. Return only valid JSON — no markdown, no explanation.',
      userPrompt: `Write an approval summary for this subprocess so a business owner can decide whether to approve it.

Subprocess: ${subprocess.name}
Description: ${subprocess.description}
Inputs: ${(subprocess.inputs || []).join(', ')}
Outputs: ${(subprocess.outputs || []).join(', ')}
Success criteria: ${subprocess.successCriteria}
AI agents handling this: ${agentInfo || 'AI agent'}
Estimated duration: ${subprocess.estimatedDuration}

Return JSON:
{
  "summary": "Full approval summary text (350-450 words). Structure it as: (1) Purpose — what this subprocess does and why it matters. (2) How the AI handles it — what the agents will do. (3) What you are being asked to approve — the proposed approach. (4) What happens next after approval.",
  "keyDecisions": ["key decision or assumption that requires the owner's sign-off 1", "key decision 2"],
  "expectedImpact": "One paragraph describing the business benefit of automating this subprocess.",
  "timeline": "Estimated time from approval to live: X weeks",
  "agentRoles": ["Agent X will Y", "Agent Z will W"]
}`,
      maxTokens: 1000,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[approval-summary]', err.message);
    return NextResponse.json({ error: 'Approval summary generation failed. Please try again.' }, { status: 500 });
  }
}
