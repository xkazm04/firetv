/**
 * The landing's theme seam (landing/model.ts, landing/themes/): what the view-model reads off a session (only the
 * profile's apps, nothing invented, about 25 words a caption, nothing for an adult that compares an age), that the
 * default look ("paper") draws it on the D-pad's stops, and that the second look ("blueprint", contest A/3) is kept
 * but LOCKED: it renders when a test instantiates it, and nothing in the app can select it. Run with npm test in
 * desk/ (directly: node tools/tv-landing-test.cjs). No session store is loaded and no server is started; the real
 * page is driven by tools/tv-landing-live.cjs.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText,file);
require.extensions['.tsx']=require.extensions['.ts'];
// next/font runs only under Next: each face module answers with its class names
for(const [f,e] of [['landing/fonts.ts',{DESK_FONTS:'desk-fonts'}],['landing/themes/blueprint/fonts.ts',{BLUEPRINT_FONTS:'bp-fonts'}]]){
 const file=path.join(root,'src',f),m=new Module(file);m.filename=file;m.loaded=true;m.exports=e;require.cache[file]=m;}
const src=(f)=>path.join(root,'src',f);
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {createElement}=require(path.join(root,'node_modules/react'));
const model=()=>require(src('landing/model.ts'));
const themes=()=>require(src('landing/themes/index.ts'));
/** A theme's Landing as the TV would draw it, quietly (a layout effect warns on the server). */
function draw(theme,view,zoom=null){const q=console.error;console.error=()=>{};try{return renderToStaticMarkup(createElement(theme.Landing,{view,zoom,boot:false}));}finally{console.error=q;}}

const EMA={id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']};
const JAKUB={id:'jakub',name:'Jakub',type:'other',modules:['english','essay']};
const noEnglish={preferences:null,notes:[],evidence:[],achievements:{},sessions:[],placement:null,plan:null,taught:[]};
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:-1,view:'band',joined:true,pin:'4711',phoneUrl:'http://10.0.0.7:3000/phone',awaiting:null,
  learner:{id:'ema',name:'Ema'},profiles:[EMA,JAKUB],draft:null,timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],log:{started:false,minutes:0,problems:[],hard:[],hints:0},
  englishLearning:noEnglish,conversation:null,check:null,writing:{},...patch};
}
const marked={topic:'linear-two-step',marked:true,items:[{n:1,question:'2x + 3 = 11',studentAnswer:'x = 4',verdict:'right'},{n:2,question:'5x - 4 = 21',studentAnswer:'x = 3',verdict:'wrong'},{n:3,question:'3x + 7 = 1',studentAnswer:'x = -2',verdict:'right'},{n:4,question:'4x - 1 = 15',studentAnswer:'x = 4',verdict:'right'}]};
const readIt={at:Date.now()-3*86400000,kind:'writing',label:'Argument',detail:'1 of 6 sentences to fix'};
const talk={id:'c1',learnerId:'jakub',sceneId:'interview',title:'Beyond the rehearsed answer',goal:'g',partner:'Jordan · Interviewer',focusSkill:'narrate',preferences:{level:'C1'},
 turns:[{id:'t1',role:'partner',text:'Tell me about a project.'},{id:'t2',role:'learner',text:'I led one.'},{id:'t3',role:'partner',text:'What did you change?'}],coaching:null,moment:null,moments:[],phase:'conversation',pending:null,error:'',paused:true,capture:false,captureAt:0,audioNonce:0,supported:false,cue:'',quizOpen:false,startedAt:Date.now()-5*86400000};
const words=(c)=>`${c.head} ${c.sub}`.trim().split(/\s+/).length;
const SCENARIOS={
 returning:()=>session({practice:marked,history:[readIt]}),
 someoneElse:()=>session({learner:{id:'jakub',name:'Jakub'},conversation:talk}),
 firstRun:()=>session({joined:false}),
 nobody:()=>session({learner:null}),
};

test('view 1: only the profile\'s apps lie on the shelf, in the desk\'s order, and the stops are the D-pad\'s',()=>{
 const {landingView}=model();const {landingStops,landingAt}=require(src('tv/landingRows.ts'));
 const r=landingView(SCENARIOS.returning());
 assert.deepEqual(r.apps.map(a=>a.id),['maths','english','essay']);
 assert.deepEqual(landingView(SCENARIOS.someoneElse()).apps.map(a=>a.id),['english','essay'],'an adult with two apps: only those two');
 assert.deepEqual(landingView(session({profiles:[{...EMA,modules:['essay','maths']}]})).apps.map(a=>a.id),['maths','essay'],'the desk\'s order whatever order the profile lists');
 for(const k of Object.keys(SCENARIOS)){const s=SCENARIOS[k]();const v=landingView(s);assert.deepEqual(v.stops,landingStops(s),k);assert.equal(v.at,landingStops(s)[landingAt(s)],`${k}: the view is on the stop the keys are on`);}
 assert.equal(landingView(session({profiles:[{...EMA,modules:[]}]})).empty,true,'a profile with no app: an empty desk, said so');
 assert.equal(landingView(session({profiles:[{...EMA,modules:[]}]})).world,null);
});

test('view 2: the light rests on what was left, and the world stays on the last app while the D-pad is on Someone else',()=>{
 const {landingView}=model();
 const r=landingView(SCENARIOS.returning());
 assert.equal(r.world,'maths','a marked set beats a reading');assert.deepEqual(r.apps.map(a=>a.tagged),[true,false,false],'the CONTINUE tag is on the marked set');
 const onPlace=landingView({...SCENARIOS.returning(),focus:3},'essay');
 assert.equal(onPlace.at,'place');assert.equal(onPlace.world,'essay','moving down to Someone else keeps the world behind');
 assert.equal(landingView({...SCENARIOS.returning(),focus:3}).world,'maths','with no history of moves, the CONTINUE app');
 assert.equal(landingView({...SCENARIOS.returning(),focus:1}).world,'english','the app the D-pad is on is the world');
});

test('view 3: the words are about 25 in the caption slot, and never invented - an app with nothing on the desk says so',()=>{
 const {landingView}=model();
 for(const k of Object.keys(SCENARIOS)){const v=landingView(SCENARIOS[k]());for(const a of v.apps)assert.ok(words(a.caption)<=25,`${k}/${a.id}: ${words(a.caption)} words`);}
 const r=landingView(SCENARIOS.returning());
 assert.equal(r.apps[0].caption.head,'Two-step equations · 3 of 4 right','the set as the session has it');assert.equal(r.apps[0].caption.sub,'The marked set is still on the desk.');
 assert.deepEqual(r.apps[0].art,{app:'maths',fresh:false,n:3,m:4},'the stairs are lit by what came back right, of what was asked');
 const n=landingView(session());
 assert.deepEqual(n.apps.map(a=>[a.kind,a.caption.head]),[['none','Not started'],['none','Not started'],['none','Nothing read']],'nothing waiting: two words, as the rows say');
 assert.deepEqual(n.apps[0].art,{app:'maths',fresh:true,n:null,m:6},'no invented steps lit');
 for(const a of n.apps)assert.equal(/\d/.test(a.caption.head),false,`${a.id}: no number on an empty desk`);
 const j=landingView(SCENARIOS.someoneElse());
 assert.equal(j.apps[0].caption.head,'Beyond the rehearsed answer');assert.match(j.apps[0].caption.sub,/left mid-way/);assert.equal(j.apps[0].art.resume,true);
 assert.equal(j.apps[0].caption.chip.text.startsWith('Left '),true,'when it was left, as a label');
 assert.doesNotMatch(JSON.stringify(j.apps.map(a=>a.caption)),/\bage\b|years|your age|for a \d/i,'no age comparison for a learner without a school system');
});

test('view 4: the actions say what Select does; the phone carries the real code and address; no one seated asks who',()=>{
 const {landingView,primaryLabel}=model();
 assert.equal(landingView(SCENARIOS.returning()).primary,'Continue as Ema');assert.equal(landingView(session()).primary,'Start as Ema');
 assert.equal(landingView(SCENARIOS.returning()).place,'Someone else');
 const f=landingView(SCENARIOS.firstRun());
 assert.deepEqual(f.phone,{paired:false,pin:'4711',url:'10.0.0.7:3000/phone'},'the address without its scheme, the session\'s own code');
 assert.equal(f.at,'phone','a fresh unpaired desk rests on the phone');assert.match(f.caption.sub,/four digits/);
 assert.equal(landingView(SCENARIOS.returning()).phone.paired,true);
 const nb=landingView(SCENARIOS.nobody());
 assert.deepEqual([nb.learner,nb.primary,nb.place],[null,'Choose who is studying','Choose who'],'no one at the desk: an app asks who first');
 assert.equal(primaryLabel('Ema','marked'),'Continue as Ema');
});

test('paper 1: the default look draws each scenario with its hooks and its real words',()=>{
 const {landingView}=model();const PAPER=themes().THEMES.paper;
 assert.equal(PAPER.id,'paper');
 const html=(k,zoom)=>draw(PAPER,landingView(SCENARIOS[k]()),zoom);
 const r=html('returning');
 assert.match(r,/data-role="desk-scene"[^>]*data-theme="paper"|data-theme="paper"[^>]*data-role="desk-scene"/);
 assert.equal((r.match(/data-role="desk-object"/g)||[]).length,3);assert.match(r,/data-app="maths"[^>]*data-focused="true"|data-focused="true"[^>]*data-app="maths"/,'the focus ring is on the lit app');
 assert.match(r,/Two-step equations · 3 of 4 right/);assert.match(r,/Continue as Ema/);assert.match(r,/data-role="desk-place-card"/);
 assert.doesNotMatch(r,/data-role="desk-pin"/,'a paired phone shows no code');
 assert.equal((html('someoneElse').match(/data-role="desk-object"/g)||[]).length,2);
 const f=html('firstRun');assert.match(f,/data-role="desk-pin"[^>]*>4711</,'the pairing code is the session\'s');assert.match(f,/10\.0\.0\.7:3000\/phone/);
 assert.match(html('nobody'),/Whose desk\?/);
 const z=html('returning','maths');assert.match(z,/data-role="desk-zoom"[^>]*data-app="maths"/,'Select plays the hand-off of the lit app');assert.match(z,/Opening/);
 assert.doesNotMatch(r,/dangerouslySetInnerHTML|<script/);
});

test('paper 2: nothing in the landing writes markup from strings',()=>{
 const dir=path.join(root,'src/landing');
 const files=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true}))e.isDirectory()?walk(path.join(d,e.name)):/\.(tsx?|ts)$/.test(e.name)&&files.push(path.join(d,e.name));})(dir);
 for(const f of files){const t=fs.readFileSync(f,'utf8');assert.doesNotMatch(t.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,''),/dangerouslySetInnerHTML|\.innerHTML\s*=|insertAdjacentHTML/,path.relative(root,f));}
});

test('lock 1: the blueprint theme renders when a test instantiates it explicitly, on the same view-model',()=>{
 const {landingView}=model();const {THEMES,THEMES_ENABLED}=themes();
 assert.equal(THEMES_ENABLED,false,'themes are off until product decides the age tiers');
 const bp=THEMES.blueprint;assert.equal(bp.id,'blueprint');
 for(const k of ['returning','someoneElse','firstRun']){
  const html=draw(bp,landingView(SCENARIOS[k]()));
  assert.match(html,/data-theme="blueprint"/,k);assert.match(html,/data-role="desk-scene"/,k);
  const apps=(html.match(/data-role="desk-object"/g)||[]).length;assert.equal(apps,k==='someoneElse'?2:3,`${k}: one entry per app on the profile`);
 }
 const f=draw(bp,landingView(SCENARIOS.firstRun()));assert.match(f,/data-role="desk-pin"/);assert.match(f,/4711/);
 assert.match(draw(bp,landingView(SCENARIOS.returning())),/Two-step equations/,'the same words as paper');
 assert.match(draw(bp,landingView(SCENARIOS.returning()),'maths'),/data-role="desk-zoom"|data-zoom/,'and the same hand-off');
});

test('lock 2: the app cannot select it - the registry answers paper to any request, and no route, query, setting or storage names a theme',()=>{
 const {THEMES,themeFor,DEFAULT_THEME,THEMES_ENABLED}=themes();
 assert.equal(DEFAULT_THEME,'paper');
 assert.equal(themeFor().id,'paper');assert.equal(themeFor('paper').id,'paper');
 assert.equal(themeFor('blueprint').id,'paper','asked for blueprint, the app still draws paper while themes are off');
 assert.equal(themeFor('nonsense').id,'paper');assert.equal(THEMES_ENABLED,false);
 assert.deepEqual(Object.keys(THEMES).sort(),['blueprint','paper']);
 // the only callers: the landing asks for the default, with no argument
 const all=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?e.name!=='node_modules'&&walk(p):/\.(tsx?|ts|css)$/.test(e.name)&&all.push(p);}})(path.join(root,'src'));
 const rel=(f)=>path.relative(path.join(root,'src'),f).replace(/\\/g,'/');
 for(const f of all){
  const r=rel(f),t=fs.readFileSync(f,'utf8');
  if(!r.startsWith('landing/themes/')&&r!=='design/desk-landing-blueprint.css'&&r!=='design/desk-landing.css'&&r!=='app/globals.css')assert.doesNotMatch(t.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,''),/blueprint/i,`${r} does not name the locked theme`);
  if(!r.startsWith('landing/themes/')&&r!=='design/desk-landing.css'&&r!=='app/globals.css')assert.doesNotMatch(t.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'').replace(/@\/landing\/themes/g,''),/\bTHEMES(_ENABLED)?\b/,`${r} does not reach into the registry's list`);
  if(!r.startsWith('landing/themes/')&&r!=='app/globals.css')assert.doesNotMatch(t,/themeFor\((?!\))/,`${r} asks the registry for a named theme`);
  if(r.startsWith('landing/')&&!r.startsWith('landing/themes/'))assert.doesNotMatch(t.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,''),/URLSearchParams|location\.|localStorage|sessionStorage|process\.env|searchParams|cookies?\(/,`${r}: nothing selects a look at run time`);
 }
 const themeCallers=all.filter(f=>/themeFor\(/.test(fs.readFileSync(f,'utf8'))&&!rel(f).startsWith('landing/themes/'));
 assert.deepEqual(themeCallers.map(rel),['landing/LandingTV.tsx'],'one caller');
 assert.match(fs.readFileSync(src('landing/LandingTV.tsx'),'utf8'),/themeFor\(\)/,'and it asks for no theme by name');
 // no route, setting or profile field carries a theme
 for(const f of all.filter(f=>/^(app|lib)\//.test(rel(f))))assert.doesNotMatch(fs.readFileSync(f,'utf8'),/\btheme\s*[:=?]|["']theme["']/i,`${rel(f)} carries no theme setting`);
 // the stylesheet for the locked look is scoped: nothing outside .desk-tv.bp
 const css=fs.readFileSync(src('design/desk-landing-blueprint.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 for(const k of css.match(/@keyframes\s+[\w-]+/g)||[])assert.match(k,/@keyframes\s+bp-/,`its animations are prefixed: ${k}`);
 for(const sel of css.match(/(^|})\s*[^{}@]+\{/g)||[]){const s=sel.replace(/^[}\s]+/,'').replace(/\{$/,'').trim();if(/^((\d+(\.\d+)?%|from|to)\s*,?\s*)+$/.test(s))continue;for(const one of s.split(','))assert.match(one.trim(),/^\.desk-tv\.bp\b/,`the blueprint stylesheet stays under .desk-tv.bp: ${one.trim().slice(0,60)}`);}
});

test('GUARD: the landing view-model stays free of the filesystem-backed session modules',()=>{
 const out=ts.transpileModule(fs.readFileSync(src('landing/model.ts'),'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
 model();assert.ok(!Object.keys(require.cache).some(k=>/session[\\/](store|learners)\.ts$/.test(k)),'loading the view-model pulled the store in');
});
