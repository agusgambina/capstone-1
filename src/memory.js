// Memory bank: every completed run is appended to data/scores.json; new ideas recall the most similar one.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BANK = path.join(ROOT, 'data', 'scores.json');
const LESSONS = path.join(ROOT, 'lessons.md');
const STOPWORDS = new Set('a an and the of to for in on with that this is it by from as at or be are its their our your'.split(' '));

const tokens = (text) =>
  new Set(text.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 2 && !STOPWORDS.has(t)) ?? []);

function jaccard(a, b) {
  const inter = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

export async function loadBank() {
  try {
    return JSON.parse(await fs.readFile(BANK, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function recallSimilar(idea, minSimilarity = 0.1) {
  const bank = await loadBank();
  const query = tokens(idea);
  let best = null;
  for (const run of bank) {
    const similarity = jaccard(query, tokens(run.idea));
    if (similarity >= minSimilarity && (!best || similarity > best.similarity)) best = { similarity, run };
  }
  return best && { similarity: Number(best.similarity.toFixed(2)), idea: best.run.idea, poc: best.run.poc, market: best.run.market, verdict: best.run.verdict, at: best.run.at };
}

export async function appendRun(run) {
  const bank = await loadBank();
  bank.push(run);
  await fs.mkdir(path.dirname(BANK), { recursive: true });
  const tmp = `${BANK}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(bank, null, 2));
  await fs.rename(tmp, BANK); // atomic replace so a crash never leaves a half-written bank
}

export async function loadLessons() {
  try {
    return (await fs.readFile(LESSONS, 'utf8')).trim() || null;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
