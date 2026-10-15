// shared: load desk/src files, parse with the TypeScript compiler API from desk/node_modules
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "../../../..");
const desk = path.join(root, "desk"), src = path.join(desk, "src"), tools = path.join(root, "tools");
const ts = require(path.join(desk, "node_modules/typescript"));
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (/\.(ts|tsx)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(src);
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(src, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")])
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
// every module specifier a file imports, re-exports or dynamically imports, with the names it takes
function edges(file) {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const out = [];
  const visit = (n) => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const names = [], c = n.importClause; let all = false;
      if (c) {
        if (c.name) names.push("default");
        if (c.namedBindings) { if (ts.isNamespaceImport(c.namedBindings)) all = true; else c.namedBindings.elements.forEach((e) => names.push((e.propertyName || e.name).text)); }
      } else all = true;
      out.push({ spec: n.moduleSpecifier.text, names, all });
    } else if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
      const names = [];let all = false;
      if (!n.exportClause || ts.isNamespaceExport(n.exportClause)) all = true; else n.exportClause.elements.forEach((e) => names.push((e.propertyName || e.name).text));
      out.push({ spec: n.moduleSpecifier.text, names, all });
    } else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
      out.push({ spec: n.arguments[0].text, names: [], all: true });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { sf, edges: out };
}
const toolsText = fs.readdirSync(tools).filter((f) => fs.statSync(path.join(tools, f)).isFile()).map((f) => fs.readFileSync(path.join(tools, f), "utf8")).join("\n");
module.exports = { fs, path, root, desk, src, tools, ts, files, rel, resolve, edges, toolsText };
