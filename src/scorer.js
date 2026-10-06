// Runs ONE criterion scorer as an isolated Agent SDK session: it sees only the idea and its own skill.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '@anthropic-ai/claude-agent-sdk';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', minimum: 1, maximum: 10 },
    reason: { type: 'string', minLength: 1 },
  },
  required: ['score', 'reason'],
  additionalProperties: false,
};

function buildPrompt(criterion, idea, lessons) {
  const lessonBlock = lessons ? `\n\n## Lessons\n${lessons}` : '';
  return `Use the ${criterion.id}-scorer skill to score this idea on ${criterion.label} only.

## Idea
${idea}${lessonBlock}`;
}

function validate(out) {
  if (!out || !Number.isInteger(out.score) || out.score < 1 || out.score > 10) return false;
  return typeof out.reason === 'string' && out.reason.trim().length > 0;
}

async function runOnce(criterion, idea, lessons) {
  let structured;
  for await (const msg of query({
    prompt: buildPrompt(criterion, idea, lessons),
    options: {
      cwd: PROJECT_ROOT,
      settingSources: ['project'], // loads .claude/skills from this project only
      skills: [`${criterion.id}-scorer`],
      tools: ['Skill'], // no file/shell access: the scorer reasons over the idea text alone
      outputFormat: { type: 'json_schema', schema: SCORE_SCHEMA },
      maxTurns: 6,
      effort: 'low',
      persistSession: false,
    },
  })) {
    if (msg.type === 'result' && msg.subtype === 'success') structured = msg.structured_output;
  }
  if (!validate(structured)) throw new Error(`${criterion.id}: invalid scorer output ${JSON.stringify(structured)}`);
  return { score: structured.score, reason: structured.reason.trim() };
}

// One retry on invalid output or a failed session, then fail loudly.
export async function runScorer(criterion, idea, lessons) {
  try {
    return await runOnce(criterion, idea, lessons);
  } catch (first) {
    try {
      return await runOnce(criterion, idea, lessons);
    } catch (second) {
      throw new Error(`Scorer ${criterion.id} failed twice: ${second.message}`, { cause: first });
    }
  }
}
