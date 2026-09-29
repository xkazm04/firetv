/**
 * The Calculus 1 baseline, live: every topic's examples (desk/src/lib/library/calculus1.ts) on every Math Buddy
 * screen of the REAL TV, measured in a real browser. Not run by the gate - the Director runs it against an isolated
 * server, like tools/linga-ui-test.cjs:
 *
 *   MATHS_LIVE_ALLOW_WRITES=1 MATHS_LIVE_URL=http://localhost:3217 DESK_DATA_DIR=<that server's data dir> \
 *     node tools/maths-calculus-live.cjs [--strict] [--topics calc1-limit-idea,calc1-ftc]
 *
 * What it does, and what is real in it:
 *  - REAL: the server, its TV key (read from DESK_DATA_DIR/pairing.json), the TV page (/tv?key=, 1920 x 1080) and every
 *    Math Buddy screen it draws, a phone paired the way a phone pairs (/phone?pin=, 390 x 844), and the scratch learner
 *    'calc-live' (modules ['maths']) created through the session event endpoint (profile.draft, profile.save).
 *  - NO MODEL CALL: the set, the marking, the page read and the hint are the desk's own events (practice.set,
 *    practice.marked with studentAnswer / studentWorking / verdict / said / slipAt, page.reading, page.read, hint.set,
 *    nav, walk - lib/session/store.ts). The session route REFUSES those from any screen (api/session SERVER_ONLY: a
 *    screen that could post them could forge a verdict), so this script does not post them: it runs them through the
 *    store's own pure `reduce`, in this process, starting from the server's real session as the TV sees it, and hands
 *    the result to the TV on its session stream (Playwright route on /api/session/stream). The TV cannot tell the
 *    difference; the server's desk is never given a forged set. /api/speak is answered empty so no voice engine runs.
 *
 * For each topic x screen it checks: no page error and no console error; every math node (.mx) inside its container
 * (scrollWidth <= clientWidth + 1, and no taller than its row) and inside the 5% safe zone (x 96-1824, y 54-1026 on
 * the stage); every text node inside an .mb-* element computes to >= 28 px, except the design's labels (LABELS below),
 * which must be the 20-22 px uppercase furniture docs/DESIGN-MATH-BUDDY.md allows; no text node holds a backslash.
 * It saves artifacts/math-calculus/<topic>-<screen>.png and report.json + report.md (pass/fail per check, with the
 * offending selector and the measured value). Non-strict by default (prints violations, exits 0); --strict exits 1
 * on any violation or unreachable screen. A screen that cannot be reached is reported as such, and the run goes on.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module');

/**
 * The labels (docs/DESIGN-MATH-BUDDY.md, "Ten-foot law" and the type scale: "kicker, label, tab, ruler text |
 * Manrope 800 | 20-22 | uppercase"), as design/maths-lamplight.css names them. The only text allowed under 28 px,
 * and only at 20-22 px, uppercase.
 */
const LABELS=['.mb-lab','.mb-kick','.mb-tab','.mb-ok .ok','.mb-strand','.mb-ty','.mb-marker .mc','.mb-flag .mc','.mb-item .ok b','.mb-rule dt','.mb-unit .next'];
const SAFE={x0:96,x1:1824,y0:54,y1:1026};
const SCREENS=['tonight','topics','practice','sheet','walk','page','hint'];

// ------------------------------------------------------------------ refuse to run anywhere but an isolated server

const argv=process.argv.slice(2);
const strict=argv.includes('--strict');
/** --dry: no server, no browser - build every topic x screen state and render it with MathsTV to static markup. */
const dry=argv.includes('--dry');
const topicsArg=(()=>{const i=argv.indexOf('--topics');return i>=0&&argv[i+1]?argv[i+1].split(',').map(s=>s.trim()).filter(Boolean):null;})();
const base=process.env.MATHS_LIVE_URL||'http://localhost:3217';
const SERVER_DATA=process.env.DESK_DATA_DIR;
let key,chromium;
if(!dry){
 if(process.env.MATHS_LIVE_ALLOW_WRITES!=='1'){console.error('Refusing to run: start an isolated server (its own DESK_DATA_DIR), then set MATHS_LIVE_ALLOW_WRITES=1. This script seats a scratch learner on that desk. (--dry checks the states offline.)');process.exit(2);}
 if(!SERVER_DATA){console.error('Refusing to run: set DESK_DATA_DIR to the isolated server\'s data directory - the TV is opened with the key the desk keeps there (pairing.json).');process.exit(2);}
 try{key=JSON.parse(fs.readFileSync(path.join(SERVER_DATA,'pairing.json'),'utf8')).key;}catch(e){console.error(`Cannot read the TV key from ${path.join(SERVER_DATA,'pairing.json')}: ${e.message}. Is DESK_DATA_DIR the running server's data directory?`);process.exit(2);}
 try{({chromium}=require('playwright'));}catch{console.error('Playwright is not installed: run npm install in tools/ (it is a devDependency there).');process.exit(2);}
}

// ------------------------------------------------------------------ the desk's TypeScript, in this process

const root=path.resolve(__dirname,'../desk');
const ts=require(path.join(root,'node_modules/typescript'));
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
// the store is loaded only for its pure reducer; pointed at a scratch directory, so this process never reads or
// writes the server's data (the store and the learner record both read DESK_DATA_DIR when they load)
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'maths-calc-live-'));
const {CALCULUS_1}=require(path.join(root,'src/lib/library/calculus1.ts'));
const {reduce}=require(path.join(root,'src/lib/session/store.ts'));
const stopTicker=()=>{const g=globalThis.__desk;if(g?.ticker){clearInterval(g.ticker);g.ticker=null;}};

const out=path.resolve(__dirname,'../artifacts/math-calculus');
const topics=CALCULUS_1.topics.filter(t=>!topicsArg||topicsArg.includes(t.id));
if(topicsArg){const unknown=topicsArg.filter(id=>!CALCULUS_1.topics.some(t=>t.id===id));if(unknown.length){console.error(`Unknown topic id(s): ${unknown.join(', ')}. Known: ${CALCULUS_1.topics.map(t=>t.id).join(', ')}`);process.exit(2);}}

// ------------------------------------------------------------------ the session endpoint, as the TV

let tvCookie='';
async function asTheTV(){
 const r=await fetch(base+'/tv?key='+encodeURIComponent(key),{redirect:'manual'});
 tvCookie=(r.headers.getSetCookie?.()??[]).map(c=>c.split(';')[0]).filter(c=>c.startsWith('desk-tv=')).join('; ');
 if(!tvCookie)throw new Error(`The desk at ${base} did not take the key from ${SERVER_DATA}/pairing.json - is that its data directory?`);
}
async function post(e){const r=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',cookie:tvCookie},body:JSON.stringify(e)});if(r.status!==200)throw new Error(`${e.type}: HTTP ${r.status} ${await r.text()}`);return r.json();}
async function current(){return(await fetch(base+'/api/session',{headers:{cookie:tvCookie}})).json();}

// ------------------------------------------------------------------ one topic's states, one per screen

const PHOTO='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600"><rect width="1200" height="1600" fill="#f4efe3"/><g stroke="#c9c1ad" stroke-width="2">'+Array.from({length:30},(_,i)=>`<line x1="80" x2="1120" y1="${120+i*48}" y2="${120+i*48}"/>`).join('')+'</g></svg>');
const firstLine=(s)=>String(s).split('\n')[0];
/** A span the pen can ring in the first working line: its first sign and what follows it, if it has one. */
function spanIn(line){const m=/[-+−]\s*\S+/.exec(line);return m?m[0]:undefined;}

function statesFor(t,base0){
 const R=(s,...events)=>events.reduce((x,e)=>reduce(x,e),s);
 const q=t.examples.filter(e=>e.kind==='question'),w=t.examples.filter(e=>e.kind==='working'),c=t.examples.filter(e=>e.kind==='caption'),p=t.examples.filter(e=>e.kind==='page');
 // the set: each question as the models would send it, plain and TeX, at most six
 const qs=q.flatMap(e=>[{text:e.plain,tex:false,e},...(e.tex?[{text:e.tex,tex:true,e}]:[])]).slice(0,6);
 const works=w.flatMap(e=>[e.plain,...(e.tex?[e.tex]:[])]);
 const said=c[0]?.plain??'';
 const items=qs.map((x,i)=>({n:i+1,question:x.text}));
 const verdicts=['wrong','right','unsure'];
 const marked=qs.map((x,i)=>{
  const working=works.length?works[i%works.length]:x.text,v=verdicts[i%3],it={n:i+1,question:x.text,studentWorking:working,studentAnswer:firstLine(working.split('\n').pop()),verdict:v,said};
  const sp=spanIn(firstLine(working));if(v==='wrong'&&sp)it.slipAt={line:0,span:sp,kind:'sign'};
  return it;
 });
 const practice=R(base0,{type:'practice.set',practice:{topic:t.id,items,marked:false}});
 const sheet=R(practice,{type:'practice.marked',items:marked});
 const pageItems=[...p.flatMap(e=>[e.plain,...(e.tex?[e.tex]:[])]),...q.map(e=>e.plain)].map((text,i)=>({n:i+1,text,cx:600,cy:160+i*120,band:[110+i*120,210+i*120],key:`calc-live-${t.id}-${i}`}));
 const pageId=`calc-live-${t.id}-${Date.now()}`;
 const page=R(sheet,{type:'page.reading',page:{id:pageId,subject:'maths',title:t.name,img:PHOTO,w:1200,h:1600}},{type:'page.read',id:pageId,items:pageItems,readMs:1200,provider:'fixture'},{type:'item',itemIx:0});
 const hint=R(page,{type:'hint.set',hint:{key:pageItems[0].key,problem:q[0]?.plain??pageItems[0].text,stage:1,hint1:{hint:said,next:'Write the first line on your paper.'},hint2:null,askedQ:''}});
 return {
  tonight:R(practice,{type:'nav',screen:'tonight'}),
  topics:R(practice,{type:'nav',screen:'topics'}),
  practice,
  sheet,
  walk:R(sheet,{type:'nav',screen:'walk'},{type:'walk',ix:0}),
  page:R(page,{type:'nav',screen:'page'}),
  hint,
 };
}

// ------------------------------------------------------------------ the checks, in the page

/** Runs in the TV page: every violation on the stage as it stands, with the offending selector and the value. */
function measure({LABELS,SAFE}){
 const stage=document.querySelector('.stage'),root=document.querySelector('.maths-tv');
 if(!stage||!root)return {missing:true};
 // the safe zone is in 1920 x 1080 stage pixels: a stage laid out at another size is reported, not measured
 if(stage.offsetWidth!==1920)return {missing:true,why:`the stage is laid out ${stage.offsetWidth} px wide, not the 1920 px television`};
 const sr=stage.getBoundingClientRect(),k=sr.width/1920||1;
 const box=(el)=>{const r=el.getBoundingClientRect();return {x:(r.left-sr.left)/k,y:(r.top-sr.top)/k,r:(r.right-sr.left)/k,b:(r.bottom-sr.top)/k,w:r.width/k,h:r.height/k};};
 const sel=(el)=>{const parts=[];for(let e=el,d=0;e&&e!==root&&d<4;e=e.parentElement,d++){let s=e.tagName.toLowerCase();if(e.classList.length)s+='.'+[...e.classList].slice(0,3).join('.');const role=e.getAttribute('data-role');if(role)s+=`[data-role="${role}"]`;parts.unshift(s);}return parts.join(' > ');};
 const visible=(el)=>{const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 const v={overflow:[],rowHeight:[],safe:[],fontSize:[],label:[],backslash:[]};
 const win=root.querySelector('.mb-win');const wb=win?box(win):null;
 for(const mx of root.querySelectorAll('.mx')){
  if(!visible(mx))continue;
  const b=box(mx);
  // a line on the paper that has panned out of the reading window is masked by design: not on screen, not measured
  if(wb&&win.contains(mx)&&(b.b<wb.y||b.y>wb.b))continue;
  // Tonight's thumbnails (.mb-srow .qx, .mb-box .qx) crop the paper by design (overflow: hidden, a fixed box): a
  // glance at the sheet, not the reading of it. Their text is still held to the font-size, label and backslash checks.
  if(mx.closest('.mb-srow .qx, .mb-box .qx'))continue;
  const c=mx.closest('.mb-row, .qx, .mb-card, .mb-cap, .mb-lede, .mb-side')||mx.parentElement;
  if(c.scrollWidth>c.clientWidth+1)v.overflow.push({selector:sel(mx),value:`${c.scrollWidth}px in ${c.clientWidth}px (${sel(c)})`});
  // 2 px of slack on a row's height and on the safe zone: sub-pixel layout, not a design breach
  if(c.classList.contains('mb-row')){const rb=box(c);if(b.h>rb.h+2)v.rowHeight.push({selector:sel(mx),value:`${b.h.toFixed(0)}px in a ${rb.h.toFixed(0)}px row`});}
  if(b.x<SAFE.x0-2||b.r>SAFE.x1+2||b.y<SAFE.y0-2||b.b>SAFE.y1+2)v.safe.push({selector:sel(mx),value:`x ${b.x.toFixed(0)}-${b.r.toFixed(0)}, y ${b.y.toFixed(0)}-${b.b.toFixed(0)}`});
 }
 const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 for(let n=tw.nextNode();n;n=tw.nextNode()){
  const text=n.nodeValue.trim();if(!text)continue;
  const el=n.parentElement;if(!el||!visible(el))continue;
  if(text.includes('\\'))v.backslash.push({selector:sel(el),value:text.slice(0,60)});
  if(!el.closest('[class*="mb-"]'))continue;
  if(wb&&win.contains(el)){const b=box(el);if(b.b<wb.y||b.y>wb.b)continue;}
  const cs=getComputedStyle(el),fs=parseFloat(cs.fontSize);
  if(LABELS.some(s=>el.closest(s))){
   if(fs<20-0.5||fs>22+0.5||cs.textTransform!=='uppercase')v.label.push({selector:sel(el),value:`${fs}px ${cs.textTransform} "${text.slice(0,30)}"`});
  }else if(fs<28-0.5)v.fontSize.push({selector:sel(el),value:`${fs}px "${text.slice(0,30)}"`});
 }
 return v;
}

// ------------------------------------------------------------------ --dry: the states, offline

function dryRun(){
 require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
 // next/font runs only inside Next: the three font modules are stood in for by their class names (tools/tv-recap-test.cjs does the same)
 for(const [f,e] of [['maths/fonts.ts',{MATHS_FONTS:'maths-fonts'}],['essay/fonts.ts',{ESSAY_FONTS:'essay-fonts'}],['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}]]){
  const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
 const React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {fresh}=require(path.join(root,'src/lib/session/store.ts'));
 const {MathsTV}=require(path.join(root,'src/maths/MathsTV.tsx'));
 const base0={...[{type:'profile.draft',patch:{id:'calc-live',name:'Calc',type:'other',modules:['maths']}},{type:'profile.save'},{type:'join'}].reduce((s,e)=>reduce(s,e),fresh()),viewer:'tv'};
 const quiet=console.error;console.error=()=>{};// useLayoutEffect's server warning, once per render
 let bad=0;
 try{
  for(const t of topics){const states=statesFor(t,base0);for(const screen of SCREENS){
   const s=states[screen];let why='';
   if(s.screen!==screen)why=`the state is on "${s.screen}"`;
   else{try{const html=renderToStaticMarkup(React.createElement(MathsTV,{s,busy:false}));const text=html.replace(/<[^>]+>/g,' ');
    if(!html.includes(`data-screen="${screen}"`))why='MathsTV drew another screen';else if(text.includes('\\'))why='a backslash reaches the text';}
    catch(e){why='MathsTV threw: '+e.message;}}
   if(why){bad++;console.log(`FAIL ${t.id} ${screen}: ${why}`);}
  }}
 }finally{console.error=quiet;stopTicker();}
 console.log(`dry: ${topics.length} topics x ${SCREENS.length} screens built and rendered with MathsTV; ${bad} failed`);
 process.exitCode=bad?1:0;
}

// ------------------------------------------------------------------ the run

if(dry)dryRun();
else (async()=>{
 const started=new Date().toISOString();
 fs.mkdirSync(out,{recursive:true});
 await asTheTV();
 await post({type:'profile.draft',patch:{id:'calc-live',name:'Calc',type:'other',modules:['maths']}});
 await post({type:'profile.save'});
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  // under reduced motion every pen stroke is already drawn and nothing is mid-rise when the stage is measured
  const tv=await(await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'})).newPage();
  const phone=await(await browser.newContext({viewport:{width:390,height:844}})).newPage();
  // the phone pairs the way a phone pairs: the QR's ?pin=
  await phone.goto(base+'/phone?pin='+(await current()).pin);
  await phone.waitForFunction(async()=>(await(await fetch('/api/session')).json()).viewer==='phone',null,{timeout:20000}).catch(()=>{throw new Error('The phone did not pair with ?pin= - is the desk\'s pin current?');});
  const base0=await current();
  if(base0.learner?.id!=='calc-live')throw new Error(`The scratch learner is not at the desk (it is ${base0.learner?.id ?? 'no one'}).`);
  if(base0.viewer!=='tv')throw new Error('The session was not read as the TV.');
  // the TV's session is the stream this script serves; nothing else about the page is touched
  let served=base0;
  await tv.route('**/api/session/stream',(r)=>r.fulfill({status:200,headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache'},body:`data: ${JSON.stringify(served)}\n\n`}));
  // no voice engine: an empty 204 (an error status would put a "Failed to load resource" line in the console we check)
  await tv.route('**/api/speak',(r)=>r.fulfill({status:204,body:''}));
  const errors=[];
  tv.on('pageerror',(e)=>errors.push(`pageerror: ${e.message}`));
  // the empty /api/speak answer above becomes an empty audio blob, which the browser cannot range-read: that one line is
  // this script's own stub, not the desk's (any other error, blob or not, still counts)
  tv.on('console',(m)=>{if(m.type()!=='error')return;const url=m.location().url||'';if(url.startsWith('blob:')&&/ERR_REQUEST_RANGE_NOT_SATISFIABLE/.test(m.text()))return;errors.push(`console: ${m.text()} ${url}`.trim());});
  phone.on('pageerror',(e)=>errors.push(`phone pageerror: ${e.message}`));
  // display=tv: the 1920 x 1080 television stage, never the bench's larger PC-monitor stage
  await tv.goto(base+'/tv?key='+encodeURIComponent(key)+'&display=tv');
  // the bench's bar is the dev harness, not the television: hidden, so the stage is the whole 1920 x 1080 window
  await tv.addStyleTag({content:'.bench .bar{display:none!important}'});
  await tv.waitForSelector('.stage',{timeout:20000});
  for(const t of topics){
   const states=statesFor(t,base0);
   for(const screen of SCREENS){
    const marker=`calc-live ${t.id} ${screen} ${Date.now()}`;
    served=reduce(states[screen],{type:'status',text:marker});
    const row={topic:t.id,screen,reached:false,checks:{},screenshot:null};
    errors.length=0;
    try{
     await tv.waitForFunction(({m,screen})=>document.querySelector('.bench .status')?.textContent.includes(m)&&document.querySelector('.maths-tv')?.getAttribute('data-screen')===screen,{m:marker,screen},{timeout:12000});
     await tv.evaluate(()=>document.fonts.ready);
     await tv.waitForTimeout(250);
     row.reached=true;
    }catch{
     const at=await tv.evaluate(()=>({screen:document.querySelector('.maths-tv')?.getAttribute('data-screen')??null,status:document.querySelector('.bench .status')?.textContent??null})).catch(()=>({}));
     row.reason=`could not reach "${screen}" for ${t.id}: the TV shows ${at.screen?`the "${at.screen}" screen`:'no Math Buddy screen'}${at.status?` (status "${at.status.slice(0,80)}")`:''}`;
     console.log('UNREACHED '+row.reason);
     results.push(row);continue;
    }
    const v=await tv.evaluate(measure,{LABELS,SAFE});
    if(v.missing){row.reached=false;row.reason=v.why?`${t.id} ${screen}: ${v.why}`:`the "${screen}" screen drew no .maths-tv stage`;console.log('UNREACHED '+row.reason);results.push(row);continue;}
    const file=`${t.id}-${screen}.png`;await tv.screenshot({path:path.join(out,file)});row.screenshot=file;
    const add=(name,items)=>{row.checks[name]={pass:!items.length,items};};
    add('errors',errors.map(e=>({selector:'(page)',value:e})));
    add('overflow',v.overflow);add('rowHeight',v.rowHeight);add('safeZone',v.safe);add('fontSize',v.fontSize);add('labels',v.label);add('backslash',v.backslash);
    const bad=Object.entries(row.checks).filter(([,c])=>!c.pass);
    console.log(`${bad.length?'FAIL':'ok  '} ${t.id} ${screen}${bad.map(([n,c])=>` | ${n}: ${c.items.length} (${c.items[0].selector} = ${c.items[0].value})`).join('')}`);
    results.push(row);
   }
  }
  await tv.unroute('**/api/session/stream');
 }finally{await browser.close();stopTicker();}
 // ---- the report
 const failed=results.filter(r=>!r.reached||Object.values(r.checks).some(c=>!c.pass));
 const report={base,started,finished:new Date().toISOString(),strict,labels:LABELS,safeZone:SAFE,screens:SCREENS,topics:topics.map(t=>t.id),
  totals:{runs:results.length,reached:results.filter(r=>r.reached).length,failed:failed.length},results};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
 const cell=(r,n)=>!r.reached?'n/a':r.checks[n].pass?'pass':`FAIL ${r.checks[n].items.length}`;
 const names=['errors','overflow','rowHeight','safeZone','fontSize','labels','backslash'];
 const md=['# Calculus 1 on the TV (live)','',`${base} · ${report.started} · ${strict?'strict':'non-strict'} · ${report.totals.reached}/${report.totals.runs} screens reached · ${report.totals.failed} with a violation`,'',
  `| topic | screen | ${names.join(' | ')} | screenshot |`,`|---|---|${names.map(()=>'---').join('|')}|---|`,
  ...results.map(r=>`| ${r.topic} | ${r.screen} | ${names.map(n=>cell(r,n)).join(' | ')} | ${r.screenshot??(r.reason||'')} |`),'','## Violations','',
  ...results.flatMap(r=>[...(!r.reached?[`- ${r.topic} ${r.screen}: ${r.reason}`]:[]),...Object.entries(r.checks).flatMap(([n,c])=>c.items.slice(0,5).map(i=>`- ${r.topic} ${r.screen} · ${n} · \`${i.selector}\` · ${i.value}`))])];
 fs.writeFileSync(path.join(out,'report.md'),md.join('\n')+'\n');
 console.log(`\n${report.totals.reached}/${report.totals.runs} screens reached, ${report.totals.failed} with a violation. Report: ${path.join(out,'report.md')}`);
 if(strict&&failed.length)process.exitCode=1;
})().catch(e=>{stopTicker();console.error(e.message||e);process.exitCode=1;});
