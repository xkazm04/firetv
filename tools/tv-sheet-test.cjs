/**
 * The marked sheet: a marked set lands on one picture of its verdicts, Select opens a slip in the
 * walk, "Six more" asks for a new set on the same topic, and Back parks the set instead of
 * throwing it away. Run with npm test in desk/ (directly: node tools/tv-sheet-test.cjs). The store
 * writes to a scratch DESK_DATA_DIR under the OS temp dir, never desk/data; no route or model is called.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
const opts={compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),opts).outputText,file);
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-tv-sheet-'));
after(()=>{if(globalThis.__desk?.ticker)clearInterval(globalThis.__desk.ticker);fs.rmSync(process.env.DESK_DATA_DIR,{recursive:true,force:true});});
// loaded per test, so a missing module fails each case on its own
const keys=()=>require(path.join(root,'src/tv/keys.ts'));
const rows=()=>require(path.join(root,'src/tv/sheetRows.ts'));
const maths=()=>require(path.join(root,'src/tv/mathsRows.ts'));
const store=()=>require(path.join(root,'src/lib/session/store.ts'));

const LOCAL={busy:false,table:false,hintInFlight:false};
const Q=['x+3=7','x-5=2','3x=18','x/2=4','x+1=10','5x=35'];
const unmarked=(topic='linear-one-step')=>({topic,marked:false,items:Q.map((question,ix)=>({n:ix+1,question}))});
const marked=(verdicts,topic='linear-one-step')=>({topic,marked:true,items:Q.map((question,ix)=>({n:ix+1,question,studentAnswer:String(ix+2),studentWorking:'x = '+(ix+2),
 ...(verdicts[ix]?{verdict:verdicts[ix]}:{}),...(verdicts[ix]==='wrong'?{slip:'sign-lost-moving'}:{}),said:`Number ${ix+1}.`}))});
function session(patch={}){
 return {subject:'maths',screen:'tonight',focus:0,view:'band',joined:true,pin:'1234',phoneUrl:'',awaiting:null,
  learner:{id:'ema',name:'Ema'},profiles:[{id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']}],draft:null,
  timer:{running:false,left:1500,phase:'work'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,lessonPaused:false,noLesson:false,
  english:null,essay:null,practice:null,topic:null,walkIx:0,skills:{},history:[],jobs:{},status:'',log:{started:null,minutes:0,problems:[],hard:[],hints:0},...patch};
}
/** Apply a step's events with the real reducer - what the session is after the press. */
const after_=(s,events)=>events.reduce((x,e)=>store().reduce(x,e),s);
const keysIn=(o)=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>[k,...keysIn(v)]):[];

test('case 1: a marked set lands on the sheet, focused on the first item to look at, with the set kept',()=>{
 const {reduce}=store();
 const s=session({screen:'practice',topic:'linear-one-step',practice:unmarked()});
 const verdicts=['right','wrong','right','unsure','right','right'];
 const n=reduce(s,{type:'practice.marked',items:marked(verdicts).items});
 assert.equal(n.screen,'sheet');assert.equal(n.focus,1,'item 2 is the first one to look at');assert.equal(n.walkIx,0);
 assert.ok(n.practice&&n.practice.marked,'the practice is kept');
 assert.deepEqual(n.practice.items.map(i=>i.verdict),verdicts);
});

test('case 2: a set with nothing to look at lands on the sheet focused on "Six more"',()=>{
 const {reduce}=store();
 const s=session({screen:'practice',practice:unmarked()});
 const n=reduce(s,{type:'practice.marked',items:marked(Array(6).fill('right')).items});
 assert.equal(n.screen,'sheet');assert.equal(n.focus,6);
 assert.equal(rows().sheetStops(n.practice)[n.focus],'more');
});

test('case 3: the sheet is six tiles of number, verdict and slip - never a question or an answer - and eight stops',()=>{
 const {sheetTiles,sheetStops}=rows();
 const p=marked(['right','wrong',undefined,'unsure','right','right']);
 // an item an explanation settled (desk-pipelines B): its stored verdict is what the tile shows
 p.items[3]={...p.items[3],verdict:'right',reply:'Look at the line where the 1 moved.'};
 const tiles=sheetTiles(p);
 assert.deepEqual(tiles,[{n:1,verdict:'right'},{n:2,verdict:'wrong',slip:'sign-lost-moving'},{n:3,verdict:'unsure'},{n:4,verdict:'right'},{n:5,verdict:'right'},{n:6,verdict:'right'}]);
 for(const t of tiles)assert.deepEqual(Object.keys(t).filter(k=>!['n','verdict','slip'].includes(k)),[],`tile ${t.n} carries only n, verdict, slip`);
 const flat=JSON.stringify(tiles);for(const q of Q)assert.ok(!flat.includes(q),'no question text on a tile');
 assert.ok(!/studentAnswer|studentWorking|answer|solution/.test(flat));
 assert.deepEqual(sheetStops(p),['item0','item1','item2','item3','item4','item5','more','away']);
});

test('case 4: Select on a tile opens that item in the walk; Back from the walk returns to the sheet at that item and keeps the set',()=>{
 const {tvKey}=keys();
 const p=marked(['right','wrong','right','unsure','right','right']);
 assert.deepEqual(tvKey(session({screen:'sheet',focus:3,practice:p}),'select',LOCAL).events,[{type:'walk',ix:3},{type:'nav',screen:'walk',focus:0}]);
 const back=tvKey(session({screen:'walk',walkIx:3,practice:p}),'back',LOCAL);
 assert.deepEqual(back.events,[{type:'nav',screen:'sheet',focus:3}]);
 assert.ok(!back.events.some(e=>e.type==='practice.clear'),'leaving the walk does not throw the marked set away');
 // the walk's last-item action goes back to the sheet too, never clears
 const last=tvKey(session({screen:'walk',walkIx:5,focus:0,practice:p}),'select',LOCAL);
 assert.deepEqual(last.events,[{type:'nav',screen:'sheet',focus:5}]);
 // Left and Right still step the walk
 assert.deepEqual(tvKey(session({screen:'walk',walkIx:3,practice:p}),'right',LOCAL).events,[{type:'walk',ix:4}]);
 // and on the sheet they step the tiles, Down reaches the actions
 const on=session({screen:'sheet',focus:1,practice:p});
 assert.deepEqual(tvKey(on,'right',LOCAL).events,[{type:'focus',focus:2}]);
 assert.deepEqual(tvKey(session({screen:'sheet',focus:5,practice:p}),'right',LOCAL).events,[],'Right stops at the last tile');
 assert.deepEqual(tvKey(on,'down',LOCAL).events,[{type:'focus',focus:6}]);
 assert.deepEqual(tvKey(session({screen:'sheet',focus:6,practice:p}),'right',LOCAL).events,[{type:'focus',focus:7}]);
 assert.deepEqual(tvKey(session({screen:'sheet',focus:7,practice:p}),'up',LOCAL).events,[{type:'focus',focus:1}],'Up returns to the first tile to look at');
});

test('case 5: "Six more" is one press from the sheet to a new set on the same topic',()=>{
 const {tvKey}=keys();
 const s=session({screen:'sheet',focus:6,topic:'linear-two-step',practice:marked(['right','wrong','right','right','right','right'],'linear-two-step')});
 const step=tvKey(s,'select',LOCAL);
 assert.deepEqual(step.events,[{type:'topic.open',topic:'linear-two-step'}]);
 assert.deepEqual(step.calls.map(c=>({url:c.url,body:c.body})),[{url:'/api/practice',body:{topic:'linear-two-step'}}]);
 assert.deepEqual(step.calls[0].onFail,{busy:false},'a failed set gives Select back, as on Topics');
 assert.deepEqual(step.local,{busy:true});
 const again=tvKey(s,'select',{...LOCAL,busy:true});assert.deepEqual([again.events,again.calls],[[],[]],'a second press while the set is written does nothing');
 const run=tvKey({...s,jobs:{practice:{id:'j',phase:'running',startedAt:1,key:'linear-two-step'}}},'select',LOCAL);
 assert.deepEqual(run.calls,[],'a set already being written is not asked for twice');
 assert.equal(after_(s,step.events).screen,'topics','Topics shows its preparing caption while the set is written');
});

test('case 6: Back from the sheet parks the set and the continue card resumes it; "Put the sheet away" clears it',()=>{
 const {tvKey}=keys(),{continueCard}=maths();
 const p=marked(['right','wrong','right','unsure','right','right']);
 const s=session({screen:'sheet',focus:2,topic:'linear-one-step',practice:p});
 const back=tvKey(s,'back',LOCAL);
 assert.deepEqual(back.events,[{type:'nav',screen:'tonight',focus:0}]);
 const home=after_(s,back.events);
 assert.ok(home.practice,'the set is kept');
 const cont=continueCard(home);assert.equal(cont&&cont.go,'sheet');
 // Enter on the card goes back to the sheet, at the first item to look at
 assert.deepEqual(tvKey(home,'select',LOCAL).events,[{type:'subject',subject:'maths'},{type:'nav',screen:'sheet',focus:1}]);
 const away=tvKey(session({screen:'sheet',focus:7,practice:p}),'select',LOCAL);
 assert.deepEqual(away.events,[{type:'practice.clear'}]);
 const gone=after_(s,away.events);assert.equal(gone.practice,null);
 const c=continueCard(gone);assert.ok(c===null||c.go==='page');
});

test('case 7: Back from the unmarked poster parks the set, and "Still open" is reachable',()=>{
 const {tvKey}=keys(),{continueCard}=maths();
 const s=session({screen:'practice',topic:'linear-one-step',practice:unmarked()});
 const back=tvKey(s,'back',LOCAL);
 assert.deepEqual(back.events,[{type:'nav',screen:'tonight',focus:0}]);
 const home=after_(s,back.events);assert.ok(home.practice,'the set on paper is kept');
 const cont=continueCard(home);assert.equal(cont&&cont.k,'Still open');assert.equal(cont.go,'practice');
});

test('GUARD: a marked set in the real store carries no answer or solution anywhere',()=>{
 const st=store();
 st.dispatch({type:'reset'});
 st.dispatch({type:'practice.set',practice:{topic:'linear-one-step',marked:false,items:Q.map((question,ix)=>({n:ix+1,question,answer:String(ix)}))}});
 st.dispatch({type:'practice.marked',items:marked(['right','wrong','right','unsure','right','right']).items.map(i=>({...i,answer:'4',solution:'x=4'}))});
 const k=keysIn(st.getSession().practice);
 assert.ok(!k.includes('answer'));assert.ok(!k.includes('solution'));
});

test('extra: the sheet rows stay free of the filesystem-backed session modules',()=>{
 const out=ts.transpileModule(fs.readFileSync(path.join(root,'src/tv/sheetRows.ts'),'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
});
