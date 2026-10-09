/**
 * The marked sheet: a marked set lands on one picture of its verdicts, Select opens a slip in the
 * walk, "Six more" asks for a new set on the same topic, and Back parks the set instead of
 * throwing it away. Run with npm test in desk/ (directly: node tools/tv-sheet-test.cjs). The store
 * writes to a scratch DESK_DATA_DIR under the OS temp dir, never desk/data; no route or model is called.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const {transpile,options:opts}=require('./ts-load.cjs');
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

// ---- S82: only this learner's. Math Buddy's work is stamped with its learner; another learner at the desk gets a clean desk ----
const landing=()=>require(path.join(root,'src/tv/landingRows.ts'));
const TWO=[{id:'ema',name:'Ema',type:'high-school',age:16,system:'uk',modules:['maths','english','essay']},{id:'tom',name:'Tom',type:'high-school',age:15,system:'uk',modules:['maths']}];
const PAGE_EMA={id:'maths-100',subject:'maths',title:'Algebra - Exercise 4.2',img:'',w:1,h:1,items:[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,1],key:'k1'}],owner:'ema'};
const HINT_EMA={key:'k1',problem:'2x+3=11',stage:1,hint1:{hint:'Undo the +3 first.',next:'What is left?'},hint2:null,askedQ:'',owner:'ema'};
function emaEvening(patch={}){
 return session({profiles:TWO,screen:'sheet',focus:1,topic:'linear-one-step',practice:{...marked(['right','wrong','right','unsure','right','right']),owner:'ema'},
  pages:[PAGE_EMA],hint:HINT_EMA,log:{started:Date.now(),minutes:12,problems:['k1'],hard:[],hints:1},...patch});
}

test('case 8 (S82): a set owned by Ema is not on Tom\'s landing, Tonight or sheet; switching back gives her all of it untouched',()=>{
 const {reduce}=store(),{continueCard}=maths(),{mathsWaiting,continueStop}=landing(),{tvKey}=keys();
 const s=emaEvening();
 assert.equal(continueCard(s).go,'sheet','Ema\'s own desk offers her marked set');
 const tom=reduce(s,{type:'learner.set',id:'tom'});
 assert.equal(tom.learner.id,'tom');
 assert.equal(tom.practice,null,'no set of Ema\'s on Tom\'s desk');assert.deepEqual(tom.pages,[],'no page of Ema\'s');assert.equal(tom.hint,null);assert.equal(tom.lesson,null);assert.equal(tom.topic,null);
 assert.equal(tom.log.hints,0,'Ema\'s hints are not counted on Tom\'s recap');assert.equal(tom.log.minutes,12,'the evening\'s clock stays the desk\'s');
 assert.equal(continueCard(tom),null,'Tonight has nothing of Ema\'s to continue');
 const w=mathsWaiting(tom);assert.equal(w.kind,'none');assert.deepEqual(w.lines,[],'the landing object draws none of her questions or answers');
 const c=continueStop(tom);assert.ok(!c||!c.tagged,'CONTINUE is not tagged on Ema\'s work');
 // on the sheet screen Tom gets the app's empty state, and Back goes home
 const onSheet={...tom,screen:'sheet',focus:0};assert.equal(onSheet.practice,null);
 assert.deepEqual(tvKey(onSheet,'back',LOCAL).events,[{type:'nav',screen:'tonight',focus:0}]);
 assert.ok(!JSON.stringify({...tom,away:undefined}).includes('studentAnswer'),'none of her answers ride on the seated session');
 const ema=reduce(tom,{type:'learner.set',id:'ema'});
 assert.deepEqual(ema.practice,s.practice,'her marked set, untouched');assert.deepEqual(ema.pages,s.pages);assert.deepEqual(ema.hint,s.hint);
 assert.equal(ema.topic,'linear-one-step');assert.equal(ema.log.hints,1);
 assert.equal(continueCard(ema).go,'sheet');assert.equal(mathsWaiting(ema).kind,'marked');
 assert.deepEqual(ema.away,{},'nothing is left behind in away once she is back (Tom had nothing)');
});

test('case 9 (S82): Tom\'s own set is stamped his and never replaces Ema\'s; each learner sits down to their own',()=>{
 const {reduce}=store(),{continueCard}=maths();
 let x=reduce(emaEvening(),{type:'learner.set',id:'tom'});
 x=reduce(x,{type:'practice.set',practice:unmarked('linear-two-step')});
 assert.equal(x.practice.owner,'tom','stamped for the learner at the desk');assert.equal(continueCard(x).k,'Still open');
 x=reduce(x,{type:'learner.set',id:'ema'});
 assert.equal(x.practice.owner,'ema');assert.equal(x.practice.marked,true,'Ema\'s marked set, not Tom\'s new one');
 x=reduce(x,{type:'learner.set',id:'tom'});
 assert.equal(x.practice.topic,'linear-two-step');assert.equal(x.practice.marked,false);
 // a new learner saved at the desk sits down to a clean desk too
 let y=reduce(emaEvening(),{type:'profile.draft',patch:{name:'Ana',type:'high-school',age:15,modules:['maths']}});
 y=reduce(y,{type:'profile.save'});assert.equal(y.practice,null);assert.deepEqual(y.pages,[]);assert.ok(y.away.ema.practice,'Ema\'s set waits for her');
});

test('case 10 (S82): an unstamped (legacy) set still shows to the learner at the desk; settleOwners names owners from the desk\'s own record',()=>{
 const {reduce,settleOwners}=store(),{continueCard}=maths();
 const legacy=session({profiles:TWO,topic:'linear-one-step',practice:marked(['right','right','wrong','right','right','right'])});
 assert.equal(legacy.practice.owner,undefined);
 assert.equal(continueCard(legacy).go,'sheet','the single-learner desk keeps its set');
 assert.equal(settleOwners(legacy,()=>[]).practice.owner,'ema','no record names anyone: the learner at the desk when it was saved');
 const round=reduce(reduce(legacy,{type:'learner.set',id:'tom'}),{type:'learner.set',id:'ema'});
 assert.equal(continueCard(round).go,'sheet','it went away with her and came back');
 // a page snapped while Ema sat, read as she sat (her homework line), saved with Tom at the desk: it is hers
 const saved=session({profiles:TWO,learner:{id:'tom',name:'Tom'},pages:[{...PAGE_EMA,owner:undefined}],hint:{...HINT_EMA,owner:undefined},
  lesson:{id:'L1',title:'Two-step',t:0,text:'',why:''},log:{started:1,minutes:5,problems:['k1'],hard:[],hints:1}});
 const hist={ema:[{at:150,kind:'homework',label:PAGE_EMA.title,detail:'1 problem read'}],tom:[]};
 const settled=settleOwners(saved,(id)=>hist[id]??[]);
 assert.deepEqual(settled.pages,[],'not on Tom\'s desk');assert.equal(settled.hint,null);assert.equal(settled.lesson,null);assert.equal(settled.log.hints,0);
 assert.equal(settled.away.ema.pages[0].owner,'ema');assert.equal(settled.away.ema.hint.owner,'ema');assert.equal(settled.away.ema.lesson.owner,'ema');assert.equal(settled.away.ema.log.hints,1);
 assert.equal(settleOwners(settled,(id)=>hist[id]??[]),settled,'settled once, left alone after');
 const back=reduce(settled,{type:'learner.set',id:'ema'});
 assert.equal(back.pages[0].id,PAGE_EMA.id);assert.equal(maths().continueCard(back).go,'page');
 // a homework line written before the page was snapped is not its read
 const early=settleOwners({...saved,pages:[{...PAGE_EMA,id:'maths-200',owner:undefined}]},(id)=>hist[id]??[]);
 assert.equal(early.pages[0].owner,'tom');
});

test('case 11 (S82): a result that lands after its learner left goes to their work, never onto the seated learner\'s',()=>{
 const {reduce}=store();
 const s=emaEvening({practice:{...unmarked(),owner:'ema'},pages:[{...PAGE_EMA,items:[]}],screen:'practice'});
 const tom=reduce(s,{type:'learner.set',id:'tom'});
 const items=Q.map((question,ix)=>({n:ix+1,question,studentAnswer:'1',verdict:'right'}));
 let x=reduce(tom,{type:'practice.marked',items,owner:'ema'});
 assert.equal(x.screen,'landing','Tom\'s screen does not jump to Ema\'s sheet');assert.equal(x.practice,null);assert.equal(x.away.ema.practice.marked,true);
 x=reduce(x,{type:'page.read',id:PAGE_EMA.id,items:PAGE_EMA.items,readMs:1,provider:'t'});
 assert.deepEqual(x.pages,[]);assert.equal(x.away.ema.pages[0].items.length,1,'her page is read where it waits');
 x=reduce(x,{type:'hint.set',hint:{...HINT_EMA,key:'k1'}});
 assert.equal(x.hint,null,'Ema\'s late hint is not on Tom\'s screen');assert.notEqual(x.screen,'hint');assert.equal(x.log.hints,0);assert.equal(x.away.ema.log.hints,2);
 x=reduce(x,{type:'lesson.set',lesson:{id:'L1',title:'Two-step',t:0,text:'',why:''},key:'k1'});
 assert.equal(x.lesson,null);assert.equal(x.away.ema.lesson.id,'L1');assert.equal(x.away.ema.lesson.owner,'ema');
 const ema=reduce(x,{type:'learner.set',id:'ema'});
 assert.equal(ema.practice.marked,true);assert.equal(ema.pages[0].items.length,1);assert.equal(ema.hint.key,'k1');assert.equal(ema.lesson.id,'L1');
});

test('case 12 (S82): no screen is sent the away learners\' work',()=>{
 const {reduce}=store(),{view}=require(path.join(root,'src/lib/session/pairing.ts'));
 const tom=reduce(emaEvening(),{type:'learner.set',id:'tom'});
 assert.ok(tom.away.ema);
 for(const role of ['tv','phone','guest'])assert.equal('away' in view(tom,role),false,role);
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
 const out=transpile(fs.readFileSync(path.join(root,'src/tv/sheetRows.ts'),'utf8'),opts).outputText;
 assert.doesNotMatch(out,/require\([^)]*lib\/session\/(store|learners)/);
});

test('extra: a located slip (slipAt) rides only on a wrong item, as a line, a span and a kind - junk never reaches a screen',()=>{
 const {reduce}=store();
 const s=session({screen:'practice',practice:unmarked()});
 const items=marked(['wrong','right','wrong','unsure','wrong','wrong']).items.map((it,ix)=>({...it,slipAt:[{line:1,span:'- 7',kind:'sign',answer:'x = 6'},{line:0,kind:'sign'},{line:-1,kind:'sign'},{line:2},{line:1.5},{line:0,span:'  ',kind:'bogus'}][ix]}));
 const n=reduce(s,{type:'practice.marked',items}).practice.items;
 assert.deepEqual(n[0].slipAt,{line:1,span:'- 7',kind:'sign'},'only line, span and kind are kept');
 assert.equal(n[1].slipAt,undefined,'a right item carries no slip position');
 assert.equal(n[2].slipAt,undefined,'a negative line is dropped');
 assert.equal(n[3].slipAt,undefined,'an unsure item carries no slip position');
 assert.equal(n[4].slipAt,undefined,'a line that is not a whole number is dropped');
 assert.deepEqual(n[5].slipAt,{line:0},'an empty span and an unknown kind are dropped, the line stays');
});

test('extra: a located slip keeps which occurrence of its span it means only as a whole number from 0 - junk is dropped, the rest stays',()=>{
 const {reduce}=store();
 const s=session({screen:'practice',practice:unmarked()});
 const span={span:'- 1',kind:'sign'};
 const items=marked(['wrong','wrong','wrong','wrong','wrong','wrong']).items.map((it,ix)=>({...it,slipAt:[{line:0,...span,nth:1},{line:0,...span,nth:0},{line:0,...span,nth:-1},{line:0,...span,nth:1.5},{line:0,...span,nth:'1'},{line:0,...span}][ix]}));
 const n=reduce(s,{type:'practice.marked',items}).practice.items;
 assert.deepEqual(n[0].slipAt,{line:0,span:'- 1',kind:'sign',nth:1},'a later occurrence is kept');
 assert.deepEqual(n[1].slipAt,{line:0,span:'- 1',kind:'sign',nth:0},'the first occurrence is kept');
 for(const k of [2,3,4])assert.deepEqual(n[k].slipAt,{line:0,span:'- 1',kind:'sign'},`nth ${JSON.stringify(items[k].slipAt.nth)} is dropped, the place stays`);
 assert.deepEqual(n[5].slipAt,{line:0,span:'- 1',kind:'sign'},'an old slipAt without nth is unchanged');
 // a wrong settle carries it too
 const u=session({screen:'practice',practice:{...marked(['unsure','right','right','right','right','right']),marked:true}});
 const v=reduce(u,{type:'practice.settle',n:1,reply:'I see.',verdict:'wrong',slipAt:{line:0,...span,nth:2}}).practice.items[0];
 assert.deepEqual(v.slipAt,{line:0,span:'- 1',kind:'sign',nth:2});
});

// ---- challenge-2026-10-05 math-buddy-B: the second go. A ringed item that holds on a typed second go wears a tick; the record is the first attempt.
const withSecond=(verdicts,seconds)=>{const p=marked(verdicts);p.items=p.items.map((it,ix)=>seconds[ix]?{...it,second:seconds[ix]}:it);return p;};

test('case 2 (second go): practice.second sets second once and touches nothing else; a right item or an unknown n changes nothing; shown() drops junk',()=>{
 const {reduce}=store();
 const s=session({screen:'walk',focus:0,walkIx:1,topic:'linear-one-step',practice:marked(['right','wrong','right','wrong','right','right'])});
 const was=s.practice.items[1];
 const n=reduce(s,{type:'practice.second',n:2,verdict:'right'});
 const it=n.practice.items[1];
 assert.equal(it.second,'right');assert.equal(it.verdict,'wrong');
 for(const k of ['slip','said','slipAt','studentAnswer','studentWorking','reply'])assert.equal(it[k],was[k],`${k} is as marking left it`);
 assert.equal(n.screen,'walk');assert.equal(n.focus,0);assert.equal(n.walkIx,1);
 assert.deepEqual(n.practice.items.filter((x)=>x.n!==2),s.practice.items.filter((x)=>x.n!==2),'every other item is untouched');
 // one go: a replay with the other verdict leaves the first
 assert.equal(reduce(n,{type:'practice.second',n:2,verdict:'wrong'}).practice.items[1].second,'right');
 assert.equal(reduce(reduce(s,{type:'practice.second',n:2,verdict:'wrong'}),{type:'practice.second',n:2,verdict:'right'}).practice.items[1].second,'wrong');
 // a right item and an unknown n are not the event's to change
 assert.deepEqual(reduce(s,{type:'practice.second',n:1,verdict:'right'}).practice.items,s.practice.items);
 assert.deepEqual(reduce(s,{type:'practice.second',n:9,verdict:'right'}).practice.items,s.practice.items);
 assert.equal(reduce(session({practice:null}),{type:'practice.second',n:2,verdict:'right'}).practice,null);
 // a hand-edited session.json: a second that is neither 'right' nor 'wrong' never reaches a screen
 const edited=marked(['right','wrong','wrong','wrong','right','right']);
 edited.items[1].second='right';edited.items[2].second='maybe';edited.items[3].second=true;edited.items[0].second='right';
 const m=reduce(session({screen:'practice',practice:unmarked()}),{type:'practice.marked',items:edited.items}).practice.items;
 assert.equal(m[1].second,'right');assert.equal(m[2].second,undefined);assert.equal(m[3].second,undefined);
 assert.equal(m[0].second,undefined,'a right item never carries one');
});

test('case 6 (second go): sheetTiles carries second; firstToLook and lookCount skip a fixed item; the head counts it out',()=>{
 const {sheetTiles,firstToLook,lookCount}=rows(),{sheetHead}=maths();
 const p=withSecond(['right','wrong','wrong','right','right','right'],[null,'right',null]);
 const tiles=sheetTiles(p);
 assert.deepEqual(tiles[1],{n:2,verdict:'wrong',slip:'sign-lost-moving',second:'right'});
 assert.deepEqual(tiles[2],{n:3,verdict:'wrong',slip:'sign-lost-moving'},'a tile with no second go carries no second key');
 assert.equal(firstToLook(p.items),2,'the fixed item is skipped, the next ringed one is first');
 assert.equal(firstToLook(withSecond(['right','wrong','wrong','right','right','right'],[null,'right']).items.map((it)=>it)),2);
 assert.equal(firstToLook(withSecond(['right','wrong','right','right','right','right'],[null,'right']).items),6,'every item right or fixed: the Six more stop');
 assert.equal(firstToLook(withSecond(['right','wrong','right','right','right','right'],[null,'wrong']).items),1,'a second go that missed is still to look at');
 assert.equal(firstToLook(marked(['right','right','right','right','right','right']).items),6);
 const two=withSecond(['wrong','wrong','right','right','right','right'],[]);
 assert.equal(lookCount(two.items),2);assert.equal(sheetHead(lookCount(two.items),6),'Two to look at');
 const one=withSecond(['wrong','wrong','right','right','right','right'],['right']);
 assert.equal(lookCount(one.items),1);assert.equal(sheetHead(lookCount(one.items),6),'One to look at');
 assert.equal(lookCount(withSecond(['wrong','right','right','right','right','right'],['wrong']).items),1,'a missed go still counts');
 assert.equal(lookCount(marked(['right','unsure','wrong',undefined,'right','right']).items),3,'unsure and unmarked count as before');
 // the marked set lands, and the key for Up from the actions, on the first unfixed item
 const {tvKey}=keys();
 const sheet=session({screen:'sheet',focus:6,practice:p});
 assert.deepEqual(tvKey(sheet,'up',LOCAL).events,[{type:'focus',focus:2}],'Up from the actions lands on the next unfixed item');
 const card=maths().continueCard(session({screen:'tonight',topic:'linear-one-step',practice:withSecond(['right','wrong','right','wrong','right','right'],[null,'right'])}));
 assert.equal(card.focus,3,"Tonight's Enter goes to the first item still to look at");
});

test('GUARD case 8 (second go): with item 2 fixed, Tonight\'s Marked hero still reads the first attempt',()=>{
 const {continueCard}=maths();
 const p=withSecond(['right','wrong','right','wrong','right','right'],[null,'right']);
 const card=continueCard(session({screen:'tonight',topic:'linear-one-step',practice:p}));
 assert.match(card.d,/4 of 6 right/,'the same count a first-attempt reading gives');
});

test('M3a: the parts of a word problem are tiles and stops like any item - one per part, no stem and no part line on a tile; the store keeps the parts',()=>{
 const {sheetTiles,sheetStops,firstToLook}=rows();
 const W=require(path.join(root,'src/lib/rules/calc-word.ts'));
 const w=W.drawWord('sphere-rates',3);
 const items=[{n:1,question:"Find f'(2) for f(x) = x^3.",spec:{shape:'derivative-at',f:'x^3',at:2},verdict:'right'},...W.wordItems(w,2).map((it,i)=>({...it,verdict:i?'wrong':'right'}))];
 const p={topic:w.topic,marked:true,items};
 assert.deepEqual(sheetTiles(p),[{n:1,verdict:'right'},{n:2,verdict:'right'},{n:3,verdict:'wrong'}]);
 const flat=JSON.stringify(sheetTiles(p));assert.ok(!flat.includes(w.stem)&&!w.parts.some((x)=>flat.includes(x.line)),'no stem and no part line on a tile');
 assert.deepEqual(sheetStops(p),['item0','item1','item2','more','away'],'a part is a stop of its own');
 assert.equal(firstToLook(items),2,'part (b) is the first to look at');
 // the real reducer lands the marked set with its parts, and every view keeps the stem and the letters
 const s=after_(session({practice:{...p,marked:false,items:items.map(({verdict,...x})=>x)}}),[{type:'practice.marked',items}]);
 assert.deepEqual(s.practice.items.map((i)=>[i.part??null,i.stem===w.stem]),[[null,false],['a',true],['b',true]]);
 assert.equal(s.screen,'sheet');
});
