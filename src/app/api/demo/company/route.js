import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { companyName } = await req.json();

    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const systemPrompt =
      'You are a senior enterprise analyst with deep knowledge of companies across every industry — their tech stacks, regulatory compliance, operational models, and automation maturity. Return only valid JSON — no markdown, no code fences, no explanation.';

    const userPrompt = `Research "${companyName.trim()}" and return detailed company intelligence for a process discovery session.

Return this exact JSON structure:
{
  "companyName": "${companyName.trim()}",
  "industry": "<specific industry, e.g. Commercial Insurance, Healthcare Payers, Discrete Manufacturing, Retail Banking>",
  "companyType": "<one of: Fortune 500, Large Enterprise, Mid-Market, SME, Public Sector>",
  "companySummary": "<2-3 sentences: what they do, market position, approximate scale>",
  "headquarters": "<City, Country>",
  "employeeCount": "<range, e.g. 10,000-50,000>",
  "governanceFrameworks": [
    { "name": "<framework name, e.g. SOC 2 Type II, HIPAA, ISO 27001, SOX, GDPR, PCI-DSS>", "source": "<issuing body, e.g. AICPA, U.S. Dept of Health, ISO, SEC>", "relevance": "<1 sentence why it applies>" }
  ],
  "inferredTechStack": [
    { "name": "<tool name>", "category": "<CRM/ERP/HRMS/Integration/Data>", "confidence": "<High/Medium>" }
  ],
  "keyFacts": [
    "<specific verifiable fact 1 about the company>",
    "<fact 2>",
    "<fact 3>"
  ],
  "recommendedProcesses": [
    { "id": "<exactly one of: lead-to-cash, hire-to-retire, procure-to-pay, order-to-cash, record-to-report, issue-to-resolution>", "priority": "High", "reason": "<1 sentence why this process matters most for this company>" },
    { "id": "<second process id>", "priority": "Medium", "reason": "<reason>" },
    { "id": "<third process id>", "priority": "Medium", "reason": "<reason>" }
  ],
  "industryAutomationContext": "<2 sentences on automation trends/pressure in their specific industry>",
  "dataSource": "Public company records, regulatory filings, industry databases"
}

Rules:
- governanceFrameworks: 2-4 items that are genuinely applicable to this industry/company
- inferredTechStack: 3-6 real enterprise platforms this company likely uses
- recommendedProcesses: exactly 3 items with valid IDs from the list above, ordered by relevance
- keyFacts: exactly 3 concise, verifiable facts
- Be specific to this actual company, not generic`;

    let result;
    try {
      result = await requestLlm({ systemPrompt, userPrompt, maxTokens: 2500 });
    } catch (llmErr) {
      console.error('[company] LLM error:', llmErr.message);
      return NextResponse.json(
        { error: `Company research failed: ${llmErr.message.slice(0, 200)}` },
        { status: 500 }
      );
    }

    // Ensure required fields exist with sensible defaults
    if (!result.industry) result.industry = 'Enterprise';
    if (!result.companyType) result.companyType = 'Large Enterprise';
    if (!result.companySummary) result.companySummary = `${companyName} is an enterprise organization focused on operational excellence.`;
    if (!Array.isArray(result.governanceFrameworks)) result.governanceFrameworks = [];
    if (!Array.isArray(result.inferredTechStack)) result.inferredTechStack = [];
    if (!Array.isArray(result.recommendedProcesses)) result.recommendedProcesses = [];
    if (!Array.isArray(result.keyFacts)) result.keyFacts = [];
    if (!result.dataSource) result.dataSource = 'Public company records, industry databases';

    // Validate recommended process IDs
    const validIds = ['lead-to-cash', 'hire-to-retire', 'procure-to-pay', 'order-to-cash', 'record-to-report', 'issue-to-resolution'];
    result.recommendedProcesses = result.recommendedProcesses.filter(p => validIds.includes(p.id));

    return NextResponse.json(result);
  } catch (err) {
    console.error('[company]', err.message);
    return NextResponse.json({ error: `Company research failed: ${err.message.slice(0, 200)}` }, { status: 500 });
  }
}
