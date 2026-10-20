/**
 * The desk's runtime import graph, read from source text. One scanner for every tool that asks "what does this module
 * load": the model-drift pre-merge check (tools/model-drift-pr.cjs) derives the live surface from it, and the desk
 * boundary check (tools/desk-boundaries.cjs) holds the layering of desk/src/lib/ to it.
 *
 * Paths are repo paths with forward slashes (`desk/src/lib/rules/maths.ts`). `@/` is desk/src/, as in
 * desk/tsconfig.json. Type-only imports (`import type`, `export type`) are skipped: they load nothing at run time. A
 * statement may span lines, and two statements may share a line (desk/src/lib/library/paths.ts does), so a statement
 * is anchored at a line start or after a `;`.
 */
const path = require("node:path");

/** The module specifiers a TypeScript or CommonJS source loads at run time. `import type` and `export type` are skipped. */
function importsOf(src) {
  const out = [];
  for (const m of src.matchAll(/(?:^|;)[ \t]*(?:import|export)\s+(type\s+)?(?:[^"';]*?\s+from\s+)?["']([^"'\s]+)["']/gm)) if (!m[1]) out.push(m[2]);
  for (const m of src.matchAll(/\b(?:import|require)\(\s*["']([^"'\s]+)["']\s*\)/g)) out.push(m[1]);
  return out;
}

/** A specifier as the repo file it names (`@/` is desk/src/), or null for a package or a file that does not exist. */
function resolveSpec(from, spec, isFile) {
  let base;
  if (spec.startsWith("@/")) base = "desk/src/" + spec.slice(2);
  else if (spec.startsWith("./") || spec.startsWith("../")) base = path.posix.join(path.posix.dirname(from), spec);
  else return null;
  for (const f of [base, base + ".ts", base + ".tsx", base + "/index.ts"]) if (isFile(f)) return f;
  return null;
}

/** Every file reachable from `entries` through runtime imports, sorted. `read` and `isFile` take repo paths. */
function closureOf(entries, { read, isFile }) {
  const seen = new Set(), queue = entries.filter(isFile);
  while (queue.length) {
    const f = queue.shift();
    if (seen.has(f)) continue;
    seen.add(f);
    if (!/\.(ts|tsx|cjs|mjs|js)$/.test(f)) continue;
    for (const spec of importsOf(read(f))) {
      const r = resolveSpec(f, spec, isFile);
      if (r && !seen.has(r)) queue.push(r);
    }
  }
  return [...seen].sort();
}

module.exports = { importsOf, resolveSpec, closureOf };
