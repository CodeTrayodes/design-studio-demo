import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { industry, answers = [] } = await req.json();
    const priorContext = answers.length
      ? `\nPrior answers so far:\n${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n')}`
      : '';

    const result = await requestLlm({
      systemPrompt:
        'You are a business process analyst. Generate a targeted questionnaire to understand a business process. Return only valid JSON — no markdown, no explanation.',
      userPrompt: `Generate 9 questions to deeply understand the ${industry} business process.${priorContext}

Return JSON exactly like this:
{
  "questions": [
    {
      "id": "q1",
      "text": "Full question text here?",
      "placeholder": "e.g. hint or example answer"
    }
  ]
}

Make questions specific to ${industry}. Cover: process volume, current tools, stakeholders, biggest pain points, compliance constraints, manual steps, automation maturity, decision points, and success metrics.`,
      maxTokens: 1200,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[questions]', err.message);
    return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
  }
}
