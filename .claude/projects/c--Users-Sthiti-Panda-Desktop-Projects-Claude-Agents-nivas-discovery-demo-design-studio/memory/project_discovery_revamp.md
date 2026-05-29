---
name: project-discovery-revamp
description: Discovery Studio UI revamp — new design system, chat-based flow, component architecture
metadata:
  type: project
---

Discovery Studio landing page has been completely revamped to a chat-based flow.

**Why:** Full UI revamp from form wizard to conversational discovery interface. Backend API routes (`/api/demo/*`) are unchanged.

**How to apply:** All new UI lives in `src/components/discovery/` and `src/hooks/useConversation.js`. Old multi-step pages (`/setup`, `/input`, `/discover`) still exist for backward compat but are no longer the primary UX path.

## New architecture

- **Design tokens:** `#0B0B0E` dark bg, `#F5A623` amber accent, `#30D5C8` teal, Cormorant Garamond serif, Inter sans, JetBrains Mono
- **Theme:** `src/lib/theme.js` — ThemeContext + useTheme hook, defaults dark, key `ls-theme`
- **Fonts:** Google Fonts in `layout.jsx` — Inter, Cormorant Garamond, JetBrains Mono (+ legacy IBM Plex)
- **Tool categories:** `src/lib/toolCategories.js` — 6 categories (CRM, ERP, HR, Marketing, Integration, ITSM), 6 tools each
- **Process templates:** `src/lib/processTemplates.js` — 7 templates + custom
- **Animations:** `src/lib/animations.js` — framer-motion variants (fadeUp, staggerContainer, etc.)

## Conversation flow (useConversation.js)

1. User types process intent → detect processId, extract company or ask
2. `doResearch()` → `/api/demo/research` → ToolSelector appears in chat
3. `confirmTools()` → ContextInput appears in chat
4. `confirmContext()` → AnalysisProgress appears (runs `/api/demo/discover` + `/api/demo/plan`)
5. `runAnalysis()` → MaturityReport appears with "View Full Roadmap" → opens `/plan`

## Key files

- `src/app/page.jsx` — new DiscoveryPage (hero → chat transition)
- `src/hooks/useConversation.js` — state machine for full conversation
- `src/components/discovery/ChatThread.jsx` — message renderer
- `src/components/discovery/ToolSelector.jsx` — tabbed tool grid
- `src/components/discovery/ContextInput.jsx` — API/doc/questionnaire/benchmark forms
- `src/components/discovery/AnalysisProgress.jsx` — staged analysis progress
- `src/components/discovery/MaturityReport.jsx` — score cards + CTA
- `src/components/layout/Header.jsx` — new header (replaces TopBar.jsx)
- `src/components/legacy/StepContext.jsx` — StepIndicator/StoryContext for old pages
