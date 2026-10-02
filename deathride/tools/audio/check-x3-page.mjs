// Browser playback/interaction evidence, not human listening. No API requests.
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const wave=process.argv[2];
const base=path.resolve(`audio/x3/${wave}`),out=path.join(base,'evidence');
fs.mkdirSync(out,{recursive:true});
const plan=JSON.parse(fs.readFileSync(path.join(base,'plan.json')));
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const report={at:new Date().toISOString(),page:pathToFileURL(path.join(base,'index.html')).href,layouts:[],media:[]};
try{
  await page.goto(report.page);
  assert.equal(await page.locator('article').count(),plan.samples.length);
  for(const light of [false,true])for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(light=>document.body.classList.toggle('light',light),light);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    report.layouts.push({width,light,overflow:false});
    if(width===390||width===1440)await page.screenshot({path:path.join(out,`${light?'light':'dark'}-${width}.png`)});
  }
  report.media=await page.evaluate(async()=>{
    const rows=[];
    for(const a of document.querySelectorAll('audio')){
      a.muted=true;
      const duration=await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('media timeout')),10000);
        a.onloadedmetadata=()=>{clearTimeout(timer);resolve(a.duration)};
        a.onerror=()=>{clearTimeout(timer);reject(Error('media error '+a.src))};a.load();
      });
      await a.play();a.pause();rows.push({file:a.src,duration,playStarted:true});
    }return rows;
  });
  assert.ok(report.media.every(r=>Number.isFinite(r.duration)&&r.duration>0));
  assert.ok(await page.evaluate(async()=>{const[a,b]=document.querySelectorAll('audio');a.muted=b.muted=true;await a.play();await b.play();return a.paused&&!b.paused}));
  await page.click('#stop');assert.ok(await page.evaluate(()=>[...document.querySelectorAll('audio')].every(a=>a.paused)));
  const groups=await page.locator('#filter option').allTextContents();
  await page.selectOption('#filter',groups[1]);assert.ok(await page.locator('article:visible').count()<plan.samples.length);
  await page.selectOption('#filter','all');
  await page.locator('textarea').first().fill('AUTOMATED TEST NOTE, not an owner choice');
  await page.click('#theme');const theme=await page.evaluate(()=>document.body.classList.contains('light'));
  await page.reload();assert.equal(await page.evaluate(()=>document.body.classList.contains('light')),theme);
  assert.match(await page.locator('textarea').first().inputValue(),/AUTOMATED TEST NOTE/);
  const download=page.waitForEvent('download');await page.click('#export');
  const file=await download;assert.match(fs.readFileSync(await file.path(),'utf8'),/AUTOMATED TEST NOTE/);
  assert.deepEqual(errors,[]);
  report.result='pass';report.checks=['8 responsive/theme layouts','all media decode and muted starts','single player','stop','filter','theme and notes persistence','notes export'];
  report.notMeasured=['human listening','physical Stick','in-game mix'];
  fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({wave,result:report.result,candidates:plan.samples.length,media:report.media.length,page:report.page}));
}finally{await browser.close()}
