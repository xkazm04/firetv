import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const out=resolve('evidence/tracks/owner-part2/browser');await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
 await page.goto(pathToFileURL(resolve('tracks/atlas/scrap-7.html')).href);await page.waitForFunction(()=>window.candidatesReady);
 assert.equal(await page.locator('article.card').count(),3);assert.equal(await page.locator('input[type=radio]:checked').count(),0);assert.equal(await page.locator('[data-provisional=true]').count(),1);
 assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 const data=await page.evaluate(()=>TRACK_CANDIDATES);assert.deepEqual(data.candidates.map(c=>c.id),['scrap-7-d','scrap-7-e','scrap-7-f']);
 for(const c of data.candidates){assert.equal(c.tier,1);assert.equal(c.laps,3);assert.equal(c.proof.sixCarTrials,72);assert.deepEqual(c.technicalFlags,[]);assert.ok(c.shape.gates.every(g=>g.status==='pass'));}
 for(const href of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href))){const u=new URL(href);assert.equal(u.protocol,'file:');u.search='';u.hash='';await access(fileURLToPath(u));}
 const cards=page.locator('article.card');for(const [i,pick] of ['Keep','Maybe','Reject'].entries()){await cards.nth(i).locator(`input[value=${pick}]`).check();await cards.nth(i).locator('textarea').fill(`Owner | note \\ ${i}\n<script>literal</script>`);}
 await page.locator('#refresh-export').click();const markdown=await page.locator('#export').inputValue();for(const pick of ['Keep','Maybe','Reject'])assert.ok(markdown.includes(`| ${pick} |`));assert.ok(markdown.includes('&#124;')&&markdown.includes('&#92;')&&markdown.includes('&lt;script&gt;'));assert.ok(markdown.includes('PROVISIONAL'));
 await page.reload();await page.waitForFunction(()=>window.candidatesReady);assert.equal(await page.locator('input[type=radio]:checked').count(),3);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});document.execCommand=()=>false});await page.locator('#copy').click();assert.match(await page.locator('#status').textContent(),/selected below/);
 for(const theme of ['light','dark']){await page.locator('#theme').selectOption(theme);assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.screenshot({path:resolve(out,`review-${width}-${theme}.png`),fullPage:true});}
 if(width===1440){const png=await page.locator('canvas.sheet').evaluate(c=>c.toDataURL());await writeFile(resolve(out,'scrap-7-outline-sheet.png'),Buffer.from(png.split(',')[1],'base64'));}
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);results.push({width,cards:3,provisional:1,blankInitialChoices:true,persistence:true,escapedMarkdown:true,clipboardFallback:true,errors,remote});await context.close();
}await writeFile(resolve(out,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
