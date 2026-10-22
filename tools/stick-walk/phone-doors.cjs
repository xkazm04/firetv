// The ask door as a joined phone meets it (craft-1, TL-11): every POST below must be refused 409 before any work or model call,
// and the TV's session (screen, ask, awaiting) must not move. Reuses the cookie state phone.cjs saved from its join.
// usage: node tools/stick-walk/phone-doors.cjs <desk-url> <out-dir>
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");
const [desk, out] = process.argv.slice(2);
const view = (j) => JSON.stringify({ screen: j.screen, ask: j.ask && { id: j.ask.id, kind: j.ask.kind, phase: j.ask.phase }, awaiting: j.awaiting });
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: path.join(out, ".state-360.json") });
  const get = async () => (await ctx.request.get(desk + "/api/session")).json();
  const before = await get();
  const askId = before.ask ? before.ask.id : undefined;
  const cases = [
    ["worked, naming the open ask", "/api/worked", { topic: "fractions", askId }],
    ["worked, no askId", "/api/worked", { topic: "fractions" }],
    ["memory, no askId", "/api/memory", {}],
    ["practice, no askId", "/api/practice", { topic: "fractions" }],
    ["retry practice, unknown job", "/api/session/retry", { kind: "practice", jobId: "nope" }],
    ["retry practice, no jobId", "/api/session/retry", { kind: "practice" }],
    ["coach, no writing ask, empty body", "/api/writing/coach", {}],
    ["coach, no writing ask, a draft", "/api/writing/coach", { draft: "x" }],
  ];
  for (const [name, p, body] of cases) {
    const r = await ctx.request.post(desk + p, { data: body });
    console.log(r.status(), name, "->", (await r.text()).slice(0, 90));
  }
  const after = await get();
  console.log("before", view(before));
  console.log("after ", view(after));
  console.log("TV unmoved:", view(before) === view(after));
  await b.close();
})();
