import {chromium} from 'playwright';
import {access,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const draft=process.argv.includes('--draft'),output=resolve('evidence/perf');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(output+'/index.html').href);
 const images=await page.locator('img').evaluateAll(xs=>xs.map(x=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})));
 assert.ok(images.every(x=>x.loaded));assert.deepEqual(errors,[]);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const missing=[];
 for(const href of await page.locator('a').evaluateAll(xs=>xs.map(x=>x.href)))if(href.startsWith('file:'))try{await access(fileURLToPath(href))}catch{missing.push(href)}
 assert.ok(missing.length===0||(draft&&missing.every(x=>x.endsWith('/manifest.json'))));
 if(!draft)assert.equal(await page.getByText('DRAFT',{exact:false}).count(),0);
 await page.screenshot({path:output+'/evidence-page.png',fullPage:true});
 const result={pass:true,draft,title:await page.title(),images,missing,errors};
 await writeFile(output+'/html-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close()}
