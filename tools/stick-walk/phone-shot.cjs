// A joined phone's current view at a width: reuses the cookie state phone.cjs saved from its join.
// usage: node tools/stick-walk/phone-shot.cjs <width> <desk-url> <out-dir> <name> [tapText...]
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");
const [width, desk, out, name, ...taps] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +width, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, storageState: path.join(out, ".state-360.json") });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(desk + "/phone", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  for (const t of taps) { await p.getByText(t, { exact: false }).first().click(); await p.waitForTimeout(1200); }
  await p.screenshot({ path: path.join(out, `phone-${width}-${name}.png`) });
  console.log("overflow px:", await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  console.log("text:", (await p.locator("body").innerText()).slice(0, 700).replace(/\n+/g, " | "));
  console.log("errors:", JSON.stringify(errs));
  await b.close();
})();
