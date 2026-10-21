// A wrong pairing code from a fresh phone: node tools/stick-walk/badcode.cjs <width> <desk-url> <out-file>
const { chromium } = require(process.env.PW || "playwright");
const [width, desk, file] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +width, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); await p.goto(desk + "/phone", { waitUntil: "networkidle" });
  await p.locator("input").first().fill("0000"); await p.waitForTimeout(2000);
  await p.screenshot({ path: file });
  console.log("text:", (await p.locator("body").innerText()).slice(0, 300).replace(/\n+/g, " | "));
  console.log("overflow", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await b.close();
})();
