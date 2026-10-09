/**
 * Approximate integration (v2 M3b-3b; desk/src/lib/rules/calc2.ts 'approx-integral', the topic calc2-approx): the first
 * Calculus 2 shape. Hand values are Stewart 9e 7.7 (1/x over [1, 2]) and x^2 over [0, 2] and [0, 4], each checked
 * by an independent script. The frozen set requests (tools/calc-sets-frozen.json, written at the base by
 * tools/calc-sets-frozen-gen.cjs before any desk/src change) are recomputed and must be equal byte for byte. Offline:
 * no model, no server; the data directory is disposable.
 * Run with npm run test:rules in desk/ (directly: node tools/calc2-approx-test.cjs).
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const G=require('./calc-sets-frozen-gen.cjs');
after(()=>G.cleanup());

test('frozen sets: every Calculus 1 topic and the five Calculus 2 topics send the request they sent at the base, byte for byte',async()=>{
 const onDisk=fs.readFileSync(G.OUT,'utf8');
 const frozen=JSON.parse(onDisk);
 assert.equal(frozen.topics,27,'22 Calculus 1 topics and the five Calculus 2 topics');
 const now=G.text(await G.table());
 assert.equal(now===onDisk,true,'tools/calc-sets-frozen.json differs from what a set now sends: an existing set request moved');
});
