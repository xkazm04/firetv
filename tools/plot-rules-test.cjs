/**
 * Function graphs (v2 M4a): desk/src/maths/plot.ts and Plot.tsx.
 *   - a pole is never bridged: 1/x across 0 is two pieces, and no drawn step is taller than the box;
 *   - the tangent's slope is the numeric derivative the marking uses, through the point on the curve;
 *   - a definite integral shades between its bounds; a curve undefined there shades nothing;
 *   - plotFor chooses the window and the extras per shape; a constant or unreadable f draws nothing;
 *   - Plot renders an SVG with the role a capture looks for.
 * Run with npm test in desk/ (directly: node tools/plot-rules-test.cjs). No model is called.
 */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), Module = require('node:module');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../desk');
let ts; try { ts = require(path.join(root, 'node_modules/typescript')); } catch { console.error("This suite transpiles desk TypeScript with desk's own compiler. Run `npm install` in desk/ first, then `npm test` from desk/."); process.exit(1); }
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : id, ...args); };
require.extensions['.ts'] = require.extensions['.tsx'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText, file);
const src = (f) => path.join(root, 'src', f);
const P = require(src('maths/plot.ts'));
const pts = (d) => d.split(/(?=[ML])/).map(s => s.slice(1).trim().split(' ').map(Number));

test('a pole is never bridged: 1/x across 0 is two pieces, no drawn step taller than the box', () => {
  const m = P.plotModel({ f: '1/x', x: [-2, 2] }, 480, 300);
  assert(m.curve.length >= 2, `${m.curve.length} pieces`);
  for (const d of m.curve) { const p = pts(d); for (let i = 1; i < p.length; i++) assert(Math.abs(p[i][1] - p[i - 1][1]) <= 300, 'no vertical bridge'); }
  const tan = P.plotModel({ f: 'tan(x)', x: [-3, 3] }, 480, 300); assert(tan.curve.length >= 3, 'tan breaks at each pole');
  assert.equal(P.plotModel({ f: 'x^2', x: [-2, 2] }).curve.length, 1, 'a smooth curve is one piece');
});
test('the tangent is the numeric derivative, through the point on the curve', () => {
  const { derivativeAt, compile } = require(src('lib/rules/calc-expr.ts'));
  for (const [f, a] of [['x^2', 1], ['x^3 - 3x', 1.5], ['sin(x)', 0.7], ['e^x', -1]]) {
    const m = P.plotModel({ f, x: [a - 3, a + 3], tangentAt: a }, 480, 300);
    assert(Math.abs(m.tangent.slope - derivativeAt(compile(f), a)) < 1e-9, f);
    // the line's pixel ends lie on y = f(a) + m (x - a), mapped into the box, at the point's own x
    const { x0, x1, y0, y1 } = m.view, py = (y) => 300 - ((y - y0) / (y1 - y0)) * 300, fa = compile(f).at(a);
    assert(Math.abs(m.tangent.at.y - py(fa)) < 1e-6, `${f}: the tangent touches at (a, f(a))`);
    const t = (x) => fa + m.tangent.slope * (x - a), clamp = (y) => Math.max(-300, Math.min(600, py(y)));
    assert(Math.abs(m.tangent.y1 - clamp(t(x0))) < 1e-6 && Math.abs(m.tangent.y2 - clamp(t(x1))) < 1e-6);
  }
  assert.equal(P.plotModel({ f: '1/x', x: [-1, 1], tangentAt: 0 }).tangent, undefined, 'no tangent where the function is undefined');
});
test('a definite integral shades between its bounds; nothing where the curve is undefined', () => {
  const m = P.plotModel({ f: 'sin(x)', x: [-1, 4], area: [0, Math.PI] }, 480, 300);
  assert.match(m.area, /^M.* Z$/);
  const xs = pts(m.area.replace(/ Z$/, '')).map(p => p[0]);
  const px = (x) => ((x - -1) / 5) * 480;
  assert(Math.abs(Math.min(...xs) - px(0)) < 0.2 && Math.abs(Math.max(...xs) - px(Math.PI)) < 0.2, 'from a to b, no further');
  assert.equal(P.plotModel({ f: '1/x', x: [-2, 2], area: [-1, 1] }).area, undefined);
});
test('plotFor picks the window and the extras per shape; constants and nonsense draw nothing', () => {
  assert.deepEqual(P.plotFor({ shape: 'derivative-at', f: 'x^2', at: 2 }), { f: 'x^2', x: [-1, 5], tangentAt: 2, mark: 2 });
  const di = P.plotFor({ shape: 'definite-integral', f: 'x', a: 0, b: 'pi' });
  assert.deepEqual(di.area, [0, Math.PI]); assert(di.x[0] < 0 && di.x[1] > Math.PI);
  assert.deepEqual(P.plotFor({ shape: 'extremum', f: 'x^2', on: [0, 4], kind: 'min' }).x, [-0.6, 4.6]);
  assert.deepEqual(P.plotFor({ shape: 'limit', f: '1/x', at: 'inf' }).x, [0, 20]);
  assert.equal(P.plotFor({ shape: 'derivative', f: '7' }), null, 'a constant has no curve to read');
  assert.equal(P.plotFor({ shape: 'derivative', f: 'x +* 2' }), null);
  assert.equal(P.numOf('pi/4'), Math.PI / 4); assert.equal(P.numOf('x'), null); assert.equal(P.numOf(Infinity), null);
});
test('Plot renders an SVG the capture finds; nothing for a spec without a graph', () => {
  const React = require(path.join(root, 'node_modules/react')), { renderToStaticMarkup } = require(path.join(root, 'node_modules/react-dom/server'));
  const { Plot } = require(src('maths/Plot.tsx'));
  const html = renderToStaticMarkup(React.createElement(Plot, { spec: { shape: 'definite-integral', f: 'sin(x)', a: 0, b: 'pi' } }));
  assert.match(html, /data-role="maths-plot"/); assert.match(html, /class="pa"/); assert.match(html, /aria-label="The graph of sin\(x\)"/);
  assert.equal(renderToStaticMarkup(React.createElement(Plot, { spec: { shape: 'derivative', f: '3' } })), '');
});
