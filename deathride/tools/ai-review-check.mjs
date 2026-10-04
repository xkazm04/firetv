// File:// checks in disposable browser contexts; test selections never become owner choices.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {access,readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const out=resolve(process.argv[2]||'evidence/ai/z4/review-browser');
await mkdir(out,{recursive:true});
const target=pathToFileURL(resolve('ai/design/index.html')).href;
const manifest=JSON.parse(await readFile('ai/design/manifest.json','utf8'));
for(const [path,hash] of Object.entries(manifest.sources)) {
  const bytes=await readFile(path),content=path.endsWith('.gz')?bytes:bytes.toString('utf8').replaceAll('\r\n','\n');
  assert.equal(createHash('sha256').update(content).digest('hex'),hash,`Source drift: ${path}`);
}
const browser=await chromium.launch({headless:true,channel:'chrome'}), results={target,sourceHashes:true,layouts:[],checks:[]};
const errors=[],remote=[];
const watch=page=>{
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
};
try {
  const ctx=await browser.newContext({offline:true}),page=await ctx.newPage();watch(page);
  await page.goto(target);
  const expected={'temperament-table':11,'persona-table':6,'plan-table':4,'phase-table':4,'weakness-table':7,
    'event-table':35,'course-table':21,'event-band-table':102,'boss-win-table':12,'difficulty-table':36,'cohort-table':12,'class-table':20,'skill-table':9};
  for(const [id,count] of Object.entries(expected))assert.equal(await page.locator(`#${id} tbody tr`).count(),count,id);
  const campaign=(await readFile('core/src/main/resources/data/campaign.csv','utf8')).trim().split(/\r?\n/).slice(1).map(row=>row.split(',')[0]);
  const ids=await page.locator('#event-table tbody tr td:first-child').allTextContents();
  assert.deepEqual(ids.map(x=>x.split(' / ')[1]),campaign);
  for(const link of await page.locator('a[href],link[href],script[src],img[src]').evaluateAll(xs=>xs.map(x=>x.href||x.src))) {
    const url=new URL(link);assert.equal(url.protocol,'file:');url.hash='';await access(fileURLToPath(url));
  }
  await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>{x.loading='eager';return x.decode()})));
  const cards=page.locator('article.card[data-direction]');
  assert.equal(await cards.count(),32);assert.equal(manifest.decisions.length,32);
  assert.equal(await page.locator('input[type=radio]').count(),96);
  assert.equal(await page.locator('input:checked').count(),0);
  assert.deepEqual(await cards.evaluateAll(xs=>xs.map(x=>x.dataset.direction)),manifest.decisions.map(x=>x.id));
  const text=await page.locator('main').innerText();
  for(const finding of ['735','1.031818','0 / 667','16.54%','10.06%','53.22%','70-attempt','No paired pre-change roster','no visible hunt cue'])
    assert.ok(text.includes(finding),finding);
  results.checks.push('offline local assets, source hashes, exact table/event counts, disclosed findings, no default picks');
  const colours=[];
  for(const theme of ['light','dark']) {
    await page.selectOption('#theme',theme);colours.push(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor));
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${theme}/${width}`);
      results.layouts.push({theme,width,overflow:false});
      if([390,1440].includes(width))await page.screenshot({path:resolve(out,`${theme}-${width}.png`)});
    }
  }
  assert.notEqual(colours[0],colours[1]);
  await page.selectOption('#theme','system');
  for(const [i,theme] of ['light','dark'].entries()) {
    await page.emulateMedia({colorScheme:theme});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),colours[i]);
  }
  await page.emulateMedia({colorScheme:'light'});
  await page.locator('details').evaluateAll(xs=>xs.forEach(x=>x.open=true));
  const hostile='AUTOMATED TEST ONLY | Keep \\| Maybe\n<script>alert("test")</script> & Reject';
  for(let i=0;i<32;i++) {
    const card=cards.nth(i),pick=['Keep','Maybe','Reject'][i%3];
    await card.locator(`input[value=${pick}]`).check();
    await card.locator('textarea').fill(i===0?hostile:`AUTOMATED decision ${i}; not an owner choice`);
  }
  await cards.first().screenshot({path:resolve(out,'choice-controls.png')});
  await page.reload();await page.locator('details').evaluateAll(xs=>xs.forEach(x=>x.open=true));
  assert.equal(await page.locator('input:checked').count(),32);
  assert.equal(await cards.first().locator('textarea').inputValue(),hostile);
  await page.locator('#refresh-export').click();
  const markdown=await page.locator('#export').inputValue();
  assert.equal(markdown.split('\n').filter(x=>x.startsWith('| ')).length,33);
  assert.ok(markdown.includes('&#124;')&&markdown.includes('&#92;&#124;')&&markdown.includes('<br>&lt;script&gt;'));
  assert.ok(!markdown.includes('<script>'));
  for(const d of manifest.decisions)assert.ok(markdown.includes(`| ${d.label} |`));
  await cards.first().locator('.clear-pick').click();
  assert.equal(await cards.first().locator('input:checked').count(),0);
  assert.equal(await cards.first().locator('textarea').inputValue(),hostile);
  assert.ok((await page.locator('#export').inputValue()).includes('| Needle temperament | Not reviewed |'));
  results.checks.push('all 32 choices/notes, reload persistence, safe four-column Markdown, clear preserves note');
  // Both clipboard API success and denied/manual fallback use the real button.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}}));
  await page.locator('#copy').click();
  assert.equal(await page.evaluate(()=>window.__copied),await page.locator('#export').inputValue());
  assert.match(await page.locator('#status').innerText(),/Markdown copied/);
  await page.evaluate(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});
    const original=document.execCommand.bind(document);
    document.execCommand=cmd=>{window.__fallback=cmd;return original(cmd)};
  });
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.__fallback),'copy');
  await page.evaluate(()=>{document.execCommand=()=>false});
  await page.locator('#copy').click();
  assert.match(await page.locator('#status').innerText(),/Press Ctrl\+C/);
  assert.ok(await page.locator('#export').evaluate(x=>x.selectionStart===0&&x.selectionEnd===x.value.length));
  results.checks.push('clipboard API, native fallback, denied manual-copy selection');
  // Storage failure and corrupt state must not destroy the visible form or exported note.
  for(const mode of ['denied','corrupt','malformed']) {
    const c=await browser.newContext({offline:true,viewport:{width:390,height:1000}});
    await c.addInitScript(mode=>{
      if(mode==='denied')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}});
      else localStorage.setItem('deathride.ai.z4.review',mode==='corrupt'?'broken json':JSON.stringify({theme:'bad',choices:{'car-Needle':{pick:'invented',note:{bad:true}}}}));
    },mode);
    const p=await c.newPage();watch(p);await p.goto(target);
    assert.equal(await p.locator('input:checked').count(),0);
    await p.locator('details').evaluateAll(xs=>xs.forEach(x=>x.open=true));
    await p.locator('article.card').first().locator('textarea').fill('AUTOMATED storage check');
    await p.locator('article.card').first().locator('input[value=Maybe]').check();
    assert.ok((await p.locator('#export').inputValue()).includes('AUTOMATED storage check'));
    if(mode==='denied')assert.match(await p.locator('#status').innerText(),/storage unavailable/);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await c.close();
  }
  results.checks.push('storage denial/corruption/malformed state, mobile expanded controls');
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  results.pass=true;results.errors=errors;results.remoteRequests=remote;
} catch(error) {results.pass=false;results.error=error.stack;throw error}
finally {await writeFile(resolve(out,'result.json'),JSON.stringify(results,null,2)+'\n');await browser.close()}
console.log('AI owner review browser PASS: 32 decisions, 35 events, offline assets, persistence, export and layouts');
