/**
 * The product a run exercised, as a fact the repo can prove: the desk/src files the driver loads, each with its git blob.
 * The instrument (recertify.cjs instrumentOf) says what produced a run; this says what it was run against, and sits
 * beside it in run.json (`product`), never inside it, so a product change is never read as an instrument change.
 *
 *   surface()                       -> the repo-relative, sorted desk/src files the driver loads (derived, not listed)
 *   stampOf(repo, files, git?)      -> { commit, dirty, files: { path: git blob sha } } of the working tree now
 *   seenOf(run, opts)               -> { commit, files, source: 'run.json' | 'git' } for a run, or null (unknown)
 *   changedBetween(seen, now)       -> { changed: [path], total } between two file -> blob maps
 *
 * The load set is whatever require.cache holds under desk/src after the driver's entry modules load and one Linga
 * screen renders (surface.cjs install(), the modules linga-text.cjs reads), measured in a child process on a scratch
 * DESK_DATA_DIR so nothing here touches desk/data. A run without a stamp is read from git: the commit that first added
 * its findings.json, with that commit's blobs of the same files. A run with neither is unknown, never current.
 * `git` is a runner `(args, { input }) -> stdout` bound to a repo; tests inject one. Nothing here calls a model.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { spawnSync } = require('node:child_process');
const REPO = path.resolve(__dirname, '../..'), DESK = path.join(REPO, 'desk');

/** A git runner bound to `repo`: stdout as a string, a thrown Error on a non-zero exit. */
const gitOf = repo => (args, { input } = {}) => {
  const r = spawnSync('git', args, { cwd: repo, input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`git ${args[0]} exited ${r.status}: ${String(r.stderr).trim()}`);
  return r.stdout;
};

// ---------------------------------------------------------------- the load set
/** The modules the LT driver loads (linga-text.cjs loadDesk() and child(), surface.cjs load()). */
const ENTRIES = ['lib/engines/codex.ts', 'lib/engines/text.ts', 'lib/english/view.ts', 'lib/english/conversation.ts', 'lib/session/store.ts', 'lib/english/curriculum.ts', 'lib/english/placement.ts', 'english/LingaTV.tsx', 'english/LingaPhone.tsx'];
const MARK = 'uat-product-surface:';
let memo = null;
/** The desk/src files the driver loads, sorted and repo-relative. Measured once per process, in a child on scratch data. */
function surface() {
  if (memo) return [...memo];
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-product-'));
  try {
    const r = spawnSync(process.execPath, [__filename, '--surface'], { env: { ...process.env, DESK_DATA_DIR: scratch }, encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024, windowsHide: true });
    const line = String(r.stdout).split(/\r?\n/).find(l => l.startsWith(MARK));
    if (r.status !== 0 || !line) throw new Error(`could not measure the product surface: ${String(r.stderr).trim().slice(0, 300) || `exit ${r.status}`}`);
    memo = JSON.parse(line.slice(MARK.length));
  } finally { fs.rmSync(scratch, { recursive: true, force: true }); }
  return [...memo];
}
/** Child mode: load the entries, render one screen, print the desk/src files in require.cache. */
function measure() {
  const SF = require('./surface.cjs');
  SF.install();
  for (const e of ENTRIES) require(path.join(DESK, 'src', e));
  SF.surfaceOf(require(path.join(DESK, 'src/lib/session/store.ts')).getSession());
  const src = path.join(DESK, 'src') + path.sep;
  return Object.keys(require.cache).filter(k => k.startsWith(src) && !k.includes('node_modules'))
    .map(k => path.relative(REPO, k).split(path.sep).join('/')).filter(f => !f.startsWith('desk/data')).sort();
}

// ---------------------------------------------------------------- stamps
const lines = s => String(s).split(/\r?\n/).filter(Boolean);
/** { path: blob sha } at `commit` for `files` (a path missing at that commit is absent). */
function blobsAt(git, commit, files) {
  const out = {};
  if (!files.length) return out;
  for (const l of lines(git(['ls-tree', '-r', commit, '--', ...files]))) {
    const m = l.match(/^\d+ blob ([0-9a-f]{4,64})\t(.+)$/);
    if (m) out[m[2]] = m[1];
  }
  return out;
}
/** The working tree's stamp: HEAD, whether any of the files differs from HEAD, and each file's git blob now. */
function stampOf(repo, files, git = gitOf(repo)) {
  const commit = git(['rev-parse', 'HEAD']).trim();
  const now = lines(git(['hash-object', '--stdin-paths'], { input: files.join('\n') }));
  if (now.length !== files.length) throw new Error(`git hash-object returned ${now.length} blobs for ${files.length} files`);
  const blobs = Object.fromEntries(files.map((f, i) => [f, now[i]])), head = blobsAt(git, commit, files);
  return { commit, dirty: files.some(f => head[f] !== blobs[f]), files: blobs };
}

/**
 * What a run saw: its own stamp when run.json carries one, else the blobs of `files` at the commit that first added
 * its findings.json. null when neither exists. `run` is { dir }.
 */
function seenOf(run, { repo, git = repo && gitOf(repo), files = [], cache = new Map() } = {}) {
  let stamp = null;
  try { stamp = JSON.parse(fs.readFileSync(path.join(run.dir, 'run.json'), 'utf8')).product; } catch { /* no run.json */ }
  if (stamp && stamp.files && typeof stamp.files === 'object') return { commit: typeof stamp.commit === 'string' ? stamp.commit : null, files: stamp.files, source: 'run.json' };
  if (!git || !repo) return null;
  try {
    const rel = path.relative(repo, path.join(run.dir, 'findings.json')).split(path.sep).join('/');
    const commit = lines(git(['log', '--diff-filter=A', '--format=%H', '--', rel])).at(-1);
    if (!commit) return null;
    const key = `${commit}\0${files.join('\n')}`;
    if (!cache.has(key)) cache.set(key, blobsAt(git, commit, files));
    return { commit, files: cache.get(key), source: 'git' };
  } catch { return null; }
}

/** The paths whose blob differs between two maps (a path only one side has counts), and how many paths in all. */
function changedBetween(seen, now) {
  const all = [...new Set([...Object.keys(seen), ...Object.keys(now)])].sort();
  return { changed: all.filter(f => seen[f] !== now[f]), total: all.length };
}

if (require.main === module && process.argv[2] === '--surface') {
  const out = `${MARK}${JSON.stringify(measure())}\n`;
  process.stdout.write(out, () => process.exit(0));
}

module.exports = { surface, stampOf, seenOf, changedBetween, gitOf, blobsAt, REPO };
