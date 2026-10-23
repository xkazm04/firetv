#!/usr/bin/env node
/**
 * The portable package: dist/study-desk-portable.zip, a built desk a judge unzips and starts with only Node.js 24
 * (and the Claude CLI signed in for the model features). Run from desk/: npm run package:portable [-- --no-build].
 *
 *   1. next build with DESK_STANDALONE=1 (desk/next.config.ts turns on output: "standalone" only then)
 *   2. stage dist/study-desk-portable/: app/ = .next/standalone + .next/static + public, demo-data/ seeded by
 *      desk/scripts/seed-demo.mjs through the staged server itself (never from desk/data), .env.example,
 *      start.cmd, start.sh and INSTALL.md from tools/portable/
 *   3. refuse to zip a staged tree that holds a .env file other than .env.example, a data/ directory, a pairing
 *      file, a key or keystore file, or text that looks like a token
 *   4. zip it (Windows: the system's bsdtar; elsewhere: zip)
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESK = join(REPO, 'desk');
const TEMPLATES = join(REPO, 'tools', 'portable');
const DIST = join(REPO, 'dist');
const NAME = 'study-desk-portable';
const STAGE = join(DIST, NAME);
const ZIP = join(DIST, `${NAME}.zip`);
const log = (s) => process.stdout.write(`package-portable: ${s}\n`);

/** Files that must never ship, by name; and text that looks like a credential. */
const BANNED_NAME = [/^\.env(\..+)?$/i, /^pairing\.json$/i, /\.(pem|key|p12|pfx|jks|keystore)$/i, /^id_(rsa|ed25519)/i, /^usage\.jsonl$/i];
const TOKEN = [/sk-ant-[A-Za-z0-9_-]{16,}/, /\bghp_[A-Za-z0-9]{30,}/, /\bgithub_pat_[A-Za-z0-9_]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/, /\bxox[bap]-[A-Za-z0-9-]{20,}/,
  /(ELEVENLABS_API_KEY|STT_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY)\s*[=:]\s*["']?[A-Za-z0-9_-]{12,}/];
const TEXT_EXT = /\.(js|cjs|mjs|json|ts|map|md|txt|html|css|cmd|sh|yml|yaml|env|example)$/i;

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { out.push(p + '/'); walk(p, out); } else out.push(p);
  }
  return out;
}

/** Every reason the staged tree may not ship; empty when it may. */
export function audit(stage) {
  const bad = [];
  for (const p of walk(stage)) {
    const rel = relative(stage, p).replace(/\\/g, '/');
    const name = rel.replace(/\/$/, '').split('/').pop();
    if (p.endsWith('/')) {
      if (/^app\/data$/.test(rel.replace(/\/$/, '')) || /(^|\/)desk\/data$/.test(rel.replace(/\/$/, ''))) bad.push(`${rel}: a desk data directory`);
      continue;
    }
    if (rel === '.env.example') continue;
    if (BANNED_NAME.some((re) => re.test(name))) { bad.push(`${rel}: a file that must not ship`); continue; }
    if (!TEXT_EXT.test(name) || statSync(p).size > 8_000_000) continue;
    const text = readFileSync(p, 'utf8');
    for (const re of TOKEN) if (re.test(text)) bad.push(`${rel}: text matching ${re.source.slice(0, 30)}`);
  }
  // the demo data holds the two demo learners and nothing else
  const dd = join(stage, 'demo-data');
  const names = existsSync(dd) ? readdirSync(dd).sort().join(',') : '';
  if (names !== 'learners.json,session.json') bad.push(`demo-data holds ${names || 'nothing'}, not learners.json and session.json`);
  else {
    const demo = (id) => id === 'demo-dana' || id === 'demo-nell';
    const book = Object.keys(JSON.parse(readFileSync(join(dd, 'learners.json'), 'utf8')));
    if (!book.every(demo)) bad.push(`demo-data/learners.json holds ${book.join(',')}, not only the demo learners`);
    const s = JSON.parse(readFileSync(join(dd, 'session.json'), 'utf8'));
    const ids = (s.profiles ?? []).map((p) => p.id).sort().join(',');
    if (ids !== 'demo-dana,demo-nell' || s.learner?.id !== 'demo-nell') bad.push(`demo-data/session.json seats ${s.learner?.id} with profiles ${ids}, not Nell with Nell and Dana`);
  }
  return bad;
}

const node = (args, opts = {}) => execFileSync(process.execPath, args, { stdio: 'inherit', ...opts });

function build() {
  log('next build (standalone)');
  const env = { ...process.env, DESK_STANDALONE: '1', NEXT_TELEMETRY_DISABLED: '1' };
  node([join(DESK, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], { cwd: DESK, env });
  if (!existsSync(join(DESK, '.next', 'standalone', 'server.js'))) throw new Error('the build wrote no .next/standalone/server.js: is DESK_STANDALONE read in desk/next.config.ts?');
}

function stage() {
  rmSync(STAGE, { recursive: true, force: true });
  const app = join(STAGE, 'app');
  mkdirSync(app, { recursive: true });
  cpSync(join(DESK, '.next', 'standalone'), app, { recursive: true });
  // the standalone copy never carries a desk's data or local settings, whatever the tracer picked up
  for (const n of readdirSync(app)) if (n === 'data' || (/^\.env/.test(n) && n !== '.env.example')) rmSync(join(app, n), { recursive: true, force: true });
  // nor the sources and notes the tracer copies beside server.js: the server runs from .next/ and node_modules/ alone
  for (const n of ['src', 'scripts', 'audio', 'AGENTS.md', 'CLAUDE.md', 'README.md', 'next.config.ts', 'tsconfig.json', 'tsconfig.tsbuildinfo', 'package-lock.json']) rmSync(join(app, n), { recursive: true, force: true });
  cpSync(join(DESK, '.next', 'static'), join(app, '.next', 'static'), { recursive: true });
  cpSync(join(DESK, 'public'), join(app, 'public'), { recursive: true });
  cpSync(join(DESK, '.env.example'), join(STAGE, '.env.example'));
  writeFileSync(join(STAGE, 'start.cmd'), readFileSync(join(TEMPLATES, 'start.cmd'), 'utf8').replace(/\r?\n/g, '\r\n'));
  writeFileSync(join(STAGE, 'start.sh'), readFileSync(join(TEMPLATES, 'start.sh'), 'utf8').replace(/\r\n/g, '\n'), { mode: 0o755 });
  cpSync(join(TEMPLATES, 'INSTALL.md'), join(STAGE, 'INSTALL.md'));
  log('seeding demo-data through the staged server');
  node([join(DESK, 'scripts', 'seed-demo.mjs'), '--data', join(STAGE, 'demo-data'), '--server', join(app, 'server.js')]);
}

function zip() {
  rmSync(ZIP, { force: true });
  if (process.platform === 'win32') {
    const tar = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    execFileSync(tar, ['-a', '-c', '-f', ZIP, NAME], { cwd: DIST, stdio: 'inherit' });
  } else execFileSync('zip', ['-qr', ZIP, NAME], { cwd: DIST, stdio: 'inherit' });
}

async function main() {
  if (!existsSync(join(DESK, 'node_modules', 'next'))) throw new Error('no desk/node_modules: run npm ci in desk/ first');
  if (!process.argv.includes('--no-build')) build();
  stage();
  const bad = audit(STAGE);
  if (bad.length) throw new Error(`the staged tree may not ship:\n  ${bad.join('\n  ')}`);
  log(`audit: clean (${walk(STAGE).length} entries)`);
  zip();
  log(`${relative(REPO, ZIP)}: ${(statSync(ZIP).size / 1048576).toFixed(1)} MB`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { process.stderr.write(`package-portable: ${e.message}\n`); process.exit(1); });
}
