// Deterministic math: weighting, summing and verdict mapping never go through the LLM.
import { CRITERIA, HIGH_THRESHOLD, VERDICTS } from './rubric.js';

export function axisScore(scores, axis) {
  return CRITERIA.filter((c) => c.axis === axis).reduce((sum, c) => {
    const s = scores[c.id];
    if (!Number.isInteger(s) || s < 1 || s > 10) {
      throw new RangeError(`Invalid score for ${c.id}: ${s}`);
    }
    return sum + s * c.weight;
  }, 0);
}

export function verdictFor(poc, market) {
  const highPoc = poc >= HIGH_THRESHOLD;
  const highMarket = market >= HIGH_THRESHOLD;
  if (highPoc && highMarket) return 'go';
  if (!highPoc && highMarket) return 'derisk';
  if (highPoc && !highMarket) return 'validate';
  return 'shelve';
}

// scores: { novelty: 7, scope: 9, ... } -> totals + verdict
export function decide(scores) {
  const poc = axisScore(scores, 'poc');
  const market = axisScore(scores, 'market');
  const verdict = verdictFor(poc, market);
  return { poc, market, verdict, ...VERDICTS[verdict] };
}
