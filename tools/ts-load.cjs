/**
 * The one loader of the rules suites: `const {root,src,transpile,ts}=require('./ts-load.cjs')`. It registers, once
 * per process, the '@/' alias to desk/src and require hooks for .ts and .tsx (CommonJS, ES2022, esModuleInterop,
 * jsx ReactJSX for .tsx, fileName = the real file so a .ts file parses as TS and a .tsx file as TSX), and returns
 * root (desk/), src (desk/src), transpile(source, transpileModuleOptions), ts() (TypeScript, required lazily) and
 * options / jsxOptions (the hooks' own transpile options, for a suite that transpiles a file itself).
 *
 * Every transpile goes through a disk cache: sha256 of the loader version, TypeScript's version, the options, the
 * fileName's extension and the source -> the output text. TypeScript itself is required only on a cache miss. The
 * cache lives in os.tmpdir()/desk-ts-load (DESK_TS_CACHE_DIR moves it, DESK_TS_CACHE=0 turns it off), is written by
 * temp file + rename, and a failed read or write is an uncached transpile - never a failed suite. It never writes
 * inside the repo or desk/node_modules (in a worktree that is a link to the operator's checkout).
 * Pure: no network, no model.
 */
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), crypto = require('node:crypto'), Module = require('node:module');

const LOADER_VERSION = 1;
// ts.ModuleKind.CommonJS, ts.ScriptTarget.ES2022, ts.JsxEmit.ReactJSX as numbers, so a cache hit never loads TypeScript.
const MODULE_COMMONJS = 1, TARGET_ES2022 = 9, JSX_REACTJSX = 4;
const root = path.resolve(__dirname, '../desk'), src = path.join(root, 'src');

// desk/node_modules/typescript first; only if that cannot be read, wherever Node resolves 'typescript' from desk/.
let modules = path.join(root, 'node_modules/typescript'), tsVersion;
const readVersion = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
try { tsVersion = readVersion(modules); }
catch {
  try { modules = path.dirname(require.resolve('typescript/package.json', { paths: [root] })); tsVersion = readVersion(modules); }
  catch { console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.'); process.exit(1); }
}

let tsModule;
const ts = () => (tsModule ??= require(modules));

const cacheOn = process.env.DESK_TS_CACHE !== '0';
const cacheDir = process.env.DESK_TS_CACHE_DIR || path.join(os.tmpdir(), 'desk-ts-load');

const keyOf = (source, options) => crypto.createHash('sha256')
  .update(`${LOADER_VERSION}\0${tsVersion}\0${JSON.stringify({ ...options, fileName: undefined })}\0${options.fileName ? path.extname(options.fileName) : ''}\0`)
  .update(source).digest('hex');

/** ts.transpileModule(source, options), through the disk cache. Returns { outputText }. */
function transpile(source, options = {}) {
  let file = null;
  if (cacheOn) {
    try {
      file = path.join(cacheDir, keyOf(source, options) + '.js');
      return { outputText: fs.readFileSync(file, 'utf8') };
    } catch { /* a miss, or an unreadable cache: transpile */ }
  }
  const outputText = ts().transpileModule(source, options).outputText;
  if (file) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
      fs.writeFileSync(tmp, outputText);
      fs.renameSync(tmp, file);
    } catch { /* an unwritable cache is no cache */ }
  }
  return { outputText };
}

if (!globalThis[Symbol.for('desk.ts-load.registered')]) {
  globalThis[Symbol.for('desk.ts-load.registered')] = true;
  const resolve = Module._resolveFilename;
  Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(src, id.slice(2)) : id, ...args); };
  const hook = (mod, file) => {
    const compilerOptions = { module: MODULE_COMMONJS, target: TARGET_ES2022, esModuleInterop: true };
    if (file.endsWith('.tsx')) compilerOptions.jsx = JSX_REACTJSX;
    return mod._compile(transpile(fs.readFileSync(file, 'utf8'), { compilerOptions, fileName: file }).outputText, file);
  };
  require.extensions['.ts'] = hook;
  require.extensions['.tsx'] = hook;
}

// The options the hooks use, for a suite that transpiles a file itself: options.compilerOptions, plus jsx ReactJSX.
const options = { compilerOptions: { module: MODULE_COMMONJS, target: TARGET_ES2022, esModuleInterop: true } };
const jsxOptions = { compilerOptions: { ...options.compilerOptions, jsx: JSX_REACTJSX } };

module.exports = { root, src, transpile, ts, options, jsxOptions };
