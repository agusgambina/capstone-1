import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, verdictFor } from '../src/scoring.js';
import { CRITERIA } from '../src/rubric.js';

const all = (n) => Object.fromEntries(CRITERIA.map((c) => [c.id, n]));

test('all 10s -> 100/100 -> Go', () => {
  assert.deepEqual(
    { poc: decide(all(10)).poc, market: decide(all(10)).market, verdict: decide(all(10)).verdict },
    { poc: 100, market: 100, verdict: 'go' },
  );
});

test('all 1s -> 10/10 -> Shelve', () => {
  const r = decide(all(1));
  assert.equal(r.poc, 10);
  assert.equal(r.market, 10);
  assert.equal(r.verdict, 'shelve');
});

test('exactly 65 counts as High (inclusive threshold)', () => {
  // PoC: 5x3 + 8x4 + 7x2 + 4x1 = 65 ; Market: 8x4 + 7x3 + 5x2 + 2x1 = 65
  const r = decide({ novelty: 5, scope: 8, resources: 7, outcome: 4, pain: 8, pay: 7, size: 5, moat: 2 });
  assert.equal(r.poc, 65);
  assert.equal(r.market, 65);
  assert.equal(r.verdict, 'go');
});

test('64 is Low', () => {
  assert.equal(verdictFor(64, 64), 'shelve');
  assert.equal(verdictFor(64, 65), 'derisk');
  assert.equal(verdictFor(65, 64), 'validate');
});

test('rejects out-of-range or non-integer scores', () => {
  assert.throws(() => decide({ ...all(5), scope: 11 }), RangeError);
  assert.throws(() => decide({ ...all(5), pay: 0 }), RangeError);
  assert.throws(() => decide({ ...all(5), moat: 7.5 }), RangeError);
});
