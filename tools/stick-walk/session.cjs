// The desk's session as the joined phone sees it: node tools/stick-walk/session.cjs <desk-url> <out-dir> [field...]
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");
const [desk, out, ...fields] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: path.join(out, ".state-360.json") });
  const j = await (await ctx.request.get(desk + "/api/session")).json();
  const pick = fields.length ? Object.fromEntries(fields.map((f) => [f, j[f]])) : j;
  console.log(JSON.stringify(pick));
  await b.close();
})();
