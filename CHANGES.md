# ShiftAI — Session Change Log

> Product: **ShiftAI** (formerly "Discovery Studio")  
> Session date: 2026-06-01  
> Branch: `main`

---

## Overview

This session redesigned and extended the demo for CEO-level sales presentations targeting healthcare, manufacturing, and enterprise clients. The core change is a shift from a process-first to a **company-first discovery flow**, with richer context capture, industry benchmarking, and cleaner language throughout.

---

## 1. Branding

| Location | Before | After |
|---|---|---|
| `layout.jsx` page title | `LevelShift — Discovery Studio` | `ShiftAI - Process Intelligence` |
| `Header.jsx` product name | `Discovery Studio` | `ShiftAI` |
| `Header.jsx` sub-label | `Operational Intelligence` | `Process Intelligence` |
| `ChatThread.jsx` avatar badge | `DS` | `SA` |
| `roadmap/page.jsx` back link | `← Back to Discovery Studio` | `Back to ShiftAI` |

---

## 2. New API Route — `/api/demo/company`

**File:** `src/app/api/demo/company/route.js` *(new)*

LLM-powered company profiling endpoint called before any process is selected. Returns:

- `industry` — specific industry name (e.g. "Commercial Insurance")
- `companyType` — Fortune 500 / Large Enterprise / Mid-Market / SME
- `companySummary` — 2-3 sentence description
- `governanceFrameworks` — array of `{ name, source, relevance }` (SOC 2, HIPAA, ISO 27001, SOX, GDPR, etc.)
- `inferredTechStack` — array of `{ name, category, confidence }`
- `recommendedProcesses` — 3 ordered process IDs with reasons
- `keyFacts` — 3 verifiable facts
- `dataSource` — attribution string for governance badges

---

## 3. Landing Page — Company-First Hero Flow

**File:** `src/app/page.jsx` *(complete rewrite)*

The landing page now has a **3-state hero** instead of a single process-input form:

### State 1: Company Input
- Prominent company name input with `Building2` icon
- Placeholder: `e.g. Pfizer, Walmart, JPMorgan, Siemens...`
- Shield note: "Company data sourced from public records"
- Footer stat: "847 pre-built processes across 234 organisations and 18 industries"

### State 2: Profiling Spinner
- Animated 4-step progress while calling `/api/demo/company`
- Steps: Scanning records → Identifying industry → Mapping governance → Generating recommendations

### State 3: Profiled — Company Card + Process Selection
- **Company profile card**: name, industry badge, company type, employee count, inferred tech stack tags, 2-3 sentence summary
- **Governance & Compliance badges**: each badge shows `{Framework name} via {Issuing body}`, hoverable tooltip shows relevance. Sources attributed below.
- **LevelShift Template banner**: "847 pre-built processes from 234 companies across 18 industries — {Industry} benchmarks loaded"
- **Process cards grid** (6 cards): each shows name, tagline, colour accent bar, recommended badge + reason (if LLM recommended it), plus stats (company count, avg automation %, template count)
- **Custom process input**: freetext field (e.g. "Lead to Order", "Claims Processing") with inline submit

### New hook method: `initWithCompany()`
- Called when a process card is selected on the profiled state
- Skips the org-context card and research steps entirely (company already profiled)
- Seeds the chat with the company + process context and goes directly to tool selection

---

## 4. Terminology Changes (Global)

| Old term | New term | Context |
|---|---|---|
| Process Assessment | Process Discovery | Initial analysis phase |
| Audit / audit | Discover / discovery | All user-facing strings |
| AI Agent | Automation Agent | Roadmap and analysis sections |
| Sub-process | Process Step / Activity | Stage-level language |
| Pain Points | Optimization Gaps | Stat card label |
| Automation Opportunities | Automation Targets | Discovery language |
| Architecture Diagram | Process Execution Blueprint | Progress step label |
| Input Options | Process Definition Methods | ContextInput header |
| New Audit | New Discovery | Reset button |
| AI Insights | Evaluation Insights | Analysis page collapsible |
| Stage-by-stage breakdown | Process Steps Breakdown | Section headings |
| AI Agents Planned (stat) | Automation Agents (stat) | Analysis stat card |

All `â€"` (corrupted em-dash), `â€™`, `Â·` encoding artifacts removed from all active-flow files.

---

## 5. Context Input — Major Upgrade

**File:** `src/components/discovery/ContextInput.jsx` *(rewrite)*

### Multi-select method cards
- `selected` changed from `string | null` → `string[]`
- Clicking a method **toggles** it — multiple methods can be active simultaneously
- Each selected method gets its own **expanded form stacked inline** with a labelled header
- Completed forms show a teal checkmark badge on the card and "Saved" in the form header
- Global **"Run Discovery with N sources"** button appears once any form is submitted

### Custom themed dropdown (replaces native `<select>`)
- Native `<select>` was rendering browser-default white dropdown in dark mode
- Replaced with `CustomSelect` component: fully themed button + animated `<ul>` list
- Respects dark/light mode, highlights active option in orange, closes on outside click

### Multi-API form
- Add up to N integrations simultaneously
- Per integration: platform dropdown (Salesforce, Dynamics 365, SAP, Oracle, Boomi, MuleSoft, Workday, ServiceNow, Custom API), endpoint field, API key/token field, individual test button
- "Add another integration" dashed button
- Submit button: "Use live data" if any connected, else "Continue with configured integrations"

### Structured Questionnaire (5 Discovery Dimensions)
Replaces the 5 plain text inputs with an accordion covering all PDF scoring dimensions:

| Dimension | Weight | Questions |
|---|---|---|
| Pain & Impact | 30% | Cycle time, error rate, manual effort |
| Data Readiness | 25% | Data location, API/export access |
| Process Definition | 20% | Documentation status, consistency |
| Integration Landscape | 15% | Current integration state |
| Adoption Readiness | 10% | Leadership buy-in, team readiness |

- Click-to-select option buttons (no free text)
- Progress bar + answered count
- Auto-advances to next accordion section when all questions in current section answered
- Submit button shows remaining question count until complete

---

## 6. Analysis Page — Industry Benchmarking

**File:** `src/app/analysis/page.jsx` *(major additions)*

### New: Industry Benchmark Section (`IndustryBenchmarkSection`)
Positioned between Executive Summary and Process Steps.

**Left panel — Performance vs Industry:**
- Automation coverage: yours vs industry average (with trend icon)
- Manual process steps: yours vs industry average
- Parallel execution paths: yours vs industry average
- Improvement Potential callout (orange card with % figure)

**Right panel — Risk & Opportunity Analysis:**
- Based on N processes in LevelShift database
- Four opportunity rows: automation opportunity %, time reduction, cost savings, error reduction potential
- Attribution: "Your opportunities align with these industry benchmarks"

All benchmark figures are derived algorithmically from the actual maturity score so they always tell a coherent story relative to the real analysis output.

### Other analysis page fixes
- Removed all encoding artifacts from legend labels and inline strings
- "New Audit" → "New Discovery"
- "AI Agents Planned" → "Automation Agents" (stat card)
- Phase label: "Quick wins — build momentum" (no em-dash)
- Stage card scores now show `-` instead of `·` separator

---

## 7. Analysis Progress

**File:** `src/components/discovery/AnalysisProgress.jsx`

Updated stage labels:
- `Deep Process Analysis` → `Deep Process Discovery`
- `Detecting automation gaps` → `Identifying optimization targets`
- `Building agent deployment plan` → `Scoping automation agent roadmap`
- `Generating optimisation model` → `Generating process execution blueprint`

---

## 8. Maturity Report — Simplified CTA Card

**File:** `src/components/discovery/MaturityReport.jsx` *(rewrite)*

Replaced the detailed report preview (overall maturity bars, stage breakdown, bottleneck card) with a minimal completion card:

- Pulsing teal "Analysis Ready" indicator
- Process name + maturity score + weekly leakage on one compact line
- **Primary CTA**: "Open Full Analysis Report" → opens `/analysis` in new tab (direct user click, never blocked by popup blockers)
- **Secondary CTA**: "View Automation Roadmap" → opens `/roadmap` in new tab

No auto-open, no `useEffect`, no detail dump.

---

## 9. Bug Fixes

### `Object.fromEntries` on reduce result (runtime crash)
**File:** `src/hooks/useConversation.js`  
**Symptom:** `TypeError: object is not iterable` when selecting a process from the profiled hero.  
**Cause:** `initWithCompany` called `Object.fromEntries()` on the result of `.reduce()` — but `.reduce()` already returns a plain object, not an iterable of `[key, value]` pairs.  
**Fix:** Removed `Object.fromEntries()` wrapper; `.reduce()` result used directly.

### Analysis progress completes but nothing happens
**File:** `src/hooks/useConversation.js`  
**Symptom:** Progress bar hits 100%, `onComplete` fires, chat shows nothing.  
**Cause:** `runAnalysis` was changed to only call `window.open('/analysis')` but removed `addMessage({ type: 'report' })`. No message → no `MaturityReport` card mounted in chat.  
**Fix:** Restored `addMessage({ role: 'assistant', type: 'report' })` in `runAnalysis`.

### `window.open` blocked by popup blocker
**File:** `src/components/discovery/MaturityReport.jsx`  
**Cause:** `window.open` called from a `setTimeout` chain is treated as non-interactive by browsers and blocked.  
**Fix:** Moved tab-open to direct `onClick` handlers on CTA buttons (user gesture → never blocked).

### Focus border too prominent on custom process input
**File:** `src/app/page.jsx`  
**Symptom:** Bright orange full-card border on focus clashed with the card's existing border.  
**Fix:**
- Removed `focus-within:border-[#F5A623]` from inner `border-b` div (no underline flash inside the card)
- Added `focus-within:border-[#F5A623]/35` to the outer card (subtle, barely-visible hint)
- Added `focus:outline-none ring-0 focus:ring-0` to inputs to suppress browser-native outlines
- Main company input and chat bar: toned down to `focus-within:border-[#F5A623]/60`

### Native select dropdown ignores dark theme
**File:** `src/components/discovery/ContextInput.jsx`  
**Symptom:** Platform dropdown in API Integration form rendered with browser white background in dark mode.  
**Fix:** Replaced native `<select>` with custom `CustomSelect` component (fully themed, animated dropdown list).

### Definition method is single-select, not multi-select
**File:** `src/components/discovery/ContextInput.jsx`  
**Symptom:** Clicking "Document Upload" after "API Integration" replaced the selection — only one form shown at a time.  
**Fix:** `selected` changed to `string[]`, method cards toggle in/out, all selected forms render stacked, global confirm button aggregates all submitted data.

---

## Files Changed

| File | Type |
|---|---|
| `src/app/api/demo/company/route.js` | New |
| `src/app/page.jsx` | Rewrite |
| `src/app/analysis/page.jsx` | Major update |
| `src/hooks/useConversation.js` | Major update |
| `src/components/discovery/ContextInput.jsx` | Rewrite |
| `src/components/discovery/MaturityReport.jsx` | Rewrite |
| `src/components/discovery/ChatThread.jsx` | Minor (avatar badge) |
| `src/components/discovery/AnalysisProgress.jsx` | Minor (labels) |
| `src/components/discovery/OrgContextCard.jsx` | Minor (copy) |
| `src/components/layout/Header.jsx` | Minor (branding) |
| `src/app/layout.jsx` | Minor (title) |
| `src/app/roadmap/page.jsx` | Minor (back link) |
