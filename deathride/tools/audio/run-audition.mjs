// Deliberately sequential; resume only complete, hash-matching takes. Never retries POST.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { samples, directions, voices, session, cap, line, cli } from './audition-plan.mjs';
const base = 'audio/audition';
fs.mkdirSync(base, { recursive: true });
const generate = process.argv.includes('--generate');
function command(args) {
  const result = spawnSync(process.execPath, ['tools/audio/elevenlabs.mjs', ...args], { encoding: 'utf8', timeout: 300000, maxBuffer: 2 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || 'Guarded command failed or timed out; stop and reconcile');
  return JSON.parse(result.stdout);
}
function save(name, data) { fs.writeFileSync(`${base}/${name}.json`, JSON.stringify(data, null, 2) + '\n'); }
try {
  if (process.argv.includes('--credits-final')) {
    const result = command(['credits']); save('credits-final', result); console.log(JSON.stringify(result));
  } else if (!generate) {
    const estimates = samples.map(s => ({ id: s.id, ...command([...cli(s), '--dry-run']) }));
    const estimatedCredits = estimates.reduce((sum, e) => sum + e.estimatedCredits, 0);
    if (estimatedCredits > cap || line.length < 100 || line.length > 150) throw new Error('Invalid proof kit budget or speech length');
    save('plan', { session, cap, reserve: 8000, line, lineCharacters: line.length, directions, voices, samples });
    save('dry-run', { at: new Date().toISOString(), estimatedCredits, headroom: cap - estimatedCredits, estimates });
    console.log(JSON.stringify({ dryRun: true, samples: samples.length, lineCharacters: line.length, estimatedCredits, headroom: cap - estimatedCredits }));
  } else {
    const saved = JSON.parse(fs.readFileSync(`${base}/plan.json`, 'utf8'));
    if (JSON.stringify(saved.samples) !== JSON.stringify(samples)) throw new Error('Plan changed since dry-run');
    if (!fs.existsSync(`${base}/credits-before.json`)) save('credits-before', command(['credits']));
    const accountVoices = command(['voices']);
    const selected = Object.values(voices).map(v => {
      const match = accountVoices.find(x => x.id === v.id);
      if (!match) throw new Error('Selected voice unavailable; stop before generation');
      return { ...match, castingReason: v.reason };
    });
    if (!fs.existsSync(`${base}/voice-candidates.json`)) save('voice-candidates', { at: new Date().toISOString(), voices: selected });
    for (const sample of samples) {
      const out = `${base}/raw/${sample.id}.mp3`;
      if (fs.existsSync(out)) {
        const sidecar = JSON.parse(fs.readFileSync(out + '.json', 'utf8'));
        const hash = createHash('sha256').update(fs.readFileSync(out)).digest('hex');
        if (sidecar.status !== 'complete' || sidecar.sha256 !== hash || sidecar.session !== session) throw new Error('Existing take is not complete/matching; stop');
        console.log(JSON.stringify({ retained: sample.id })); continue;
      }
      console.log(JSON.stringify({ sample: sample.id, ...command(cli(sample)) }));
    }
    const after = command(['credits']); save('credits-after', after);
    console.log(JSON.stringify({ after }));
  }
} catch (e) { console.error(e.message); process.exitCode = 1; }
