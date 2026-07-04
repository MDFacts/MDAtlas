# MDAtlas v1 Prototype — Design Spec

**Date:** 2026-07-03
**Status:** Approved by Nathan (design gate #2)
**Product:** MDAtlas on MDfacts.ai — interactive 3D body symptom assessment

## Goal

A deployable web prototype proving the core loop:

> Tap where it hurts on a 3D body → describe the pain → answer 5–8 smart
> branching questions → get risk-tiered possible explanations and next steps.

Real architecture with curated clinical content for 3 pilot regions. The LLM is
used only for plain-language prose, never for clinical branching.

## Positioning (regulatory)

MDAtlas is an AI-assisted symptom **assessment and education** tool. It never
presents definitive diagnoses. Every results surface carries:

- "Possible explanations, not a diagnosis" framing
- Care-level guidance (see Risk Tiers) with plain-language reasons
- Encouragement to seek qualified professional evaluation
- Prominent red-flag escalation when emergency criteria match

No PHI is stored in v1: all assessment state is session-only, in-memory.

## Tech Stack

| Concern | Choice |
| --- | --- |
| App | Vite + React 18 + TypeScript (strict) |
| 3D | three.js via @react-three/fiber + @react-three/drei |
| State | Zustand (immutable updates) |
| Styling | Tailwind CSS |
| Validation | zod on all content packs and LLM I/O |
| Tests | Vitest (engine/triage), Playwright smoke (happy path) |
| Deploy | Static site + one serverless function for LLM proxy |

## Architecture

Eight isolated units. Everything downstream of a body tap is driven by typed
JSON — the clinical engine has no UI or 3D dependency and can move server-side
unchanged.

### 1. BodyViewport (3D)

- R3F canvas: orbit rotate 360°, zoom, front/back flip.
- Procedural humanoid assembled from named region meshes (primary approach —
  license-free, guaranteed region mapping). A realistic GLB can replace it
  later because region mapping is data, not code.
- Raycast tap → `regionId`; tapped region glows; pain marker decal.
- Layer toggle v1: **skin / skeleton / organs** (three mesh sets). The full
  16-layer system is post-prototype.

### 2. Anatomy Map (data contract)

Static JSON: `regionId → { name, snomedTag, side, structuresByLayer }`.
This is the single contract between the 3D scene and clinical logic.

### 3. PainInput Panel

Pain types (aching, sharp, burning, stabbing, throbbing, tingling, numbness,
cramping, pressure), severity 1–10, onset, better/worse factors, radiation
(tap a second point).

### 4. Interview Engine (pure TS, zero UI)

- Input: `{ regionId, painProfile }`; walks a JSON decision tree from the
  region's content pack; each answer selects the next node.
- Deterministic, immutable state transitions, fully unit-tested.
- Output: structured `AssessmentResult` (answers, matched differentials with
  weights, triggered red flags).

### 5. Clinical Content Packs (3 pilot regions)

1. **Right lower abdomen** — appendicitis vs GI vs ovarian vs muscular paths
   (fever, pain on walking, nausea/vomiting, pregnancy possibility, relation
   to eating, blood in stool).
2. **Chest** — cardiac vs reflux vs musculoskeletal vs anxiety paths.
3. **Shoulder** — joint vs muscle vs referred-pain paths (surface / muscle /
   joint / bone depth question).

Each pack: question tree, differentials with weights, red-flag rules,
care-level rules. Packs are zod-validated JSON — adding a region adds data,
not code.

### 6. Risk Triage Output

Four tiers: **Emergency (go now) / Urgent care (today) / Primary care (this
week) / Self-care & monitor**. Ranked possibilities with likelihood and
"why" factors, red-flag callouts, suggested specialty and tests
(clearly labeled "general suggestions, not diagnostic orders").

### 7. LLM Prose Layer

- Provider-adapter interface; default adapter: Gemini 2.5 Flash (fast/cheap
  per Nathan); swappable to Claude/others.
- Used ONLY to phrase explanations and the doctor-summary paragraph from the
  structured result. Structured data in, prose out, zod-checked.
- **Offline mode:** templated prose generated locally so the demo never
  depends on an API key.

### 8. Doctor-Ready Export

Printable summary: symptom timeline, pain map snapshot, red flags,
differential list, suggested tests. Browser print → PDF in v1.

## Data Flow

```
tap → regionId → PainProfile → InterviewEngine(content pack)
    → AssessmentResult → TriageRenderer + LLM prose (optional)
    → DoctorExport
```

## Error Handling

- Content packs validated with zod at load; invalid pack fails loudly at build.
- LLM call: timeout + failure falls back to offline templated prose silently.
- Unmapped tap region → nearest mapped region or "select a highlighted area".

## Out of Scope (v1)

Accounts, health memory/trends, wearables, "what changed" mode, second-opinion
lenses, full 16 anatomy layers, finger-drawn heat maps (tap + radius in v1),
HIPAA infrastructure (no PHI stored).

## Testing

- Vitest: interview engine branching (every path per region), triage rules,
  red flags tested exhaustively per region.
- Playwright smoke: tap right-lower-abdomen → complete interview → triage
  screen shows appendicitis path + urgent tier → export renders.

## Success Criteria

1. `npm run build` and all tests green.
2. Happy path works in a real browser: tap → interview (≤8 questions) →
   risk-tiered results → printable export.
3. Zero API keys required to run the demo.
