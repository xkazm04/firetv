import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { request, checkBudget, sessionUsage } from './elevenlabs.mjs';

test('invalid costs and unsafe parameters fail before generation', () => {
  for (const seconds of ['NaN', '-1', 'Infinity', true, '0'])
    assert.throws(() => request({ _: ['music'], prompt: 'original', out: 'x.mp3', seconds }));
  assert.throws(() => request({ _: ['music'], prompt: 'original', out: 'x.mp3', seconds: 181 }));
  assert.equal(request({ _: ['sfx'], text: 'metal', out: 'x.mp3', seconds: 1 }).estimate, 100);
  assert.equal(request({ _: ['music'], prompt: 'original', out: 'x.mp3', seconds: 20 }).estimate, 1200);
});
test('cap and reserve boundaries, pending reservations and duplicate ledger rows', () => {
  const base = { estimate: 100, remaining: 8100, reserve: 8000, spent: 8900, cap: 9000 };
  assert.doesNotThrow(() => checkBudget(base));
  assert.throws(() => checkBudget({ ...base, remaining: 8099 }), /Reserve/);
  assert.throws(() => checkBudget({ ...base, spent: 8901 }), /cap/);
  assert.throws(() => checkBudget({ ...base, pending: ['unknown-billing'] }), /Unresolved/);
  assert.deepEqual(sessionUsage([
    { session: 'a', id: '1', status: 'pending', budgetCharge: 100 },
    { session: 'a', id: '1', status: 'complete', budgetCharge: 120 },
    { session: 'b', id: '2', status: 'complete', budgetCharge: 300 },
    { session: 'a', id: '3', status: 'pending', budgetCharge: 100 },
  ], 'a'), { spent: 220, pending: ['3'] });
});
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'deathride-audio-test-'));
  t.after(() => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep + 'deathride-audio-test-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, 'tools/audio'), { recursive: true });
  fs.copyFileSync(new URL('./elevenlabs.mjs', import.meta.url), path.join(root, 'tools/audio/elevenlabs.mjs'));
  const mock = path.join(root, 'mock.mjs');
  fs.writeFileSync(mock, `import fs from 'node:fs';
    let used=0;
    globalThis.fetch=async (url,init)=>{
      fs.appendFileSync('requests.txt',init.method==='POST'?'POST\\n':'GET\\n');
      if(init.method==='POST') {
        used+=100;
        if(process.env.MOCK_FAIL) return new Response('secret provider body',{status:500});
        return new Response(new Uint8Array([73,68,51,1,2,3]));
      }
      return Response.json({tier:'test',character_count:used,character_limit:20000,next_character_count_reset_unix:1791142301});
    };`);
  const run = (extra = [], env = {}) => spawnSync(process.execPath,
    ['--import', pathToFileURL(mock).href, 'tools/audio/elevenlabs.mjs', 'sfx', '--text', 'original metal impact', '--seconds', '1',
      '--session', 'test', '--session-cap', '100', ...extra], {
      cwd: root, encoding: 'utf8', env: { ...process.env, ELEVENLABS_API_KEY: 'FAKE-TEST-KEY', DEATHRIDE_AUDIO_RESERVE: '8000', ...env } });
  return { root, run };
}
test('real CLI persists cap across process restarts and refuses overwrite', t => {
  const { root, run } = fixture(t);
  assert.equal(run(['--out', 'audio/one.mp3']).status, 0);
  const second = run(['--out', 'audio/two.mp3']);
  assert.equal(second.status, 1); assert.match(second.stderr, /cap refused/);
  assert.equal(run(['--out', 'audio/one.mp3']).status, 1);
  assert.equal(fs.readFileSync(path.join(root, 'requests.txt'), 'utf8').split('POST').length - 1, 1);
  const sidecar = JSON.parse(fs.readFileSync(path.join(root, 'audio/one.mp3.json')));
  assert.equal(sidecar.status, 'complete'); assert.equal(sidecar.budgetCharge, 100);
  assert.ok(!JSON.stringify(sidecar).includes('FAKE-TEST-KEY'));
});
test('failed POST is not retried and unresolved billing blocks the next process', t => {
  const { root, run } = fixture(t);
  const failed = run(['--out', 'audio/one.mp3'], { MOCK_FAIL: '1' });
  assert.equal(failed.status, 1); assert.ok(!failed.stderr.includes('secret provider body'));
  assert.match(run(['--out', 'audio/two.mp3']).stderr, /Unresolved/);
  assert.equal(fs.readFileSync(path.join(root, 'requests.txt'), 'utf8').split('POST').length - 1, 1);
});
test('dry run neither calls network nor writes session/ledger/output', t => {
  const { root, run } = fixture(t);
  assert.equal(run(['--out', 'audio/one.mp3', '--dry-run']).status, 0);
  assert.equal(fs.existsSync(path.join(root, 'requests.txt')), false);
  assert.equal(fs.existsSync(path.join(root, 'tools/audio/ledger.jsonl')), false);
  assert.equal(fs.existsSync(path.join(root, 'audio/one.mp3')), false);
});
test('generation lock rejects parallel writers before any network request', t => {
  const { root, run } = fixture(t);
  fs.writeFileSync(path.join(root, 'tools/audio/.generation.lock'), 'another process');
  assert.match(run(['--out', 'audio/one.mp3']).stderr, /lock exists/);
  assert.equal(fs.existsSync(path.join(root, 'requests.txt')), false);
});
