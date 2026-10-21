// Any desk path at a phone width (STATE=<file> for a joined phone): node tools/stick-walk/page-shot.cjs <width> <desk-url> <path> <out-file>
const { chromium } = require(process.env.PW || "playwright");
const [width, desk, p, file] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +width, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, ...(process.env.STATE ? { storageState: process.env.STATE } : {}) });
  const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
  const r = await pg.goto(desk + p, { waitUntil: "networkidle" }); await pg.waitForTimeout(1000);
  await pg.screenshot({ path: file });
  console.log(p, width, "status", r.status(), "overflow px:", await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), "errors", JSON.stringify(errs));
  console.log((await pg.locator("body").innerText()).slice(0, 300).replace(/\n+/g, " | "));
  await b.close();
})();
