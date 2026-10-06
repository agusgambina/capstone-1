// Runs every idea in examples/ideas.json through the orchestrator and checks the expected verdict.
import fs from 'node:fs/promises';
import { evaluate } from '../src/orchestrator.js';
import { VERDICTS } from '../src/rubric.js';

const examples = JSON.parse(await fs.readFile(new URL('../examples/ideas.json', import.meta.url), 'utf8'));
let failures = 0;

for (const ex of examples) {
  console.log(`\n=== ${ex.name} ===\n${ex.idea}\n`);
  try {
    const r = await evaluate(ex.idea, (e) => {
      if (e.type === 'score') console.log(`  [${e.axis.padEnd(6)}] ${e.label.padEnd(22)} ${String(e.score).padStart(2)}/10  (${(e.ms / 1000).toFixed(1)}s)  ${e.reason}`);
      if (e.type === 'memory' && e.similar) console.log(`  memory: similar to "${e.similar.idea.slice(0, 60)}..." (${e.similar.similarity}) -> ${e.similar.verdict}`);
    });
    const pass = r.verdict === ex.expected;
    if (!pass) failures++;
    console.log(`\n  PoC ${r.poc}/100 · Market ${r.market}/100 -> ${r.label}  (${(r.ms / 1000).toFixed(1)}s)`);
    console.log(`  expected ${VERDICTS[ex.expected].label}: ${pass ? 'PASS' : 'FAIL'}`);
  } catch (err) {
    failures++;
    console.error(`  ERROR: ${err.message}`);
  }
}

console.log(`\n${examples.length - failures}/${examples.length} examples matched the expected verdict`);
process.exitCode = failures ? 1 : 0;
