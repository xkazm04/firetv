// node build-findings.cjs: turns tsc-before.txt, no-importer.out and unused-exports.out into findings.jsonl (status of the TS6133 lines is set below from the removals)
const fs = require("fs"), path = require("path");
const here = __dirname, rd = (f) => fs.readFileSync(path.join(here, f), "utf8").split(/\r?\n/).filter(Boolean);
const built = {
  "landing/themes/blueprint/drawings.tsx": ["f2f6efe5", "delete `const G = 500;` in english()"],
  "lib/english/conversation.ts": ["2c9db914", "drop `takeSpent` from the ./take import"],
  "lib/rules/school.ts": ["1856bf80", "rename the unused parameter u to _u in the len helper (callers keep passing it)"],
  "lib/rules/week.ts": ["61c911dd", "delete `const DAY = 24 * 60 * 60 * 1000;`"],
  "tv/rulerRows.ts": ["ae0f74e0", "rename the unused map element x to _x in `w.map((x, i) => i)`"],
};
const open = {
  "lib/desk/read.ts": "NOT removed: `num = (n) => finite(n) ? n : Infinity` sits beside the item filter and looks like a missed use. `n: i.number` is the one item field not guarded, and missingNumbers treats a non-integer n as unknown (null), so n: num(i.number) would have mapped a non-finite printed number to 'unknown'. Owner decision: wire it in (behaviour change) or delete it",
  "tv/screens.tsx": "NOT edited: screens.tsx belongs to delivery 7b. Remove the unused `Clock` const (line 38) once 7b lands",
};
const out = [];
for (const l of rd("tsc-before.txt")) {
  const m = l.match(/^(.+?)\((\d+),\d+\): error TS6133: '(\w+)' is declared but its value is never read\.$/);
  if (!m) continue;
  const key = m[1].replace(/^src\//, ""), kind = /\(.*\)/.test("") ? "" : (m[3] === "u" || m[3] === "x" ? "unused-param" : "unused-local");
  const b = built[key];
  out.push({ file: "desk/" + m[1], line: +m[2], kind, tool: l, removal: b ? b[1] : open[key] || "", status: b ? "built" : "open", ...(b ? { commit: b[0] } : {}) });
}
const intentional = {
  "desk/src/lib/desk/paperRead.ts": "wired to nothing by design (docs/concepts/STUDY-DESK-V2-PLAN.md about :1602-1606); tools/paper-probe*.cjs and econ-rules-test.cjs require it",
  "desk/src/lib/rules/paperScore.ts": "wired to nothing by design (docs/concepts/STUDY-DESK-V2-PLAN.md about :1602-1606)",
  "desk/src/lib/english/cambridge.ts": "required by tools/cambridge-rules-test.cjs and tools/cambridge-coverage.cjs",
};
for (const l of rd("no-importer.out")) {
  const o = JSON.parse(l), why = intentional[o.file];
  out.push({ file: o.file, line: 1, kind: "no-importer", tool: l, removal: why ? "none: " + why : "none: no desk/src importer, but a tools/ rule suite requires it (a test-only module); left in place", status: why ? "intentional" : "open" });
}
for (const l of rd("unused-exports.out")) {
  const o = JSON.parse(l);
  out.push({ file: o.file, line: o.line, kind: "unused-export", tool: l, removal: "none in this sweep (no export is removed: tools/ requires .ts files directly); count only", status: "open" });
}
fs.writeFileSync(path.join(here, "findings.jsonl"), out.map((o) => JSON.stringify(o)).join("\n") + "\n");
const c = {}; out.forEach((o) => { const k = o.kind + "/" + o.status; c[k] = (c[k] || 0) + 1; });
console.log(out.length, JSON.stringify(c));
