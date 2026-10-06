# V-Score Validator — Speaker Notes (3 min)

Run the deck with `npx serve apps/slides` and open the printed localhost URL. Press `S` for speaker view, which shows these notes and a timer.

| # | Slide | Time | Cumulative |
|---|-------|------|------------|
| 1 | Title | 0:10 | 0:10 |
| 2 | The Spec | 0:25 | 0:35 |
| 3 | Agent & Skill definitions | 0:30 | 1:05 |
| 4 | Orchestration | 0:35 | 1:40 |
| 5 | Verdict matrix | 0:15 | 1:55 |
| 6 | Proof (live run) | 0:50 | 2:45 |
| 7 | Bonus | 0:15 | 3:00 |

> **Timing trick:** paste the judges' idea into the web app and press **Score** at the *start* of slide 4. A full run takes up to ~60 s. Starting early means the results are already on screen by slide 6.

---

## 1 · Title (0:10)

"This is the V-Score Validator. We didn't build a calculator. We built a team of agents that reason out each score, and an orchestrator that turns those scores into a decision."

## 2 · The Spec (0:25)

- "We wrote the spec before writing any code."
- "The brief: a plain-English idea goes in. Out come two scores out of 100, a verdict, and a reason for every criterion."
- "The Definition of Done is six concrete cases: the three judge ideas plus three boundary checks. The math is 'done' when all six pass."

## 3 · Agent & Skill definitions (0:30)

- "There's one scorer per criterion: four for PoC viability and four for Market viability."
- "Every scorer follows the same contract. It takes the idea and its rubric, and it returns a score from 1 to 10 with a reason."
- Point at a real `SKILL.md`: "This description is what makes the scorer fire. It names the criterion and when to use it."
- "A number without a reason is rejected and retried."

## 4 · Orchestration (0:35)

*Start the live run in the web app now.*

- "The orchestrator delegates to two domain agents, PoC and Market."
- "Each domain agent fans out to its four scorers in parallel. The scorers are blind to each other, so one criterion's reasoning can't anchor another."
- "The weighting, summing and verdict mapping run in deterministic code, not in the model. That's why the boundary cases are provably correct."

## 5 · Verdict matrix (0:15)

- "65 or above counts as High, and that includes exactly 65."
- "Two axes give four verdicts: Go, De-risk First, Validate Demand, Reframe or Shelve."

## 6 · Proof — live run (0:50)

*Switch to the web app tab.*

- Walk through 2–3 reasons: "Here's what the Scope scorer said, and why."
- Read both totals and the verdict out loud.
- "Our acceptance suite also covers the edges: all 10s gives 100/100 and Go, all 1s gives Shelve, and an exact 65 counts as High."

## 7 · Bonus — memory & self-learning (0:15)

- "Every run is appended to `scores.json`, so a new idea shows its most similar past outcome."
- "Feedback such as 'the market scorer ran hot' becomes a rule in `lessons.md`, and the next run's score changes. We can show that loop live if there's time."
- Close: "Spec, decompose, orchestrate, verify. Thank you."
