// node unused-exports.cjs: exported names in desk/src that no other desk/src file imports and tools/ never mentions as text
const L = require("./lib.cjs"), ts = L.ts;
const taken = new Map(); // file -> {names:Set, all:bool}
for (const f of L.files) for (const e of L.edges(f).edges) {
  const r = L.resolve(f, e.spec); if (!r || r === f) continue;
  const t = taken.get(r) || { names: new Set(), all: false };
  e.names.forEach((n) => t.names.add(n)); if (e.all) t.all = true; taken.set(r, t);
}
const entry = /(^|\/)(page|layout|route)\.tsx?$|(^|\/)(instrumentation|proxy)\.ts$/;
const out = [];
for (const f of L.files) {
  if (entry.test(L.rel(f))) continue;
  const { sf } = L.edges(f), t = taken.get(f) || { names: new Set(), all: false };
  const add = (name, node) => {
    if (t.all || t.names.has(name)) return;
    if (new RegExp("\b" + name.replace(/\$/g, "\$") + "\b").test(L.toolsText)) return;
    out.push({ file: L.rel(f), line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, name });
  };
  for (const s of sf.statements) {
    const mods = ts.canHaveModifiers(s) ? ts.getModifiers(s) || [] : [];
    const exp = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword), def = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (exp && !def) {
      if (ts.isVariableStatement(s)) s.declarationList.declarations.forEach((d) => ts.isIdentifier(d.name) && add(d.name.text, d));
      else if (s.name && ts.isIdentifier(s.name)) add(s.name.text, s);
    } else if (ts.isExportDeclaration(s) && !s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause)) s.exportClause.elements.forEach((e) => add(e.name.text, e));
  }
}
out.forEach((o) => console.log(JSON.stringify(o)));
console.error(out.length + " unused export(s)");
