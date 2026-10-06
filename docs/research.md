# Capstone 1 — Research Summary (Phase 1 · Analyst)

> Source: [`assets/session-7.pdf`](../assets/session-7.pdf) ("Workshop: The V-Score Validator Capstone", 11 pages) and [`Notes.md`](../Notes.md).
> Method: full-text extraction of the PDF, cross-checked against the Notes goals; arithmetic boundaries verified by hand.

## Proposed Project Title

**V-Score Validator — an agent team that scores an idea's PoC and Market viability**

## Key Findings

| # | Finding | Evidence | Confidence |
|---|---------|----------|------------|
| F1 | The product is the agent system, not the calculator. You're graded on decomposition, orchestration and verification. | p2 ("The math is trivial… the challenge is the agent system"), p8 | High |
| F2 | Two component types: one **scorer per criterion** (8 total) that returns `{score 1–10, reason}` given `{idea, rubric}`, and one **orchestrator** that fans out, weights, sums and maps to a verdict | p3 | High |
| F3 | Fixed weights. PoC = Novelty×3 + Scope×4 + Resources×2 + Outcome×1. Market = Pain×4 + Pay×3 + Size×2 + Moat×1. Each axis ranges from 10 to 100. | p4 | High |
| F4 | Verdict matrix: High means ≥ 65. High/High gives Go, Low PoC with High Market gives De-risk First, High PoC with Low Market gives Validate Demand, Low/Low gives Reframe or Shelve. | p5 | High |
| F5 | The output has to show the plain-language verdict and every per-criterion reason. A score with no reason is not allowed. | p4, p5 | High |
| F6 | Three orchestration patterns are allowed: single agent + skills, orchestrator + sub-agents, or parallel scorers. You pick one and defend it. | p6 | High |
| F7 | Four deliverables, presented in this order in a 3-min demo: Spec (brief, agent breakdown, measurable DoD), Agent/Skill defs, Orchestration, Proof (a live run on a fresh idea) | p7, p10 | High |
| F8 | Judging: 5 dimensions × 5 pts, plus a +5 bonus for a memory bank (`scores.md/.json` with similar-idea recall) and/or a self-learning loop (`lessons.md` rule that changes the next score) | p8, p9 | High |
| F9 | Known judge test cases: Slack bot gives Go, translation earbuds give De-risk First, "AI for everything" gives Shelve. Boundary checks: all 10s give 100/100 and Go, all 1s give Shelve, a tie at exactly 65 counts as High. | p10 | High |
| F10 | The Notes add scope that isn't in the PDF: a **localhost web app** to run evaluations, **reveal.js slides** in `apps/slides/`, and a project **harness** (skills, hooks, agents) | Notes.md | High |

## Assumptions Status

| Assumption | Status | Evidence |
|------------|--------|----------|
| A score of 10 always means *most favorable* for viability | **Validated (by implication)** | p10: all 10s must give Go. So for Novelty, 10 has to mean "novel in a way that is still PoC-friendly", not "riskiest". Each scorer rubric must state its 1/10 anchors explicitly. |
| An exact 65 is reachable on an axis | **Validated** | 5×3 + 8×4 + 7×2 + 4×1 = 65 (PoC). Same check works for Market weights. The ≥ comparison must be inclusive. |
| "At least two agents (PoC + Market)" (Notes) is enough | **Partially invalidated** | The PDF wants **one scorer per criterion** (p3, judged on p8 "a real skill/agent per criterion"). Two agents only work if each is a sub-orchestrator over four criterion scorers. |
| The web app can call the harness directly | **Unvalidated** | Claude Code skills/agents run inside the CLI. A web app would need a bridge, either headless `claude -p` or the Claude Agent SDK, or it would have to re-implement the agents through the API. This is an architecture decision. |
| Slides are part of the judged deliverables | **Invalidated** | Judging (p8) scores demo clarity, not slides. Slides support the 3-min pitch (Notes requirement only). |

## Recommendations

1. **Decomposition: two domain agents over eight scorer skills.** Orchestrator → `poc-viability` agent and `market-viability` agent → four criterion scorer skills each. This satisfies both the Notes ("two agents") and the PDF ("a skill/agent per criterion"). It also tells a legible orchestration story for the demo.
2. **Run the scorers in parallel, blind to each other.** This shows the parallelism live (p6 "fastest" pattern) and keeps one criterion's reasoning from anchoring another.
3. **Keep the math deterministic and outside the LLM.** Weighting, summing and verdict mapping go in code, or a script the orchestrator calls. That way the boundary cases (100, 10, exactly 65) are provably correct and unit-testable (p8 "Verification & correctness").
4. **Use a strict output contract.** Each scorer returns JSON `{criterion, score:int 1–10, reason:string}` and the orchestrator rejects a missing reason or an out-of-range score (F5).
5. **Make the web app a thin client.** Idea textarea → backend runs the harness → render both scores, the verdict and the 8 reasons. Choose between headless CLI and the Agent SDK in Phase 2.
6. **Go for the bonus with hooks.** A Stop/PostToolUse hook appends each run to `scores.json` (memory bank). A `lessons.md` file loaded by the scorers gives the self-learning loop.
7. **Define the DoD from the judge cases.** The 3 named ideas plus the 3 boundary checks (F9) become the acceptance test suite.

## Decisions (resolved with user, 2026-10-06)

| Question | Decision |
|----------|----------|
| Web app → harness bridge | **Claude Agent SDK**: the backend loads the same `.claude/` skills/agents |
| Web app stack | **Node + static HTML**: a single small server and one page, localhost |
| +5 bonus | **Both**: memory bank (`scores.json` + similar-idea recall) and self-learning loop (`lessons.md`) |

## Sources

- `assets/session-7.pdf` — pp. 1–11 (cited inline)
- `Notes.md` — Goals, Construction
