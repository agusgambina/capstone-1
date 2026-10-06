// Orchestrator: fans out to two domain coordinators, each running its 4 criterion scorers in parallel,
// then applies the deterministic weights and verdict matrix.
import { CRITERIA } from './rubric.js';
import { decide } from './scoring.js';
import { runScorer } from './scorer.js';
import { appendRun, loadLessons, recallSimilar } from './memory.js';

async function runDomain(axis, idea, lessons, emit) {
  const criteria = CRITERIA.filter((c) => c.axis === axis);
  return Promise.all(
    criteria.map(async (c) => {
      const started = Date.now();
      const { score, reason } = await runScorer(c, idea, lessons);
      const result = { criterion: c.id, label: c.label, axis, weight: c.weight, score, reason, ms: Date.now() - started };
      emit({ type: 'score', ...result });
      return result;
    }),
  );
}

// emit receives progress events: start, memory, score (x8), result
export async function evaluate(idea, emit = () => {}) {
  const text = idea?.trim();
  if (!text) throw new Error('Idea text is required');

  const started = Date.now();
  emit({ type: 'start', criteria: CRITERIA.map(({ id, label, axis, weight }) => ({ id, label, axis, weight })) });

  const [similar, lessons] = await Promise.all([recallSimilar(text), loadLessons()]);
  emit({ type: 'memory', similar });

  const [poc, market] = await Promise.all([
    runDomain('poc', text, lessons, emit),
    runDomain('market', text, lessons, emit),
  ]);
  const criteria = [...poc, ...market];
  const totals = decide(Object.fromEntries(criteria.map((r) => [r.criterion, r.score])));

  const run = { at: new Date().toISOString(), idea: text, ...totals, criteria, ms: Date.now() - started };
  await appendRun(run);
  emit({ type: 'result', ...run, similar });
  return { ...run, similar };
}
