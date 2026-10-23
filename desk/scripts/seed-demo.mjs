#!/usr/bin/env node
/**
 * Seeds a demo data directory, so a fresh desk does not open on an empty TV: two invented learners, Nell (11, UK,
 * maths, English and essay, seated) and Dana (an adult, Linga alone, B1 picked by hand). Ported from the demo film's
 * seeder (tools/film-capture/seed.mjs on film-studydesk), without the film's stick and camera parts.
 *
 *   npm run seed:demo -- --data <dir> [--force] [--port <n>] [--server <standalone server.js>]
 *
 * It writes through the desk's own session API: it starts a desk of its own on a free port (next start from this
 * desk/, so build first; or `node <server.js>` with --server, a standalone build), with DESK_DATA_DIR = <dir> and
 * every model engine pointed at a path that does not exist, so nothing is spent. Then, with that desk stopped, it
 * keeps only the demo profiles, drops the 4-digit code and the TV key (each install mints its own on first start),
 * and starts the desk once more to prove the seeded files load.
 *
 * It refuses, before touching anything: a desk/data directory (real learners live there), and a directory that is
 * not empty unless --force (which empties it first; a directory holding .git or package.json is refused even then).
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, parse, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const DESK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REAL = join(DESK, 'data');
const NEXT = join(DESK, 'node_modules', 'next', 'dist', 'bin', 'next');
/** Ports other desks on this machine hold. */
const FORBIDDEN = new Set([3000, 3002, 3128, 3517]);
const log = (s) => process.stdout.write(`seed-demo: ${s}\n`);

/** The demo learner. An invented name; 11 years old, UK system, all three modules. */
export const DEMO_LEARNER = { id: 'demo-nell', name: 'Nell', type: 'elementary', age: 11, system: 'uk', modules: ['maths', 'english', 'essay'] };
/** The grown-up: Dana, invented, `other` with no age, Adult mode (the 18+ confirmation is the mode itself), Linga alone. */
export const DEMO_ADULT = { id: 'demo-dana', name: 'Dana', type: 'other', mode: 'adult', modules: ['english'] };
const DEMO_IDS = new Set([DEMO_LEARNER.id, DEMO_ADULT.id]);
/** Dana's English part (lib/english/types.ts emptyEnglish(), with her preferences and a self-picked placement). */
const ADULT_ENGLISH = (at) => ({
  preferences: { level: 'B1', interest: 'food and wine', goal: 'a job interview in English', creativity: 'playful', challenge: 'realistic', correction: 'pauses', adultConfirmed: true },
  notes: [], evidence: [], achievements: {}, sessions: [], plan: null, taught: [], certificates: [], seenIds: [],
  placement: { at, band: 'B1', selfBand: 'B1', confidence: 'low', source: 'self', summary: '', focus: '', tasks: [] },
  placements: [{ at, band: 'B1', confidence: 'low', source: 'self' }],
});

/** Throws unless `dir` may be seeded: never a desk/data directory (this desk's, or any checkout's), never under one. */
export function assertDemoData(dir, { force = false } = {}) {
  if (!dir) throw new Error('--data <dir> is required: the directory to seed (never desk/data)');
  const d = resolve(dir);
  const low = d.toLowerCase(), real = REAL.toLowerCase();
  if (low === real || low.startsWith(real + sep)) throw new Error(`refusing ${d}: desk/data holds real learners' records`);
  if (/[\\/]desk[\\/]data([\\/]|$)/i.test(d)) throw new Error(`refusing ${d}: that is a desk/data directory, where real learners live`);
  if (d === parse(d).root || low === homedir().toLowerCase()) throw new Error(`refusing ${d}: not a data directory`);
  if (existsSync(d)) {
    const names = readdirSync(d);
    if (names.length && !force) throw new Error(`refusing ${d}: it is not empty (${names.slice(0, 4).join(', ')}${names.length > 4 ? ', ...' : ''}); pass --force to empty it and seed again`);
    if (names.some((n) => n === '.git' || n === 'package.json')) throw new Error(`refusing ${d}: it holds ${names.includes('.git') ? '.git' : 'package.json'}, so it is not a data directory`);
  }
  return d;
}

function args(argv) {
  const o = { data: '', force: false, port: 0, server: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') o.force = true;
    else if (a === '--data') o.data = argv[++i] ?? '';
    else if (a === '--port') o.port = Number(argv[++i]);
    else if (a === '--server') o.server = resolve(argv[++i] ?? '');
    else throw new Error(`unknown option ${a} (usage: --data <dir> [--force] [--port n] [--server server.js])`);
  }
  if (o.port && (!Number.isInteger(o.port) || FORBIDDEN.has(o.port))) throw new Error(`port ${o.port} is not one to seed on`);
  return o;
}

const freePort = () => new Promise((ok, no) => { const s = createServer(); s.unref(); s.on('error', no); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); }); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A desk of its own on `port`, serving `data`, with every model engine unreachable. */
async function startDesk(o, data, port) {
  const env = { ...process.env, DESK_DATA_DIR: data, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production',
    CLAUDE_BIN: join(data, 'no-such-claude.exe'), CODEX_JS: join(data, 'no-such-codex.js'), OLLAMA_HOST: 'http://127.0.0.1:9', ELEVENLABS_API_KEY: '' };
  delete env.ELEVENLABS_VOICE_ID;
  if (!o.server && !existsSync(join(DESK, '.next', 'BUILD_ID'))) throw new Error(`no build in ${join(DESK, '.next')}: run npm run build in desk/ first (or pass --server)`);
  const cmd = o.server ? [o.server] : [NEXT, 'start', '-p', String(port), '-H', '127.0.0.1'];
  const child = spawn(process.execPath, cmd, { cwd: o.server ? dirname(o.server) : DESK, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let out = '';
  child.stdout.on('data', (b) => { out += b; }); child.stderr.on('data', (b) => { out += b; });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`the desk exited (${child.exitCode}) before it answered:\n${out.slice(-2000)}`);
    if (await fetch(`${base}/api/session`).then((r) => r.ok, () => false)) return { base, child, log: () => out };
    await sleep(500);
  }
  stopDesk(child);
  throw new Error(`the desk at ${base} did not answer in 60 s:\n${out.slice(-2000)}`);
}

function stopDesk(child) {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ } }
  else child.kill('SIGTERM');
}
async function stopped(child) { stopDesk(child); for (let i = 0; i < 40 && child.exitCode === null && child.signalCode === null; i++) await sleep(250); }

/** The desk, spoken to as the TV: the key from <data>/pairing.json and the desk-tv cookie it sets. */
async function tvClient(base, data) {
  const key = JSON.parse(readFileSync(join(data, 'pairing.json'), 'utf8')).key;
  const r = await fetch(`${base}/tv?key=${encodeURIComponent(key)}`, { redirect: 'manual' });
  const cookie = (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).filter((c) => c.startsWith('desk-tv=')).join('; ');
  if (!cookie) throw new Error(`the desk at ${base} did not take the key from ${data}/pairing.json`);
  const session = async () => (await fetch(`${base}/api/session`, { headers: { cookie } })).json();
  const post = async (body) => {
    const res = await fetch(`${base}/api/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(body) });
    if (res.status !== 200) throw new Error(`${JSON.stringify(body)} -> ${res.status} ${await res.text()}`);
    return res.json();
  };
  return { session, post };
}

async function seedThrough(base, data) {
  const tv = await tvClient(base, data);
  await tv.post({ type: 'phones.forget' }).catch(() => null);
  await tv.post({ type: 'reset' });
  // Dana first, so Nell is the one seated when the seed is done
  for (const who of [DEMO_ADULT, DEMO_LEARNER]) {
    if (!(await tv.session()).profiles?.some((p) => p.id === who.id)) {
      await tv.post({ type: 'profile.draft', patch: who });
      await tv.post({ type: 'profile.save' });
    }
  }
  await tv.post({ type: 'learner.set', id: DEMO_LEARNER.id });
  const s = await tv.session();
  const dana = s.profiles?.find((p) => p.id === DEMO_ADULT.id);
  if (!dana) throw new Error('Dana was not saved');
  if (dana.mode !== 'adult') throw new Error(`Dana's mode is ${dana.mode}, not adult`);
  if (s.learner?.id !== DEMO_LEARNER.id) throw new Error(`the seated learner is ${s.learner?.id}, not ${DEMO_LEARNER.id}`);
}

/** With the desk stopped (a running desk writes its session back): only the demo profiles, no code, no key, no phones. */
function tidy(data) {
  const sf = join(data, 'session.json');
  const s = JSON.parse(readFileSync(sf, 'utf8'));
  s.profiles = (s.profiles ?? []).filter((p) => DEMO_IDS.has(p.id));
  delete s.pin; delete s.phoneUrl;
  writeFileSync(sf, JSON.stringify(s));
  const lf = join(data, 'learners.json');
  const book = existsSync(lf) ? JSON.parse(readFileSync(lf, 'utf8') || '{}') : {};
  for (const id of Object.keys(book)) if (!DEMO_IDS.has(id)) delete book[id];
  const was = book[DEMO_ADULT.id] ?? { id: DEMO_ADULT.id, skills: {}, writing: {}, memory: [], history: [], digest: [] };
  book[DEMO_ADULT.id] = { ...was, id: DEMO_ADULT.id, english: ADULT_ENGLISH(Date.now() - 3 * 86_400_000) };
  writeFileSync(lf, JSON.stringify(book));
  for (const f of ['pairing.json', 'usage.jsonl']) rmSync(join(data, f), { force: true });
  for (const f of readdirSync(data)) if (f.endsWith('.tmp')) rmSync(join(data, f), { force: true });
}

export async function seedDemo(o) {
  const data = assertDemoData(o.data, { force: o.force });
  if (existsSync(data) && readdirSync(data).length) { log(`--force: emptying ${data}`); rmSync(data, { recursive: true, force: true }); }
  mkdirSync(data, { recursive: true });
  const port = o.port || await freePort();
  let desk = await startDesk(o, data, port);
  try { await seedThrough(desk.base, data); } finally { await stopped(desk.child); }
  tidy(data);
  // once more, to prove the tidied files load: Nell seated, only the demo profiles
  desk = await startDesk(o, data, port);
  try {
    const s = await (await tvClient(desk.base, data)).session();
    const ids = (s.profiles ?? []).map((p) => p.id).sort().join(',');
    if (s.learner?.id !== DEMO_LEARNER.id || ids !== [...DEMO_IDS].sort().join(',')) throw new Error(`the seeded desk reloads as learner ${s.learner?.id}, profiles ${ids}`);
  } finally { await stopped(desk.child); }
  tidy(data);
  log(`seeded ${data}: ${DEMO_LEARNER.name} seated, ${DEMO_ADULT.name} on the switcher; files: ${readdirSync(data).join(', ')}`);
  return data;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let o;
  try { o = args(process.argv.slice(2)); assertDemoData(o.data, { force: o.force }); } catch (e) { process.stderr.write(`seed-demo: ${e.message}\n`); process.exit(2); }
  seedDemo(o).catch((e) => { process.stderr.write(`seed-demo: ${e.message}\n`); process.exit(1); });
}
