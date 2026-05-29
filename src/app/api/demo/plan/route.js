import { NextResponse } from 'next/server';
import { requestLlm } from '@/lib/llm';

// Maps discovery phase → activation plan phase number
// Phase 1 stages (composite≥3.8) → already partially automated → Phase 1 quick wins
// Phase 2 stages (composite 2.8-3.8) → structural gaps → Phase 2
// Phase 3/Backlog stages (composite<2.8) → deep gaps → Phase 3
function phaseToNumber(phase) {
  if (phase === 'Phase 1') return 1;
  if (phase === 'Phase 2') return 2;
  return 3;
}

export async function POST(req) {
  try {
    const { processName, techStack, discovery } = await req.json();

    const techList = Object.values(techStack || {})
      .flat()
      .filter(t => t && t !== 'None')
      .join(', ') || 'standard enterprise tools';

    const stages = discovery?.stageScores || [];

    // Build rich per-stage context using the dimension scores and activities from discovery
    const stageContext = stages.map(s => {
      const dims = s.dimensionScores || {};
      const activities = (s.activities || []).filter(a => a.rating === 'MANUAL' || a.rating === 'NOT_IN_PLACE');
      const automatedActivities = (s.activities || []).filter(a => a.rating === 'AUTOMATED' || a.rating === 'PARTIAL');
      return `**${s.stageName}** [${s.stageId}] — Score: ${s.score}% | Priority: ${s.priority} | Phase: ${s.phase || 'Phase 2'}
  Dimensions: pain=${dims.pain || '?'}, data=${dims.data || '?'}, processDef=${dims.processDefinition || '?'}, integration=${dims.integration || '?'}, adoption=${dims.adoption || '?'}
  Gap: ${s.gap || 'Unknown'}
  Manual/broken activities: ${activities.map(a => a.name).join(', ') || 'see manualTasks'}
  Already automated: ${automatedActivities.map(a => a.name).join(', ') || 'minimal'}`;
    }).join('\n\n');

    // Determine natural phase placement based on discovery phases
    const phase1Stages = stages.filter(s => s.phase === 'Phase 1' || (s.score >= 50 && s.priority !== 'HIGH'));
    const phase2Stages = stages.filter(s => s.phase === 'Phase 2' || (s.score >= 30 && s.score < 50));
    const phase3Stages = stages.filter(s => s.phase === 'Phase 3' || s.phase === 'Backlog' || s.score < 30);

    const result = await requestLlm({
      systemPrompt:
        'You are a senior AI activation planner specialising in enterprise process automation. You design rigorous, phased AI agent roadmaps grounded in real gap analysis. Return only valid JSON — no markdown, no explanation.',

      userPrompt: `Generate a 3-phase AI Activation Plan for **${processName}**.

## CONTEXT
Tech stack: ${techList}
Overall automation score: ${discovery?.overallScore}%
Stages assessed: ${stages.length}

## DETAILED STAGE ANALYSIS
${stageContext}

## PHASE GUIDANCE (from gap analysis)
- **Phase 1 candidates** (existing infrastructure to build on): ${phase1Stages.map(s => s.stageName).join(', ') || 'none identified'}
- **Phase 2 candidates** (structural gaps, medium effort): ${phase2Stages.map(s => s.stageName).join(', ') || 'all stages'}
- **Phase 3 candidates** (deep gaps, requires new capability): ${phase3Stages.map(s => s.stageName).join(', ') || 'none identified'}

## AGENT DESIGN RULES
- **Category "Native"**: agent uses built-in features of an existing platform (e.g. Salesforce Einstein, SAP workflow rules, Power Automate flow)
- **Category "Custom"**: agent requires custom development, API integration, or a new AI model
- **Effort** (choose based on activity type from the gap analysis):
  - Integration/SYSTEM activities with existing platform → "1-2 weeks"
  - Cross-system workflows → "2-4 weeks"
  - Analytics/new data pipelines → "1-2 months"
  - New AI models, complex orchestration → "2-3 months"
- **Impact**: tie directly to activities rated MANUAL or NOT_IN_PLACE in the gap analysis
- **Rationale**: must reference the specific manual activity being automated and the quantified business benefit (time saved, error rate, cycle time)
- Each agent must target a specific activity from the gap analysis — not generic descriptions
- Platform must reference a specific tool from the tech stack

## PHASE RULES
- Phase 1 (Weeks 1–6): 3–5 agents — target PARTIAL activities where a small push achieves AUTOMATED; prefer Native agents on existing platforms
- Phase 2 (Weeks 7–16): 4–6 agents — target MANUAL activities in core process stages; mix of Native and Custom
- Phase 3 (Weeks 17–24): 3–5 agents — target NOT_IN_PLACE and deepest MANUAL gaps; advanced AI/ML, autonomous decisions

Return JSON:
{
  "summary": "<3 sentences: overall plan rationale, expected business impact with numbers, total timeline>",
  "phases": [
    {
      "number": 1,
      "name": "Quick Wins",
      "subtitle": "Activate existing platform intelligence",
      "timeframe": "Weeks 1–6",
      "description": "<2 sentences describing the Phase 1 strategy and why these agents come first>",
      "agents": [
        {
          "id": "a1",
          "name": "<Agent Name>",
          "category": "Native",
          "platform": "<specific tool from tech stack>",
          "stageId": "<exact stageId from analysis>",
          "stageName": "<exact stageName>",
          "effort": "<one of: 1-2 weeks | 2-4 weeks | 1-2 months | 2-3 months>",
          "impact": "<High | Medium | Low>",
          "rationale": "<1-2 sentences: what manual activity this automates, what business outcome it delivers>"
        }
      ]
    },
    {
      "number": 2,
      "name": "Core Transformation",
      "subtitle": "Eliminate the highest-volume manual work",
      "timeframe": "Weeks 7–16",
      "description": "<Phase 2 strategy>",
      "agents": []
    },
    {
      "number": 3,
      "name": "Advanced Autonomy",
      "subtitle": "Close the deepest gaps with new AI capability",
      "timeframe": "Weeks 17–24",
      "description": "<Phase 3 strategy>",
      "agents": []
    }
  ]
}

Valid stageIds: ${stages.map(s => s.stageId).join(', ')}`,
      maxTokens: 5000,
    });

    // Compute totalAgents from actual phases
    if (result && result.phases) {
      result.totalAgents = result.phases.reduce((sum, ph) => sum + (ph.agents?.length || 0), 0);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[plan]', err.message);
    return NextResponse.json({ error: 'Plan generation failed. Please try again.' }, { status: 500 });
  }
}
