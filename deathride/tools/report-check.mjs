import {chromium} from 'playwright';
import {readFile,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const project=process.cwd(),root=path.resolve(project,'..'),file=path.join(root,'index.html');
await writeFile(path.join(root,'evidence/report-check.json'),JSON.stringify({pending:true}));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],remote=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
await page.goto(pathToFileURL(file).href);
assert.match(await page.title(),/Death Ride/);
for(const tab of ['race','lobby','controller','results']){
 await page.locator(`[data-shot="${tab}"]`).click();
 await page.waitForFunction(()=>document.querySelector('#shot').complete&&document.querySelector('#shot').naturalWidth>0);
}
await page.locator('[data-shot="race"]').click();
await page.screenshot({path:path.join(root,'evidence/report.png'),fullPage:true});
await page.screenshot({path:path.join(root,'evidence/report-hero.png')});
const hrefs=await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
for(const href of hrefs){if(href.startsWith('#')||/^https?:/.test(href))continue;await access(fileURLToPath(new URL(href,pathToFileURL(file))))}
for(const width of [390,896,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`horizontal overflow at ${width}`)}
const notes=await readFile(path.join(root,'NOTES.md'),'utf8');assert.ok(notes.trim().split(/\s+/).length<400);
for(const heading of ['## The bets','## How it feels','## Verified vs not measured','## Known limits'])assert.ok(notes.includes(heading));
assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
const result={pass:true,protocol:'file://',tabs:4,linkedFilesChecked:hrefs.filter(h=>!h.startsWith('#')).length,viewportWidths:[390,896,1440],remoteRequests:remote,pageErrors:errors,notesWords:notes.trim().split(/\s+/).length};
await writeFile(path.join(root,'evidence/report-check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
