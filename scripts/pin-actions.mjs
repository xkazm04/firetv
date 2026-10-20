#!/usr/bin/env node
// Pins every GitHub Action in .github/workflows/*.yml to a full commit SHA, keeping the tag as a comment:
//   uses: actions/checkout@v4   ->   uses: actions/checkout@<40-hex sha> # v4
// Dependabot's github-actions updates (.github/dependabot.yml) then move the SHA and the comment together.
//
// Usage (from the repo root):
//   node scripts/pin-actions.mjs            resolve each tag through the GitHub API and rewrite the files
//   node scripts/pin-actions.mjs --check    no network; list every ref that is not a SHA, exit 1 if any
// Set GITHUB_TOKEN or GH_TOKEN (for example `GH_TOKEN=$(gh auth token)`) to lift the anonymous rate limit.
//
// Each SHA comes from GitHub at run time (GET /repos/{owner}/{repo}/commits/{ref}, which peels an
// annotated tag to its commit). Never type a SHA by hand (.ai/memory/0013).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.github/workflows';
const CHECK = process.argv.includes('--check');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
// `uses: owner/repo[/path]@ref [# comment]`; local (./) and docker:// refs never match.
const USES = /^(\s*-?\s*uses:\s*)([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[^@\s]+)?)@([^\s#]+)(.*)$/;
const SHA = /^[0-9a-f]{40}$/;

const cache = new Map();
async function resolve(action, ref) {
  const repo = action.split('/').slice(0, 2).join('/');
  const key = repo + '@' + ref;
  if (cache.has(key)) return cache.get(key);
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`, {
    headers: { accept: 'application/vnd.github.sha', 'user-agent': 'firetv-pin-actions', ...(TOKEN ? { authorization: 'Bearer ' + TOKEN } : {}) },
  });
  const body = (await res.text()).trim();
  if (!res.ok || !SHA.test(body)) throw new Error(`${key}: GitHub answered HTTP ${res.status} ${body.slice(0, 120)}`);
  cache.set(key, body);
  return body;
}

const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)).map((f) => join(DIR, f));
let floating = 0, pinned = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(USES);
    if (!m || SHA.test(m[3])) continue;
    const [, pre, action, ref, rest] = m;
    floating++;
    if (CHECK) { console.log(`${file}:${i + 1}  ${action}@${ref}`); continue; }
    const sha = await resolve(action, ref);
    const note = rest.trim().replace(/^#\s*/, '');
    lines[i] = `${pre}${action}@${sha} # ${ref}${note ? ' - ' + note : ''}`;
    changed = true;
    pinned++;
    console.log(`${file}:${i + 1}  ${action}@${ref} -> ${sha}`);
  }
  if (changed) writeFileSync(file, lines.join(eol));
}

if (CHECK) {
  console.log(floating ? `${floating} action ref(s) float on a tag or branch.` : 'Every action ref is pinned to a commit SHA.');
  process.exit(floating ? 1 : 0);
}
console.log(`Pinned ${pinned} action ref(s) across ${files.length} workflow file(s).`);
