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

test('--journeys naming a journey no file defines is refused before a Character is spawned, never an empty run that exits 0', () => {
  const texts = ['J1', 'J3'].map(id => `# ${id}\n\n\`\`\`json\n${JSON.stringify({ id, title: id, budget: 3, gates: [] })}\n\`\`\`\n`);
  assert.throws(() => D().parseArgs(['--journeys', 'J1,J7'], { characters: [], journeyTexts: texts }), /--journeys J7.*Known: J1, J3/);
  assert.deepEqual(D().parseArgs(['--journeys', 'J3,J1'], { characters: [], journeyTexts: texts }).journeys, ['J3', 'J1']);
  assert.doesNotThrow(() => D().parseArgs(['--journeys', 'J1,J2,J3,J4,J5'], { characters: [] }), 'the committed journeys J1-J5 are all known');
});

test('a Character whose own journeys name no journey file is refused before any child is spawned, never a crash mid-run', () => {
  const texts = ['J1', 'J3'].map(id => `# ${id}\n\n\`\`\`json\n${JSON.stringify({ id, title: id, budget: 3, gates: [] })}\n\`\`\`\n`);
  const cast = [{ id: 'ana-20', journeys: ['J1', 'J3'] }, { id: 'bo-30', journeys: ['J1', 'J9'] }];
  const opts = { characters: cast.map(c => c.id), journeyTexts: texts, cast };
  assert.throws(() => D().parseArgs([], opts), /bo-30 J9.*Known: J1, J3/);
  assert.throws(() => D().parseArgs(['bo-30'], opts), /bo-30 J9/);
  assert.doesNotThrow(() => D().parseArgs(['ana-20'], opts), 'a run of other Characters is not stopped by her list');
  assert.doesNotThrow(() => D().parseArgs(['--journeys', 'J1'], opts), 'a --journeys run that leaves the stray journey out never reaches it');
  assert.doesNotThrow(() => D().parseArgs(['--status'], opts), '--status spawns nothing');
  // the committed Characters, read as the parent reads them, all name known journeys
  const all = fs.readdirSync(path.join(UAT, 'characters')).filter(f => f.endsWith('.md')).map(f => JSON.parse(fs.readFileSync(path.join(UAT, 'characters', f), 'utf8').match(/```json\s*\n([\s\S]*?)\n```/)[1]));
  assert.ok(all.length >= 10);
  assert.doesNotThrow(() => D().parseArgs([], { characters: all.map(c => c.id), cast: all }));
  const src = fs.readFileSync(path.join(DRIVER, 'linga-text.cjs'), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  assert.match(src, /parseArgs\(process\.argv\.slice\(2\), \{[^}]*cast: all\.map\(c => c\.sim\)/, 'parent() hands parseArgs the cast it will spawn');
});

test('the overlay docs cite driver code by symbol, never by a line number that the next driver edit moves', () => {
  const docs = ['README.md', 'env.md', 'rubric.md', 'references.md', 'accepted-gaps.md', 'drift/README.md'];
  const anchors = docs.flatMap(f => [...fs.readFileSync(path.join(UAT, f), 'utf8').matchAll(/driver\/[\w-]+\.cjs:\d+/g)].map(m => `${f}: ${m[0]}`));
  assert.deepEqual(anchors, [], 'cite the function instead (`readBlock` in driver/linga-text.cjs)');
  // the symbol the two docs name for the throw on a file without a json block exists, and is what throws
  const src = fs.readFileSync(path.join(DRIVER, 'linga-text.cjs'), 'utf8');
  assert.match(src, /function readBlock\(file\) \{[^}]*throw new Error\(`\$\{file\}: no json block`\)/);
  for (const f of ['README.md', 'env.md']) assert.match(fs.readFileSync(path.join(UAT, f), 'utf8'), /`readBlock`/, `${f} names readBlock`);
});

test('the README layout counts each Character and journey directory as it is, not as it was', () => {
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const readme = fs.readFileSync(path.join(UAT, 'README.md'), 'utf8'), seen = [];
  for (const m of readme.matchAll(/^ {2}((?:characters|journeys)(?:\/\w+)?)\/\*\.md +(\w+) /gm)) {
    const [, dir, word] = m, n = fs.readdirSync(path.join(UAT, dir)).filter(f => f.endsWith('.md')).length;
    assert.equal(WORDS.indexOf(word), n, `README layout: ${dir}/*.md says "${word}", the directory holds ${n}`);
    seen.push(dir);
  }
  assert.deepEqual(seen.sort(), ['characters', 'characters/essay', 'characters/maths', 'journeys', 'journeys/essay', 'journeys/maths'], 'every Character and journey directory has its count line');
});

test('the README Character template carries every field a committed Character carries, so a new one written from it is complete', () => {
  const readme = fs.readFileSync(path.join(UAT, 'README.md'), 'utf8');
  const template = JSON.parse(readme.slice(readme.indexOf('## Character template')).match(/```json\s*\n([\s\S]*?)\n```/)[1]);
  const sims = fs.readdirSync(path.join(UAT, 'characters')).filter(f => f.endsWith('.md')).map(f => JSON.parse(fs.readFileSync(path.join(UAT, 'characters', f), 'utf8').match(/```json\s*\n([\s\S]*?)\n```/)[1]));
  const keys = (o, pre = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? [`${pre}${k}`, ...keys(v, `${pre}${k}.`)] : [`${pre}${k}`]);
  const have = new Set(keys(template)), missing = [...new Set(sims.flatMap(s => keys(s)))].filter(k => !have.has(k)).sort();
  assert.deepEqual(missing, [], `the template lacks ${missing.join(', ')}`);
});

test('Essay and Math: each Character\'s "journeys:" line and each journey\'s Characters section name the same pairs', () => {
  const ids = new Set(), byCharacter = new Set(), byJourney = new Set(), journeyIds = new Set();
  for (const mod of ['essay', 'maths']) {
    for (const f of fs.readdirSync(path.join(UAT, 'characters', mod)).filter(f => f.endsWith('.md'))) {
      const id = f.replace(/\.md$/, ''), line = fs.readFileSync(path.join(UAT, 'characters', mod, f), 'utf8').match(/^module: [^\n]*· journeys: ([^·\n]+)/m);
      assert.ok(line, `${mod}/${f}: no "module: … · journeys: …" line`);
      ids.add(id);
      for (const j of line[1].split(',').map(s => s.trim()).filter(Boolean)) byCharacter.add(`${id} ${j}`);
    }
    for (const f of fs.readdirSync(path.join(UAT, 'journeys', mod)).filter(f => f.endsWith('.md'))) {
      const j = f.match(/^([A-Z]+\d+)-/)[1], text = fs.readFileSync(path.join(UAT, 'journeys', mod, f), 'utf8');
      journeyIds.add(j);
      const section = text.split(/^## Characters\s*$/m)[1];
      assert.ok(section, `${mod}/${f}: no "## Characters" section`);
      const listed = section.split(/^## /m)[0].split(/\n\s*\n/).find(p => p.trim()) ?? '';
      for (const m of listed.matchAll(/[a-z]+-\d+/g)) byJourney.add(`${m[0]} ${j}`);
    }
  }
  const only = (a, b) => [...a].filter(x => !b.has(x)).sort();
  assert.deepEqual(only(byCharacter, byJourney), [], 'pairs a Character lists that its journey does not');
  assert.deepEqual(only(byJourney, byCharacter), [], 'pairs a journey lists that its Character does not');
  assert.deepEqual([...byJourney].map(p => p.split(' ')[0]).filter(c => !ids.has(c)), [], 'a journey names a Character no file defines');
  assert.deepEqual([...byCharacter].map(p => p.split(' ')[1]).filter(j => !journeyIds.has(j)), [], 'a Character names a journey no file defines');
  assert.equal(byCharacter.size, 23);
});
