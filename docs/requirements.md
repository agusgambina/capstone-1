# V-Score Validator — Product Requirements (Phase 1 · Product Owner)

> Input: [research.md](./research.md). Rubric source: [`assets/session-7.pdf`](../assets/session-7.pdf).

## Why

A person with an idea writes it in plain English and gets back a defensible go/no-go recommendation, with every number explained by its reasoning. For the capstone, the judges score the **agent design and the proof of steering**, not the math (research F1, F8).

## Users

| User | Need |
|------|------|
| **Idea owner** | Paste an idea and get a PoC score, a Market score, a verdict and the reasoning behind each, without typing any numbers |
| **Capstone judge** | See the decomposition and the orchestration flow, then watch a live, correct run on a fresh idea in under 3 min |
| **Developer (us)** | Change a rubric or a lesson in one file and see the change in the next run |

## User Stories

### Story 1: Criterion scorers
**As a** judge **I want** one dedicated scorer per criterion **so that** the decomposition is real and inspectable.

**Acceptance Criteria**:
- [ ] There are 8 scorers: Novelty, Scope, Resources, Outcome (PoC) and Pain, Pay, Size, Moat (Market)
- [ ] Each scorer is a `SKILL.md` or sub-agent whose `description` clearly says when it fires
- [ ] Each takes `{idea, rubric}` and returns JSON `{criterion, score, reason}`, where `score` is an integer from 1 to 10 and `reason` is a non-empty string
- [ ] Each rubric defines its 1 and 10 anchors explicitly, with 10 always meaning *most favorable*

**Priority**: High · **Effort**: M

### Story 2: Orchestration
**As a** judge **I want** a coordinator that fans out to the scorers and aggregates their results **so that** the orchestration story is legible.

**Acceptance Criteria**:
- [ ] Orchestrator → `poc-viability` agent and `market-viability` agent → 4 scorers each
- [ ] Scorers run in parallel and cannot see each other's output
- [ ] Any scorer result that is invalid (out of range, missing reason, non-JSON) is retried once, then the run fails with a clear message
- [ ] The run output shows which agent produced which score

**Priority**: High · **Effort**: M

### Story 3: Deterministic scoring & verdict
**As an** idea owner **I want** correct math and a correct verdict **so that** I can trust the result.

**Acceptance Criteria**:
- [ ] The weighting is computed in code, not by the LLM: PoC = N×3 + S×4 + R×2 + O×1, Market = P×4 + W×3 + Z×2 + M×1
- [ ] High means ≥ 65 (inclusive). The verdict matrix is Go / De-risk First / Validate Demand / Reframe or Shelve.
- [ ] Unit tests cover: all 10s → 100/100 → Go, all 1s → 10/10 → Shelve, exactly 65 → High, and 64 → Low
- [ ] The output is a plain-language verdict plus all 8 reasons

**Priority**: High · **Effort**: S

### Story 4: Localhost web app
**As an** idea owner **I want** a minimal web page **so that** I can evaluate an idea without using the CLI.

**Acceptance Criteria**:
- [ ] `npm start` serves one HTML page on `localhost`
- [ ] A textarea plus a "Score" button sends the idea to a Node backend, which runs the harness through the **Claude Agent SDK**
- [ ] The page shows each criterion's score and reason as it arrives (streamed), then both totals and the verdict
- [ ] Errors (auth, invalid scorer output) are shown inline and don't crash the page

**Priority**: High · **Effort**: M

### Story 5: Memory bank (bonus)
**As a** judge **I want** the system to remember past ideas **so that** I can see memory working live.

**Acceptance Criteria**:
- [ ] Every completed run is appended to `data/scores.json` with the idea, the 8 scores and reasons, both totals, the verdict and a timestamp
- [ ] For a new idea, the most similar past idea and its verdict are shown
- [ ] The append is done by a hook or orchestrator step, never edited by hand

**Priority**: Medium · **Effort**: S

### Story 6: Self-learning loop (bonus)
**As a** developer **I want** scorers to learn from outcome feedback **so that** a full loop can be demonstrated.

**Acceptance Criteria**:
- [ ] The user can attach feedback to a past run (for example "market scorer ran hot")
- [ ] A step extracts a pattern from the bank and the feedback, then writes a rule to `lessons.md`
- [ ] Scorers load the relevant `lessons.md` rules on the next run
- [ ] Demo: run → feedback → a new rule appears → re-running the same idea changes the affected score

**Priority**: Medium · **Effort**: M

### Story 7: Spec & acceptance suite
**As a** judge **I want** a spec written before building and a repeatable proof **so that** verification is credible.

**Acceptance Criteria**:
- [ ] A spec doc contains the brief, the agent breakdown and a measurable DoD
- [ ] The acceptance runs cover: Slack bot → Go, translation earbuds → De-risk First, "AI for everything" → Shelve, plus the 3 boundary checks
- [ ] One command runs the acceptance suite and prints pass/fail for each case

**Priority**: High · **Effort**: S

### Story 8: Pitch slides
**As a** presenter **I want** a 3-minute reveal.js deck **so that** the demo follows the judged order.

**Acceptance Criteria**:
- [ ] The deck lives in `apps/slides/` and runs on localhost
- [ ] Slide order follows the deliverables: Spec → Agent/Skill defs → Orchestration → Proof (live run) → Bonus
- [ ] ≤ 8 slides, so the pitch fits in 3 min

**Priority**: Low · **Effort**: S

## Priority Ranking

1. Story 3 (math, the base for verification)
2. Story 1 (scorers)
3. Story 2 (orchestration)
4. Story 7 (spec + suite)
5. Story 4 (web app)
6. Story 5 (memory bank)
7. Story 6 (self-learning)
8. Story 8 (slides)

## Scope

**In Scope**:
- A `.claude/` harness inside `capstone-1`: 8 scorer skills, 2 domain agents, the orchestrator, and hooks for memory and learning
- A Node + static HTML web app on localhost using the Claude Agent SDK
- `scores.json` memory bank and `lessons.md` self-learning
- reveal.js slides in `apps/slides/`

**Out of Scope**:
- Auth, multi-user support, deployment beyond localhost
- Editing the rubric weights through the UI
- Embedding/vector similarity. Recall uses simple lexical similarity, which is enough for the demo.

## Technical Constraints

- The harness definitions must be shared by the Claude Code CLI and the web app through the Agent SDK. Prompts must not be duplicated.
- An API key or Claude auth comes from the environment only. Never commit it (`.env` stays gitignored).
- Node 20+.

## Success Metrics

- Acceptance suite: 6 out of 6 cases pass
- Every run returns 8 non-empty reasons (100%)
- A full web-app run finishes in under 60 s on localhost
- The demo fits in 3 min, following the deliverables order
