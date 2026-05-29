import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { processName, companyContext } = await req.json();

    if (!processName || processName.trim().length < 2) {
      return NextResponse.json({ error: 'Process name is required.' }, { status: 400 });
    }

    const systemPrompt =
      'You are a senior enterprise process consultant who has assessed hundreds of companies. You describe processes as they actually exist today in the average large enterprise — not as an ideal or aspirational state. Your assessments are honest: most companies have a mix of automated steps, partially-automated steps, and fully manual steps. Real organisations have data silos, manual handoffs, spreadsheet workarounds, and compliance gaps even with expensive tooling. Return only valid JSON — no markdown, no code fences, no explanation.';

    const userPrompt = `Write a realistic current-state description of how a typical large enterprise runs their "${processName.trim()}" process today.

${companyContext ? `Company context: ${String(companyContext).slice(0, 500)}\n` : ''}

This is NOT a best-case or aspirational description. It should reflect the REAL situation at an average large company: a mix of automated, partially-automated, and manual activities. Most stages will have some manual work, spreadsheet usage, email handoffs, or system integration gaps. Even stages with ERP/CRM tools typically have data quality issues, exception handling done manually, and reporting done in Excel.

Return this exact JSON structure:
{
  "description": "<400-500 word honest current-state description of how companies ACTUALLY run ${processName.trim()} today. Include: key stages in order, which stages are mostly automated vs mostly manual, specific manual pain points (e.g. 'approvals done via email', 'reconciliation in Excel', 'no real-time visibility'), typical team structure and handoff points, common tools used BUT also their limitations in practice, volume and cycle time challenges, and regulatory/compliance overhead that causes manual work. Make it sound like a real internal assessment — not a vendor white paper.>",
  "highlights": ["<stage 1>", "<stage 2>", "<stage 3>", "<stage 4>", "<stage 5>"],
  "commonTools": ["<platform 1>", "<platform 2>", "<platform 3>", "<platform 4>"],
  "keyPainPoints": ["<specific pain point 1 — be concrete>", "<specific pain point 2 — be concrete>", "<specific pain point 3 — be concrete>"]
}

Rules:
- description must be 400-500 words, honest and realistic (not aspirational)
- At least half the stages should have clear manual steps or automation gaps described
- highlights = exactly 5 key stages of this specific process
- commonTools = 3-5 real enterprise platforms, but note that having a tool does not mean a stage is fully automated
- keyPainPoints = exactly 3 concrete, specific pain points that are common even at well-resourced companies`;

    let result;
    try {
      result = await requestLlm({ systemPrompt, userPrompt, maxTokens: 2000 });
    } catch (llmErr) {
      console.error('[best-practice] LLM error:', llmErr.message);
      return NextResponse.json(
        { error: `Best practice generation failed: ${llmErr.message.slice(0, 200)}` },
        { status: 500 }
      );
    }

    if (!result.description) result.description = `${processName} is a critical enterprise process.`;
    if (!Array.isArray(result.highlights)) result.highlights = [];
    if (!Array.isArray(result.commonTools)) result.commonTools = [];
    if (!Array.isArray(result.keyPainPoints)) result.keyPainPoints = [];

    return NextResponse.json(result);
  } catch (err) {
    console.error('[best-practice]', err.message);
    return NextResponse.json({ error: `Generation failed: ${err.message.slice(0, 200)}` }, { status: 500 });
  }
}
