// Read-only provider analytics. No raw headers/bodies/keys written; allowlisted columns only.
import fs from 'node:fs';
const secret = process.env.ELEVENLABS_API_KEY || fs.readFileSync('C:/Users/kazda/kiro/garden-vr/.env', 'utf8')
  .match(/^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
if (!secret) throw new Error('Credential unavailable');
const response = await fetch('https://api.elevenlabs.io/v1/workspace/analytics/requests', {
  method: 'POST', headers: { 'xi-api-key': secret, 'content-type': 'application/json' },
  body: JSON.stringify({ start_time: Date.parse('2026-10-02T19:14:18Z'), end_time: Date.parse('2026-10-02T19:14:31Z'), limit: 1000 }),
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) { console.log(JSON.stringify({ status: response.status, body: 'withheld' })); process.exit(1); }
const d = await response.json();
const keep = /^(timestamp|event_id|trace_id|path|response_code|latency_seconds)$/i;
const indexes = d.columns.map((name, i) => keep.test(name) ? i : -1).filter(i => i >= 0);
const safe = { at: new Date().toISOString(), availableColumns: d.columns.filter(x => !/key|token|secret|authorization/i.test(x)),
  columns: indexes.map(i => d.columns[i]), rows: d.rows.map(row => indexes.map(i => typeof row[i] === 'string' ? row[i].replaceAll(secret, '[REDACTED]') : row[i])) };
fs.writeFileSync('audio/audition/request-audit.json', JSON.stringify(safe, null, 2) + '\n');
console.log(JSON.stringify(safe, null, 2));
