// Minimal localhost server: serves the page and streams an evaluation as NDJSON events.
import http from 'node:http';
import fs from 'node:fs/promises';
import { evaluate } from './src/orchestrator.js';

const PORT = Number(process.env.PORT) || 3000;
const PAGE = new URL('./public/index.html', import.meta.url);
const EXAMPLES = new URL('./examples/ideas.json', import.meta.url);
const MAX_BODY = 10_000;

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY) throw new Error('Request body too large');
  }
  return JSON.parse(body || '{}');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(await fs.readFile(PAGE));
  }

  if (req.method === 'GET' && req.url === '/api/examples') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(await fs.readFile(EXAMPLES));
  }

  if (req.method === 'POST' && req.url === '/api/score') {
    let idea;
    try {
      ({ idea } = await readJson(req));
    } catch (err) {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message }));
    }
    res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-cache' });
    const emit = (event) => res.write(`${JSON.stringify(event)}\n`);
    try {
      await evaluate(idea, emit);
    } catch (err) {
      emit({ type: 'error', message: err.message });
    }
    return res.end();
  }

  res.writeHead(404).end('Not found');
});

server.listen(PORT, '127.0.0.1', () => console.log(`V-Score Validator on http://localhost:${PORT}`));
