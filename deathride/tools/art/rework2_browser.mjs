import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import {chromium} from '../node_modules/playwright/index.mjs';
const folder=new URL('../../art/review/rework2/',import.meta.url);
const report=new URL('../../art/reports/',import.meta.url);
const data=JSON.parse(await fs.readFile(new URL('review.json',folder),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(new URL('index.html',folder).href);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    if(await page.locator('article.card').count()!==data.records.length)throw Error('candidate inventory');
    if(await page.locator('.comparison figure img').count()!==data.records.length*2)throw Error('missing before/after pair');
    if(await page.locator('input[type=radio]:checked').count())throw Error('inferred owner selection');
    const card=page.locator('article.card').first();
    await card.locator('input[value=Maybe]').check();
    await card.locator('textarea').fill('Face | scale <review>\nsecond line');
    await page.click('#refresh-export');
    const markdown=await page.locator('#export').inputValue();
    if(!markdown.includes('Maybe')||!markdown.includes('&#124;')||!markdown.includes('&lt;review&gt;')||!markdown.includes('<br>second line'))throw Error('Markdown export');
    await page.reload();
    if(await page.locator('input[value=Maybe]:checked').count()!==1)throw Error('choice persistence');
    await page.locator('article.card').first().locator('.clear-pick').click();
    await page.locator('article.card').first().locator('textarea').fill('');
    await page.click('#copy');
    const links=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href));
    for(const href of links){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    const native=await page.locator('.native img').evaluateAll(xs=>xs.map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,nw:x.naturalWidth,nh:x.naturalHeight})));
    if(overflow||errors.length||native.some(x=>x.w!==x.nw||x.h!==x.nh))throw Error(JSON.stringify({overflow,errors,native}));
    await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
    await page.screenshot({path:fileURLToPath(new URL(`rework2-browser-${width}.png`,report)),fullPage:false});
    results.push({width,height,candidates:data.records.length,images:await page.locator('img').count(),links:links.length,overflow,errors,markdown:true,persistence:true,noAutomaticPicks:true});
    await page.close();
  }
  await fs.writeFile(new URL('rework2-browser.json',report),JSON.stringify({status:'pass',results},null,2)+'\n');
  console.log(JSON.stringify(results));
} finally {await browser.close();}
