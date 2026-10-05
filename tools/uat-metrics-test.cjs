/**
 * One metric registry (uat/driver/metrics.cjs) that the judge schema, the gates, the roll-up, the before/after delta and
 * the report all read. A metric is declared once; nothing else lists the metric set.
 * Run with npm test in desk/ (directly: node tools/uat-metrics-test.cjs).
 *
 * Pure: reads the overlay's journey files and rubric, writes only to the OS temp dir, calls no model. The judge schema
 * snapshots below were captured from the hand-kept schema before the registry existed (case 1 pins them).
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const { test, after } = require('node:test');
const UAT = path.resolve(__dirname, '../uat'), DRIVER = path.join(UAT, 'driver');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uat-metrics-'));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const D = () => require(path.join(DRIVER, 'linga-text.cjs')), V = () => require(path.join(DRIVER, 'verdict.cjs')), R = () => require(path.join(DRIVER, 'recertify.cjs')), M = () => require(path.join(DRIVER, 'metrics.cjs'));

// judgeSchema([], []) and judgeSchema(['x'], ['D1', 'D2']) as the hand-kept code built them
const SNAPSHOT = {"a":{"type":"object","additionalProperties":false,"required":["verdict","criteria","metrics","findings","timeSaved","voice"],"properties":{"verdict":{"type":"string","enum":["pass","conditional","fail","not-reached"]},"criteria":{"type":"array","items":{"type":"object","additionalProperties":false,"required":["id","result","evidence"],"properties":{"id":{"type":"string"},"result":{"type":"string","enum":["pass","fail","n-a"]},"evidence":{"type":"string","maxLength":500}}}},"metrics":{"type":"object","additionalProperties":false,"required":["judgeAgreement","topicFit","pitch","moments","boundaries"],"properties":{"judgeAgreement":{"type":"object","additionalProperties":false,"required":["agree","total","disagreements"],"properties":{"agree":{"type":"integer"},"total":{"type":"integer"},"disagreements":{"type":"string","maxLength":800}}},"topicFit":{"type":"object","additionalProperties":false,"required":["fit","safe","total"],"properties":{"fit":{"type":"integer"},"safe":{"type":"integer"},"total":{"type":"integer"}}},"pitch":{"type":"object","additionalProperties":false,"required":["at","below","above"],"properties":{"at":{"type":"integer"},"below":{"type":"integer"},"above":{"type":"integer"}}},"moments":{"type":"object","additionalProperties":false,"required":["correctUseful","total","learnerTurnsWithClearErrors","missedClearErrors"],"properties":{"correctUseful":{"type":"integer"},"total":{"type":"integer"},"learnerTurnsWithClearErrors":{"type":"integer"},"missedClearErrors":{"type":"integer"}}},"boundaries":{"type":"object","additionalProperties":false,"required":["breaches","notes"],"properties":{"breaches":{"type":"integer"},"notes":{"type":"string","maxLength":600}}}}},"findings":{"type":"array","maxItems":8,"items":{"type":"object","additionalProperties":false,"required":["type","dimension","title","expected","got","evidence","frequency","reachability","trust_erosion","boundary","suggested_acceptance","code_hint"],"properties":{"type":{"type":"string","enum":["missing-feature","quality-gap","broken-flow","confusion","trust","strength"]},"dimension":{"type":"string","enum":["completion","effort","clarity","trust","missing","time-saved","senior-quality"]},"title":{"type":"string","maxLength":160},"expected":{"type":"string","maxLength":400},"got":{"type":"string","maxLength":500},"evidence":{"type":"string","maxLength":600},"frequency":{"type":"string","enum":["low","med","high"]},"reachability":{"type":"string","enum":["low","med","high"]},"trust_erosion":{"type":"string","enum":["low","med","high"]},"boundary":{"type":"boolean"},"suggested_acceptance":{"type":"string","maxLength":300},"code_hint":{"type":"string","maxLength":200}}}},"timeSaved":{"type":"object","additionalProperties":false,"required":["minutes","confidence"],"properties":{"minutes":{"type":"integer"},"confidence":{"type":"string","enum":["low","medium","high"]}}},"voice":{"type":"string","maxLength":1400}}},"b":{"type":"object","additionalProperties":false,"required":["verdict","criteria","done","metrics","findings","timeSaved","voice","prior"],"properties":{"verdict":{"type":"string","enum":["pass","conditional","fail","not-reached"]},"criteria":{"type":"array","items":{"type":"object","additionalProperties":false,"required":["id","result","evidence"],"properties":{"id":{"type":"string"},"result":{"type":"string","enum":["pass","fail","n-a"]},"evidence":{"type":"string","maxLength":500}}}},"done":{"type":"array","minItems":2,"maxItems":2,"items":{"type":"object","additionalProperties":false,"required":["id","result","evidence"],"properties":{"id":{"type":"string","enum":["D1","D2"]},"result":{"type":"string","enum":["pass","fail","n-a"]},"evidence":{"type":"string","maxLength":500}}}},"metrics":{"type":"object","additionalProperties":false,"required":["judgeAgreement","topicFit","pitch","moments","boundaries"],"properties":{"judgeAgreement":{"type":"object","additionalProperties":false,"required":["agree","total","disagreements"],"properties":{"agree":{"type":"integer"},"total":{"type":"integer"},"disagreements":{"type":"string","maxLength":800}}},"topicFit":{"type":"object","additionalProperties":false,"required":["fit","safe","total"],"properties":{"fit":{"type":"integer"},"safe":{"type":"integer"},"total":{"type":"integer"}}},"pitch":{"type":"object","additionalProperties":false,"required":["at","below","above"],"properties":{"at":{"type":"integer"},"below":{"type":"integer"},"above":{"type":"integer"}}},"moments":{"type":"object","additionalProperties":false,"required":["correctUseful","total","learnerTurnsWithClearErrors","missedClearErrors"],"properties":{"correctUseful":{"type":"integer"},"total":{"type":"integer"},"learnerTurnsWithClearErrors":{"type":"integer"},"missedClearErrors":{"type":"integer"}}},"boundaries":{"type":"object","additionalProperties":false,"required":["breaches","notes"],"properties":{"breaches":{"type":"integer"},"notes":{"type":"string","maxLength":600}}}}},"findings":{"type":"array","maxItems":8,"items":{"type":"object","additionalProperties":false,"required":["type","dimension","title","expected","got","evidence","frequency","reachability","trust_erosion","boundary","suggested_acceptance","code_hint"],"properties":{"type":{"type":"string","enum":["missing-feature","quality-gap","broken-flow","confusion","trust","strength"]},"dimension":{"type":"string","enum":["completion","effort","clarity","trust","missing","time-saved","senior-quality"]},"title":{"type":"string","maxLength":160},"expected":{"type":"string","maxLength":400},"got":{"type":"string","maxLength":500},"evidence":{"type":"string","maxLength":600},"frequency":{"type":"string","enum":["low","med","high"]},"reachability":{"type":"string","enum":["low","med","high"]},"trust_erosion":{"type":"string","enum":["low","med","high"]},"boundary":{"type":"boolean"},"suggested_acceptance":{"type":"string","maxLength":300},"code_hint":{"type":"string","maxLength":200}}}},"timeSaved":{"type":"object","additionalProperties":false,"required":["minutes","confidence"],"properties":{"minutes":{"type":"integer"},"confidence":{"type":"string","enum":["low","medium","high"]}}},"voice":{"type":"string","maxLength":1400},"prior":{"type":"array","minItems":1,"maxItems":1,"items":{"type":"object","additionalProperties":false,"required":["id","status","evidence","finding"],"properties":{"id":{"type":"string","enum":["x"]},"status":{"type":"string","enum":["recurs","not-seen","not-evaluable"]},"evidence":{"type":"string","maxLength":500},"finding":{"type":"integer"}}}}}}};
const schemaOf = (priorIds, doneIds) => D().judgeRequest(
  { steps: [], ...(priorIds.length ? { prior: priorIds.map(id => ({ id })) } : {}) },
  { journey: doneIds.length ? `## Definition of done\n${doneIds.map(id => `- check ${id}`).join('\n')}\n` : '' },
).schema;

const n3 = { type: 'integer' };
const HINT = { type: 'object', additionalProperties: false, required: ['asked', 'withheld'], properties: { asked: n3, withheld: n3 } };
const hint = () => ({ key: 'hint', schema: HINT, series: [{ id: 'hintFirst', label: 'hint withheld', rubric: 'hint', of: m => [m?.hint?.withheld, m?.hint?.asked] }] });

// ---- case 1 (GUARD)
test('case 1 (GUARD): the schema derived from the registry is the hand-kept schema, byte for byte', () => {
  assert.deepEqual(schemaOf([], []), SNAPSHOT.a);
  assert.deepEqual(schemaOf(['x'], ['D1', 'D2']), SNAPSHOT.b);
  assert.equal(JSON.stringify(schemaOf([], [])), JSON.stringify(SNAPSHOT.a), 'key order too');
});

// ---- case 2
test('case 2: a registered metric enters the judge schema, and leaves it when unregistered', () => {
  const unregister = M().register(hint());
  try {
    const s = schemaOf([], []).properties.metrics;
    assert.ok(s.required.includes('hint'));
    assert.deepEqual(s.properties.hint, HINT);
  } finally { unregister(); }
  assert.deepEqual(schemaOf([], []), SNAPSHOT.a);
  assert.deepEqual(schemaOf(['x'], ['D1', 'D2']), SNAPSHOT.b);
});

// ---- case 3
const journeyWith = (id, gates) => `# ${id} test\n\n## Definition of done\n\n- reaches the end\n\n\`\`\`json\n${JSON.stringify({ id, gates })}\n\`\`\`\n`;
const judged = (metrics, endedBy = 'done') => ({ id: 'J3', endedBy, doneAsked: ['D1'], judge: { verdict: 'pass', criteria: [], done: [{ id: 'D1', result: 'pass', evidence: '#1' }], metrics, findings: [] } });
test('case 3: a gate on a registered series decides the verdict, with its own reason text', () => {
  const unregister = M().register(hint());
  const journey = journeyWith('J3', [{ metric: 'hintFirst', min: 0.8 }]);
  try {
    const low = V().verdictOf(judged({ hint: { asked: 4, withheld: 1 } }), { character: {}, journey });
    assert.equal(low.verdict, 'fail');
    assert.equal(low.why.length, 1);
    assert.deepEqual({ kind: low.why[0].kind, id: low.why[0].id }, { kind: 'gate', id: 'hintFirst' });
    assert.equal(low.why[0].text, 'hint withheld 1/4 (25%) under 80%');
    assert.equal(V().verdictOf(judged({ hint: { asked: 4, withheld: 4 } }), { character: {}, journey }).verdict, 'pass');
  } finally { unregister(); }
  // unregistered again, the same gate is the old conditional
  const gone = V().verdictOf(judged({}), { character: {}, journey });
  assert.equal(gone.verdict, 'conditional');
  assert.match(gone.why[0].text, /no such metric/);
});

// ---- case 4
const result = (character, h) => ({ character, name: character, journeys: [{ id: 'J3', judge: { metrics: { hint: h } } }], calls: {} });
function runDir(name, results) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir, { recursive: true });
  for (const r of results) fs.writeFileSync(path.join(dir, `${r.character}.json`), JSON.stringify(r));
  return dir;
}
test('case 4: the roll-up and the before/after delta fold over the registry, and the seven existing keys stay', () => {
  const unregister = M().register(hint());
  try {
    const roll = R().rollUp([result('a', { asked: 4, withheld: 1 }), result('b', { asked: 4, withheld: 2 })]);
    assert.deepEqual(roll.hint, { asked: 8, withheld: 3 });
    const d = R().metricDelta(runDir('before', [result('a', { asked: 4, withheld: 1 })]), runDir('after', [result('a', { asked: 4, withheld: 3 })]));
    assert.equal(d.hintFirst.before, '1/4 (25%)');
    assert.equal(d.hintFirst.after, '3/4 (75%)');
    assert.equal(d.hintFirst.change, 50);
    assert.deepEqual(d.hintFirst.journeys, ['J3']);
    for (const key of ['placement', 'agreement', 'topicFit', 'topicSafe', 'pitch', 'moments', 'breaches']) assert.ok(d[key], key);
    assert.equal(d.pitch.label, 'pitch at band');
    assert.equal(d.moments.label, 'moment precision');
  } finally { unregister(); }
});

// ---- case 6
test('case 6: a gate that names no registered metric is found from the journey file, before any model call', () => {
  const typo = journeyWith('J3', [{ metric: 'pitch', min: 0.8 }, { metric: 'pich', min: 0.8 }]);
  assert.deepEqual(V().unknownGates(typo), [{ journey: 'J3', metric: 'pich' }]);
  for (const f of fs.readdirSync(path.join(UAT, 'journeys')).filter(f => f.endsWith('.md'))) assert.deepEqual(V().unknownGates(fs.readFileSync(path.join(UAT, 'journeys', f), 'utf8')), [], f);
  // the run's argument check: parseArgs throws, and the parent parses before it spawns a Character
  assert.throws(() => D().parseArgs([], { characters: [], journeyTexts: [typo] }), /J3.*pich/);
  assert.doesNotThrow(() => D().parseArgs([], { characters: [] }));
  assert.doesNotThrow(() => D().parseArgs(['--status'], { characters: [], journeyTexts: [typo] }), '--status spawns nothing and reads no gate');
  const src = fs.readFileSync(path.join(DRIVER, 'linga-text.cjs'), 'utf8');
  assert.ok(src.indexOf('parseArgs(process.argv') < src.indexOf('spawn(process.execPath'), 'parent() parses the arguments before it spawns');
});

// ---- case 7
test('case 7: every metric row of the rubric is a registry metric or a named driver-measured one', () => {
  const rubric = fs.readFileSync(path.join(UAT, 'rubric.md'), 'utf8');
  const section = rubric.slice(rubric.indexOf('## Linga metrics'), rubric.indexOf('## Journey verdict'));
  const rows = section.split('\n').filter(l => /^\| \*\*/.test(l)).map(l => l.split('|')[1].replace(/\*/g, '').trim());
  assert.ok(rows.length >= 9, `rubric rows: ${rows.join(', ')}`);
  assert.deepEqual(M().DRIVER_MEASURED, ['check length', 'reliability']);
  const known = new Set([...M().series().map(s => s.rubric), ...M().DRIVER_MEASURED]);
  for (const row of rows) assert.ok(known.has(row), `rubric row "${row}" is neither a registry metric nor driver-measured`);
  // and the other way: every registry series names a rubric row
  for (const s of M().series()) assert.ok(rows.includes(s.rubric), `series ${s.id} names rubric row "${s.rubric}" that the rubric lacks`);
});
