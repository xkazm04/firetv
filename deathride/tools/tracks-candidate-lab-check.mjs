import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const output=resolve(process.env.TRACK_EVIDENCE||'evidence/tracks/owner-apply','candidate-lab');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try{for(const [id,width,race]of [['scrap-1-c',1440,true],['scrap-1-c',390,false],['scrap-6-b',1440,true],['crown-7-a',1440,true]]){
 const d=JSON.parse(await readFile(`tracks/candidates/drafts/${id}.json`,'utf8')),page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=new URL(pathToFileURL(resolve('tracks/lab/index.html')));url.searchParams.set('candidate',id);await page.goto(url.href);await page.waitForFunction(()=>window.labReady&&!document.querySelector('#race').disabled,null,{timeout:120000});
 // HTML textareas normalize CRLF to LF; compare identical CSV content after that mandated conversion.
 const textareaText=s=>s.replace(/\r\n/g,'\n');
 assert.ok((await page.locator('#composer-status').textContent()).includes(id));assert.equal(await page.locator('#nodes-csv').inputValue(),textareaText(d.csv.nodes));assert.equal(await page.locator('#spots-csv').inputValue(),textareaText(d.csv.spots));assert.equal(await page.locator('#recipe').inputValue(),textareaText(d.recipe));
 assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
 if(race){const response=page.waitForResponse(r=>r.url().endsWith('/api/race'));await page.locator('#race').click();const result=await(await response).json();await page.waitForFunction(()=>window.labRaceReady,null,{timeout:120000});assert.equal(result.trial.configuration.laps,d.laps);assert.equal(result.trial.configuration.tier,d.tier);assert.equal(result.trial.configuration.arena,false);assert.equal(result.trial.configuration.limitSeconds,d.course.raceProfile.budgetSeconds);assert.equal(result.trial.assignments.length,6);assert.ok(result.trial.assignments.every(a=>a.human===false&&a.tier===d.tier));assert.ok(result.trial.replay.length>100);results.push({id,width,configuration:result.trial.configuration,stoppingReason:result.trial.stoppingReason,pass:true})}else results.push({id,width,pass:true});
 await page.screenshot({path:resolve(output,`${id}-${width}.png`)});assert.deepEqual(errors,[]);await page.close();
}await writeFile(resolve(output,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close()}
