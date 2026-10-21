#!/usr/bin/env node
// Runs the Study Desk audition plan (desk/audio/audition/plan.json) through the guarded ElevenLabs tool beside this file.
// Default is a dry run: no key, no request, no write. `--generate` is the spending action; it stops at the first refusal
// or failure and never retries. A take that already exists is skipped, so a stopped run resumes where it stopped.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const dir = path.join(root, 'desk/audio/audition');
const plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8'));
const generate = process.argv.includes('--generate');

/** Every take the plan asks for, as the tool's argument list. */
export function takes(p = plan) {
  const out = [];
  for (const c of p.cues) for (const [fam, sound] of Object.entries(p.families)) {
    const text = `UI sound effect, ${sound}: ${c.brief}. Clean, no music, no voice, no background noise.`;
    out.push({ file: `sfx/${c.id}-${fam}.mp3`, session: 'desk-a1-sfx', args: ['sfx', '--text', text, '--seconds', String(c.seconds), '--influence', '0.6'] });
  }
  for (const t of p.tracks)
    out.push({ file: `music/${t.id}.mp3`, session: 'desk-a1-music', args: ['music', '--prompt', t.prompt, '--seconds', String(t.seconds)] });
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let estimate = 0;
  for (const t of takes()) {
    const out = path.join(dir, t.file);
    if (fs.existsSync(out)) { console.log(`skip ${t.file} (exists)`); continue; }
    const cap = String(plan.sessions[t.session].cap);
    const argv = [path.join(here, 'elevenlabs.mjs'), ...t.args, '--out', out, '--session', t.session, '--session-cap', cap];
    if (!generate) argv.push('--dry-run');
    const r = spawnSync(process.execPath, argv, { encoding: 'utf8' });
    if (r.status !== 0) { console.error(`stop at ${t.file}: ${r.stderr.trim()}`); process.exit(1); }
    const line = r.stdout.trim().split('\n').pop();
    if (!generate) estimate += JSON.parse(line).estimatedCredits;
    console.log(`${generate ? 'made' : 'plan'} ${t.file} ${line}`);
  }
  if (!generate) console.log(`dry run: ${takes().length} takes, ${estimate} estimated credits, 0 requests`);
}
