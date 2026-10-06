# V-Score Validator

An agent team that scores a plain-English idea on **PoC viability** and **Market viability**, then turns both scores into a go/no-go verdict with a reason for every number.

Write an idea in English and you get back:

- 8 criterion scores (1–10), each with a short reason
- a PoC score and a Market score (10–100 each)
- a verdict: **Go**, **De-risk First**, **Validate Demand** or **Reframe or Shelve**
- the most similar idea scored before, if there is one

Built for Capstone 1 of the agentic dev training. The rubric comes from [`assets/session-7.pdf`](assets/session-7.pdf).

## How it works

```
                         orchestrator (src/orchestrator.js)
                        /                                  \
          PoC viability (×4 in parallel)          Market viability (×4 in parallel)
   novelty · scope · resources · outcome            pain · pay · size · moat
                        \                                  /
          deterministic math + verdict (src/scoring.js) → memory bank (data/scores.json)
```

1. **One scorer per criterion.** Each of the 8 criteria has its own Claude Code skill in [`.claude/skills/`](.claude/skills/) (`<criterion>-scorer/SKILL.md`) with an explicit 1–10 rubric, where 10 always means most favorable.
2. **Isolated, parallel sessions.** [`src/scorer.js`](src/scorer.js) runs each scorer as its own Claude Agent SDK session. A scorer sees only the idea and its own skill, has no file or shell tools, and must return JSON `{score, reason}`. Invalid output is retried once, and a second failure stops the run.
3. **Math stays out of the LLM.** [`src/scoring.js`](src/scoring.js) applies the weights and the verdict matrix in code, so the boundary cases are unit-tested.
4. **Memory.** [`src/memory.js`](src/memory.js) appends every completed run to `data/scores.json` and recalls the most similar past idea using lexical (Jaccard) similarity. If a `lessons.md` file exists at the repo root, its rules are passed to every scorer.

### Rubric

All weights, thresholds and verdict labels are defined in one place, [`src/rubric.js`](src/rubric.js).

| Axis | Criterion | Weight |
|------|-----------|--------|
| PoC | Technical Novelty | ×3 |
| PoC | Defined Scope | ×4 |
| PoC | Resource Accessibility | ×2 |
| PoC | Measurable Outcome | ×1 |
| Market | Pain Severity | ×4 |
| Market | Willingness to Pay | ×3 |
| Market | Market Size | ×2 |
| Market | Differentiation | ×1 |

An axis counts as **High** when its score is **≥ 65** (inclusive).

| | High Market | Low Market |
|---|---|---|
| **High PoC** | Go / Full Speed Ahead | Validate Demand |
| **Low PoC** | De-risk First | Reframe or Shelve |

## Getting started

### Requirements

- Node.js 20 or later
- Claude authentication for the Agent SDK: a logged-in Claude Code CLI, or `ANTHROPIC_API_KEY` set in your environment. Never commit credentials (`.env` is gitignored).

### Install and run

```bash
npm install
npm start          # http://localhost:3000 (set PORT to change it)
```

Open the page, paste an idea (or pick one of the examples) and press **Score**. Scores appear as each scorer finishes, followed by the totals and the verdict. A full run takes up to about 60 seconds.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Starts the localhost web app ([`server.js`](server.js) + [`public/index.html`](public/index.html)) |
| `npm test` | Runs the unit tests for the scoring math and verdict boundaries (no API calls) |
| `npm run examples` | Scores every idea in [`examples/ideas.json`](examples/ideas.json) and checks it against the expected verdict (makes real API calls and writes to the memory bank) |
| `npm run slides` | Serves the 3-minute reveal.js pitch deck in [`apps/slides/`](apps/slides/) |

## HTTP API

The server listens on `127.0.0.1` only.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | The web page |
| `GET` | `/api/examples` | Example ideas from `examples/ideas.json` |
| `POST` | `/api/score` | Body `{"idea": "..."}`. Streams NDJSON events: `start`, `memory`, `score` (one per criterion), then `result`, or `error` if the run fails |

## Project structure

```
.claude/skills/        8 criterion scorer skills (shared by Claude Code and the web app)
src/
  rubric.js            criteria, weights, threshold and verdicts
  scoring.js           deterministic weighting and verdict mapping
  scorer.js            runs one scorer through the Claude Agent SDK
  orchestrator.js      fans out to the scorers, aggregates, saves the run
  memory.js            memory bank and lessons loading
server.js              localhost HTTP server
public/index.html      single-page UI
examples/ideas.json    acceptance ideas with their expected verdicts
scripts/run-examples.js  acceptance runner
tests/                 unit tests (node:test)
apps/slides/           pitch deck and speaker notes
docs/                  research summary and product requirements
assets/session-7.pdf   capstone brief and rubric
```

## Documentation

- [`docs/research.md`](docs/research.md): findings from the capstone brief and the design decisions
- [`docs/requirements.md`](docs/requirements.md): user stories and acceptance criteria
- [`apps/slides/notes.md`](apps/slides/notes.md): speaker notes for the 3-minute demo
- [`Notes.md`](Notes.md): original capstone goals

## Status

- Done: the 8 scorer skills, parallel orchestration, deterministic scoring with unit tests, the streaming web app, the memory bank with similar-idea recall, and the slides.
- Partial: the self-learning loop. Scorers already load `lessons.md`, but there is no feedback step yet that writes rules to it.
- Partial: the acceptance suite. `examples/ideas.json` covers the Slack bot (Go) and the translation earbuds (De-risk First). The "AI for everything" (Shelve) case from the brief is still missing.