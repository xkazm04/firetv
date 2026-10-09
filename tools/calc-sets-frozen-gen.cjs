/**
 * The frozen Calculus set requests (v2 M3b-3b): for every Calculus 1 topic and every Calculus 2 topic that existed at the
 * base (the five of M3b-2), the request a set sends to the text engine - system, prompt and schema - written to
 * tools/calc-sets-frozen.json BEFORE the approx-integral shape and its topic were added, and compared byte for byte by
 * tools/calc2-approx-test.cjs ('frozen sets') afterwards. The new shape and topic must leave it equal: a set on an existing
 * topic sends the model exactly the words it sent. Never regenerate it to make a row green.
 *
 * Each topic gets a fresh learner on its own path in a disposable DESK_DATA_DIR; makeItems(topic, learner, 3, {word: false})
 * runs with the text provider stubbed to record the request and reply {specs: []} (the empty set fails; the failure is
 * caught, only the first request is read); the embed provider is stubbed as calc2-path-test row 5 does.
 *
 * Usage: node tools/calc-sets-frozen-gen.cjs   (writes tools/calc-sets-frozen.json; `require` it for table()/text()).
 * Pure: no network, no model.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const root = path.resolve(__dirname, '../desk');
require('./ts-load.cjs');
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-sets-frozen-'));
process.env.DESK_DATA_DIR = data;
delete process.env.DESK_TEXT_ENGINE;

const SRC = path.join(root, 'src'), src = (f) => path.join(SRC, f);
const reg = require(src('lib/engines/registry.ts'));
require(src('lib/engines/text.ts')); require(src('lib/engines/embed.ts'));
const store = require(src('lib/session/store.ts'));
const items = require(src('lib/desk/items.ts'));
const P = require(src('lib/library/paths.ts'));

const OUT = path.join(__dirname, 'calc-sets-frozen.json');
/** The topics frozen: every Calculus 1 topic and the five Calculus 2 topics of M3b-2, in path order. */
const FROZEN_CALC2 = ['calc2-parts', 'calc2-trig-integrals', 'calc2-trig-sub', 'calc2-partial-fractions', 'calc2-strategy'];

/** The rows [{ topic, system, prompt, schema }] for every frozen topic. */
async function table() {
  const topics = [...P.PATHS.calc1.topics.map((t) => [t.id, 'calc1']), ...FROZEN_CALC2.map((id) => [id, 'calc2'])];
  reg.useProvider('embed', { name: 'stub', run: async ({ texts }) => ({ raw: texts.map(() => [1, 0]) }) });
  const rows = [];
  try {
    store.dispatch({ type: 'reset' });
    for (const [topic, mathPath] of topics) {
      const learner = `frozen-${topic}`;
      store.dispatch({ type: 'profile.draft', patch: { id: learner, name: 'Frozen', type: 'other', modules: ['maths'], mathPath } });
      store.dispatch({ type: 'profile.save' });
      const seen = [];
      reg.useProvider('text', { name: 'stub', run: async (req) => { seen.push(req); return { raw: JSON.stringify({ specs: [] }) }; } });
      try { await items.makeItems(topic, learner, 3, { word: false }); } catch { /* an empty stubbed set fails: only the request is read */ }
      if (!seen.length) throw new Error(`${topic}: the set sent no request`);
      rows.push({ topic, system: seen[0].system, prompt: seen[0].prompt, schema: seen[0].schema });
    }
  } finally { reg.resetProviders(); }
  return { topics: rows.length, rows };
}

const text = (t) => JSON.stringify(t, null, 1) + '\n';
const cleanup = () => {
  if (globalThis.__desk?.ticker) clearInterval(globalThis.__desk.ticker);
  fs.rmSync(data, { recursive: true, force: true });
};

module.exports = { table, text, cleanup, OUT, FROZEN_CALC2 };

if (require.main === module) {
  table().then((t) => {
    fs.writeFileSync(OUT, text(t));
    console.log(`calc-sets-frozen.json: ${t.topics} topics`);
  }).finally(cleanup);
}
