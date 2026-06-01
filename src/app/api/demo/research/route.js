import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

export async function POST(req) {
  try {
    const { companyName, companyDescription, processId, processName, industry, governance } = await req.json();

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
      'You are a senior enterprise analyst with deep knowledge of how companies across every industry run their business processes. You have extensive knowledge of Fortune 500 companies, mid-market firms, and industry leaders -- their tech stacks, operational models, improvement opportunities, and automation maturity. Return only valid JSON -- no markdown, no code fences, no explanation.';

    const industryContext = industry ? `The company operates in the ${industry} industry (use this as a hint, but still infer and return inferredIndustry).` : '';
    const governanceContext = governance ? `Governance model hint: ${governance} (still infer and return inferredGovernance).` : '';

    const industryProcessesInstruction = `Generate 5-6 common processes specific to the inferred industry for this company. Examples for context:
- Insurance: Underwriting, Claims Processing, Policy Administration, Regulatory Compliance, Reinsurance Management
- Financial Services: Loan Origination, KYC/AML, Treasury Management, Trade Settlement, Regulatory Reporting
- Healthcare: Patient Onboarding, Claims Adjudication, Clinical Documentation, Prior Authorization, Revenue Cycle
- Manufacturing: Procurement, Quality Control, Production Planning, Inventory Management, Supplier Management
- Technology: Software Development Lifecycle, Incident Management, Security & Compliance, Vendor Management, Customer Success
- Government: Permit Processing, Procurement, Compliance Auditing, Public Records Management, Contract Management
Use processes that are actually relevant to the inferred industry.`;

    const userPrompt = `Research "${companyName.trim()}" and how they handle their "${processName}" process.
${industryContext}${governanceContext ? `\n${governanceContext}` : ''}

${companyDescription ? `User context: ${String(companyDescription).slice(0, 1500)}\n` : ''}
IMPORTANT: Based solely on the company name (and any hints above), you MUST infer:
1. inferredIndustry — the single most likely industry sector (e.g. "Financial Services", "Insurance", "Healthcare", "Retail", "Technology", "Manufacturing", "Government", etc.)
2. inferredGovernance — the compliance frameworks most likely required for this company type (e.g. a bank → ["SOC 2", "PCI-DSS", "GDPR"]; a hospital → ["HIPAA", "SOC 2", "HITRUST"]; a tech startup → ["SOC 2", "ISO 27001"]; a government agency → ["FedRAMP", "NIST", "SOC 2"])

Return this exact JSON structure:
{
  "companyBrief": "<2-3 sentence professional description. Example: '${companyName.trim()} is a [type] organization in the [inferred industry] sector, focused on [key areas]. They manage [typical operations]. Key processes include: [3-4 key processes specific to inferred industry].'">",
  "inferredIndustry": "<the most likely industry sector for this company>",
  "inferredGovernance": ["<compliance framework 1>", "<compliance framework 2>", "<compliance framework 3>"],
  "companyProfile": "<2-3 sentences: industry, size, market position>",
  "inferredTechStack": ["<platform 1>", "<platform 2>", "<platform 3>"],
  "processDescription": "<200-300 words describing how ${companyName.trim()} likely runs ${processName} end-to-end: key stages, tools, team structure, improvement opportunities, automation maturity>",${isCustom ? `
  ${stagesInstruction}` : ''}
  "keyInsights": [
    "<process maturity insight specific to this company>",
    "<technology usage insight>",
    "<competitive or regulatory pressure insight>",
    "<top optimization candidate>"
  ],
  "industryBenchmark": "<1-2 sentences comparing their automation maturity to peers>",
  "recommendedFocus": ["<focus area 1>", "<focus area 2>", "<focus area 3>"],
  "industryProcesses": [
    { "id": "proc-1", "name": "<Process Name>", "description": "<One clear sentence describing this process>", "companyCount": <number between 50 and 200>, "avgAutomationRate": <number between 40 and 75>, "avgSla": "<X days>" },
    { "id": "proc-2", "name": "<Process Name>", "description": "<One clear sentence describing this process>", "companyCount": <number between 50 and 200>, "avgAutomationRate": <number between 40 and 75>, "avgSla": "<X days>" },
    { "id": "proc-3", "name": "<Process Name>", "description": "<One clear sentence describing this process>", "companyCount": <number between 50 and 200>, "avgAutomationRate": <number between 40 and 75>, "avgSla": "<X days>" },
    { "id": "proc-4", "name": "<Process Name>", "description": "<One clear sentence describing this process>", "companyCount": <number between 50 and 200>, "avgAutomationRate": <number between 40 and 75>, "avgSla": "<X days>" },
    { "id": "proc-5", "name": "<Process Name>", "description": "<One clear sentence describing this process>", "companyCount": <number between 50 and 200>, "avgAutomationRate": <number between 40 and 75>, "avgSla": "<X days>" }
  ]
}

${industryProcessesInstruction}

Rules: be specific to this company; inferredIndustry = exactly one industry string; inferredGovernance = 2-4 relevant compliance framework strings; inferredTechStack = 3-6 real enterprise platforms; keyInsights = exactly 4 items; recommendedFocus = exactly 3 items; industryProcesses = exactly 5-6 items with realistic companyCount (50-200) and avgAutomationRate (40-75) values.${stagesRule}`;

    let result;
    try {
      result = await requestLlm({ systemPrompt, userPrompt, maxTokens: isCustom ? 4000 : 3000 });
    } catch (llmErr) {
      console.error('[research] LLM error:', llmErr.message);
      return NextResponse.json(
        { error: `Research failed: ${llmErr.message.slice(0, 200)}` },
        { status: 500 }
      );
    }

    // Resolve the effective industry: prefer LLM-inferred, fall back to user input, then generic label
    const effectiveIndustry = result.inferredIndustry || industry || 'enterprise';

    // Ensure required fields exist with sensible defaults
    if (!result.inferredIndustry) result.inferredIndustry = industry || 'Enterprise';
    if (!Array.isArray(result.inferredGovernance) || result.inferredGovernance.length === 0) {
      result.inferredGovernance = ['SOC 2', 'ISO 27001'];
    }
    if (!result.companyBrief) {
      result.companyBrief = `${companyName} is an organization operating in the ${effectiveIndustry} sector. They manage a range of business operations including ${processName} and related activities. Key processes span core operational, compliance, and customer-facing functions typical of ${effectiveIndustry} organizations.`;
    }
    if (!result.companyProfile) result.companyProfile = `${companyName} is a company running ${processName}.`;
    if (!Array.isArray(result.inferredTechStack)) result.inferredTechStack = [];
    if (!result.processDescription) result.processDescription = '';
    if (!Array.isArray(result.keyInsights)) result.keyInsights = [];
    if (!result.industryBenchmark) result.industryBenchmark = '';
    if (!Array.isArray(result.recommendedFocus)) result.recommendedFocus = [];
    if (!Array.isArray(result.industryProcesses) || result.industryProcesses.length === 0) {
      result.industryProcesses = [
        { id: 'proc-1', name: 'Operational Workflow Management', description: `Core operational workflow management process for ${effectiveIndustry} organizations.`, companyCount: 120, avgAutomationRate: 55, avgSla: '3 days' },
        { id: 'proc-2', name: 'Compliance & Regulatory Reporting', description: `Ensures adherence to ${effectiveIndustry} regulations and timely regulatory submissions.`, companyCount: 95, avgAutomationRate: 48, avgSla: '5 days' },
        { id: 'proc-3', name: 'Vendor & Supplier Management', description: 'Manages vendor relationships, contracts, and procurement activities.', companyCount: 80, avgAutomationRate: 42, avgSla: '7 days' },
        { id: 'proc-4', name: 'Customer Onboarding', description: 'Streamlines the end-to-end process of onboarding new customers or clients.', companyCount: 110, avgAutomationRate: 60, avgSla: '2 days' },
      ];
    }

    // Surface effectiveIndustry at the top level so callers always have a resolved industry value
    result.industry = effectiveIndustry;

    return NextResponse.json(result);
  } catch (err) {
    console.error('[research]', err.message);
    return NextResponse.json({ error: `Research failed: ${err.message.slice(0, 200)}` }, { status: 500 });
  }
}
