import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import {chromium} from '../node_modules/playwright/index.mjs';
const folder=new URL('../../art/review/story/',import.meta.url);
const report=new URL('../../art/reports/',import.meta.url);
const review=JSON.parse(await fs.readFile(new URL('review.json',folder),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(new URL('index.html',folder).href);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const current=review.records.filter(r=>r.current).length;
    if(current!==17 || await page.locator('article:visible').count()!==current)throw Error('candidate inventory');
    await page.click('#attempts');
    if(await page.locator('article:visible').count()!==review.records.length)throw Error('attempt inventory');
    await page.click('#attempts');
    const links=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href));
    for(const href of links){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    const native=await page.locator('article:visible .native img').evaluateAll(xs=>xs.map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height,nw:x.naturalWidth,nh:x.naturalHeight})));
    if(overflow||errors.length||native.some(x=>x.w!==x.nw || x.h!==x.nh))throw Error(JSON.stringify({overflow,errors,native}));
    await page.screenshot({path:fileURLToPath(new URL(`story-browser-${width}.png`,report)),fullPage:false});
    results.push({width,height,images:await page.locator('img').count(),links:links.length,current,attempts:review.records.length,overflow,errors,native});
    await page.close();
  }
  await fs.writeFile(new URL('story-browser.json',report),JSON.stringify({status:'pass',results},null,2)+'\n');
  console.log(JSON.stringify(results));
} finally {await browser.close();}
