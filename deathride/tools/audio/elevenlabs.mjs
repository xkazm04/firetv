#!/usr/bin/env node
// Port of Garden VR tools/audio/elevenlabs.mjs, read-only source consulted 2026-10-02.
// No provider response bodies, request headers or environment contents are logged.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const API = 'https://api.elevenlabs.io';
const KEY_FILE = 'C:/Users/kazda/kiro/garden-vr/.env';
const RESERVE = number(process.env.DEATHRIDE_AUDIO_RESERVE ?? 8000, 'reserve', 8000, Infinity);
const FORMAT = 'mp3_44100_128';

export function number(value, name, min, max) {
  if (typeof value === 'boolean' || value === '' || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max)
    throw new Error(`Invalid ${name}; expected ${min}..${max}`);
  return Number(value);
}
export function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2), v = argv[i + 1];
      if (Object.hasOwn(out, k)) throw new Error(`Duplicate --${k}`);
      out[k] = v === undefined || v.startsWith('--') ? true : (i++, v);
    } else out._.push(argv[i]);
  }
  return out;
}
function need(a, k) {
  if (typeof a[k] !== 'string' || !a[k].trim()) throw new Error(`--${k} is required`);
  return a[k];
}
function key() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  if (fs.existsSync(KEY_FILE)) {
    const match = fs.readFileSync(KEY_FILE, 'utf8').match(/^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY unavailable in environment or read-only Garden VR .env');
}
function cleanText(value) {
  // Refuse accidental credential inclusion, without echoing the supplied value.
  if (value.includes(key())) throw new Error('Credential detected in request content; refused');
}
async function get(endpoint) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(API + endpoint, { headers: { 'xi-api-key': key() }, signal: AbortSignal.timeout(30000) });
    if (r.status === 429 && attempt < 3) { await new Promise(resolve => setTimeout(resolve, 2000 * 2 ** attempt)); continue; }
    if (!r.ok) throw new Error(`Read request failed (HTTP ${r.status}); response body withheld`);
    return r.json();
  }
}
export async function credits() {
  const d = await get('/v1/user/subscription');
  const used = number(d.character_count, 'account usage', 0, Infinity);
  const limit = number(d.character_limit, 'account limit', used, Infinity);
  return { at: new Date().toISOString(), tier: d.tier, used, limit, remaining: limit - used,
    resetsAt: new Date(d.next_character_count_reset_unix * 1000).toISOString() };
}
export function request(a) {
  const kind = a._[0], out = need(a, 'out');
  let body, estimate, endpoint, seconds = null;
  if (kind === 'sfx') {
    seconds = number(a.seconds ?? 2, 'seconds', 0.5, 30);
    body = { text: need(a, 'text'), duration_seconds: seconds, prompt_influence: number(a.influence ?? 0.5, 'influence', 0, 1),
      model_id: 'eleven_text_to_sound_v2', loop: a.loop === true };
    estimate = Math.max(100, Math.ceil(seconds * 40)); endpoint = '/v1/sound-generation';
  } else if (kind === 'music') {
    seconds = number(a.seconds ?? 20, 'seconds', 3, 180);
    body = { prompt: need(a, 'prompt'), music_length_ms: Math.round(seconds * 1000), force_instrumental: true };
    estimate = Math.ceil(seconds * 60); endpoint = '/v1/music';
  } else if (kind === 'tts') {
    const text = a['text-file'] ? fs.readFileSync(need(a, 'text-file'), 'utf8') : need(a, 'text');
    if (!text.trim()) throw new Error('Empty speech text');
    const voice = need(a, 'voice');
    if (!/^[a-zA-Z0-9_-]+$/.test(voice)) throw new Error('Invalid voice identifier');
    body = { text, model_id: 'eleven_multilingual_v2', voice_settings: {
      stability: number(a.stability ?? 0.6, 'stability', 0, 1), similarity_boost: number(a.similarity ?? 0.75, 'similarity', 0, 1),
      style: number(a.style ?? 0.1, 'style', 0, 1), use_speaker_boost: true } };
    estimate = text.length; endpoint = `/v1/text-to-speech/${voice}`;
  } else throw new Error('Unknown generation command');
  return { kind, out, seconds, estimate, endpoint, body, format: FORMAT };
}
export function sessionUsage(entries, session) {
  const calls = new Map();
  for (const row of entries.filter(e => e.session === session)) calls.set(row.id, row);
  return { spent: [...calls.values()].reduce((sum, row) => sum + row.budgetCharge, 0),
    pending: [...calls.values()].filter(row => row.status !== 'complete').map(row => row.id) };
}
export function checkBudget({ estimate, remaining, reserve, spent, cap, pending = [] }) {
  if (pending.length) throw new Error('Unresolved generation in session; stop and reconcile billing before any further call');
  if (spent + estimate > cap) throw new Error(`Session cap refused: ${spent} + ${estimate} > ${cap}`);
  if (remaining - estimate < reserve) throw new Error(`Reserve refused: ${remaining} - ${estimate} < ${reserve}`);
}
function append(row) { fs.appendFileSync(path.join(here, 'ledger.jsonl'), JSON.stringify(row) + '\n'); }
function readLedger() {
  const f = path.join(here, 'ledger.jsonl');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map(s => JSON.parse(s)) : [];
}
function atomicJson(f, data) {
  fs.writeFileSync(f + '.tmp', JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(f + '.tmp', f);
}
export async function main(argv = process.argv.slice(2)) {
  const a = args(argv), cmd = a._[0];
  if (cmd === 'credits') { console.log(JSON.stringify(await credits(), null, 2)); return; }
  if (cmd === 'voices') {
    const d = await get('/v1/voices'), filter = String(a.filter ?? '').toLowerCase();
    const voices = (d.voices ?? []).map(v => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels, description: v.description }));
    console.log(JSON.stringify(voices.filter(v => JSON.stringify(v).toLowerCase().includes(filter)), null, 2)); return;
  }
  if (!['sfx', 'music', 'tts'].includes(cmd)) throw new Error('Usage: credits | voices [--filter text] | sfx --text --seconds [--loop] | music --prompt --seconds | tts --voice --text|--text-file; generation requires --out --session NAME --session-cap CREDITS [--dry-run]');
  const spec = request(a);
  const session = need(a, 'session');
  if (!/^[a-z0-9-]{1,64}$/.test(session)) throw new Error('Session must be a short lowercase alphanumeric/hyphen name');
  const cap = number(need(a, 'session-cap'), 'session cap', 1, 9000);
  if (a['dry-run']) {
    checkBudget({ estimate: spec.estimate, remaining: Infinity, reserve: RESERVE, spent: sessionUsage(readLedger(), session).spent, cap });
    console.log(JSON.stringify({ dryRun: true, kind: spec.kind, out: spec.out, seconds: spec.seconds, characters: spec.body.text?.length,
      estimatedCredits: spec.estimate, session, sessionCap: cap, reserve: RESERVE, networkRequests: 0,
      basis: 'SFX max(100, 40/s); music 60/s; multilingual v2 speech 1/character. Conservative estimates, not invoices.' })); return;
  }
  cleanText(JSON.stringify(spec));
  const output = path.resolve(spec.out), allowed = path.join(root, 'audio') + path.sep;
  if (!output.startsWith(allowed) || path.extname(output) !== '.mp3') throw new Error('Output must be an .mp3 inside deathride/audio');
  if (fs.existsSync(output) || fs.existsSync(output + '.json')) throw new Error('Output exists; refuse to overwrite an audition take');
  const lock = path.join(here, '.generation.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx'); } catch { throw new Error('Another generation or interrupted lock exists; no request sent'); }
  try {
    fs.writeFileSync(fd, JSON.stringify({ session, at: new Date().toISOString(), pid: process.pid }));
    const sessionFile = path.join(here, `session-${session}.json`);
    let state = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile, 'utf8')) : null;
    if (state && (state.cap !== cap || state.reserve !== RESERVE)) throw new Error('Persisted session cap/reserve cannot be changed');
    const usage = sessionUsage(readLedger(), session);
    const before = await credits();
    if (state && state.resetsAt !== before.resetsAt) throw new Error('Account reset changed; stop and reconcile session');
    checkBudget({ estimate: spec.estimate, remaining: before.remaining, reserve: RESERVE, spent: usage.spent, cap, pending: usage.pending });
    if (!state) { state = { session, cap, reserve: RESERVE, openedAt: before.at, resetsAt: before.resetsAt, balanceAtOpen: before.remaining }; atomicJson(sessionFile, state); }
    const entry = { id: randomUUID(), ts: new Date().toISOString(), session, status: 'pending', kind: spec.kind,
      out: path.relative(root, output).replaceAll('\\', '/'), seconds: spec.seconds, request: spec.body,
      endpoint: spec.endpoint, format: spec.format, estimatedCredits: spec.estimate, budgetCharge: spec.estimate,
      creditsBefore: before.remaining, accountTier: before.tier, reserve: RESERVE, sessionCap: cap };
    append(entry); // Durable reservation before POST. Never retry a possibly billed POST.
    const response = await fetch(API + spec.endpoint + `?output_format=${FORMAT}`, {
      method: 'POST', headers: { 'xi-api-key': key(), 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify(spec.body), signal: AbortSignal.timeout(240000) });
    if (!response.ok) throw new Error(`Generation failed (HTTP ${response.status}); reservation retained; response body withheld`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error('Empty response; reservation retained');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, bytes, { flag: 'wx' });
    // Save provenance even if the subsequent account lookup fails.
    const saved = { ...entry, status: 'saved-billing-pending', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
    atomicJson(output + '.json', saved);
    const after = await credits();
    if (after.resetsAt !== before.resetsAt || after.remaining > before.remaining) throw new Error('Billing window changed; saved take remains pending reconciliation');
    const observed = before.remaining - after.remaining;
    const done = { ...saved, status: 'complete', completedAt: after.at, creditsAfter: after.remaining,
      observedAccountDelta: observed, spendBasis: 'Account balance delta during request; concurrent project activity may be included.',
      budgetCharge: Math.max(spec.estimate, observed), sessionBudgetUsed: usage.spent + Math.max(spec.estimate, observed) };
    atomicJson(output + '.json', done); append(done);
    console.log(JSON.stringify({ ok: true, out: done.out, bytes: done.bytes, estimatedCredits: spec.estimate, observedAccountDelta: observed,
      budgetCharge: done.budgetCharge, sessionBudgetUsed: done.sessionBudgetUsed, remaining: after.remaining, generatedAt: entry.ts }));
    if (done.sessionBudgetUsed > cap || after.remaining < RESERVE) throw new Error('Observed billing exceeded a guard; stop immediately and reconcile (no further calls)');
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    // Only controlled messages are printed. A provider/network exception could contain credentials.
    const message = error instanceof TypeError || error.name === 'TimeoutError' || error.name === 'AbortError'
      ? 'Network/timeout failure; any pending reservation remains charged. Do not retry automatically.' : error.message;
    console.error(JSON.stringify({ ok: false, error: message })); process.exitCode = 1;
  });
}
