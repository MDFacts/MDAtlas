# MDAtlas v1 Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deployable web prototype: tap a 3D body where it hurts → describe pain → 5–8 branching questions → risk-tiered explanations + doctor export.

**Architecture:** Pure-TS interview/triage engine driven by zod-validated JSON content packs, decoupled from a React Three Fiber 3D viewport via an anatomy-map data contract. LLM (adapter pattern, offline fallback) phrases prose only.

**Tech Stack:** Vite, React 18, TypeScript strict, @react-three/fiber + drei, Zustand, Tailwind, zod, Vitest, Playwright.

## Global Constraints

- No mutation anywhere — all state transitions return new objects (Nathan's global rule).
- Files ≤ ~400 lines; split by responsibility.
- No `console.log` in committed code.
- All external/content data validated with zod.
- No API key required to run the demo (offline prose fallback).
- Every results surface carries "possible explanations, not a diagnosis" copy.
- Conventional commits; no attribution footer.
- Node 22, npm.

## File Structure

```
src/
  clinical/
    types.ts              # PainProfile, Question, Differential, RedFlag, AssessmentResult, RiskTier
    contentPackSchema.ts  # zod schemas for content packs + anatomy map
    interviewEngine.ts    # pure functions: startInterview / answerQuestion / currentQuestion
    triage.ts             # computeAssessment: weights, red flags, tier resolution
    packs/
      rightLowerAbdomen.ts
      chest.ts
      shoulder.ts
      index.ts            # pack registry keyed by regionId, zod-validated at load
  anatomy/
    anatomyMap.ts         # regionId -> name, snomedTag, side, structuresByLayer
  scene/
    BodyViewport.tsx      # Canvas, controls, tap raycasting dispatch
    HumanBody.tsx         # procedural humanoid; meshes named by regionId
    bodyGeometry.ts       # capsule/sphere/lathe builders per region, per layer
    PainMarker.tsx        # glowing marker at tap point
  state/
    assessmentStore.ts    # Zustand: phase machine idle→pain→interview→results
  ui/
    PainInputPanel.tsx
    InterviewPanel.tsx
    ResultsPanel.tsx
    DoctorReport.tsx      # print-friendly export
    LayerSwitcher.tsx
    Disclaimer.tsx
  llm/
    proseProvider.ts      # ProseProvider interface + selectProvider()
    offlineProvider.ts    # templated prose, zero-network
    geminiProvider.ts     # Gemini 2.5 Flash adapter (env-gated)
  App.tsx
tests/ (Vitest colocated in src/**/*.test.ts; Playwright in e2e/)
```

---

### Task 1: Scaffold

**Files:** Create: full Vite react-ts scaffold, `tailwind.config.js`, `vitest.config.ts`, `e2e/` placeholder.

- [ ] `npm create vite@latest . -- --template react-ts`; install `three @react-three/fiber @react-three/drei zustand zod`, dev `tailwindcss @tailwindcss/vite vitest @vitest/coverage-v8 jsdom @testing-library/react playwright @playwright/test`
- [ ] Wire Tailwind (v4 vite plugin), strict tsconfig, `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`.
- [ ] Verify: `npm run build` passes. Commit `chore: scaffold vite + r3f + tailwind + vitest`.

### Task 2: Clinical types + content pack schema

**Files:** Create `src/clinical/types.ts`, `src/clinical/contentPackSchema.ts`, test `src/clinical/contentPackSchema.test.ts`.

**Produces (exact interfaces consumed by all later tasks):**

```ts
export type PainType = 'aching'|'sharp'|'burning'|'stabbing'|'throbbing'|'tingling'|'numbness'|'cramping'|'pressure'
export type RiskTier = 'emergency'|'urgent'|'primary-care'|'self-care'
export interface PainProfile {
  regionId: string; painTypes: PainType[]; severity: number; // 1-10
  onset: string; betterFactors: string[]; worseFactors: string[];
  radiatesTo: string | null
}
export interface Question {
  id: string; text: string;
  options: { value: string; label: string }[]  // includes yes/no as options
}
export interface TreeNode {
  question: Question;
  next: Record<string, string | null>; // answer value -> next node id (null = end)
}
export interface Differential {
  id: string; name: string; baseWeight: number;
  supports: Record<string, string[]>; // questionId -> answer values that add weight
  tier: RiskTier; specialty: string; suggestedTests: string[];
  explanation: string  // offline prose seed
}
export interface RedFlag {
  id: string; label: string; tier: RiskTier; // tier this flag forces (emergency|urgent)
  when: { questionId: string; answers: string[] }[]; // ANY match triggers
  minSeverity?: number
}
export interface ContentPack {
  regionId: string; entryNodeId: string;
  nodes: Record<string, TreeNode>;
  differentials: Differential[]; redFlags: RedFlag[]
}
export interface AssessmentResult {
  regionId: string; pain: PainProfile;
  answers: Record<string, string>;
  ranked: { differential: Differential; score: number; matchedFactors: string[] }[];
  triggeredRedFlags: RedFlag[]; tier: RiskTier
}
```

- [ ] Write failing schema test (valid pack parses; pack with `next` pointing to missing node id fails via superRefine; weight bounds enforced). Run → FAIL.
- [ ] Implement zod schemas mirroring the types + graph-integrity superRefine. Run → PASS. Commit `feat: clinical types and content pack schema`.

### Task 3: Interview engine (TDD)

**Files:** Create `src/clinical/interviewEngine.ts`, test `src/clinical/interviewEngine.test.ts`.

**Produces:**
```ts
export interface InterviewState { packRegionId: string; currentNodeId: string | null; answers: Record<string,string> }
export function startInterview(pack: ContentPack): InterviewState
export function currentQuestion(pack: ContentPack, s: InterviewState): Question | null
export function answerQuestion(pack: ContentPack, s: InterviewState, value: string): InterviewState // immutable
export function isComplete(s: InterviewState): boolean
```

- [ ] Failing tests: start yields entry question; answering advances per `next`; unknown answer value throws; terminal answer → complete; state objects never mutated (assert old reference unchanged). Run → FAIL.
- [ ] Implement (pure, no classes). Run → PASS. Commit `feat: deterministic interview engine`.

### Task 4: Triage engine (TDD)

**Files:** Create `src/clinical/triage.ts`, test `src/clinical/triage.test.ts`.

**Produces:**
```ts
export function computeAssessment(pack: ContentPack, pain: PainProfile, answers: Record<string,string>): AssessmentResult
```
Rules: score = baseWeight + 1 per matched support answer; ranked desc; red flag triggers when ANY `when` clause matches answers AND severity ≥ minSeverity (if set); final tier = most severe of {triggered red-flag tiers, top-ranked differential tier}. Red flags escalate, never de-escalate.

- [ ] Failing tests incl. red-flag forcing tier escalation and never de-escalating. Run → FAIL.
- [ ] Implement. Run → PASS. Commit `feat: triage scoring and risk tiers`.

### Task 5: Content packs (3 regions) + exhaustive red-flag tests

**Files:** Create `src/clinical/packs/{rightLowerAbdomen,chest,shoulder,index}.ts`, test `src/clinical/packs/packs.test.ts`.

Pack content per spec: RLQ (fever, walking pain, nausea/vomiting, pregnancy possibility, eating relation, blood in stool → appendicitis/gastroenteritis/ovarian/hernia/muscle strain); Chest (exertion, breath, position, radiation to arm/jaw, burning after meals → ACS red flag/angina/GERD/costochondritis/anxiety/muscle strain); Shoulder (depth question surface/muscle/joint/bone, overhead motion, night pain, trauma, neck radiation → rotator cuff/frozen shoulder/impingement/AC joint/referred cervical; red flags: trauma+deformity, fever+joint).

- [ ] Tests: every pack parses through schema; every tree path terminates ≤ 8 questions (walk all paths); every red flag reachable; each differential's `supports` reference real questionIds. Run → FAIL, then author packs → PASS. Commit `feat: clinical content packs for RLQ, chest, shoulder`.

### Task 6: Anatomy map

**Files:** Create `src/anatomy/anatomyMap.ts`, test `src/anatomy/anatomyMap.test.ts`.

`ANATOMY_MAP: Record<string, AnatomyRegion>` with `{ regionId, name, snomedTag, side: 'left'|'right'|'midline', structuresByLayer: { skin: string[]; skeleton: string[]; organs: string[] } }` for: head, neck, chest, upperAbdomen, rightLowerAbdomen, leftLowerAbdomen, pelvis, leftShoulder, rightShoulder, upperBack, lowerBack, plus arms/legs (assessable regions without packs show "coming soon" and the three packed regions). Test: every content pack regionId exists in map. Commit `feat: anatomy region map`.

### Task 7: Zustand store

**Files:** Create `src/state/assessmentStore.ts`, test `src/state/assessmentStore.test.ts`.

Phase machine: `'explore' → 'pain-input' → 'interview' → 'results'`; actions `selectRegion(regionId, point)`, `submitPain(profile)`, `answer(value)`, `restart()`; layer state `activeLayer: 'skin'|'skeleton'|'organs'`; all updates immutable. Store composes engine functions; holds `AssessmentResult` after final answer. Commit `feat: assessment flow store`.

### Task 8: Procedural 3D body + viewport

**Files:** Create `src/scene/bodyGeometry.ts`, `src/scene/HumanBody.tsx`, `src/scene/PainMarker.tsx`, `src/scene/BodyViewport.tsx`, `src/ui/LayerSwitcher.tsx`.

- Humanoid from capsules/spheres/lathe segments; each mesh `name={regionId}`, `userData.regionId`; skin layer full-body tone, skeleton layer (simplified bone shapes) and organs layer (heart/lungs/gut shapes in torso) toggled by store's `activeLayer` with skin ghosted at 15% opacity when deeper layer active.
- OrbitControls (rotate/zoom, pan off), front/back camera flip button, hover highlight (emissive), tap → `onPointerDown` raycast → `selectRegion(regionId, point)`; PainMarker pulsing sphere at point.
- Manual verify in browser + commit `feat: interactive 3D body with layers and region tapping`.

### Task 9: Pain input, interview, results, export UI

**Files:** Create `src/ui/{PainInputPanel,InterviewPanel,ResultsPanel,DoctorReport,Disclaimer}.tsx`, `src/App.tsx` layout (viewport left, panel right; mobile stacks).

- PainInputPanel: pain-type chips (9), severity slider, onset select (hours/today/2-3 days/week/longer), better/worse factor chips, radiation toggle. zod-validate before submit.
- InterviewPanel: one question at a time, progress dots, option buttons.
- ResultsPanel: tier banner (4 styles), red-flag callouts, ranked differentials with % (normalized scores) + why-factors, specialty + tests card, Disclaimer on every screen.
- DoctorReport: print stylesheet, timeline, answers table, pain map snapshot (canvas screenshot via `gl.domElement.toDataURL`), differential list, `window.print()` button.
- Commit per component group: `feat: pain input panel`, `feat: interview UI`, `feat: triage results and doctor export`.

### Task 10: LLM prose layer

**Files:** Create `src/llm/{proseProvider,offlineProvider,geminiProvider}.ts`, test `src/llm/offlineProvider.test.ts`.

```ts
export interface ProseRequest { result: AssessmentResult; audience: 'patient'|'doctor' }
export interface ProseProvider { name: string; generate(req: ProseRequest): Promise<string> }
export function selectProvider(): ProseProvider // gemini if VITE_GEMINI_API_KEY else offline
```
Gemini adapter: fetch to `generativelanguage.googleapis.com` `gemini-2.5-flash`, 8s timeout, any failure → offlineProvider result (silent fallback, error surfaced to console.error only). Offline: assembles differential `explanation` seeds + tier copy into readable paragraphs. Commit `feat: prose layer with offline fallback`.

### Task 11: E2E + final verification

**Files:** Create `e2e/happyPath.spec.ts`, `playwright.config.ts`.

- Playwright: load app → click RLQ region (dispatch via test hook `window.__mdatlas.selectRegion('rightLowerAbdomen')` to avoid raycast flakiness) → fill pain (sharp, 8) → answer path to appendicitis → assert tier ≥ urgent + red-flag visible → open doctor report.
- Full gate: `npm run typecheck && npm run test && npm run build && npx playwright test`. Screenshot evidence. Commit `test: e2e happy path`.
