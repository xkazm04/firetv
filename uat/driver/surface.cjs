/**
 * What a Linga Character sees and can do, read from the rendered screens.
 *
 *   surfaceOf(session, ui?) -> { screen, shown, heard, tv, phone, offered, controls, strays, unrendered, view }
 *
 * `shown` is the text of LingaTV and LingaPhone as react-dom/server renders them for this session (desk's own
 * components, transpiled with desk's own typescript), in a TV and a Phone section. A collapsed <details> is marked
 * as tap-to-open. `heard` is the one channel no markup carries: the line the TV speaks.
 *
 * `offered` takes its ids, needs and commands from the Linga screen model (lib/english/view.ts), never from a table
 * of its own. Each rendered control is tied to a view action: a TV button by its label to the view's TV row or footer
 * (the TV prints the view's labels, and never draws the view's phone-side list), a phone control by the command its
 * own handler sends, caught at the useEnglish seam and never posted. The view offers every control the phone draws,
 * on its TV row or as a phone-side action (`on: 'phone'`). A phone control whose command this screen's view does not
 * offer is a drift the detector still catches: it is tied to the action the view defines for the same session on
 * another Linga screen and marked `phoneOnly`, and should be 0. A rendered control tied to nothing, and not in
 * BY_DESIGN_UNMAPPED, is a stray; a view action with no rendered control is unrendered. Both should be 0 too.
 *
 * No browser, no dev server, no model call; nothing here posts to the desk.
 */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const desk = path.resolve(__dirname, '../../desk');

/** Controls that take no action in the Linga screen model, and why. */
const BY_DESIGN_UNMAPPED = {
  'Talk': 'the phone tab that holds this screen',
  'Set up': 'phone setup (interests, goals, preferences): outside the journeys the LT run covers',
  'My map': 'the learning map on the phone: read-only evidence',
  'Help with a sentence': 'Say it, a different module',
  'Linga on the TV': 'brings the TV back to Linga; the LT run is always on Linga',
};

// ---------------------------------------------------------------- loading desk TS and TSX in node
let installed = false;
/** The require hooks every LT tool shares: `@/` resolves into desk/src, .ts and .tsx transpile with desk's typescript. */
function install() {
  if (installed) return;
  let ts; try { ts = require(path.join(desk, 'node_modules/typescript')); } catch { console.error('Run `npm install` in desk/ first.'); process.exit(1); }
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (id, ...rest) { return resolve.call(this, id.startsWith('@/') ? path.join(desk, 'src', id.slice(2)) : id, ...rest); };
  const compile = jsx => (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, ...(jsx ? { jsx: ts.JsxEmit.ReactJSX } : {}) } }).outputText, file);
  require.extensions['.ts'] = compile(false);
  require.extensions['.tsx'] = compile(true);
  installed = true;
}

let R = null;
/** React, the two components, and the seams a render is observed through. Loaded once. */
function load() {
  if (R) return R;
  install();
  const React = require(path.join(desk, 'node_modules/react'));
  const rt = require(path.join(desk, 'node_modules/react/jsx-runtime'));
  const { renderToStaticMarkup } = require(path.join(desk, 'node_modules/react-dom/server'));
  const V = require(path.join(desk, 'src/lib/english/view.ts'));
  // every command a rendered control sends lands here, never at /api/english
  const hook = require(path.join(desk, 'src/english/useEnglish.ts'));
  hook.useEnglish = () => ({ run: (action, extra = {}) => { R.sink?.push({ run: { action, extra } }); return Promise.resolve(false); }, busy: false, error: '', setError() {} });
  // while a render is recorded, every host control gets a data-uat index and its props are kept; a component that
  // takes onSend (the reply box) lends it to the text box it renders
  const wrappers = new Map();
  const tag = orig => (type, props, key) => {
    const rec = R.rec;
    if (rec && typeof type === 'function' && typeof props?.onSend === 'function') {
      const Inner = type;
      if (!wrappers.has(Inner)) wrappers.set(Inner, function Sends(p) { const prev = R.rec.send; R.rec.send = p.onSend; try { return Inner(p); } finally { R.rec.send = prev; } });
      type = wrappers.get(Inner);
    } else if (rec && ['button', 'select', 'textarea', 'input'].includes(type)) {
      props = { ...props, 'data-uat': rec.controls.length };
      rec.controls.push({ tag: type, props, send: type === 'textarea' ? rec.send : null });
    }
    return orig(type, props, key);
  };
  rt.jsx = tag(rt.jsx); rt.jsxs = tag(rt.jsxs);
  const { LingaTV } = require(path.join(desk, 'src/english/LingaTV.tsx'));
  const { LingaPhone } = require(path.join(desk, 'src/english/LingaPhone.tsx'));
  R = { React, rt, renderToStaticMarkup, V, LingaTV, LingaPhone, rec: null, sink: null };
  return R;
}

/** One component's static markup and the controls it rendered. The TV's own state (menu, picker, browsers) is `ui`. */
function renderOne(Component, props, ui) {
  const { React, rt, renderToStaticMarkup, V } = R;
  const useState = React.useState;
  R.rec = { controls: [], send: null };
  if (ui) React.useState = init => useState(init === V.NO_UI ? { ...V.NO_UI, ...ui } : init);
  try { return { html: renderToStaticMarkup(rt.jsx(Component, props)), controls: R.rec.controls }; }
  finally { React.useState = useState; R.rec = null; }
}

// ---------------------------------------------------------------- markup to words
const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source']);
const BLOCK = new Set(['div', 'p', 'h1', 'h2', 'h3', 'header', 'footer', 'main', 'nav', 'section', 'label', 'details', 'summary', 'br', 'small', 'b']);
const decode = t => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');
const attrsOf = s => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] === undefined ? true : decode(m[2])]));
const squash = t => t.replace(/\s+/g, ' ').trim();

/**
 * The words a person reads on this markup, one block per line, each control in brackets as the Character meets it,
 * and the controls found in it (`data-uat` index, label, options). svg art and empty alt images carry no words.
 */
function read(html) {
  const lines = [''], controls = [], stack = [];
  const nl = () => { if (lines.at(-1).trim()) lines.push(''); };
  const put = t => { lines[lines.length - 1] += t; for (const f of stack) f.text += t; };
  let skip = 0;
  for (const tok of html.split(/(<[^>]*>)/)) {
    if (!tok) continue;
    if (tok[0] !== '<') { if (!skip) put(decode(tok)); continue; }
    const close = tok[1] === '/', name = tok.match(/^<\/?([\w-]+)/)?.[1]?.toLowerCase();
    if (!name) continue;
    if (name === 'svg') { skip += close ? -1 : 1; continue; }
    if (skip) continue;
    if (close) {
      let f; do f = stack.pop(); while (f && f.name !== name);
      if (!f) continue;
      if (f.control) {
        const c = f.control;
        if (c.tag === 'button') c.label = squash(f.text);
        if (c.tag === 'select') c.label = squash(c.label || '');
        const off = c.disabled ? ' (disabled)' : '', at = lines.at(-1).slice(0, f.at);
        if (c.tag === 'select') lines[lines.length - 1] = `${at} [list: ${c.options.filter(o => o.value).map(o => o.value === o.text || o.text.startsWith(`${o.value} `) ? o.text : `${o.text} [${o.value}]`).join(' | ')}${off}]`;
        else if (c.tag === 'button') lines[lines.length - 1] = `${at} [button: ${c.label}${off}]`;
        else if (c.tag === 'textarea') lines[lines.length - 1] = `${at} [text box${off}]`;
      }
      if (f.name === 'option') stack.findLast(x => x.control?.tag === 'select')?.control.options.push({ value: f.attrs.value ?? squash(f.text), text: squash(f.text) });
      if (f.name === 'summary') put(' (collapsed; tap to open)');
      if (BLOCK.has(name)) nl();
      continue;
    }
    const attrs = attrsOf(tok.slice(name.length + 1, -1));
    if (BLOCK.has(name)) nl();
    if (name === 'summary') put('▸ ');
    else if (!BLOCK.has(name) && /\S$/.test(lines.at(-1))) put(' ');
    if (VOID.has(name) || tok.endsWith('/>')) {
      if (name === 'input' && attrs['data-uat'] !== undefined) { const c = { index: +attrs['data-uat'], tag: 'input', label: '', disabled: 'disabled' in attrs, options: [] }; controls.push(c); put(`[${attrs.type ?? 'input'}${attrs.checked ? ', ticked' : ''}]`); }
      if (name === 'br') nl();
      continue;
    }
    const f = { name, attrs, text: '', at: lines.at(-1).length };
    if (attrs['data-uat'] !== undefined) {
      const label = stack.findLast(x => x.name === 'label');
      f.control = { index: +attrs['data-uat'], tag: name, label: label ? squash(label.text) : '', disabled: 'disabled' in attrs, options: [] };
      controls.push(f.control);
    }
    stack.push(f);
  }
  return { text: lines.map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n'), controls };
}

// ---------------------------------------------------------------- what a control does
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fake = value => ({ preventDefault() {}, stopPropagation() {}, target: { value, checked: true }, currentTarget: { value } });
/** Presses a rendered control with nothing posted: what its own handler sends (a command, a TV event, a module switch). */
function press(c, rendered) {
  R.sink = [];
  try {
    if (c.send) c.send('…', 'text', undefined, 'uat-surface');
    else if (c.tag === 'select') c.props.onChange?.(fake(rendered.options.find(o => o.value)?.value ?? ''));
    else if (c.tag === 'textarea' || c.tag === 'input') c.props.onChange?.(fake('…'));
    else c.props.onClick?.(fake(''));
  } catch (e) { R.sink.push({ error: String(e.message) }); }
  const out = R.sink; R.sink = null;
  return out;
}

/** Does a view action run what this effect runs? A value the action `needs` must be in the effect's extra. */
function runs(a, eff) {
  if (eff.run && a.run.command) {
    if (a.run.command.action !== eff.run.action) return false;
    if (!Object.entries(a.run.command.extra ?? {}).every(([k, v]) => same(eff.run.extra[k], v))) return false;
    return !a.needs || a.needs in eff.run.extra;
  }
  if (eff.post?.type === 'nav' && a.run.nav) return a.run.nav.screen === eff.post.screen;
  return false;
}

const LINGA_SCREENS = ['linga', 'linga-check', 'linga-verdict', 'linga-plan', 'linga-scenes', 'linga-map', 'linga-talk', 'linga-moment', 'linga-coach', 'linga-recap'];
/**
 * Every action the view defines for this session on any Linga screen, with or without the menu, and with the
 * conversation or the check at rest: no quiz, pause, moment or pending turn over the conversation, and the same
 * conversation before its first reply; the check between two steps, and at its questions. This is where a phone
 * control the view has stopped offering on this screen finds its id, so the drift is named rather than a stray.
 */
function catalogue(s) {
  const out = [], c = s.conversation, lc = s.check;
  const rest = c && { ...c, quizOpen: false, paused: false, pending: null, moment: null };
  const variants = [s,
    ...(c ? [{ ...s, conversation: rest }, { ...s, conversation: { ...rest, turns: c.turns.slice(0, 1), help: undefined } }] : []),
    ...(lc ? [{ ...s, check: { ...lc, pending: null, task: null } }, { ...s, check: { ...lc, stage: 'about', pending: null } }] : [])];
  for (const v of variants) for (const screen of LINGA_SCREENS) for (const ui of [{}, { menu: true }]) out.push(...R.V.offeredActions(R.V.lingaView({ ...v, screen }, ui)));
  return out;
}
/** A needed value's sample, so the command a select or text box sends can be compared without it. */
const withoutNeed = (extra, needs) => Object.fromEntries(Object.entries(extra).filter(([k]) => k !== needs && k !== 'commandId' && k !== 'mode' && (needs !== 'text' || k !== 'text')));

function surfaceOf(s, ui = {}) {
  load();
  const V = R.V, v = V.lingaView(s, ui);
  const post = e => { R.sink?.push({ post: e }); return Promise.resolve(); };
  const tv = renderOne(R.LingaTV, { s, post, voice: false }, ui), phone = renderOne(R.LingaPhone, { s, post, onSentence: () => R.sink?.push({ module: 'sentence' }) });
  const tvRead = read(tv.html), phoneRead = read(phone.html);
  const offers = [...V.offeredActions(v)];
  const tied = new Map(offers.map(a => [a, []])), controls = [];
  let cat = null;
  for (const [side, r, rec] of [['tv', tvRead, tv], ['phone', phoneRead, phone]]) for (const c of r.controls) {
    const row = { side, tag: c.tag, label: c.label, disabled: c.disabled, options: c.options.map(o => o.text), action: null, phoneOnly: false, byDesign: BY_DESIGN_UNMAPPED[c.label] ?? null, effect: null };
    controls.push(row);
    if (c.disabled) continue;
    if (side === 'tv') {
      // the TV prints the view's own labels, and "Select · " before each menu entry
      const label = c.label.replace(/^Select · /, '');
      // only the TV row and footer: a TV button that drew a phone-side action would be a stray
      const tvRow = [...v.actions, ...v.footer];
      row.action = tvRow.find(a => a.label === label && !tied.get(a).length) ?? tvRow.find(a => a.label === label) ?? null;
      if (row.action) tied.get(row.action).push(row);
      continue;
    }
    const effects = press(rec.controls[c.index], c), eff = effects.find(e => e.run || e.post?.type === 'nav') ?? effects[0] ?? null;
    row.effect = eff;
    if (!eff || (!eff.run && eff.post?.type !== 'nav')) continue; // a local step (a tab, a text box being typed in, a picker's value)
    if (eff.run && v.answer && eff.run.action === v.answer.action && c.tag === 'textarea') { row.action = 'answer'; continue; }
    const prefer = list => list.find(a => a.label === c.label) ?? list.find(a => c.tag === 'select' ? a.needs : !a.needs) ?? list[0] ?? null;
    row.action = prefer(offers.filter(a => runs(a, eff)));
    if (row.action) { tied.get(row.action).push(row); continue; }
    const def = prefer((cat ??= catalogue(s)).filter(a => runs(a, eff)));
    if (def) {
      row.phoneOnly = true;
      row.action = { ...def, run: eff.run ? { command: { action: eff.run.action, extra: withoutNeed(eff.run.extra, def.needs) } } : def.run };
    }
  }
  // a typed value the phone takes in a text box whose own button only appears once something is typed
  for (const a of offers) if (!tied.get(a).length && a.needs === 'text') {
    const box = controls.find(r => r.side === 'phone' && r.tag === 'textarea' && !r.action && !r.disabled);
    if (box) { box.action = a; tied.get(a).push(box); }
  }
  const offered = [];
  for (const a of offers) if (tied.get(a).length) offered.push({ id: a.id, label: a.label, run: a.run, ...(a.needs ? { needs: a.needs } : {}), on: [...new Set(tied.get(a).map(r => r.side))].join('+') });
  for (const r of controls) if (r.phoneOnly && !offered.some(o => o.id === r.action.id && same(o.run, r.action.run))) offered.push({ id: r.action.id, label: r.label || r.action.label, run: r.action.run, ...(r.action.needs ? { needs: r.action.needs } : {}), on: 'phone', phoneOnly: true });
  const answered = v.answer && controls.some(r => r.action === 'answer');
  if (answered) offered.unshift({ id: 'answer', label: v.answer.label, needs: 'text', answer: v.answer, on: 'phone' });
  const strays = controls.filter(r => !r.disabled && !r.action && !r.byDesign && r.effect && (r.effect.run || r.effect.post)).map(r => `${r.side}: ${r.label}`);
  const unrendered = [...offers.filter(a => !tied.get(a).length).map(a => a.id), ...(v.answer && !answered ? ['answer'] : [])];
  const heard = v.audible && !v.spoken.blocked ? v.spoken.line : '';
  const shown = `TV\n${tvRead.text}\n\nPhone\n${phoneRead.text}`;
  return { screen: v.screen, shown, heard, tv: tvRead.text, phone: phoneRead.text, offered, controls, strays, unrendered, view: v };
}

/** What the Character reads: both screens, and the line the TV says aloud (heard once, never shown). */
const surfaceText = sf => `${sf.shown}${sf.heard ? `\n\nHeard from the TV: "${sf.heard}"` : ''}`;

/**
 * The actions the Character picks from: one entry per id. An id offered more than once (a reply per option, a swap
 * per topic, a situation per scene) becomes one entry that takes the varying value, as the decide schema has it.
 */
function choices(sf) {
  const groups = new Map();
  for (const a of sf.offered) (groups.get(a.id) ?? groups.set(a.id, []).get(a.id)).push(a);
  return [...groups.values()].map(list => {
    const a = list[0];
    if (a.id === 'answer') return { id: 'answer', label: `${a.label} on the phone (speak or type)`, needs: 'text' };
    const param = ['option', 'topicId', 'sceneId'].find(k => new Set(list.map(x => x.run.command?.extra?.[k])).size > 1);
    return { id: a.id, label: param ? list.map(x => x.label).join(' / ') : a.label, ...(param ? { needs: param } : a.needs ? { needs: a.needs } : {}) };
  });
}

/** The offered action a decision names: by id, then by the value it carries. */
function pick(sf, d) {
  const list = sf.offered.filter(a => a.id === d.action);
  return list.find(x => x.run?.command?.extra?.option !== undefined && x.run.command.extra.option === d.option)
    ?? list.find(x => x.run?.command?.extra?.topicId !== undefined && x.run.command.extra.topicId === d.topicId)
    ?? list.find(x => x.run?.command?.extra?.sceneId !== undefined && x.run.command.extra.sceneId === d.sceneId)
    ?? list[0] ?? null;
}

module.exports = { surfaceOf, surfaceText, choices, pick, install, BY_DESIGN_UNMAPPED };
