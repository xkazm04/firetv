// One-off X2 HTTP 400 reconciliation. Retain the FULL 100-credit reservation, never refund it.
import fs from 'node:fs';
const ledger = 'tools/audio/ledger.jsonl';
const rows = fs.readFileSync(ledger, 'utf8').trim().split('\n').map(s => JSON.parse(s));
const id = 'd02735a7-31dd-424e-b107-69600701bb03';
const latest = rows.filter(r => r.id === id).at(-1);
if (latest.status === 'abandoned-reserved') { console.log('Already reconciled; no mutation'); process.exit(0); }
const audit = JSON.parse(fs.readFileSync('audio/audition/request-audit.json'));
const rejected = audit.rows.find(r => r[audit.columns.indexOf('timestamp')] === '2026-10-02T19:14:29.741000Z'
  && r[audit.columns.indexOf('path')] === '/v1/sound-generation' && r[audit.columns.indexOf('response_code')] === 400);
if (!rejected || latest.status !== 'pending' || latest.budgetCharge !== 100 || fs.existsSync(latest.out)) throw new Error('Reconciliation preconditions not met');
const resolution = { ...latest, status: 'abandoned-reserved', resolvedAt: new Date().toISOString(), httpStatus: 400,
  actualCredits: null, budgetCharge: 100, evidence: 'audio/audition/request-audit.json',
  resolution: 'Provider analytics confirms 400 in 5.8 ms; no audio returned. Prompt exceeded documented 450-character limit (likely cause, original error body unavailable). Abandon this attempt, retain full 100 credits against cap; no claim of zero billing. Rebrief all SFX within limit before new requests.' };
fs.appendFileSync(ledger, JSON.stringify(resolution) + '\n');
fs.writeFileSync('audio/audition/rejected-attempt.json', JSON.stringify(resolution, null, 2) + '\n');
console.log(JSON.stringify({ id, status: resolution.status, budgetCharge: resolution.budgetCharge }));
