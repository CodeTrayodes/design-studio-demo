import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

// Scoring constants (mirrors real app)

const RATING_SCORE = { NOT_IN_PLACE: 0, MANUAL: 25, PARTIAL: 60, AUTOMATED: 100 };

// Dimension weights (improvement opportunities 30%, data 25%, processDefinition 20%, integration 15%, adoption 10%)
const DIM_WEIGHTS = { pain: 0.30, data: 0.25, processDefinition: 0.20, integration: 0.15, adoption: 0.10 };

// Tech stack -> dimension boosts

const TECH_BOOSTS = {
  // CRM
  salesforce:       { integration: 1.5, data: 1.0, adoption: 0.5 },
  hubspot:          { integration: 1.0, data: 0.8, adoption: 0.6 },
  'dynamics 365':   { integration: 1.2, data: 0.8, processDefinition: 0.5, adoption: 0.3 },
  dynamics:         { integration: 1.0, data: 0.7, processDefinition: 0.4 },
  pipedrive:        { integration: 0.7, data: 0.5 },
  zoho:             { integration: 0.6, data: 0.4 },

  // ERP
  sap:              { processDefinition: 1.5, integration: 1.0, data: 0.5 },
  oracle:           { processDefinition: 1.3, integration: 0.8, data: 0.6 },
  netsuite:         { processDefinition: 1.0, integration: 0.8, data: 0.5 },
  'ms dynamics':    { processDefinition: 0.9, integration: 0.7, data: 0.4 },
  epicor:           { processDefinition: 0.8, integration: 0.5 },
  sage:             { processDefinition: 0.7, integration: 0.4 },

  // Integration / iPaaS
  boomi:            { integration: 2.0, processDefinition: 0.5 },
  mulesoft:         { integration: 1.8, processDefinition: 0.4 },
  workato:          { integration: 1.5, processDefinition: 0.3 },
  informatica:      { integration: 1.6, data: 0.8 },
  talend:           { integration: 1.2, data: 0.7 },
  zapier:           { integration: 0.8 },
  'azure data factory': { integration: 1.4, data: 1.0 },
  azuredf:          { integration: 1.4, data: 1.0 },

  // Data / Analytics
  snowflake:        { data: 2.0 },
  databricks:       { data: 1.8 },
  tableau:          { data: 1.2 },
  powerbi:          { data: 1.0 },
  'power bi':       { data: 1.0 },
  looker:           { data: 1.1 },
  dbt:              { data: 1.3 },
  fivetran:         { data: 1.0, integration: 0.5 },

  // HRMS / HCM
  workday:          { adoption: 1.0, processDefinition: 1.0, data: 0.5 },
  successfactors:   { processDefinition: 1.0, adoption: 0.8 },
  bamboohr:         { adoption: 0.8, processDefinition: 0.6 },
  adp:              { processDefinition: 1.0, data: 0.4 },
  servicenow:       { processDefinition: 1.2, integration: 0.8, adoption: 0.4 },

  // Automation / RPA
  'power automate': { integration: 1.0, processDefinition: 0.8 },
  uipath:           { integration: 0.9, processDefinition: 0.8, adoption: 0.5 },
  'blue prism':     { integration: 0.8, processDefinition: 0.7 },
  automation360:    { integration: 0.8, processDefinition: 0.7 },
};

function inferBaseDimensions(techList) {
  const dims = { pain: 3.5, data: 2.0, processDefinition: 2.0, integration: 1.5, adoption: 2.5 };
  for (const tool of techList) {
    const t = tool.toLowerCase();
    for (const [key, boosts] of Object.entries(TECH_BOOSTS)) {
      if (t.includes(key)) {
        for (const [dim, boost] of Object.entries(boosts)) {
          dims[dim] = Math.min(5, dims[dim] + boost);
        }
        break; // only apply first matching key per tool
      }
    }
  }
  return dims;
}

// Stage name heuristics (mirrors real app's inferStageScores)

function inferStageDimensions(stageName, baseDims) {
  const n = stageName.toLowerCase();
  const s = { ...baseDims };

  // L2C patterns
  if (/lead|prospect|qualif|opportun|pipeline/.test(n)) {
    s.integration = Math.min(5, s.integration + 0.7);
    s.data        = Math.min(5, s.data + 0.4);
  }
  if (/quote|cpq|price|configur|proposal/.test(n)) {
    s.processDefinition = Math.min(5, s.processDefinition + 0.6);
    s.integration       = Math.max(1, s.integration - 0.2);
  }
  if (/contract|agreement|legal|negotiat/.test(n)) {
    s.integration       = Math.max(1, s.integration - 0.4);
    s.processDefinition = Math.min(5, s.processDefinition + 0.3);
  }
  if (/order|fulfil|deliver|ship/.test(n)) {
    s.integration = Math.min(5, s.integration + 0.5);
    s.data        = Math.min(5, s.data + 0.3);
  }
  if (/invoice|bill|statement/.test(n)) {
    s.processDefinition = Math.min(5, s.processDefinition + 0.4);
    s.data              = Math.min(5, s.data + 0.5);
  }
  if (/collect|cash|payment|receiv|ar\b/.test(n)) {
    s.pain = Math.min(5, s.pain + 0.3);
    s.data = Math.min(5, s.data + 0.2);
  }

  // H2R patterns
  if (/recruit|hire|source|talent|acquis/.test(n)) {
    s.data = Math.min(5, s.data + 0.3);
    s.integration = Math.min(5, s.integration + 0.2);
  }
  if (/onboard/.test(n)) {
    s.processDefinition = Math.min(5, s.processDefinition + 0.5);
    s.adoption          = Math.max(1, s.adoption - 0.3);
  }
  if (/perform|review|apprais|feedback/.test(n)) {
    s.adoption          = Math.max(1, s.adoption - 0.5);
    s.processDefinition = Math.min(5, s.processDefinition + 0.3);
  }
  if (/learn|train|develop|l&d/.test(n)) {
    s.adoption = Math.min(5, s.adoption + 0.4);
  }
  if (/pay|payroll|compensat|benefit/.test(n)) {
    s.processDefinition = Math.min(5, s.processDefinition + 0.8);
    s.data              = Math.min(5, s.data + 0.5);
  }
  if (/offboard|exit|terminat|separat/.test(n)) {
    s.processDefinition = Math.max(1, s.processDefinition - 0.3);
    s.adoption          = Math.max(1, s.adoption - 0.3);
  }

  return s;
}

function compositeScore(dims) {
  return Object.entries(DIM_WEIGHTS).reduce((sum, [k, w]) => sum + (dims[k] || 0) * w, 0);
}

function compositeToPhase(c) {
  if (c >= 3.8) return 'Phase 1';
  if (c >= 2.8) return 'Phase 2';
  if (c >= 1.8) return 'Phase 3';
  return 'Backlog';
}

// Activity fallback rating (mirrors real app)

function activityFallbackRating(activityType, dims) {
  const { pain, data, processDefinition, integration, adoption } = dims;
  const t = (activityType || '').toUpperCase();

  if (t === 'INTEGRATION') {
    if (integration >= 4.5 && data >= 4.0) return 'AUTOMATED';
    if (integration >= 3.5) return 'PARTIAL';
    if (integration < 2.0) return 'NOT_IN_PLACE';
    return 'MANUAL';
  }
  if (t === 'ANALYTICS') {
    if (data >= 4.5) return 'AUTOMATED';
    if (data >= 3.0) return 'PARTIAL';
    if (data < 2.0) return 'NOT_IN_PLACE';
    return 'MANUAL';
  }
  if (t === 'APPROVAL') {
    if (processDefinition >= 4.5 && adoption >= 3.5) return 'AUTOMATED';
    if (processDefinition >= 2.8) return 'PARTIAL';
    return 'MANUAL';
  }
  if (t === 'HUMAN') {
    return (adoption >= 4.0 && processDefinition >= 4.0) ? 'PARTIAL' : 'MANUAL';
  }
  if (t === 'SYSTEM') {
    if (data >= 4.0 && integration >= 3.5) return 'AUTOMATED';
    if (data >= 2.8 || integration >= 2.8) return 'PARTIAL';
    return 'MANUAL';
  }
  // Generic
  const c = compositeScore(dims);
  if (c >= 4.2) return 'AUTOMATED';
  if (c >= 3.2) return 'PARTIAL';
  if (c >= 2.0) return 'MANUAL';
  return 'NOT_IN_PLACE';
}

// Deterministic score computation

function computeStageScore(activities, stageDims) {
  if (!activities || activities.length === 0) return 0;
  const scored = activities.map(a => {
    const r = (a.rating && RATING_SCORE[a.rating] !== undefined)
      ? a.rating
      : activityFallbackRating(a.type, stageDims);
    return RATING_SCORE[r];
  });
  return Math.round(scored.reduce((s, v) => s + v, 0) / scored.length);
}

// Route

export async function POST(req) {
  try {
    const { processName, stages, techStack, processContext } = await req.json();

    const techList = Object.values(techStack || {}).flat().filter(t => t && t !== 'None');
    const techDisplay = techList.join(', ') || 'no specific platforms identified';

    // Compute dimension scores per stage (deterministic)
    const baseDims = inferBaseDimensions(techList);
    const stageData = (stages || []).map(stage => {
      const dims = inferStageDimensions(stage.name, baseDims);
      const composite = compositeScore(dims);
      return { ...stage, dims, composite, phase: compositeToPhase(composite) };
    });

    const contextSection = processContext
      ? `\nAdditional process context:\n${processContext.slice(0, 1500)}`
      : '';

    const result = await requestLlm({
      systemPrompt:
        'You are a senior enterprise automation consultant performing a rigorous process discovery. Apply the scoring methodology exactly as specified. Return only valid JSON -- no markdown, no explanation.',

      userPrompt: `Assess automation coverage for **${processName}** on tech stack: ${techDisplay}.${contextSection}

## MANDATORY SCORING METHODOLOGY

**Rating scale** -- use ONLY these four values:
- NOT_IN_PLACE = 0   (no automation, activity is broken or absent)
- MANUAL = 25        (entirely human effort, no system support)
- PARTIAL = 60       (some tool support but significant manual steps remain)
- AUTOMATED = 100    (system-driven, minimal human touch)

**Stage coverage %** = arithmetic mean of all activity scores using 0/25/60/100

**Activity rating rules by type:**
- INTEGRATION (APIs, syncs, data handoffs): integration>=4.5 AND data>=4.0->AUTOMATED; integration>=3.0 OR data>=3.0->PARTIAL; integration<2.0->NOT_IN_PLACE; else MANUAL
- ANALYTICS (reporting, forecasting, dashboards): data>=4.5->AUTOMATED; data>=2.8->PARTIAL; data<1.8->NOT_IN_PLACE; else MANUAL
- APPROVAL (sign-offs, workflow gates, notifications): processDefinition>=4.0 AND adoption>=3.0->AUTOMATED; processDefinition>=2.8->PARTIAL; else MANUAL
- HUMAN (negotiations, relationships, judgment calls): adoption>=4.0 AND processDefinition>=4.0->PARTIAL; else MANUAL
- SYSTEM (data entry, capture, enrichment, updates): data>=4.0 AND integration>=3.5->AUTOMATED; data>=2.8 OR integration>=2.8->PARTIAL; else MANUAL

**Global rules:**
- If pain>=4.0 AND any other score<2.5 -> downgrade lowest-rated activities to NOT_IN_PLACE
- **VARIATION IS MANDATORY**: never assign identical ratings to all activities in a process step -- ensure >=20% spread

## PRE-COMPUTED DIMENSION SCORES (apply these -- do not invent your own)
${stageData.map(s =>
  `**${s.name}** [${s.id}]: pain=${s.dims.pain.toFixed(1)}, data=${s.dims.data.toFixed(1)}, processDef=${s.dims.processDefinition.toFixed(1)}, integration=${s.dims.integration.toFixed(1)}, adoption=${s.dims.adoption.toFixed(1)} -> composite=${s.composite.toFixed(2)} -> ${s.phase}`
).join('\n')}

## TASK
For each process step, identify 4-6 realistic activities that occur in **${processName}**. Apply the rules above using the pre-computed dimension scores to rate each activity. Compute coverage as the mean.

Return JSON (no markdown):
{
  "overallScore": <mean of all stage scores, integer>,
  "executiveSummary": "<3-4 sentences: current automation maturity, the single biggest optimization gap, top opportunity with quantified business impact, and recommended first action>",
  "stageScores": [
    {
      "stageId": "<id from list>",
      "stageName": "<name>",
      "score": <mean of activity scores, integer 0-100>,
      "priority": "<HIGH if score<40, MEDIUM if 40-65, LOW if>65>",
      "phase": "<Phase 1|Phase 2|Phase 3|Backlog>",
      "activities": [
        { "name": "<activity>", "type": "<INTEGRATION|ANALYTICS|APPROVAL|HUMAN|SYSTEM>", "rating": "<rating>", "score": <0|25|60|100> }
      ],
      "manualTasks": ["<top 2-3 manual/broken tasks>"],
      "automatedItems": ["<1-3 already automated items, or empty array if none>"],
      "gap": "<one sentence: the single most impactful optimization gap in this process step>",
      "dimensionScores": { "pain": <float>, "data": <float>, "processDefinition": <float>, "integration": <float>, "adoption": <float> }
    }
  ],
  "insights": [
    { "type": "Opportunity", "text": "<specific, quantified optimization target tied to a named process step>" },
    { "type": "Risk",        "text": "<specific business risk if top optimization gap is not addressed>" },
    { "type": "Action",      "text": "<immediate recommended action with expected outcome>" },
    { "type": "Opportunity", "text": "<second improvement opportunity in a different process step>" },
    { "type": "Watch",       "text": "<metric or trend to monitor post-implementation>" }
  ]
}`,
      maxTokens: 5000,
    });

    // Deterministic score override
    if (result && Array.isArray(result.stageScores) && result.stageScores.length > 0) {
      // Merge back pre-computed dimension scores and recompute each stage score deterministically
      result.stageScores = result.stageScores.map(s => {
        const sd = stageData.find(x => x.id === s.stageId);
        const stageDims = sd ? sd.dims : baseDims;

        // Recompute score from activities using deterministic rating logic
        const deterministicScore = (s.activities && s.activities.length > 0)
          ? computeStageScore(s.activities, stageDims)
          : Math.round(Math.max(0, Math.min(100, s.score)));

        return {
          ...s,
          score: deterministicScore,
          phase: sd ? sd.phase : s.phase,
          dimensionScores: sd
            ? { pain: +sd.dims.pain.toFixed(1), data: +sd.dims.data.toFixed(1), processDefinition: +sd.dims.processDefinition.toFixed(1), integration: +sd.dims.integration.toFixed(1), adoption: +sd.dims.adoption.toFixed(1) }
            : s.dimensionScores,
        };
      });

      // Overall = deterministic mean of stage scores
      result.overallScore = Math.round(
        result.stageScores.reduce((sum, s) => sum + s.score, 0) / result.stageScores.length
      );
    }

    // Benchmark data (LevelShift database stats -- mock numbers for demo)
    const overallScore = result ? result.overallScore : 50;
    const industryAvgAutomation = overallScore > 70 ? 55 : 62;
    result.benchmarkData = {
      processCount: 127,
      companyCount: 89,
      industryAvgAutomation,
      industryAvgSla: '2.3 days',
      industryAvgManualSteps: 5.2,
      improvementPotential: '35-40%',
    };

    // Industry comparison via second LLM call
    try {
      const comparisonResult = await requestLlm({
        systemPrompt:
          'You are a senior enterprise automation consultant. Return only valid JSON -- no markdown, no explanation.',
        userPrompt: `Based on a score of ${overallScore}% for the ${processName} process, provide a brief industry comparison in JSON format with these exact fields:
- currentState: array of exactly 3 strings describing the current automation state
- bestPractice: array of exactly 3 strings describing industry best practices for this process
- gaps: array of exactly 3 strings describing key optimization gaps compared to best-in-class
- benchmark: one of exactly these strings -- "Above Average", "Average", or "Below Average" -- based on the score (Above Average if score > 70, Average if 45-70, Below Average if < 45)

Return only the JSON object, no markdown.`,
        maxTokens: 800,
      });

      result.industryComparison = comparisonResult;
    } catch (compErr) {
      // Fallback static industry comparison if second LLM call fails
      const benchmarkLabel = overallScore > 70 ? 'Above Average' : overallScore >= 45 ? 'Average' : 'Below Average';
      result.industryComparison = {
        currentState: [
          `${processName} automation coverage is at ${overallScore}%, indicating ${overallScore > 70 ? 'a relatively mature' : 'an emerging'} automation posture.`,
          'Several process steps still rely on manual handoffs and human-driven data entry, increasing cycle time and error risk.',
          'Existing tooling provides partial coverage but lacks end-to-end orchestration across the full process.',
        ],
        bestPractice: [
          'Industry leaders achieve 80-90% automation coverage through integrated platforms and automation agents that handle routine process steps.',
          'Best-in-class organizations use real-time data pipelines and analytics to eliminate manual reporting and enable proactive decision-making.',
          'Top performers establish clear process ownership with Process Owners accountable for continuous improvement and automation adoption.',
        ],
        gaps: [
          'Integration between core systems remains fragmented, causing manual re-keying and data reconciliation at key process handoffs.',
          'Approval and notification workflows lack automated routing, resulting in delays and inconsistent process adherence.',
          'Analytics and reporting are largely manual, preventing timely visibility into process performance and improvement opportunities.',
        ],
        benchmark: benchmarkLabel,
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[discover]', err.message);
    return NextResponse.json({ error: 'Discovery failed. Please try again.' }, { status: 500 });
  }
}
