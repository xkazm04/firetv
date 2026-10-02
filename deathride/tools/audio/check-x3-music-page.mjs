import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=path.resolve('audio/x3/music'),out=path.join(base,'evidence');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={at:new Date().toISOString(),page:pathToFileURL(path.join(base,'index.html')).href,layouts:[],media:[],sections:[]};
try{
  await page.goto(report.page);
  for(const light of [false,true])for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(light=>{document.body.classList.toggle('light',light);window.dispatchEvent(new Event('resize'))},light);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.layouts.push({width,light,overflow:false});
    if(width===390||width===1440)await page.screenshot({path:path.join(out,`${light?'light':'dark'}-${width}.png`),fullPage:true});
  }
  report.media=await page.evaluate(async()=>{
    const rows=[];
    for(const a of document.querySelectorAll('audio')){
      a.muted=true;
      const duration=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('load timeout')),10000);
        a.onloadedmetadata=()=>{clearTimeout(timeout);resolve(a.duration)};a.onerror=()=>reject(Error('media failed'));a.load()});
      await a.play();a.pause();rows.push({file:a.src,duration,playStarted:true});
    }return rows;
  });
  assert.ok(report.media.every(m=>Math.abs(m.duration-150)<.1));
  for(const [i,start] of [0,20,60,100,120].entries()){
    await page.locator('#sections button').nth(i).click();
    await page.waitForFunction(start=>{const a=document.querySelector('#main-player');return !a.paused&&a.currentTime>=start&&a.currentTime<start+1},start);
    report.sections.push({start,seekAndPlay:true});
  }
  assert.ok(await page.evaluate(async()=>{const[a,b]=document.querySelectorAll('audio');await a.play();await b.play();return a.paused&&!b.paused}));
  await page.click('#stop');assert.ok(await page.evaluate(()=>[...document.querySelectorAll('audio')].every(a=>a.paused&&a.currentTime===0)));
  await page.fill('#notes','AUTOMATED TEST NOTE; no owner listening verdict');await page.selectOption('#decision','Useful structure, refine sound');
  await page.click('#theme');const light=await page.evaluate(()=>document.body.classList.contains('light'));await page.reload();
  assert.equal(await page.evaluate(()=>document.body.classList.contains('light')),light);assert.match(await page.inputValue('#notes'),/AUTOMATED/);
  assert.equal(await page.inputValue('#decision'),'Useful structure, refine sound');
  const pending=page.waitForEvent('download');await page.click('#export');const downloaded=await pending;
  assert.match(fs.readFileSync(await downloaded.path(),'utf8'),/AUTOMATED TEST NOTE/);
  const hrefs=await page.locator('a[href]').evaluateAll(list=>list.map(a=>a.getAttribute('href')));
  for(const href of hrefs)assert.ok(fs.existsSync(path.resolve(base,href)),href);
  assert.deepEqual(errors,[]);report.result='pass';report.checks=['8 layouts and themes','3 media decodes/starts for same composition','5 section seeks','single playback','stop','notes/theme persistence','export','artifact links'];
  report.notMeasured=['human listening','physical Stick','complete 150-second realtime playback'];
  fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close()}
