# Dialectic

**Computational Argumentation & Evidence-Grounded Reasoning Engine**

*TypeScript · Next.js · Vercel AI SDK · Zod · D3.js · SSE · Tavily*

Dialectic is a research-oriented system that subjects propositions to rigorous, structured analysis — decomposing claims, grounding them in external evidence, and evaluating argument quality through deterministic scoring rather than LLM judgment calls.

---

## What It Does

### Computational Argumentation

Decomposes any proposition into discrete **claims** and **assumptions**, constructs structured [Toulmin arguments](https://en.wikipedia.org/wiki/Toulmin_method) (claim → grounds → warrant → backing → qualifier → rebuttal), and maps **support**, **attack**, and **contradiction** relationships between arguments in a typed graph.

### Evidence-Grounding Pipeline

Tool-using agents retrieve external evidence via **Tavily web search** and link individual claims to source provenance. Deterministic code — not the LLM — evaluates evidence quality (source taxonomy scoring), argument completeness (Toulmin field validation), corroboration, uncertainty, and conflicts.

### Epistemic Evaluation Layer

Identifies unsupported claims, missing warrants, conflicting evidence, stale sources (exponential freshness decay), and high-impact uncertainties. Makes model-generated conclusions **inspectable** and experimentally testable.

### Agent Execution Pipeline

A typed, observable pipeline with:
- **Structured outputs** — all LLM calls use Zod schemas for guaranteed shape
- **SSE event streaming** — real-time stage progression to the client
- **Tool-call tracing** — full execution trace with cost/token tracking
- **Adversarial cross-examination** — agents challenge each other's weakest arguments
- **Experiment generation** — converts unresolved assumptions into falsifiable validation tests

---

## Architecture

```
src/
├── app/
│   ├── api/session/         # Session creation & SSE streaming endpoints
│   └── page.tsx             # Proposition input UI
├── components/
│   ├── dialectic/
│   │   └── SessionView.tsx  # Real-time analysis dashboard
│   └── ui/                  # Shared UI primitives
├── lib/
│   ├── engine/
│   │   ├── types.ts         # Core domain types (Evidence, Claim, ToulminArgument, etc.)
│   │   ├── pipeline.ts      # Composable Pipeline class with retry & backoff
│   │   ├── session.ts       # Session factory
│   │   └── events.ts        # SSE ReadableStream emitter
│   ├── nodes/               # Pipeline stages (each is a PipelineNode)
│   │   ├── decompose.ts     # Claim & assumption extraction
│   │   ├── research.ts      # Tavily evidence retrieval + LLM classification
│   │   ├── steelman.ts      # Strongest-case reconstruction
│   │   ├── recruit.ts       # Dynamic agent recruitment
│   │   ├── critique.ts      # Formal Toulmin critique per agent
│   │   ├── cross-examine.ts # Adversarial cross-examination
│   │   ├── score.ts         # Deterministic scoring + graph construction
│   │   └── synthesize.ts    # Final verdict + experiment generation
│   ├── argumentation/       # Deterministic evaluation (no LLM)
│   │   ├── evidence-scorer.ts    # Source quality, freshness decay, composite strength
│   │   ├── toulmin-validator.ts  # Structural completeness & evidence strength
│   │   ├── conflict-detector.ts  # Contradiction detection & consensus ratio
│   │   └── scoring.ts            # DecisionProfile & EpistemicAudit computation
│   ├── schemas.ts           # Zod schemas for all structured outputs
│   ├── models/              # Multi-provider LLM configuration
│   └── tools/               # Tool registry (Tavily, mock search)
```

---

## Pipeline Stages

| # | Stage | Status | What happens |
|---|-------|--------|-------------|
| 1 | **Decompose** | `decomposing` | Extracts 5–8 claims and 3–5 hidden assumptions from the proposition |
| 2 | **Research** | `researching` | Retrieves evidence via Tavily, classifies relevance, computes quality scores |
| 3 | **Steelman** | `steelmanning` | Reconstructs the strongest possible version of the proposition |
| 4 | **Recruit** | `recruiting` | Dynamically recruits diverse expert agents with distinct personas |
| 5 | **Critique** | `critiquing` | Each agent builds a formal Toulmin argument for/against claims |
| 6 | **Cross-Examine** | `cross_examining` | Agents challenge each other's weakest arguments |
| 7 | **Score** | `scoring` | Deterministic computation of decision profile, epistemic audit, and graph |
| 8 | **Synthesize** | `synthesizing` | Final verdict + ranked experiments to resolve remaining uncertainties |

---

## Key Design Decisions

- **Deterministic scoring** — confidence, quality, and readiness scores are computed by code (`argumentation/`), never delegated to an LLM
- **Toulmin model** — every argument must have claim, grounds, warrant, backing, qualifier, and rebuttal; completeness is measured as % of fields populated
- **Source quality taxonomy** — `primary` (0.9) > `calculation` (0.95) > `academic` (0.85) > `aggregator` (0.7) > `user_input` (0.5) > `opinion` (0.4)
- **Freshness decay** — `exp(-daysOld / 365)` penalizes stale evidence
- **Graceful degradation** — pipeline continues past failed nodes after 3 retries with exponential backoff
- **Multi-provider LLM** — supports Google (Gemini), OpenAI, Groq, and OpenRouter via Vercel AI SDK

---

## Progress

### Aim

Build a complete **computational argumentation platform** where any proposition can be submitted, rigorously decomposed, evidence-grounded, adversarially challenged, and scored — with full observability into the reasoning process and actionable experiments to resolve remaining uncertainties.

### Current Status — ~70% Complete

| Component | Status | Notes |
|-----------|--------|-------|
| Core type system | ✅ Done | Full domain model: Evidence, Claim, ToulminArgument, Assumption, Experiment, Agent, Graph, etc. |
| Zod structured output schemas | ✅ Done | All 7 schemas (ClaimExtraction, AssumptionExtraction, AgentRecruitment, ToulminCritique, CrossExamination, Steelman, Synthesis) |
| Pipeline engine | ✅ Done | Composable node architecture with retry, backoff, and SSE streaming |
| Decomposition node | ✅ Done | Claim + assumption extraction with Zod-validated output |
| Research / evidence grounding | ✅ Done | Tavily integration, LLM classification, quality scoring |
| Steelman node | ✅ Done | Strongest-case reconstruction |
| Agent recruitment | ✅ Done | Dynamic persona generation with objectives and change-mind criteria |
| Critique node | ✅ Done | Formal Toulmin argument construction per agent |
| Cross-examination node | ✅ Done | Adversarial challenge generation |
| Deterministic scoring | ✅ Done | Evidence scorer, Toulmin validator, conflict detector, consensus ratio |
| Experiment generation | ✅ Done | Converts uncertainties into falsifiable tests with cost/time estimates |
| SSE event streaming | ✅ Done | Real-time stage events via ReadableStream |
| Session UI (SessionView) | ✅ Done | Claims, agents, scores, verdict display |
| D3.js argument graph visualization | 🔲 Not started | Graph data structure exists; no visual renderer yet |
| Execution trace UI (cost/token display) | 🔲 Not started | Trace data is captured; no frontend display |
| User defense flow | 🔲 Not started | `awaiting_defense` status exists; no UI for user rebuttal |
| Epistemic audit UI | 🔲 Not started | Audit computed; not surfaced in frontend |
| Multi-mode analysis | 🔲 Not started | `AnalysisMode` type defined; no mode selector or presets |
| Assumption status tracking | ⚠️ Partial | Assumptions extracted and typed; validation loop not fully wired |
| Corroboration scoring | ⚠️ Partial | Placeholder (0.5); cross-evidence corroboration not implemented |
| Evidence ↔ Claim linking | ⚠️ Partial | Works via ID arrays; conflict detector uses `as any` casts |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An LLM API key (Google, OpenAI, Groq, or OpenRouter)
- Tavily API key (optional — falls back to mock search)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd Dialectic
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start analyzing propositions.

### Environment Variables

```env
LLM_PROVIDER=google          # google | openai | groq | openrouter
LLM_API_KEY=your-api-key
LLM_MODEL=gemini-2.5-flash   # Model ID for your provider
TAVILY_API_KEY=tvly-your-key  # Optional: enables real web search
MOCK_MODE=false               # true = runs without any API keys
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| LLM Integration | Vercel AI SDK (`ai`, `@ai-sdk/*`) |
| Schema Validation | Zod v4 |
| Evidence Retrieval | Tavily Search API |
| Visualization | D3.js v7 (planned) |
| Animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |

---

## License

Private — not yet open-sourced.
