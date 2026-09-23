// Writes the run's ledger: the challenge-runs row, one scan-sweep snapshot per host and rider,
// the side findings file, the open-backlog register row, and the memory-outbox lines.
const fs = require("fs"), path = require("path");
const run = __dirname, tree = path.resolve(run, "../../../..");
const hist = path.join(tree, ".claude/scan-history");
fs.mkdirSync(hist, { recursive: true });
const at = "2026-09-23T11:40:00+02:00";
const append = (f, rows) => fs.appendFileSync(f, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");

// ---- scorecard
const results = Object.fromEntries(fs.readdirSync(path.join(run, "results")).map((f) => [f.replace(".json", ""), JSON.parse(fs.readFileSync(path.join(run, "results", f), "utf8"))]));
const coordinatorFixed = new Set(["engines-A", "desk-pipelines-A"]); // 2e41709, a45425e
const sum = (k) => Object.values(results).reduce((n, r) => n + (r[k] ?? 0), 0);
const flawless = [], strict = [];
for (const [id, r] of Object.entries(results)) {
  const allGreen = r.cases_green_after === r.cases_total;
  const redOrGuard = r.cases_red_before + (r.guards_declared ?? 0) >= r.cases_total;
  if (r.status === "landed" && allGreen && redOrGuard && !coordinatorFixed.has(id)) {
    flawless.push(id);
    if (r.cases_red_before === r.cases_total) strict.push(id);
  }
}
const row = {
  at, run: "challenge-2026-09-23",
  models: { scout: "claude-opus-5-5", critic: "claude-fable-5-1", builder: "claude-opus-5-5", coordinator: "claude-opus-5-5" },
  cohort: ["linga", "desk-pipelines", "uat", "tv-app", "tv-surface", "engines"],
  cards: 12, premise_false: 0, void: 0, revised: 4, approved: 12, excluded: 0,
  idea_score: { ambition: 4.17, grounding: 4.83, falsifiability: 4.5 },
  waves: 6, landed: 12, flawless: flawless.length, flawless_strict: strict.length, demoted: 0, partial: 0, reverted: 0,
  cases: { written: sum("cases_total"), red_before: sum("cases_red_before"), green_after: sum("cases_green_after") },
  integration_failures: 0, coordinator_fixes: 2, lines_changed: 5804,
  tokens: { scouts: 1115503, critic: 260719, builders: 1944043 }, wall_clock_min: 110,
  note: "0 red integration gates; 2 green-gate regressions caught from builder notes; TV Playwright gate unrunnable (no @next/env)",
};
append(path.join(hist, "challenge-runs.jsonl"), [row]);

// ---- per-context snapshots (section 10); challenge lenses never count toward stabilize coverage
const snap = (scope, lens_keys, findings, fixed, note) => ({ at, scope, mode: "resolve", strategy: "challenge", lens_keys, lens_no_surface: [], lenses: lens_keys.length, findings, fixed, auto: "0/0/0", fp: 0, carried: 0, escalations: 0, leads: 0, degraded: true, note });
const both = ["architecture-challenger", "ux-elevation"];
append(path.join(hist, "scan-sweep.jsonl"), [
  snap("linga", both, 2, 2, "A view model + B rescue ladder landed; TV capture not run"),
  snap("desk-pipelines", both, 2, 2, "A session jobs (+coord fix a45425e) + B settle landed"),
  snap("uat", both, 2, 2, "A rendered surface + B recertify landed; no live codex run"),
  snap("tv-app", both, 2, 2, "A sans-IO pen conversation + B review mode; device case unrun"),
  snap("tv-surface", both, 2, 2, "A keymap + B marked sheet landed; TV capture not run"),
  snap("engines", ["architecture-challenger"], 1, 1, "A schema+registry landed (+coord fix 2e41709)"),
  snap("session", ["ux-elevation"], 1, 1, "rider of engines; card B retry-in-place landed there"),
  snap("library", ["architecture-challenger"], 0, 0, "rider of engines; lessons.ts DATA_DIR fixed inside card A"),
  snap("companion", ["ux-elevation"], 1, 1, "rider of tv-app; card B ticks landed; reconnect loop backlogged"),
  snap("telestrator-harness", [], 1, 0, "rider of tv-app; 8 files read; /health PIN leak backlogged"),
  snap("phone-surface", [], 1, 0, "rider of tv-surface; auto-switch gap backlogged (B runner-up)"),
  snap("desk-tooling", [], 1, 0, "rider of uat; 4 files read; duplicated helpers backlogged"),
]);

// ---- side findings: backlogged, section 4.10 form
const F = (context, lens, title, summary, description, flow, impact, claim, before, after, method, result, gate, evidence, size, effort, impactN, risk) => ({
  type: "finding", skill: "scan-sweep", lens, context, title,
  body: `## Summary\n${summary}\n\n## Description\n${description}\n\n## Flow\n${flow.map((f) => "- " + f).join("\n")}\n\n## Expected impact\n${impact}\n\n## Evaluation\nClaim: ${claim}\nBefore: ${before}\nAfter: ${after}\nMethod: ${method}\nResult: ${result}\nGate: ${gate}`,
  evidence, size, effort, impact: impactN, risk, result, method: method.split(" ")[0], gate, disposition: "backlog",
});
const findings = [
  F("telestrator-harness", "security-auditor", "GET /health hands out the pairing PIN to any LAN client",
    "The TV's /health endpoint returns the current pairing PIN, so the PIN protects nothing on the LAN.",
    "tv-app/src/main/kotlin/dev/telestrator/tv/Health.kt:12 serialises the PIN into the health body; four harness tools (tools/pen-sim.mjs, live-ui-test.mjs, latency-probe.mjs, relay-test.mjs) pair by reading it. Fixed: /health omits the PIN; the harness reads it over adb (logcat or a debug-only intent) instead.",
    ["any client on the LAN: GET http://<tv>:8765/health", "read pin from the JSON", "open ws:// with that PIN - pairing accepted"],
    "Closes pairing to anyone who can reach the port; the harness must change in the same commit or it stops pairing.",
    "resilience - pairing PIN is not readable without the screen", "PIN present in /health body (Health.kt:12); 4 harness tools depend on it", "not built: needs a device to measure", "simulation - read the code path; a device is needed for the gate rung", "unmeasurable", "policy-tighten",
    "tv-app/src/main/kotlin/dev/telestrator/tv/Health.kt:12; tools/pen-sim.mjs, tools/live-ui-test.mjs, tools/latency-probe.mjs, tools/relay-test.mjs read /health for the PIN", "M", 4, 7, 4),
  F("companion", "error-handler", "After a wrong PIN the companion page reconnects every second, forever",
    "A rejected pairing sends the phone into an endless 1-second reconnect loop with the same wrong PIN.",
    "companion/index.html:147-152 reconnects on every close, including the TV's wrong-PIN refusal. Fixed: a refusal close stops reconnecting and asks for the PIN again.",
    ["enter a wrong PIN", "TV refuses and closes", "page reconnects each second with the same PIN, indefinitely"],
    "The phone stops hammering the TV and the learner gets a prompt instead of silence.",
    "user - a refused pairing asks again instead of looping", "reconnect loop, ~60 attempts/min, no prompt", "not built", "simulation - code read; needs a browser + TV to reach gate", "unmeasurable", "none",
    "companion/index.html:147-152", "S", 2, 5, 2),
  F("desk-tooling", "parity-auditor", "mainCheckout() and same() duplicated between kpi-measure and worktree-preflight",
    "Two tools carry word-for-word copies of the same checkout-discovery helpers.",
    "tools/kpi-measure.cjs and tools/worktree-preflight.cjs both define mainCheckout() and same(); a fix to one (e.g. a worktree path rule) will not reach the other. Also coveredBy counts a module as tested when a tools file merely names its path. Fixed: one shared helper module required by both; coveredBy requires a require() of the path.",
    ["change the worktree rule in one copy", "the other keeps the old rule", "KPI coverage over-reports a module named only in a comment"],
    "One rule, one place; the typecheck/coverage meter stops over-counting.",
    "quality - one implementation of checkout discovery", "2 copies of mainCheckout/same", "1 copy (not built)", "probe - grep of both files", "better", "none",
    "tools/kpi-measure.cjs mainCheckout/same; tools/worktree-preflight.cjs mainCheckout/same", "S", 3, 5, 2),
  F("phone-surface", "ux-reviewer", "The phone follows the TV only at join and Linga start; 8 hand-offs need a tab pick",
    "When the TV sends the learner to the phone, the phone does not move to the right panel except in two cases.",
    "desk/src/app/phone/page.tsx switches panels by itself only on join and when Linga starts; the other 8 TV screens that say 'on your phone' leave the learner choosing among 9 tabs. Fixed: the phone derives its panel from the session screen the way the TV does. Runner-up of card tv-surface B.",
    ["TV shows 'photograph your page on the phone'", "phone stays on its last tab", "learner hunts through 9 tabs"],
    "Every hand-off lands on the right panel; one fewer decision per step.",
    "user - steps from TV hand-off to the right phone panel", "1 + tab search at 8 of 10 hand-offs", "0 (not built)", "simulation - walked the 10 hand-offs in code", "better", "none",
    "desk/src/app/phone/page.tsx (panel state set only on join and linga start)", "M", 5, 7, 4),
  F("linga", "ux-reviewer", "Phone shows Linga controls the view model does not offer on that screen",
    "The phone renders controls that lingaView does not list for the current screen; uat A now offers them as phone-only.",
    "Found building uat A: the situation list on home and recap, Stop/Not now during a task or topics, and Choose a phrase / Help me answer after a reply are drawn by LingaPhone but not in lingaView(session).actions for that screen. Either view.ts should offer them or the phone should drop them - a product decision.",
    ["render LingaPhone on the recap", "compare its controls with lingaView actions", "situation list present, not offered"],
    "One source of truth for what a learner can do on each Linga screen.",
    "quality - controls outside the view", "several phone-only controls across 15 states (listed in results/uat-A.json)", "0 once decided", "gate - tools/uat-surface-test.cjs parity case", "unmeasurable", "direction",
    "tools/uat-surface-test.cjs parity case; results/uat-A.json notes", "S", 3, 6, 3),
  F("desk-pipelines", "state-coverage", "The 'k of n right' history line does not update after an item settles",
    "Settling an unsure item by explanation changes its verdict but not the set's right-count line.",
    "Reported by the desk-pipelines B builder: practice.settle records the attempt once and updates the item, but the history line counting right answers is computed at marking and not recomputed. Fixed: the count derives from item verdicts.",
    ["mark a set with one unsure item", "explain it - it settles right", "the history still reads k-1 of n"],
    "The learner's record matches the sheet.",
    "quality - history count equals settled verdicts", "count stale after settle", "count equals verdicts (not built)", "simulation - builder's read of the settle path", "better", "none",
    "results/desk-pipelines-B.json notes", "S", 2, 5, 2),
  F("uat", "risk-assessor", "recertify's prior[] schema uses minItems, unconfirmed under codex strict mode",
    "The first live --recertify run may fail at the judge if codex rejects minItems in a strict schema.",
    "uat B's judge schema adds prior[] with minItems; codex strict structured output has not been seen to accept that keyword in this repo. Instrument: one codex smoke call with the judge schema (uat/env.md smoke recipe).",
    ["node uat/driver/linga-text.cjs --recertify <run>", "judge call with prior[] minItems", "codex rejects the schema -> every pair errors"],
    "Recertify either works first time or fails loudly on call one.",
    "resilience - live recertify accepted by codex", "unknown", "one smoke call decides", "simulation - no codex call made in this run (costs, operator's call)", "unmeasurable", "none",
    "uat/driver/linga-text.cjs judge schema (prior[] minItems); results/uat-B.json notes", "S", 1, 6, 3),
];
const out = path.join(run, "findings.jsonl");
fs.writeFileSync(out, findings.map((f) => JSON.stringify(f)).join("\n") + "\n");
append(path.join(hist, "open-backlogs.jsonl"), [{ id: "challenge-2026-09-23", at, strategy: "challenge", path: ".claude/scan-sweep/runs/challenge-2026-09-23/findings.jsonl", total: findings.length, emitted: findings.length, built: 0, declined: 0, descoped: 0, open: findings.length, status: "open", note: "side findings of the first challenge run (riders + builders); /health PIN leak is the one to do first" }]);

// ---- memory outbox (the Personas app ingests from the main checkout)
const outbox = process.argv[2];
if (outbox) {
  const nodes = Object.entries(results).map(([id, r]) => ({ type: "node", kind: "progress", skill: "scan-sweep", context: id.replace(/-[AB]$/, ""), title: `Fixed: challenge card ${id}`, body: `${(r.shas || []).join(" ")}; ${r.cases_green_after}/${r.cases_total} acceptance cases green` }));
  append(outbox, [...findings, ...nodes]);
}
console.log(JSON.stringify({ flawless, strict, cases: row.cases, execution_score: +(flawless.length / 12).toFixed(2) }));
