/**
 * The rules runner (npm run test:rules in desk/): every suite listed in desk/package.json's "rulesSuites", one at a
 * time (unless --jobs), in list order, each as its own `node --test-reporter=tap <suite>` process with cwd desk/ and the parent's env plus one addition:
 * DESK_USAGE_FILE, a fresh <os tmpdir>/desk-usage-XXXX/usage.jsonl per suite (removed after it, best effort), unless the parent
 * already sets it. Without it meter.ts's usage ledger falls back to <cwd>/data, so a stub-engine suite would append rows
 * to desk/data, where the real learners live.
 * It never stops at the first red suite: every suite runs, then one table says which were red and why.
 * --jobs N (or RULES_JOBS=N) runs up to N suites at once; each suite's stdout and stderr are then held and printed whole,
 * under its own "# run-rules:" header, when it ends, and the table stays in list order. The default is 1: one at a time,
 * streamed as it runs. A value that is not a positive whole number is refused (exit 1).
 *
 * A suite is green only when it exits 0 by itself AND its last unindented TAP summary shows tests >= 1, fail 0 and
 * cancelled 0. A non-zero exit or signal, an uncaught throw, no summary (a suite that calls process.exit(0) before
 * node:test reports), 0 tests, a missing file and a timeout (RULES_SUITE_TIMEOUT_MS, default 600000) are all red.
 * The runner refuses to start (exit 1) on a missing, empty or duplicated list.
 *
 * Usage: node ../tools/run-rules.cjs [--list <json file: an array, or an object with rulesSuites>] [--jobs N] (cwd desk/).
 * Pure: no network, no model. Suite file names in the list are relative to tools/.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { spawn } = require('node:child_process');

const TOOLS = __dirname, DESK = path.resolve(TOOLS, '../desk');
const TIMEOUT = Number(process.env.RULES_SUITE_TIMEOUT_MS) > 0 ? Number(process.env.RULES_SUITE_TIMEOUT_MS) : 600000;

function refuse(msg) { console.error(`run-rules: ${msg}`); process.exit(1); }

function readList() {
  const at = process.argv.indexOf('--list');
  const file = at >= 0 ? path.resolve(process.argv[at + 1] || '') : path.join(DESK, 'package.json');
  if (at >= 0 && !process.argv[at + 1]) refuse('--list needs a json file');
  let json;
  try { json = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { refuse(`cannot read the suite list from ${file}: ${e.message}`); }
  const list = Array.isArray(json) ? json : json && json.rulesSuites;
  if (!Array.isArray(list)) refuse(`${file} has no rulesSuites array`);
  if (list.length === 0) refuse(`rulesSuites in ${file} is empty`);
  if (list.some(s => typeof s !== 'string' || !s)) refuse(`rulesSuites in ${file} holds a non-string entry`);
  const seen = new Set();
  for (const s of list) { if (seen.has(s)) refuse(`rulesSuites lists ${s} twice`); seen.add(s); }
  return list;
}

/** How many suites run at once: --jobs N, else RULES_JOBS, else 1. */
function readJobs() {
  const at = process.argv.indexOf('--jobs');
  const raw = at >= 0 ? process.argv[at + 1] : process.env.RULES_JOBS;
  if (at < 0 && (raw === undefined || raw === '')) return 1;
  if (!/^[1-9]\d*$/.test(String(raw ?? ''))) refuse(`--jobs (or RULES_JOBS) needs a positive whole number, not ${raw ?? 'nothing'}`);
  return Number(raw);
}

/** The last unindented "# name N" lines of a TAP stream. */
function summary(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = /^# (tests|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)\s*$/.exec(line);
    if (m) out[m[1]] = Number(m[2]);
  }
  return 'tests' in out ? out : null;
}

/** One suite. live: stream its output as it runs; otherwise hold stdout and stderr in r.log for the caller to print whole. */
function runOne(name, live = true) {
  return new Promise(resolve => {
    const file = path.join(TOOLS, name), t0 = Date.now();
    if (!fs.existsSync(file)) { const m = `run-rules: missing file ${file}`; if (live) console.error(m); return resolve({ name, ms: 0, why: 'missing file', log: `${m}\n` }); }
    let text = '', log = '', timedOut = false, ledgerDir = null;
    const env = { ...process.env };
    if (!env.DESK_USAGE_FILE) {
      try { ledgerDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-usage-')); env.DESK_USAGE_FILE = path.join(ledgerDir, 'usage.jsonl'); } catch { ledgerDir = null; }
    }
    const cleanup = () => { if (ledgerDir) try { fs.rmSync(ledgerDir, { recursive: true, force: true }); } catch {} };
    const child = spawn(process.execPath, ['--test-reporter=tap', file], { cwd: DESK, env, stdio: ['ignore', 'pipe', live ? 'inherit' : 'pipe'] });
    child.stdout.on('data', d => { if (live) process.stdout.write(d); else log += d; text += d; });
    if (!live) child.stderr.on('data', d => { log += d; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, TIMEOUT);
    child.on('error', e => { clearTimeout(timer); cleanup(); resolve({ name, ms: Date.now() - t0, why: `spawn failed: ${e.message}`, log }); });
    child.on('close', (code, signal) => {
      clearTimeout(timer); cleanup();
      const s = summary(text), r = { name, ms: Date.now() - t0, sum: s, log };
      if (timedOut) r.why = `timeout after ${TIMEOUT} ms`;
      else if (signal) r.why = `signal ${signal}`;
      else if (code !== 0) r.why = `exit ${code}`;
      else if (!s) r.why = 'no summary';
      else if (s.tests < 1) r.why = '0 tests';
      else if (s.fail > 0) r.why = `${s.fail} failed`;
      else if (s.cancelled > 0) r.why = `${s.cancelled} cancelled`;
      resolve(r);
    });
  });
}

(async () => {
  const list = readList(), jobs = readJobs(), t0 = Date.now(), results = [];
  if (jobs === 1) {
    for (const name of list) {
      console.log(`\n# run-rules: ${name}`);
      results.push(await runOne(name));
    }
  } else {
    let next = 0;
    const worker = async () => {
      while (next < list.length) {
        const i = next++, r = await runOne(list[i], false);
        process.stdout.write(`\n# run-rules: ${list[i]}\n${r.log}`);
        results[i] = r;
      }
    };
    await Promise.all(Array.from({ length: Math.min(jobs, list.length) }, worker));
  }
  const rows = results.map(r => {
    const s = r.sum || {};
    return [r.name, r.why ? 'RED' : 'green', s.tests ?? '-', s.pass ?? '-', s.fail ?? '-', r.ms, r.why || ''];
  });
  const head = ['suite', 'verdict', 'tests', 'pass', 'fail', 'ms', 'why'];
  const width = head.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
  const fmt = r => r.map((c, i) => (i === 0 || i === 1 || i === 6 ? String(c).padEnd(width[i]) : String(c).padStart(width[i]))).join('  ').trimEnd();
  console.log(`\n# run-rules: ${results.length} suites\n${fmt(head)}\n${rows.map(fmt).join('\n')}`);
  const sum = k => results.reduce((a, r) => a + ((r.sum && r.sum[k]) || 0), 0);
  const red = results.filter(r => r.why);
  console.log(`\ntotals: ${results.length - red.length} green, ${red.length} red; tests ${sum('tests')}, pass ${sum('pass')}, fail ${sum('fail')}; duration_ms sum ${Math.round(sum('duration_ms'))}; wall ${Date.now() - t0} ms; jobs ${jobs}`);
  if (red.length) console.log(`RED: ${red.map(r => `${r.name} (${r.why})`).join(', ')}`);
  process.exit(red.length ? 1 : 0);
})();
