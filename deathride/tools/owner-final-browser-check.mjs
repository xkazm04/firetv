import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const out=resolve(process.env.TRACK_EVIDENCE||'evidence/tracks/owner-part4','final-browser');await mkdir(out,{recursive:true});
const data=JSON.parse(await readFile('evidence/tracks/owner-part4/before-after.json','utf8'));
assert.equal(data.assignment.length,35);assert.equal(data.quality.length,35);
assert.equal(data.before.physical.rounds,34);assert.equal(data.after.physical.rounds,34);
assert.equal(data.before.physical.trials,data.after.physical.trials);
assert.equal(data.beforeBalance.trials,4896);assert.equal(data.afterBalance.trials,4896);
for(const side of ['before','after'])for(const policy of ['race','pr']){
 assert.equal(data[side].careers[policy].status,'complete');assert.equal(data[side].careers[policy].trials,2000);
}
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{
 for(const width of [1440,390])for(const name of ['index.html','final-outline-sheet.html','owner-triage.html']){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(resolve('tracks/atlas',name)).href);
  if(name!=='owner-triage.html'){
   assert.equal(await page.locator('article.outline').count(),35);assert.equal(await page.locator('svg').count(),35);
   const runoff=page.locator('article.outline').filter({hasText:'switchback-4-runoff'});
   assert.match(await runoff.textContent(),/6 laps.*Thin Air/);
   assert.match(await page.locator('article.outline').filter({hasText:'crown-7-a'}).textContent(),/Elimination.*The Crown/);
   assert.match(await page.locator('article.outline').filter({hasText:'scrap-7-e'}).textContent(),/OWNER KEEP/);
  }else{
   assert.ok(await page.locator('table').count()>=6);
   assert.ok(!(await page.locator('body').textContent()).includes('measurements running'));
  }
  for(const href of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href))){const u=new URL(href);assert.equal(u.protocol,'file:');u.search='';u.hash='';await access(fileURLToPath(u));}
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.screenshot({path:resolve(out,`${name}-${width}.png`),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);results.push({name,width,pass:true,errors,remote});await page.close();
 }
 const catalog=await(await fetch('http://127.0.0.1:8794/api/catalog')).json();
 assert.equal(catalog.playable.length,38);assert.equal(new Set(catalog.playable).size,38);
 const currentAssignment=(await readFile('tracks/candidates/owner-assignment.csv','utf8')).trim().split(/\r?\n/).slice(1).map(l=>{const [event,candidate,course,status,alternate]=l.split(',');return {event,candidate,course,status,alternate}});
 const expected=currentAssignment.flatMap(r=>[r.course,...r.alternate.split(';').filter(Boolean)]);
 assert.deepEqual([...catalog.playable].sort(),[...expected].sort());
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve('tracks/lab/index.html')).href);
  await page.waitForFunction(()=>window.labReady&&!document.querySelector('#race').disabled,null,{timeout:120000});
  const options=await page.locator('#course option').evaluateAll(xs=>xs.map(x=>x.value));
  assert.deepEqual([...options].sort(),[...expected].sort());assert.equal(await page.locator('#course').inputValue(),'scrap-1-c');
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.screenshot({path:resolve(out,`lab-default-${width}.png`)});assert.deepEqual(errors,[]);
  results.push({name:'Track Lab final library',width,courses:options.length,pass:true,errors});await page.close();
 }
 await writeFile(resolve(out,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
