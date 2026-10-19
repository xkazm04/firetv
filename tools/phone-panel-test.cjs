/**
 * The phone follows the TV's hand-off (TL-9). The session's `ask` names what the TV wants of the phone; the phone
 * moves to that ask's panel when a NEW ask id arrives - on the same TV screen too - and never on a same-ask update, so
 * a tab the learner picked stays picked. Busy hands defer the move without spending it; a Parent phone is told by a
 * banner, not moved; a reopened stream goes to the open ask.
 *
 * The rule is DERIVED from the sources, not listed: every AskKind of the store has exactly one panel, and a TV screen
 * whose (comment-stripped) copy asks for the phone opens an ask (its KEYMAP entry in tv/keys.ts holds an ask.open)
 * unless it is on the named legacy ledger below, where a later slice (TL-13) still owes it.
 *
 * Pure: panelFor/follow from desk/src/app/phone/panelFor.ts over plain session objects. Run with npm test in
 * desk/ (directly: node tools/phone-panel-test.cjs). No store, no route, no model.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
const ts=require('./ts-load.cjs').ts();
const SRC=path.join(root,'src');
const PANEL=path.join(SRC,'app/phone/panelFor.ts'),PAGE=path.join(SRC,'app/phone/page.tsx');
// loaded per test, so a missing module fails each case on its own
const P=()=>require(PANEL);
const {lingaOwns}=require(path.join(SRC,'tv/keys.ts'));
/** A source with its comments removed: TypeScript's own parser and printer, so JSX copy and strings are kept whole. */
const code=(file)=>{const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);return ts.createPrinter({removeComments:true}).printFile(sf);};

// ---------------------------------------------------------------- the TV source: which screens ask for the phone

/** Every screen id the session knows (the union type in the store). */
const SCREENS=(()=>{const m=code(path.join(SRC,'lib/session/store.ts')).match(/export type Screen =([^;]+);/);return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);})();

/** Copy that asks the learner for a phone action, or Linga's on-your-phone badge. */
const ASK=/\b(snap|type|paste|dictate|say|tell|answer|circle|scan|rewrite|send|open)\b[^\n]{0,160}?\b(on|with|from) (the|your|my) phone\b|\bphone's \w+ tab\b|<OnYourPhone\b/i;

/** A file's top-level declarations: name -> its text (up to the next top-level declaration). */
function chunks(text){
 const out=new Map();const re=/^(?:export\s+)?(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+)|let\s+(\w+))/gm;const at=[];let m;
 while((m=re.exec(text)))at.push({name:m[1]??m[2]??m[3],i:m.index});
 at.forEach((a,k)=>out.set(a.name,text.slice(a.i,k+1<at.length?at[k+1].i:text.length)));
 return out;
}
/** The file an identifier used in `file` comes from: this file, a named import, or a namespace import. */
function fileOf(file,text,ns,name){
 const abs=(spec)=>{const base=spec.startsWith('@/')?path.join(SRC,spec.slice(2)):path.resolve(path.dirname(file),spec);for(const e of ['.tsx','.ts'])if(fs.existsSync(base+e))return base+e;return base;};
 if(ns){const m=text.match(new RegExp(`import \\* as ${ns} from "([^"]+)"`));return m?abs(m[1]):null;}
 if(chunks(text).has(name))return file;
 for(const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*"([^"]+)"/g))if(m[1].split(',').map(x=>x.trim().split(/\s+as\s+/).pop()).includes(name))return abs(m[2]);
 return null;
}
/** Does this component, or any top-level helper of its file it reaches, ask for the phone? */
function asks(file,name){
 const ch=chunks(code(file)),seen=new Set(),todo=[name];
 while(todo.length){const n=todo.pop();if(seen.has(n)||!ch.has(n))continue;seen.add(n);const body=ch.get(n);
  if(ASK.test(body))return true;
  // a use in code - an element, a call, an index, a member, a value - not the same word in on-screen copy
  for(const other of ch.keys())if(!seen.has(other)&&new RegExp(`<${other}\\b|\\b${other}\\s*[(\\[]|\\b${other}\\.\\w|[{(,=:?]\\s*${other}\\b`).test(body))todo.push(other);}
 return false;
}
/** screen -> the components that draw it, read from the TV's dispatchers. */
function drawers(){
 const map=new Map();const add=(sc,file,name)=>{if(!map.has(sc))map.set(sc,[]);map.get(sc).push({file,name});};
 for(const rel of ['app/tv/page.tsx','maths/MathsTV.tsx','essay/EssayTV.tsx']){
  const file=path.join(SRC,rel),text=code(file);
  for(const m of text.matchAll(/(?:case "([\w-]+)":\s*return|s\.screen === "([\w-]+)"\s*\?)\s*<(?:(\w+)\.)?(\w+)/g)){
   const sc=m[1]??m[2],f=fileOf(file,text,m[3],m[4]);assert.ok(f,`${rel}: cannot find where ${m[4]} (for ${sc}) comes from`);add(sc,f,m[4]);
  }
 }
 // the landing's words are its view-model's (landing/model.ts), drawn by whichever theme is on: the pairing ask lives there
 add('landing',path.join(SRC,'landing/model.ts'),'landingView');
 // Linga draws every screen lingaOwns gives it (app/tv/page.tsx: lingaOwns(s) ? <LingaTV ...>)
 assert.match(code(path.join(SRC,'app/tv/page.tsx')),/lingaOwns\(s\)\s*\?\s*<LingaTV\b/,'the TV still hands Linga\'s screens to LingaTV');
 for(const sc of SCREENS)if(lingaOwns({screen:sc,subject:'maths'}))add(sc,path.join(SRC,'english/LingaTV.tsx'),'LingaTV');
 return map;
}
/** The derived hand-off screens: a screen at least one of whose drawers asks for the phone. */
const HANDOFF_SCREENS=(()=>{const d=drawers();return SCREENS.filter(sc=>(d.get(sc)??[]).some(x=>asks(x.file,x.name)));})();
/** Every AskKind, read from the store's union type. */
const ASK_KINDS=(()=>{const m=code(path.join(SRC,'lib/session/store.ts')).match(/export type AskKind =([^;]+);/);return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);})();
/** The screens whose KEYMAP entry in the TV's keys opens an ask: an entry is `    name: ` at four spaces (the printer's indent), up to the next one. */
const OPENS_ASK=(()=>{const src=code(path.join(SRC,'tv/keys.ts')),at=src.indexOf('const KEYMAP');const body=src.slice(at,src.indexOf('\n};',at));
 const heads=[...body.matchAll(/^    ([a-z-]+): /gm)];return heads.filter((h,i)=>body.slice(h.index,i+1<heads.length?heads[i+1].index:body.length).includes('"ask.open"')).map(h=>h[1]);})();
// Linga's keys are LingaTV's own (keys.ts returns an empty step under it): its screens open asks when LingaTV posts an ask.open (TL-12)
if(/type:\s*"ask\.open"/.test(code(path.join(SRC,'english/LingaTV.tsx'))))OPENS_ASK.push(...SCREENS.filter(sc=>lingaOwns({screen:sc,subject:'maths'})));
/**
 * The screens whose copy says "on the phone" and that still open no ask, each with the slice that owes it. An entry
 * leaves this ledger in that slice; one that opens an ask by then must not stay.
 */
const LEGACY={landing:'pairing: the code is typed on the phone, no ask',pair:'pairing: the code is typed on the phone, no ask',sheet:'the sheet card points at the walk, whose Tell the desk how and Type my second go stops open explain and second (TL-6); the copy is MathsTV, not this slice'};

// ---------------------------------------------------------------- sessions

const page={id:'p1',subject:'maths',title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10],cy:5}]};
const set=(marked)=>({topic:'linear-equations',marked,items:[{n:1,question:'x + 1 = 2',verdict:marked?'unsure':undefined}]});
function session(patch={}){
 return {joined:true,subject:'maths',screen:'units',awaiting:null,pages:[],pageIx:0,practice:null,jobs:{},conversation:null,draft:null,essayType:null,
  timer:{running:false,left:1500,phase:'work'},...patch};
}
/** The TV's open hand-off, as the session holds it. */
const askOf=(kind,detail,id='a1',phase='open')=>({id,kind,learner:null,screen:'tonight',at:0,phase,...(detail?{detail}:{})});
/** The phone: where it is and whether the learner's hands are on it (typing, a shot held, recording). */
const at=(panel='tonight',patch={})=>({panel,role:'student',busy:false,...patch});

/**
 * For each derived hand-off screen: the state in which the TV makes the ask, and the phone panel that does it.
 * `from` is the session the TV comes from and the panel the learner had picked there.
 */
const JOINED_FROM={s:session({screen:'units'}),panel:'tonight'};
const LINGA={s:session({screen:'linga-talk',subject:'english',ask:askOf('reply')}),panel:'linga'};
const FIXTURES={
 landing:{s:session({joined:false,screen:'landing'}),panel:'join',from:JOINED_FROM,why:'Open the address on your phone (the session ended: back to the code)'},
 pair:{s:session({joined:false,screen:'pair'}),panel:'join',from:JOINED_FROM,why:'Scan, or open ... on your phone and type the code'},
 profile:{s:session({screen:'profile',draft:{id:'new',name:''},ask:askOf('name')}),panel:'profile',why:"Type the name on the phone's Profile tab"},
 tonight:{s:session({screen:'tonight',awaiting:'maths',ask:askOf('page',{subject:'maths'})}),panel:'capture',why:'Waiting for the Math Buddy page. Snap it on the phone'},
 practice:{s:session({screen:'practice',practice:set(false),ask:askOf('sheet')}),panel:'practice',why:'snap the whole sheet with the phone'},
 sheet:{s:session({screen:'sheet',practice:set(true),ask:askOf('explain',{walkIx:0})}),panel:'practice',why:'Tell the desk on the phone how you got there'},
 walk:{s:session({screen:'walk',practice:set(true),ask:askOf('second',{walkIx:0})}),panel:'practice',why:'Type the second go on the phone'},
 page:{s:session({screen:'page',pages:[page],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'p1',error:'x',startedAt:0}}}),panel:'capture',why:'The desk could not read this page. Open Try again on the phone'},
 essaytype:{s:session({screen:'essaytype',subject:'essay',ask:askOf('paragraph')}),panel:'paste',why:'Paste, type or dictate one paragraph on the phone'},
 sentence:{s:session({screen:'sentence',subject:'english',english:null,ask:askOf('sentence')}),panel:'say',why:'Say one sentence on your phone (nothing checked yet)'},
 forensic:{s:session({screen:'forensic',subject:'essay',ask:askOf('rewrite',{n:1})}),panel:'paste',why:'Rewrite on my phone'},
 paper:{s:session({screen:'paper',ask:askOf('paper')}),panel:'paper',why:'Type the marks of a paper you sat on the phone'},
 essayplan:{s:session({screen:'essayplan',subject:'essay',ask:askOf('slot',{i:0})}),panel:'paste',why:'Say it on the phone: the plan slot is sent from the Essay tab'},
};
// Linga follows its three asks (TL-12): the learner's line, the words, the preferences; the screen alone asks nothing
FIXTURES['linga-talk']={s:session({screen:'linga-talk',subject:'english',ask:askOf('reply')}),panel:'linga',why:'Linga: answer on your phone (ask reply)'};
FIXTURES['linga-plan']={s:session({screen:'linga-plan',subject:'english',ask:askOf('words')}),panel:'linga',why:'Linga: type the words on your phone (ask words)'};
FIXTURES['linga']={s:session({screen:'linga',subject:'english',ask:askOf('prefs')}),panel:'linga',why:'Linga: set up on your phone (ask prefs)'};
/** Hand-offs the TV makes that no phone panel does: the phone stays, and the gap is named. */
const NO_PANEL={};// the lesson's "circle on the phone" ask left both TVs (shell 79ed1a38, Math Buddy 2026-10-13): lesson asks nothing of the phone and is covered by case 3

/** The phone after the TV moves from `from` to `to`: the panel it shows once both renders have run. */
function walk(from,to){
 const {follow}=P();
 const a=follow(undefined,from.s,at(from.panel));const p1=a.to??from.panel;
 const b=follow(a.key,to,at(p1));return b.to??p1;
}
const ROWS=()=>Object.entries(FIXTURES);

// ---------------------------------------------------------------- cases

test('case 1 (TL-9, replaces the old case 1 "the hand-off screens are derived from the TV source, and every one is decided"): every AskKind has exactly one panel',()=>{
 const {ASK_PANEL,panelFor}=P();
 console.log(`# ask kinds (${ASK_KINDS.length}): ${ASK_KINDS.join(', ')}`);
 assert.ok(ASK_KINDS.length>=16,'the scan finds the store ask kinds');
 assert.deepEqual(Object.keys(ASK_PANEL).sort(),[...ASK_KINDS].sort(),'one entry per kind: none missing, none extra');
 const PANELS=['join','joined','capture','practice','point','say','paste','tonight','parent','profile','linga','paper'];
 for(const k of ASK_KINDS){
  assert.ok(PANELS.includes(ASK_PANEL[k]),`${k} has a panel the phone draws`);
  assert.equal(panelFor(session({screen:'units',ask:askOf(k)})),ASK_PANEL[k],`${k}: whatever the TV screen, the ask picks the panel`);
 }
});

test('case 2: every hand-off screen maps to the panel that does what it asks',()=>{
 const {panelFor}=P();
 for(const [sc,f] of Object.entries(FIXTURES))assert.equal(panelFor(f.s),f.panel,`${sc}: ${f.why}`);
 for(const sc of Object.keys(NO_PANEL))assert.equal(panelFor(session({screen:sc,lessonPaused:true})),'stay',`${sc}: ${NO_PANEL[sc]}`);
 assert.equal(panelFor(session({screen:'tonight',subject:'english'})),'stay','Linga\'s Tonight asks nothing of the phone without an ask (TL-12)');
});

test('case 3 (TL-9, replaces the old case 3 "a screen that asks nothing of the phone maps to stay"): no TV copy says "on the phone" on a screen that opens no ask, but the named legacy ones',()=>{
 const {panelFor}=P();
 console.log(`# screens that open an ask (${OPENS_ASK.length}): ${OPENS_ASK.join(', ')}`);
 assert.ok(OPENS_ASK.length>=8,'the scan finds the keys that open asks');
 const noAsk=HANDOFF_SCREENS.filter(sc=>!OPENS_ASK.includes(sc));
 assert.deepEqual(noAsk.filter(sc=>!(sc in LEGACY)),[],'a screen whose copy asks for the phone must open an ask (or be named on the ledger with its slice)');
 assert.deepEqual(Object.keys(LEGACY).filter(sc=>!noAsk.includes(sc)),[],'a ledger entry whose screen now opens an ask, or no longer asks, leaves the ledger');
 // with no ask open, a screen outside the ledger asks nothing of the phone, whatever the TV is showing
 for(const sc of SCREENS.filter(x=>!(x in LEGACY)))assert.equal(panelFor(session({screen:sc})),'stay',sc);
 assert.equal(panelFor(session({screen:'tonight',awaiting:'maths'})),'stay','a status that names the phone is a caption, not the signal');
 assert.equal(panelFor(session({screen:'page',pages:[page]})),'stay','a page that read is the TV to show');
 assert.equal(panelFor(session({screen:'pair'})),'stay','a joined phone is not sent back to the code');
 assert.equal(panelFor(session({screen:'joined'})),'stay','the Joined screen asks nothing of the phone');
 assert.equal(panelFor(session({screen:'forensic',ask:askOf('rewrite',{n:2},'a2','sent')})),'stay','a sent ask is the desk to finish: the phone is not moved');
});

test('case 4: the phone follows every hand-off - N of N',()=>{
 let n=0;const miss=[];const rows=ROWS();
 for(const [sc,f] of rows){
  let got;try{got=walk(f.from??JOINED_FROM,f.s);}catch(e){got=`throws ${e.message}`;}
  if(got===f.panel)n++;else miss.push(`${sc} -> ${f.panel} (phone on ${got})`);
 }
 console.log(`# hand-offs followed: ${n}/${rows.length}`);
 assert.equal(n,rows.length,`not followed:\n${miss.join('\n')}`);
});

test('case 5 GUARD: a tab the learner picks survives every same-ask update',()=>{
 const {follow}=P();
 for(const [sc,f] of Object.entries(FIXTURES)){
  const k=follow(undefined,(f.from??JOINED_FROM).s,at((f.from??JOINED_FROM).panel)).key;
  const s1=follow(k,f.s,at('tonight'));
  const mine=f.s.joined?'point':'profile';
  // the learner walks away to a tab of their own; the TV ticks, the screen stays
  const tick={...f.s,timer:{running:true,left:1499,phase:'work'}};
  assert.equal(follow(s1.key,tick,at(mine)).to,null,`${sc}: a same-screen update leaves ${mine} alone`);
  assert.equal(follow(s1.key,{...tick,timer:{running:true,left:1498,phase:'work'}},at(mine)).to,null,`${sc}: and again`);
 }
 // Linga moving inside itself is not a new hand-off: Say it, opened from Linga, stays open
 const k=follow(undefined,LINGA.s,at('linga')).key;
 assert.equal(follow(k,session({screen:'linga-coach',subject:'english'}),at('say')).to,null,'linga-talk -> linga-coach leaves Say it alone');
 // the same ask carried from the sheet to the walk is one hand-off: it does not pull the learner back
 const k2=follow(undefined,FIXTURES.sheet.s,at('practice')).key;
 assert.equal(follow(k2,{...FIXTURES.walk.s,ask:FIXTURES.sheet.s.ask},at('tonight')).to,null,'the same ask on another screen leaves the learner where they went');
 // a non-hand-off screen change moves nothing
 assert.equal(follow(undefined,session({screen:'units'}),at('say')).to,null,'units asks nothing');
 assert.equal(follow(null,session({screen:'calendar'}),at('say')).to,null,'calendar asks nothing');
});

test('case 6: the hand-off follows a CHANGE - leave it, come back, and it is followed again',()=>{
 const {follow}=P();
 let k=follow(undefined,session({screen:'units'}),at('tonight')).key;
 const a=follow(k,FIXTURES.essaytype.s,at('tonight'));assert.equal(a.to,'paste');
 const b=follow(a.key,session({screen:'units'}),at('tonight'));assert.equal(b.to,null);
 assert.equal(follow(b.key,FIXTURES.essaytype.s,at('tonight')).to,'paste','back into Essay Master: the phone follows again');
 // the TV starts waiting for a page on the same Tonight: a new ask
 k=follow(undefined,session({screen:'tonight'}),at('tonight')).key;
 assert.equal(follow(k,FIXTURES.tonight.s,at('tonight')).to,'capture','I have homework: the phone opens the camera');
});

test('case 7 GUARD (TL-9, re-pinned: the old row said the hand-off is spent): typing, a shot held unsent or a recording is never taken away - the move is deferred, not spent',()=>{
 const {follow}=P();
 const k=follow(undefined,session({screen:'units'}),at('say')).key;
 const s1=follow(k,FIXTURES.essaytype.s,at('say',{busy:true}));
 assert.equal(s1.to,null,'busy on Say it: the phone stays');
 assert.equal(s1.key,k,'and the ask is not spent');
 assert.equal(follow(s1.key,FIXTURES.essaytype.s,at('say',{busy:true})).to,null,'still busy: still not moved');
 assert.equal(follow(s1.key,FIXTURES.essaytype.s,at('say')).to,'paste','hands free, same ask: the phone moves as soon as it can');
 // the deferred ask closed before the hands were free: nothing to move to
 assert.equal(follow(s1.key,session({screen:'essaytype',subject:'essay'}),at('say')).to,null,'the ask closed while the hands were busy: no move');
 // busy hands on the very panel the ask wants lose nothing: the ask is simply taken
 const same=follow(k,FIXTURES.essaytype.s,at('paste',{busy:true}));
 assert.equal(same.to,null);assert.equal(same.key,'ask:a1','an ask for the panel the hands are on is spent at once');
});

test('case 8 (TL-9, re-pinned: the old row only asserted no move): the Parent role is never moved and gets the banner; arrival never opens the camera unasked',()=>{
 const {follow,BANNER}=P();
 const k=follow(undefined,session({screen:'units'}),at('parent',{role:'parent'})).key;
 for(const [sc,f] of Object.entries(FIXTURES))if(f.s.joined){
  const st=follow(k,f.s,at('parent',{role:'parent'}));
  assert.equal(st.to,null,sc);
  assert.equal(st.banner,f.panel,`${sc}: the Parent phone is told which panel the TV wants`);
  assert.ok(BANNER[st.banner].length>8,`${sc}: and the banner has words`);
  assert.equal(st.key,k,`${sc}: the ask is not spent on a phone that was not moved`);
 }
 assert.equal(follow(k,FIXTURES.essaytype.s,at('paste',{role:'parent'})).banner,null,'a Parent phone already on the panel needs no banner');
 assert.equal(follow(k,session({screen:'units'}),at('parent',{role:'parent'})).banner,null,'no ask, no banner');
 assert.equal(follow(undefined,FIXTURES.tonight.s,at('join')).to,'joined','a join while the TV waits for a page: the confirmation, whose one button is Snap');
 assert.equal(follow(undefined,FIXTURES.practice.s,at('join')).to,'joined');
 assert.equal(follow(undefined,FIXTURES.essaytype.s,at('join')).to,'paste','a join during Essay Master goes to the paragraph');
 assert.equal(follow(undefined,LINGA.s,at('join')).to,'linga','a join during Linga goes to Linga, as before');
 assert.equal(follow(undefined,session({screen:'units'}),at('join',{busy:true})).to,'joined','the code typed on the join panel is done once joined');
 // a join mid-session leaves the TV where it was (store.ts join): the phone still arrives somewhere useful, never on the empty join panel
 assert.equal(follow(undefined,session({screen:'page'}),at('join')).to,'joined','a join while the TV is on a page: the confirmation, which names the TV screen');
 assert.equal(follow(undefined,session({screen:'recap'}),at('join',{role:'parent'})).to,'joined','a parent joining at the recap lands on the confirmation too');
 assert.equal(follow(undefined,session({joined:false,screen:'landing'}),at('profile')).to,null,'an unjoined phone may name a learner');
});

test('case 8b (TL-9): a new ask id moves a Student phone on the same TV screen; a reopened stream goes to the open ask',()=>{
 const {follow}=P();
 const first=session({screen:'forensic',subject:'essay',ask:askOf('rewrite',{n:1},'r1')});
 const a=follow(undefined,first,at('tonight'));assert.equal(a.to,'paste');
 // the learner opens another tab; the same ask, ticking on: left alone
 assert.equal(follow(a.key,{...first,timer:{running:true,left:1,phase:'work'}},at('point')).to,null);
 // Back closes the ask; Rewrite again is a NEW id on the SAME screen: the phone goes there again
 const closed=follow(a.key,session({screen:'forensic',subject:'essay'}),at('point'));assert.equal(closed.to,null);
 const second=follow(closed.key,{...first,ask:askOf('rewrite',{n:1},'r2')},at('point'));
 assert.equal(second.to,'paste','the second ask on the same screen moves the phone');
 // and replaced without a close in between
 assert.equal(follow(a.key,{...first,ask:askOf('rewrite',{n:2},'r3')},at('point')).to,'paste','an ask replaced by another id moves it');
 // a reopened stream: the page forgets what it saw, and goes to the open ask wherever it is
 assert.equal(follow(undefined,first,at('point')).to,'paste','after a reopen the phone goes to the open ask');
 // a different kind of ask is the other panel, on the same screen
 assert.equal(follow(a.key,{...first,ask:askOf('private',{n:1},'p1')},at('point')).to,'paste');
 assert.equal(follow(a.key,{...first,ask:askOf('question',{n:1},'q1')},at('paste')).to,'point');
});

test('case 9: the phone page follows through panelFor, with no screen switch of its own',()=>{
 const src=code(PAGE);
 assert.match(src,/from "\.\/panelFor"/,'page.tsx imports the follow rule');
 assert.match(src,/\bfollow\(/,'page.tsx calls follow');
 assert.doesNotMatch(src,/startsWith\("linga"\)[^\n]*setScreen\("linga"\)/,'the Linga-only switch is gone');
 assert.doesNotMatch(src,/type PScreen =/,'one PScreen, in panelFor.ts');
});

test('case 10 (W3): an essay is never snapped - a wait for an essay page, or an essay page that would not read, sends the phone to the Essay panel',()=>{
 const {panelFor,follow}=P();
 // the maths versions keep going to the camera
 assert.equal(panelFor(session({screen:'tonight',awaiting:'maths',ask:askOf('page',{subject:'maths'})})),'capture');
 assert.equal(panelFor(session({screen:'tonight',awaiting:'english',ask:askOf('page',{subject:'english'})})),'capture');
 // an essay wait is the paragraph ask: the Essay panel, from a phone that has joined, and from one on another tab
 const waiting=session({screen:'tonight',subject:'essay',awaiting:'essay',ask:askOf('paragraph')});
 assert.equal(panelFor(waiting),'paste','the TV asking for an essay: Essay panel, not Capture');
 assert.equal(panelFor({...waiting,ask:null}),'stay','the awaiting status alone asks nothing (TL-9: the ask is the signal)');
 assert.equal(walk(JOINED_FROM,waiting),'paste');
 assert.equal(follow(undefined,waiting,at('join')).to,'paste','a join while the TV asks for an essay lands on the Essay panel (no camera to open)');
 // an essay page whose read failed (a page from before this change) is not asked for again by camera
 const epage={...page,id:'e1',subject:'essay'};
 const unread=session({screen:'page',subject:'essay',pages:[epage],jobs:{read:{id:'j2',kind:'read',phase:'failed',key:'e1',error:'x',startedAt:0}}});
 assert.equal(panelFor(unread),'paste','an unread essay page: Essay panel, not Capture');
 assert.equal(panelFor(session({screen:'page',pages:[page],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'p1',error:'x',startedAt:0}}})),'capture','a maths page that would not read is still snapped again');
 // the phone page never offers Capture with an essay anywhere
 assert.ok(!['capture'].includes(panelFor(session({screen:'essaytype',subject:'essay'}))),'the lens home is the Essay panel');
});

test('case 11 (W3, re-pinned by TL-9: the subject list is gone, the ask names the module): the capture panel no longer offers Essay Master - no subject select, not among the samples',()=>{
 const src=code(PAGE);
 const capture=src.slice(src.indexOf('{screen === "capture" && ('),src.indexOf('{screen === "practice" && s'));
 assert.doesNotMatch(capture,/<select|<option/,'the capture panel offers no subject select: the TV named the module');
 assert.match(capture,/data-role="capture-subject"/,'it draws the TV choice as a line');
 assert.match(src,/s\?\.ask\?\.kind === "page" && s\.ask\.detail\?\.subject \? s\.ask\.detail\.subject/,'the subject is read from the ask');
 const samples=src.slice(src.indexOf('const SAMPLES'),src.indexOf('];',src.indexOf('const SAMPLES')));
 assert.deepEqual([...samples.matchAll(/id: "(\w+)"/g)].map(m=>m[1]),['maths','english'],'no essay sample page');
 assert.doesNotMatch(capture,/Essay Master/);
 // Tonight's list still takes an essay assignment: a task to do, not a page to snap
 const add=src.slice(src.indexOf('function AddTask'));
 assert.match(add,/<option value="essay">Essay Master<\/option>/,'an essay assignment can still be added to tonight\'s list');
 // the Essay panel takes files and messages
 assert.match(src,/type="file" accept="\.txt,\.md,/,'the Essay panel has a file picker for .txt and .md');
 assert.match(src,/Paragraph \{pix \+ 1\} of \{paras\.length\}/,'and says which paragraph it is on');
});

test('case 12 (W6): a typed mark lands the phone where a photo mark lands it - the same Practice panel, the same hand-off key',()=>{
 const {panelFor,follow}=P();
 // the marked set is one hand-off whichever way it was handed in: the TV goes practice -> sheet either way
 const open=FIXTURES.practice,marked=FIXTURES.sheet;
 assert.equal(panelFor(open.s),'practice');assert.equal(panelFor(marked.s),'practice');
 assert.equal(walk({s:open.s,panel:'practice'},marked.s),'practice','the phone that typed (or snapped) stays on Practice, which now shows the count');
 assert.equal(walk({s:open.s,panel:'tonight'},marked.s),'practice','a phone on another tab is brought to Practice, as after a photo');
 // typing hands are never interrupted by the mark landing (the page lets go of the box on Send), and the phone is still on Practice
 const k=follow(undefined,open.s,at('practice')).key;
 const landed=follow(k,marked.s,at('practice',{busy:true}));
 assert.equal(landed.to,null,'busy hands: the phone stays put, already where a photo mark would send it');
 assert.equal(follow(landed.key,marked.s,at('practice')).to,null,'and is not moved later');
 // the camera is opened for the unmarked set only (a join lands on the confirmation), never for the marked one
 assert.equal(follow(undefined,open.s,at('join')).to,'joined');
 assert.equal(follow(undefined,marked.s,at('join')).to,'practice','a join after the mark goes to the count');
});

test('case 13 (W6): the phone Practice panel has two routes - snap the sheet, type the answers - and the typed one is a phone-sized form',()=>{
 const src=code(PAGE);
 const panel=src.slice(src.indexOf('{screen === "practice" && s'),src.indexOf('{screen === "point"'));
 // both routes are offered side by side, the snap route still working and first
 assert.match(panel,/Snap the sheet<\/button>/);assert.match(panel,/Type my answers<\/button>/);
 assert.ok(panel.indexOf('Snap the sheet</button>')<panel.indexOf('Type my answers</button>'),'the snap route is listed first');
 assert.match(panel,/Send my working/,'the photo route is unchanged');assert.match(panel,/sendWorking/);
 // one box per question, numbered, each with its plain question above it
 assert.match(panel,/pr\.items\.map\(\(it, i\) => <div className="pask"/,'one box per item');
 assert.match(panel,/<label htmlFor=\{`ans-\$\{it\.n\}`\}><b>\{it\.n\}\.<\/b> \{it\.question\}<\/label>/,'the item\'s plain question above its box, numbered');
 // a text box that does not correct, capitalise or complete what a child types
 for(const a of ['type="text"','inputMode="text"','autoComplete="off"','autoCorrect="off"','autoCapitalize="off"','spellCheck={false}','maxLength={TYPED_ANSWER_MAX}'])assert.ok(panel.includes(a),`the answer box has ${a}`);
 // Enter moves to the next box; the last one lets the keyboard go
 assert.match(panel,/e\.key !== "Enter"/);assert.match(panel,/boxes\.current\[i \+ 1\]\?\.focus\(\)/,'Enter goes to the next box');
 assert.match(panel,/enterKeyHint=\{i < n - 1 \? "next" : "done"\}/);assert.match(panel,/e\.currentTarget\.blur\(\)/,'and the last one closes the keyboard');
 // Send is disabled until a box has text; a blank box is sent as an empty string, one per question
 assert.match(panel,/Send my answers/);assert.match(panel,/disabled=\{!any \|\| busy\}/);assert.match(panel,/const n = pr\.items\.length, any = typed\.some\(\(t\) => t\.trim\(\)\)/);
 assert.match(src,/answers: Array\.from\(\{ length: n \}, \(_, i\) => typed\[i\] \?\? ""\)/,'every question is sent, a blank as ""');
 assert.match(src,/call\("\/api\/mark", \{ answers:/,'to the mark route, with no image');
 assert.match(src,/document\.activeElement\.blur\(\)/,'the box in hand is let go before sending, so the phone can follow the TV');
 // the camera is on for the snap route only
 assert.match(src,/camWanted = \(screen === "capture" && !readAgain\) \|\| \(screen === "practice" && !!s\?\.practice && !s\.practice\.marked && route === "snap"\)/);
 // the box's own cap is the rule's: the one number
 const rules=fs.readFileSync(path.join(SRC,'lib/rules/maths.ts'),'utf8');
 assert.match(rules,/export const TYPED_ANSWER_MAX = 120;/);assert.match(src,/TYPED_ANSWER_MAX/);
 // phone-sized: the tap targets are at least 44 px, and the size that stops a phone zooming into a field is 16 px
 const css=fs.readFileSync(path.join(SRC,'app/globals.css'),'utf8');
 const rule=(sel)=>{const m=css.match(new RegExp(`(?:^|\\n)${sel.replace(/[.\[\]"=]/g,'\\$&')} \\{([^}]*)\\}`));assert.ok(m,`${sel} is styled`);return m[1];};
 const px=(decl,prop)=>Number((decl.match(new RegExp(`${prop}: (\\d+)px`))||[])[1]);
 assert.ok(px(rule('.pask input'),'min-height')>=44,'the answer box is at least 44 px tall');
 assert.ok(px(rule('.proute button'),'min-height')>=44,'the route buttons are at least 44 px tall');
 assert.ok(px(rule('.pask input'),'font-size')>=16,'16 px or more, so a phone does not zoom in');
 assert.match(rule('.pask input'),/width: 100%/);assert.match(rule('.pask input'),/box-sizing: border-box/,'the box never runs past the phone\'s edge');
 assert.match(rule('.pask label'),/overflow-wrap: anywhere/,'a long question wraps');
 // copy: plain and short, and no dash of any kind in what the typed route says
 const typedPart=panel.slice(panel.indexOf('route === "type" ?'),panel.indexOf('Send my answers')+20);
 const words=[...typedPart.matchAll(/>([^<>{}]{3,})</g)].map(m=>m[1]);
 assert.ok(words.some(w=>/Type your answer to each question/.test(w)),'the typed route says what to do');
 for(const w of words)assert.doesNotMatch(w,/[—–]/u,w);
});

test('case 14 (W6): the TV\'s Practice card is not made false by the typed route, and still asks nothing to be typed on the TV',()=>{
 const tv=code(path.join(SRC,'maths/MathsTV.tsx'));
 assert.match(tv,/The phone is waiting for the sheet or your answers\./,'the card names both ways in');
 assert.doesNotMatch(tv,/The phone is waiting for the sheet\./);
 // the ask stays the snap, in the TV\'s own copy (the hand-off scan reads it); the TV never asks for typing
 assert.match(tv,/then snap the whole sheet with the phone/);
 const card=tv.slice(tv.indexOf('The phone is waiting for the sheet or your answers.')-200,tv.indexOf('The phone is waiting for the sheet or your answers.')+80);
 assert.doesNotMatch(card,/\btype\b/i,'no typing asked of the TV');
});

test('plan case 7 (panel): the plan screen hands the phone to the Essay panel',()=>{
 const {panelFor}=P();
 assert.equal(panelFor(session({screen:'essayplan',subject:'essay',ask:askOf('slot',{i:1})})),'paste');
 assert.equal(panelFor(session({screen:'essayplan',subject:'essay'})),'stay','the plan with no slot asked asks nothing of the phone');
 assert.equal(panelFor(session({joined:false,screen:'essayplan',subject:'essay'})),'join','an unjoined phone is still asked for the code first');
});

test('M3a: the typed route gives each part of a word problem its own labelled field, with the stem once above the first part',()=>{
 const src=code(PAGE);
 const panel=src.slice(src.indexOf('{screen === "practice" && s'),src.indexOf('{screen === "point"'));
 assert.match(panel,/const at = partPlace\(pr\.items, i\)/,'each box asks where its item sits');
 assert.match(panel,/at\.first && <p data-role="typed-stem"><b>\{at\.q\}\.<\/b> \{it\.stem\}<\/p>/,'the stem once, numbered as the paper numbers it');
 assert.match(panel,/<label htmlFor=\{`ans-\$\{it\.n\}`\} data-part=\{at\.label\}><b>\(\{at\.label\}\)<\/b> \{it\.question\}<\/label>/,'each part its own label, by letter, above its own box');
 assert.match(panel,/aria-label=\{`Your answer to question \$\{itemName\(pr\.items, i\)\}`\}/,'read aloud as 5(a)');
 // still one box per item, in item order: the answers go to the mark route one per part
 assert.match(panel,/pr\.items\.map\(\(it, i\) => <div className="pask"/);
 assert.match(src,/answers: Array\.from\(\{ length: n \}, \(_, i\) => typed\[i\] \?\? ""\)/);
});

// ---------------------------------------------------------------- v2 M5b: the Paper panel (typed entry)

const ENTRY=()=>require(path.join(SRC,'lib/rules/paperEntry.ts'));
const PAPER_PANEL=path.join(SRC,'app/phone/PaperPanel.tsx');
const row=(q,marks,outOf,codes=[])=>({q,marks:String(marks),outOf:String(outOf),codes});

test('paper 1: every row the desk would leave out is shown, with its reason in plain words',()=>{
 const {entryOf}=ENTRY();
 const cases=[
  [[row('','1','2','N1'.split(','))],/Row 1 is left out: This question has no number\./],
  [[row('1234567890123','1','2')],/left out: A question number is at most 12 characters\./],
  [[row('GCSE 1','1','2')],/Row 1 is left out: A question number is the number the paper prints/],
  [[row('1','x','2')],/Question 1 is left out: The marks scored are not a whole number\./],
  [[row('1','1','2.5')],/Question 1 is left out: The marks the question is worth are not a whole number\./],
  [[row('1','','2')],/Question 1 is left out: Type 0 if nothing was scored\./],
  [[row('1','  ','2')],/Question 1 is left out: Type 0 if nothing was scored\./],
  [[row('1','1','')],/Question 1 is left out: Type what the question is out of\./],
  [[row('1','1','2'),ENTRY().blankRow(),row('3','x','3'),row('4','','3')],/Question 3 is left out: The marks scored are not a whole number\./],
  [[row('1','1','2'),ENTRY().blankRow(),row('3','x','3'),row('4','','3')],/Question 4 is left out: Type 0 if nothing was scored\./],
  [[row('1','0','0')],/Question 1 is left out: A question is worth at least 1 mark\./],
  [[row('1','0','7')],/Question 1 is left out: The desk takes at most 6 marks for one question\. Enter its parts one by one\./],
  [[row('1','-1','2')],/Question 1 is left out: The marks scored cannot be below 0\./],
  [[row('1','3','2')],/Question 1 is left out: The marks scored are more than the question is worth\./],
  [[row('5(b)','1','2'),row('5 (B)','1','2')],/Question 5 \(B\) is left out: This question number is already on the paper\./],
  [Array.from({length:81},(_,i)=>row(String(i+1),'0','1')),/Question 81 is left out: A paper has at most 80 questions\./],
  [Array.from({length:14},(_,i)=>row(String(i+1),'0','6')),/Question 14 is left out: The desk takes at most 80 marks for one paper\./],
 ];
 for(const [rows,re] of cases){const e=entryOf(rows);assert.ok(e.drops.some(d=>re.test(d)),`${re}\n${e.drops.join('\n')}`);}
 const codes=entryOf([row('1','0','2',['N1','NOPE','N2','N3','N4'])]);
 assert.ok(codes.drops.some(d=>/Question 1: The desk does not know this statement code\. \(NOPE\)/.test(d)),codes.drops.join('\n'));
 assert.ok(codes.drops.some(d=>/Question 1: A question names at most 3 statements\./.test(d)));
 assert.equal(codes.kept,1,'the question stays, with the codes the desk knows');
 const none=entryOf([row('3','0','4',['NOPE'])]);
 assert.equal(none.kept,1);assert.match(none.notes[0],/Question 3 names no statement the desk knows, so it counts in the marks but sits on no topic\./);
 assert.equal(entryOf([]).kept,0,'nothing typed: nothing to send');
});

test('paper 2: typed text is read as a whole number or left as text for the desk to drop - never guessed',()=>{
 const {rawOf,entryOf,blankRow,isBlank}=ENTRY();
 assert.deepEqual(rawOf([blankRow(),row(' 5(b) ',' 2 ','3',['N1'])]),[{q:' 5(b) ',marks:2,outOf:3,codes:['N1']}],'a blank row is not part of the paper; numbers are numbers');
 assert.ok(isBlank(blankRow())&&!isBlank(row('1','','')));
 assert.deepEqual(rawOf([row('1','2.5','3')])[0].marks,'2.5','a decimal stays text');
 assert.equal(entryOf([row('1','','3')]).clean.items.length+entryOf([row('1','','3')]).clean.unmapped.length,0,'an empty marks box is not 0 marks');
});

test('paper 3: statements are picked by their can text, never by a code alone',()=>{
 const {statementChoices,canOf}=ENTRY();
 const {STATEMENTS}=require(path.join(SRC,'lib/library/gcse.ts'));
 const all=statementChoices().flatMap(g=>g.items);
 assert.equal(all.length,STATEMENTS.length,'every statement can be picked');
 for(const c of all){assert.ok(c.can.length>8,`${c.code} has its can text`);assert.equal(canOf(c.code),c.can);}
 const src=code(PAPER_PANEL);
 assert.match(src,/\{c\.can\}/,'the list prints the can text');
 assert.doesNotMatch(src,/>\s*\{c\.code\}|\{c\.code\}\s*</,'a code is never printed on its own');
 assert.match(src,/post\(\{ type: "paper\.enter"/,'the rows go through the session door the phone uses for its other actions');
 assert.ok(!fs.existsSync(path.join(SRC,'app/api/paper')),'no new route');
});

test('paper 4: no string the Paper panel renders names the board, over a sweep of papers',()=>{
 const {entryOf,statementChoices}=ENTRY();
 const BAD=/GCSE|1MA1/i;
 const papers=[
  [row('GCSE 1','1','2')],[row('1MA1 2','1','2')],[row('1','x','2',['GCSE'])],[row('1','1','2',['1MA1','N1'])],
  [row('','','')],[row('1','9','2')],[row('1','1','9',['NOPE'])],[row('2','0','4',['N1','N2','N3','N4'])],
  Array.from({length:90},(_,i)=>row(String(i+1),'0','6',['N2'])),
 ];
 for(const p of papers){const e=entryOf(p);for(const t of [...e.drops,...e.notes])assert.doesNotMatch(t,BAD,t);}
 for(const g of statementChoices()){assert.doesNotMatch(g.name,BAD);for(const c of g.items)assert.doesNotMatch(c.can,BAD,c.code);}
 assert.doesNotMatch(code(PAPER_PANEL).replace(/\/\/.*$/gm,''),/["'`>][^"'`<>]*(GCSE|1MA1)/i,'no board name in the panel\'s own copy');
});

test('paper 4b: no string the Paper panel shows names an exam tier; a harder statement is flagged as one',()=>{
 const {entryOf}=ENTRY();
 const src=code(PAPER_PANEL);
 assert.doesNotMatch(src.replace(/\/\/.*$/gm,''),/["'\x60>][^"'\x60<>]*Foundation/,'no tier in the panel copy');
 assert.match(src,/ \(a harder statement\)/);
 const rows=[[row('1','0','7')],Array.from({length:14},(_,i)=>row(String(i+1),'0','6'))];
 for(const p of rows){const e=entryOf(p);assert.ok(e.drops.length);for(const t of e.drops)assert.doesNotMatch(t,/Foundation|Higher/i,t);}
});

test('paper 4c: the picker finds a statement by its words and folds its areas',()=>{
 const {choicesMatching,statementChoices}=ENTRY();
 const all=statementChoices(),n=(gs)=>gs.reduce((k,g)=>k+g.items.length,0);
 const e=choicesMatching('');
 assert.equal(e.length,all.length);assert.equal(n(e),n(all),'an empty query gives every area and statement');
 assert.equal(n(choicesMatching('   ')),n(all),'spaces alone are empty');
 const sample=all[0].items.find(c=>c.can.split(/\s+/).length>=3).can,w=sample.split(/\s+/);
 const two=choicesMatching(w[0]+' '+w[w.length-1]);
 assert.ok(two.flatMap(g=>g.items).some(c=>c.can===sample));
 for(const c of two.flatMap(g=>g.items))assert.ok(c.can.toLowerCase().includes(w[0].toLowerCase())&&c.can.toLowerCase().includes(w[w.length-1].toLowerCase()),c.can);
 assert.ok(n(two)<=n(choicesMatching(w[0])),'a second word only narrows');
 assert.equal(n(choicesMatching(sample.toUpperCase())),n(choicesMatching(sample.toLowerCase())));
 assert.ok(n(choicesMatching(sample.toUpperCase()))>=1,'another case matches');
 assert.deepEqual(choicesMatching('zzzqqq xx'),[],'nothing matches: no area');
 assert.equal(choicesMatching(w[0]).every(g=>g.items.length>0),true,'an area with no match is not drawn');
 const src=code(PAPER_PANEL);
 assert.match(src,/<details key=\{g\.area\} className="ppaper-area" open=\{typing \|\| undefined\}>/,'each area folds, and opens while typing');
 assert.match(src,/No statement has these words\./);
 assert.match(src,/useState\(""\)/,'each row keeps its own filter text');
 assert.match(src,/\(\$\{picked\} picked\)/,'the area summary counts its picks');
});

test('recert-3/L1-radka-41-MB4-1, L1-vojtech-18-MB4-1: a cz learner picks statements in Czech, on the same codes',()=>{
 const {statementChoices,canOf,choicesMatching}=ENTRY();
 const {STATEMENTS,AREAS}=require(path.join(SRC,'lib/library/gcse.ts'));
 const {CAN_CZ,AREAS_CZ}=require(path.join(SRC,'lib/library/gcse-cz.ts'));
 assert.deepEqual(Object.keys(CAN_CZ).sort(),STATEMENTS.map(s=>s.code).sort(),'every statement code has a Czech label, none missing or extra');
 for(const s of STATEMENTS){assert.ok(CAN_CZ[s.code].trim().length>3,`${s.code} has a Czech label`);assert.notEqual(CAN_CZ[s.code],s.can,`${s.code} is translated`);}
 assert.deepEqual(Object.keys(AREAS_CZ).sort(),Object.keys(AREAS).sort());
 const cz=statementChoices('cz'),uk=statementChoices('uk');
 assert.deepEqual(cz.map(g=>g.name),Object.keys(AREAS).filter(a=>STATEMENTS.some(s=>s.area===a)).map(a=>AREAS_CZ[a]),'cz gets the Czech area names');
 assert.deepEqual(cz.flatMap(g=>g.items.map(c=>c.code)),uk.flatMap(g=>g.items.map(c=>c.code)),'the codes are the same, in the same order');
 for(const c of cz.flatMap(g=>g.items)){assert.equal(c.can,CAN_CZ[c.code]);assert.equal(canOf(c.code,'cz'),CAN_CZ[c.code]);}
 assert.deepEqual(uk,statementChoices(),'uk is the English list unchanged');
 for(const sys of ['us','de',undefined])assert.deepEqual(statementChoices(sys),uk,`${sys} unchanged`);
 assert.equal(canOf('N4','uk'),STATEMENTS.find(s=>s.code==='N4').can);assert.equal(canOf('NOPE','cz'),'');
 const codes=(gs)=>gs.flatMap(g=>g.items.map(c=>c.code));
 for(const q of ['nejmenší','nejmensi','NSN','HCF, LCM'.split(',')[0],'množiny bodů','mnoziny bodu','loci'])
  assert.ok(codes(choicesMatching(q,'cz')).includes(q.match(/mno|loci/i)?'G2':'N4'),`${q} finds its statement for a cz learner`);
 assert.deepEqual(codes(choicesMatching('nejmensi','cz')),codes(choicesMatching('nejmenší','cz')),'accents do not matter');
 assert.deepEqual(codes(choicesMatching('loci','cz')),codes(choicesMatching('loci','uk')),'an English query finds the same statement for a cz learner');
 assert.deepEqual(choicesMatching('nejmenší','uk'),[],'a uk learner searches the English text only');
 const src=code(PAPER_PANEL),page=fs.readFileSync(PAGE,'utf8');
 assert.match(src,/choicesMatching\(query, system\)/);assert.match(src,/canOf\(c, system\)/);assert.match(src,/wholeOf\(system\)/);
 assert.match(page,/<PaperPanel [^>]*system=\{s\?\.learner \? s\.profiles\?\.find\(\(p\) => p\.id === s\.learner\?\.id\)\?\.system : undefined\}/,'the panel is given the seated learner\'s system');
});

test('paper 5: the panel has no Show on the TV button and posts no nav - the TV has its own key into paper (Down on Tonight, TL-13)',()=>{
 const src=code(PAPER_PANEL);
 assert.doesNotMatch(src,/paper-show/);assert.doesNotMatch(src,/Show the last paper on the TV/);
 assert.doesNotMatch(src,/type: "nav"/,'PaperPanel posts no nav');
 const {panelFor}=P();
 // TL-9 re-pin: the ask is read first; the paper screen alone asks nothing, ask paper does
 assert.equal(panelFor(session({screen:'units',ask:askOf('paper')})),'paper','ask paper hands the phone to the panel, whatever the screen');
 assert.equal(panelFor(session({screen:'paper'})),'stay','the paper screen alone asks nothing of the phone: only ask paper does (TL-13)');
 assert.equal(panelFor(session({joined:false,screen:'paper'})),'join','an unjoined phone is still asked for the code first');
});

test('MB-B43: the Paper panel\'s heading and its Send button name the seated learner',()=>{
 const src=fs.readFileSync(PAPER_PANEL,'utf8'),page=fs.readFileSync(PAGE,'utf8');
 assert.match(src,/<h3>\{paperHeading\(name\)\}<\/h3>/);assert.match(src,/\{paperSend\(e\.kept, name\)\}/);
 assert.match(src,/`A paper \$\{name\} sat`/);assert.match(src,/to \$\{name \? `\$\{name\}'s record` : "the TV"\}/);
 assert.match(page,/<PaperPanel [^>]*name=\{s\?\.learner\?\.name\}/,'the panel is given the seated learner\'s name');
 assert.doesNotMatch(src,/<h3>A paper you sat<\/h3>/,'no unnamed heading is left');
});

test('MB-B33 mic: the recogniser language follows the seated learner\'s school system (cs-CZ for cz, en-US otherwise) and the page uses the helper',()=>{
 const {recogniserLang}=require(path.join(SRC,'app/phone/recogniserLang.ts'));
 const profiles=[{id:'a',name:'A',type:'high-school',system:'cz',modules:[]},{id:'b',name:'B',type:'high-school',system:'us',modules:[]},{id:'c',name:'C',type:'high-school',modules:[]}];
 assert.equal(recogniserLang({learner:{id:'a',name:'A'},profiles}),'cs-CZ');
 for(const id of ['b','c','nobody'])assert.equal(recogniserLang({learner:{id,name:'x'},profiles}),'en-US',id);
 assert.equal(recogniserLang({learner:null,profiles}),'en-US');assert.equal(recogniserLang(null),'en-US');assert.equal(recogniserLang(undefined),'en-US');
 const page=code(PAGE);assert.match(page,/r\.lang = recogniserLangFor\(tab, s\)/);assert.doesNotMatch(page,/r\.lang = "en-US"/);
});

test('L1-daniel-15-EM2-1: Essay dictation listens in English for a cz learner; Math and Linga keep the learner language',()=>{
 const {recogniserLangFor}=require(path.join(SRC,'app/phone/recogniserLang.ts'));
 const profiles=[{id:'a',name:'A',type:'high-school',system:'cz',modules:[]}],cz={learner:{id:'a',name:'A'},profiles};
 assert.equal(recogniserLangFor('essay',cz),'en-US');
 for(const tab of ['','maths','english'])assert.equal(recogniserLangFor(tab,cz),'cs-CZ',tab);
 assert.equal(recogniserLangFor('essay',null),'en-US');
 const page=code(PAGE);
 assert.equal((page.match(/, "essay"\)\}>Dictate</g)||[]).length,3,'the rewrite, plan-slot and paragraph Dictate buttons name the Essay tab');
 assert.match(page,/listen\(setQ\)\}>Mic</);assert.match(page,/listen\(setSentence\)\}>Mic</,'the Math and Linga Mic buttons name no tab');
});

// ---- X2 Type it (MB-B18, delivery 5b): a typed way to explain beside the hold button while a recogniser exists
test('X2 Type it',async(t)=>{
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {createElement}=require(path.join(root,'node_modules/react'));
 const load=()=>require(path.join(SRC,'app/phone/ExplainTalk.tsx')).ExplainTalk;
 const noop=()=>{};
 const draw=(o)=>renderToStaticMarkup(createElement(load(),{micOk:true,holding:false,heard:'',reply:'',busy:false,typed:'',typing:false,
  onHoldStart:noop,onHoldEnd:noop,onSendHeard:noop,onTryAgain:noop,onTyped:noop,onOpenTyping:noop,onCloseTyping:noop,onSendTyped:noop,onClearTyped:noop,...o}));
 await t.test('(a) micOk, nothing heard, typing closed: the hold button and a Type it control',()=>{
  const h=draw({});assert.match(h,/class="phold"/);assert.match(h,/>Type it</);assert.doesNotMatch(h,/<textarea/);
 });
 await t.test('(b) micOk, typing open: a labelled textarea and Send, disabled while blank',()=>{
  const h=draw({typing:true});assert.match(h,/<textarea[^>]*aria-label="[^"]+"/);
  assert.match(h,/<button[^>]*disabled=""[^>]*>Send<\/button>/,'blank text: Send is disabled');
  assert.doesNotMatch(h,/class="phold"/);
  assert.doesNotMatch(draw({typing:true,typed:'čitatel'}),/<button[^>]*disabled=""[^>]*>Send<\/button>/,'text typed: Send is enabled');
 });
 await t.test('(c) micOk false: the textarea shows and there is no hold button',()=>{
  const h=draw({micOk:false});assert.match(h,/<textarea[^>]*aria-label=/);assert.doesNotMatch(h,/phold/);assert.doesNotMatch(h,/>Type it</);
 });
 await t.test('(d) heard set: I heard with Send and Try again',()=>{
  const h=draw({heard:'two thirds'});assert.match(h,/I heard: “two thirds”/);assert.match(h,/>Send</);assert.match(h,/>Try again</);assert.doesNotMatch(h,/<textarea/);
 });
 await t.test('(e) page.tsx renders ExplainTalk, the typed text is not q, the walkIx effect clears it',()=>{
  const p=code(PAGE);assert.match(p,/<ExplainTalk /);assert.match(p,/typed=\{typedExplain\}/);
  assert.doesNotMatch(p,/<ExplainTalk [^>]*typed=\{q\}/);assert.match(p,/onSendTyped=\{\(\) => explain\(typedExplain\)\}/);
  assert.match(p,/setTypedExplain\(""\);[^\n]*\}, \[s\?\.walkIx\]\)/,'the walkIx effect clears it');
  assert.match(p,/setTypedExplain\(""\);[^\n]*\}, \[s\?\.learner\?\.id\]\)/,'a learner change clears it');
  assert.match(p,/setHeard\(""\); setReply\(""\); setAgain\(""\);[^\n]*\}, \[s\?\.learner\?\.id\]\)/,'P12: a learner change also clears the heard words, the reply and the second try');
 });
});

// ---- P15 (delivery 7d-3): a late explain reply is dropped when the learner or the walk item changed
// The harness has no DOM, so explain() itself is cut out of page.tsx, transpiled and run against stubs: a behavioural test of the real code.
test('P15 explain(): a reply that returns after the learner or the walk item changed sets neither reply nor msg; busy clears',async(t)=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const a=src.indexOf('const seat = useRef'),b=src.indexOf('/** One typed second go');
 assert.ok(a>0&&b>a,'explain() is where the test expects it');
 const js=ts.transpileModule(src.slice(a,b),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const make=(s,respond)=>{
  const calls=[];const rec=(k)=>(v)=>calls.push([k,v]);
  const f=new Function('s','useRef','call','setBusy','setMsg','setReply','setHeard','setTypedExplain','setTyping',`${js}\nreturn {explain,seat};`);
  const out=f(s,(v)=>({current:v}),respond,rec('busy'),rec('msg'),rec('reply'),rec('heard'),rec('typed'),rec('typing'));
  return {...out,calls};
 };
 const reply=(body,ok=true,status=200)=>Promise.resolve({ok,status,json:async()=>body});
 const gate=()=>{let open;const p=new Promise((r)=>{open=r;});return {p,open};};
 const went=(calls,k)=>calls.filter(([x])=>x===k);
 const seatedA={learner:{id:'ema'},walkIx:1};
 await t.test('control: nothing changed - the reply lands and the heard and typed words clear',async()=>{
  const m=make(seatedA,()=>reply({reply:'Good.'}));await m.explain('x');
  assert.deepEqual(went(m.calls,'reply'),[['reply','Good.']]);assert.equal(went(m.calls,'heard').length,1);assert.equal(went(m.calls,'busy').at(-1)[1],false);
 });
 await t.test('the learner changed while it was out: no reply, no heard or typed clearing, busy cleared',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.explain('x');
  m.seat.current={id:'jakub',ix:1};g.open(reply({reply:'Good.'}));await p;
  assert.equal(went(m.calls,'reply').length,0);assert.equal(went(m.calls,'msg').filter(([,v])=>v!=='').length,0);
  assert.equal(went(m.calls,'heard').length,0);assert.equal(went(m.calls,'typed').length,0);assert.equal(went(m.calls,'busy').at(-1)[1],false);
 });
 await t.test('the walk item changed while it was out: the same',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.explain('x');
  m.seat.current={id:'ema',ix:2};g.open(reply({error:'The desk could not follow that.'},false,502));await p;
  assert.equal(went(m.calls,'reply').length,0);assert.equal(went(m.calls,'msg').filter(([,v])=>v!=='').length,0);assert.equal(went(m.calls,'busy').at(-1)[1],false);
 });
 await t.test('a failed send after a change is dropped too; unchanged, it says so',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.explain('x');
  m.seat.current={id:'jakub',ix:1};g.open(Promise.reject(new Error('net')));await p.catch(()=>{});
  assert.equal(went(m.calls,'msg').filter(([,v])=>v!=='').length,0);
  const m2=make(seatedA,()=>Promise.reject(new Error('net')));await m2.explain('x');
  assert.equal(went(m2.calls,'msg').filter(([,v])=>v!=='').length,1);
 });
 await t.test('it is sent for the item that was open at send time',async()=>{
  let sent;const m=make(seatedA,(u,b)=>{sent=b;return reply({reply:'ok'});});await m.explain('x');assert.equal(sent.n,1);
 });
});

// ---- P16 (delivery 7d-4): a late second-try reply is dropped when the learner or the walk item changed
// Same method as P15: sendSecond() is cut out of page.tsx, transpiled and run against stubs.
test('P16 sendSecond(): a reply that returns after the learner or the walk item changed sets neither again nor msg; busy clears',async(t)=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const e=src.indexOf('The phone follows the TV (panelFor.ts)');
 const a=src.indexOf('const seat = useRef'),b=src.lastIndexOf('\n',e);
 assert.ok(a>0&&e>a&&b>a,'sendSecond() is where the test expects it');
 const js=ts.transpileModule(src.slice(a,b),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const make=(s,respond)=>{
  const calls=[];const rec=(k)=>(v)=>calls.push([k,v]);
  const f=new Function('s','useRef','call','again','busy','setAgain','setBusy','setMsg','setReply','setHeard','setTypedExplain','setTyping','document','HTMLElement',`${js}\nreturn {sendSecond,seat};`);
  const out=f(s,(v)=>({current:v}),respond,'my go',false,rec('again'),rec('busy'),rec('msg'),rec('reply'),rec('heard'),rec('typed'),rec('typing'),{activeElement:null},class{});
  return {...out,calls};
 };
 const reply=(body,ok=true,status=200)=>Promise.resolve({ok,status,json:async()=>body});
 const gate=()=>{let open;const p=new Promise((r)=>{open=r;});return {p,open};};
 const went=(calls,k)=>calls.filter(([x])=>x===k);
 const full=(calls)=>went(calls,'msg').filter(([,v])=>v!=='');
 const seatedA={learner:{id:'ema'},walkIx:1,practice:{items:[{n:10},{n:11},{n:12}]}};
 await t.test('control: nothing changed - ok clears again; a refusal says the route\'s error; busy ends false',async()=>{
  const m=make(seatedA,()=>reply({}));await m.sendSecond();
  assert.deepEqual(went(m.calls,'again'),[['again','']]);assert.equal(went(m.calls,'busy').at(-1)[1],false);
  const m2=make(seatedA,()=>reply({error:'No second go here.'},false,409));await m2.sendSecond();
  assert.deepEqual(full(m2.calls),[['msg','No second go here.']]);assert.equal(went(m2.calls,'busy').at(-1)[1],false);
 });
 await t.test('the learner changed while it was out: no again, no msg, busy cleared',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.sendSecond();
  m.seat.current={id:'jakub',ix:1};g.open(reply({}));await p;
  assert.equal(went(m.calls,'again').length,0);assert.equal(full(m.calls).length,0);assert.equal(went(m.calls,'busy').at(-1)[1],false);
 });
 await t.test('the walk item changed while it was out: a refusal sets no msg; busy cleared',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.sendSecond();
  m.seat.current={id:'ema',ix:2};g.open(reply({error:'No second go here.'},false,409));await p;
  assert.equal(full(m.calls).length,0);assert.equal(went(m.calls,'busy').at(-1)[1],false);
 });
 await t.test('a failed send after a change is dropped too; unchanged, it says so',async()=>{
  const g=gate();const m=make(seatedA,()=>g.p);const p=m.sendSecond();
  m.seat.current={id:'jakub',ix:1};g.open(Promise.reject(new Error('net')));await p.catch(()=>{});
  assert.equal(full(m.calls).length,0);assert.equal(went(m.calls,'busy').at(-1)[1],false);
  const m2=make(seatedA,()=>Promise.reject(new Error('net')));await m2.sendSecond();
  assert.equal(full(m2.calls).length,1);assert.match(full(m2.calls)[0][1],/^That did not reach the desk: /);
 });
 await t.test('it is sent for the item that was open at send time',async()=>{
  let sent;const m=make(seatedA,(u,b)=>{sent=b;return reply({});});await m.sendSecond();assert.equal(sent.n,11);
 });
});

// ---- P17 (delivery 7d-5): a learner switch clears the last learner's work on the phone
// Same method as P15: the reset and its effect are cut out of page.tsx between stable markers, transpiled and run against stubs.
const P17_LOAD={paras:['load paras'],sentence:'load sentence'};
test('P17 (i) a learner switch resets the last learner\'s essay, photo, typed answers and lines to their load values',async(t)=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const a=src.indexOf('// P17 (i) begin'),b=src.indexOf('// P17 (i) end');
 assert.ok(a>0&&b>a,'the reset is where the test expects it');
 assert.ok(b<src.indexOf('const rec = useRef'),'it sits before the rec ref');
 assert.match(src,/useState\(FRESH_SENTENCE\)/);assert.match(src,/useState<string\[\]>\(FRESH_PARAS\)/,'the load values are the ones the reset uses');
 assert.match(src,/\[keep, setKeep\] = useState\(true\)/,'keep loads true');assert.match(src,/\[ring, setRing\] = useState<[^=]*\| null>\(null\)/,'ring loads null');
 const js=ts.transpileModule(src.slice(a,b),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const NAMES=['Paras','Pix','ReadIx','Note','Info','Source','PieceId','Notice','Shot','Phase','Q','Msg','PaperRows','Typed','Sentence','Keep','Ring'];
 const make=()=>{
  const calls=[];const s={learner:null};let effect;
  const setters=NAMES.map((n)=>(v)=>calls.push([n,v]));
  const f=new Function('s','useRef','useEffect','blankRow','FRESH_PARAS','FRESH_SENTENCE',...NAMES.map((n)=>'set'+n),`${js}\nreturn null;`);
  f(s,(v)=>({current:v}),(fn)=>{effect=fn;},()=>({blank:true}),P17_LOAD.paras,P17_LOAD.sentence,...setters);
  const seat=(id)=>{s.learner=id?{id}:null;calls.length=0;effect();return calls.slice();};
  return {seat};
 };
 const want={Paras:P17_LOAD.paras,Pix:0,ReadIx:[],Note:'',Info:'',Source:'message',PieceId:undefined,Notice:null,Shot:null,Phase:'idle',Q:'',Msg:'',PaperRows:[{blank:true}],Typed:[],Sentence:P17_LOAD.sentence,Keep:true,Ring:null};
 await t.test('A to B: every listed state goes back to its load value',()=>{
  const m=make();m.seat('ema');const c=m.seat('jakub');
  assert.deepEqual(c.map(([n])=>n).sort(),[...NAMES].sort());
  for(const [n,v] of c)assert.deepEqual(v,want[n],n);
 });
 await t.test('the first seating after load resets nothing',()=>{const m=make();assert.deepEqual(m.seat('ema'),[]);});
 await t.test('A to none to A resets nothing',()=>{const m=make();m.seat('ema');assert.deepEqual(m.seat(null),[]);assert.deepEqual(m.seat('ema'),[]);});
 await t.test('A to none to B resets when B sits, not when the seat empties',()=>{
  const m=make();m.seat('ema');assert.deepEqual(m.seat(null),[]);assert.equal(m.seat('jakub').length,NAMES.length);
 });
 await t.test('A to B to B resets once',()=>{const m=make();m.seat('ema');m.seat('jakub');assert.deepEqual(m.seat('jakub'),[]);});
});

// ---- P17 (ii): a reply that returns after the learner changed is dropped by every handler
// Each handler is cut out of page.tsx, transpiled and run against stubs. Only the learner is compared, never the walk item.
test('P17 (ii) a reply that returns after the learner changed sets no state but busy, in every handler',async(t)=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const cut=(from,to)=>{const a=src.indexOf(from),e=src.indexOf(to,a);assert.ok(a>0&&e>a,`${from} is where the test expects it`);return src.slice(a,src.lastIndexOf('\n',e));};
 const SETTERS=['Busy','Msg','Phase','Note','Info','Notice','ReadIx','PieceId','ShelfTick','Q','Paras','Stranded'];
 const PARAMS=['s','seat','call','post','shot','busy','typed','document','HTMLElement','onPlan','onSentence','slotText','rewrite','planFill','paras','pieceProblem','etype','keep','pieceId','source','pieceFormat','essay','paragraphsOf','essayTooLong','pix','page','ring','q','sentence','writeRewriteBack','rewriteStaysLine','stranded',...SETTERS.map((n)=>'set'+n)];
 const reply=(body,ok=true,status=200)=>Promise.resolve({ok,status,json:async()=>body});
 const gate=()=>{let open;const p=new Promise((r)=>{open=r;});return {p,open};};
 // build one handler; `respond(url, body)` is the network
 const build=(slice,name,respond)=>{
  const calls=[],urls=[],seat={current:{id:'ema',ix:1}};
  const js=ts.transpileModule(slice,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
  const f=new Function(...PARAMS,`${js}\nreturn {${name}};`);
  const rec=(k)=>(v)=>calls.push([k,typeof v==='function'?'fn':v]);
  const stubs={s:{practice:{items:[{n:10}]},walkIx:0,itemIx:0},seat,call:(u,b)=>{urls.push([u,b]);return respond(u,b);},post:(e)=>{urls.push(['post',e]);return respond('post',e);},shot:{url:'u',w:1,h:2},busy:false,typed:['a','b'],
   document:{activeElement:null},HTMLElement:class{},onPlan:{i:0,plan:{}},onSentence:{n:2},slotText:'slot',rewrite:'rw',planFill:()=>({ok:true}),paras:['one','two'],pieceProblem:()=>'',
   etype:'structure',keep:true,pieceId:'p1',source:'message',pieceFormat:'message',essay:'one',paragraphsOf:(x)=>[x],essayTooLong:()=>'',pix:0,page:{items:[]},q:'why',sentence:'I go.',writeRewriteBack:()=>({paras:['one','two'],written:true,line:''}),rewriteStaysLine:()=>'',stranded:0};
  const out=f(...PARAMS.map((p)=>p.startsWith('set')&&SETTERS.includes(p.slice(3))?rec(p.slice(3)):stubs[p]));
  return {fn:out[name],calls,urls,seat,mark:()=>calls.length};
 };
 const sendS=cut('const send = async','const toJpeg'),slotS=cut('const sendSlot','useEffect(() => { if (onSentence)'),rewriteS=cut('const sendRewrite','/** Load a text as'),
  pieceS=cut('const readPiece','const openKept'),paraS=cut('const analyseParagraph','/** From the sentence rewrite'),askS=cut('const ask = async',"/** The desk's failed run"),
  retryS=cut('const retry = async','/** A Mic press'),workS=cut('const sendWorking','const sendTyped').replace(/\/\*\*\s*$/,''),typedS=cut('const sendTyped','// the set came back');
 const okBody={piece:{pieceId:'p2'}};
 // [label, slice, handler, args, network for a good reply, what the control must set]
 const H=[
  ['send',sendS,'send',['d',1,2,'maths','T'],()=>reply({}),(c)=>c.some(([k,v])=>k==='Phase'&&v==='sent')],
  ['sendSlot',slotS,'sendSlot',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Msg'&&v==='on the TV')],
  ['sendRewrite',rewriteS,'sendRewrite',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Msg'&&v==='on the TV')],
  ['readPiece',pieceS,'readPiece',[],()=>reply(okBody),(c)=>c.some(([k,v])=>k==='PieceId'&&v==='p2')&&c.some(([k])=>k==='ShelfTick')],
  ['acceptNotice',pieceS,'acceptNotice',[],(u)=>u==='/api/texts'?reply({}):reply(okBody),(c)=>c.some(([k,v])=>k==='PieceId'&&v==='p2')],
  ['analyseParagraph',paraS,'analyseParagraph',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Msg'&&v==='on the TV')&&c.some(([k])=>k==='ReadIx')],
  ['ask',askS,'ask',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Q'&&v==='')],
  ['checkSentence',askS,'checkSentence',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Msg'&&v==='on the TV')],
  ['retry',retryS,'retry',['read'],()=>reply({}),(c)=>c.some(([k,v])=>k==='Phase'&&v==='sent')],
  ['sendWorking',workS,'sendWorking',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Phase'&&v==='sent')],
  ['sendTyped',typedS,'sendTyped',[],()=>reply({}),(c)=>c.some(([k,v])=>k==='Phase'&&v==='sent')],
 ];
 assert.equal(H.length,11,'eleven handlers');
 for(const [label,slice,name,args,net,sets] of H){
  await t.test(`${label}: control - nothing changed, it sets what it sets today`,async()=>{
   const m=build(slice,name,net);await m.fn(...args);await new Promise((r)=>setImmediate(r));
   assert.ok(sets(m.calls),`${label} sets its state`);assert.equal(m.calls.filter(([k])=>k==='Busy').at(-1)[1],false);
  });
  await t.test(`${label}: the learner changed while the call was out - nothing set but busy, which ends false`,async()=>{
   for(const how of ['ok','refusal','reject']){
    const g=gate();const m=build(slice,name,()=>g.p);const p=m.fn(...args);const from=m.mark();
    m.seat.current={id:'jakub',ix:1};
    if(how==='ok')g.open(net('/api/x')); else if(how==='refusal')g.open(reply({error:'No.'},false,409)); else g.open(Promise.reject(new Error('net')));
    await p.catch(()=>{});await new Promise((r)=>setImmediate(r));
    const after=m.calls.slice(from);
    assert.deepEqual(after.filter(([k])=>k!=='Busy'),[],`${label} (${how}) set no state after the switch`);
    if(label!=='acceptNotice'){assert.equal(after.at(-1)[0],'Busy');assert.equal(after.at(-1)[1],false);}
   }
  });
 }
 await t.test('readPiece: a 428 after a switch sets no notice; an ok after a switch sets no piece id',async()=>{
  const g=gate();const m=build(pieceS,'readPiece',()=>g.p);const p=m.fn();const from=m.mark();
  m.seat.current={id:'jakub',ix:1};g.open(reply({notice:true,error:'Notice.'},false,428));await p;
  assert.equal(m.calls.slice(from).filter(([k])=>k==='Notice').length,0);
  const g2=gate();const m2=build(pieceS,'readPiece',()=>g2.p);const p2=m2.fn();const from2=m2.mark();
  m2.seat.current={id:'jakub',ix:1};g2.open(reply(okBody));await p2;
  assert.equal(m2.calls.slice(from2).filter(([k])=>k==='PieceId'||k==='ShelfTick').length,0);
  const m3=build(pieceS,'readPiece',()=>reply({notice:true,error:'Notice.'},false,428));await m3.fn();
  assert.deepEqual(m3.calls.filter(([k])=>k==='Notice'),[['Notice','Notice.']],'unchanged, the 428 still shows the notice');
 });
 await t.test('acceptNotice: after a switch it does not call readPiece (no piece is posted)',async()=>{
  const g=gate();const m=build(pieceS,'acceptNotice',(u)=>u==='/api/texts'?g.p:reply(okBody));const p=m.fn();
  m.seat.current={id:'jakub',ix:1};g.open(reply({}));await p;
  assert.deepEqual(m.urls.map(([u])=>u),['/api/texts'],'only the notice was posted');
  const m2=build(pieceS,'acceptNotice',()=>reply(okBody));await m2.fn();
  assert.deepEqual(m2.urls.map(([u])=>u),['/api/texts','/api/analyse'],'unchanged, the piece follows the notice');
 });
 await t.test('request bodies are unchanged, and a walk item change alone drops nothing',async()=>{
  const m=build(askS,'ask',()=>reply({}));await m.fn();assert.deepEqual(m.urls[0],['/api/hint',{askedQ:'why',itemIx:0}]);
  const g=gate();const m2=build(askS,'ask',()=>g.p);const p=m2.fn();m2.seat.current={id:'ema',ix:2};g.open(reply({}));await p;
  assert.ok(m2.calls.some(([k,v])=>k==='Q'&&v===''),'the learner is the same: the reply lands');
  const w=build(workS,'sendWorking',()=>reply({}));await w.fn();assert.deepEqual(w.urls[0],['/api/mark',{image:'u',w:1,h:2}]);
 });
 assert.match(src,/onClick=\{checkSentence\}>Check it on the TV</,'the Say button calls the named handler');
});

// ---- SW1 (scan-sweep optimize 2026-10-13): the Say panel's Check it on the TV fails the way its eleven siblings do ----
test('SW1: checkSentence - a call that never reached the desk says so and never rejects; a refusal shows the route\'s own line',async()=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const a=src.indexOf('const checkSentence'),e=src.indexOf("/** The desk's failed run",a);assert.ok(a>0&&e>a,'checkSentence is where the test expects it');
 const js=ts.transpileModule(src.slice(a,src.lastIndexOf('\n',e)),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const run=async(respond)=>{
  const calls=[],seat={current:{id:'ema'}};
  const f=new Function('seat','call','sentence','setBusy','setMsg',`${js}\nreturn checkSentence;`);
  const fn=f(seat,()=>respond(),'I go.',(v)=>calls.push(['Busy',v]),(v)=>calls.push(['Msg',v]));
  let threw=null;try{await fn();}catch(x){threw=x;}
  return {threw,msg:calls.filter(([k])=>k==='Msg').at(-1)?.[1],busy:calls.filter(([k])=>k==='Busy').at(-1)?.[1]};
 };
 const reply=(body,ok,status)=>Promise.resolve({ok,status,json:async()=>body});
 const down=await run(()=>Promise.reject(new TypeError('Failed to fetch')));
 assert.equal(down.threw,null,'a network failure is handled, not left as an unhandled rejection');
 assert.equal(down.msg,'That did not reach the desk.','the line its siblings say');assert.equal(down.busy,false);
 const nobody=await run(()=>reply({error:'No one is at the desk yet.'},false,409));
 assert.equal(nobody.msg,'No one is at the desk yet.','the route\'s own reason, not a bare "failed"');
 const bare=await run(()=>reply({},false,500));
 assert.match(bare.msg,/could not check that sentence \(500\)/);
 assert.doesNotMatch(src.slice(a,e),/"failed"/,'no bare "failed" left in the handler');
 assert.equal((await run(()=>reply({},true,200))).msg,'on the TV','unchanged: an ok is on the TV');
});

// ---- SW2 (scan-sweep optimize 2026-10-13): a camera granted after the panel let it go is stopped, never left running ----
test('SW2: the camera effect stops a stream that arrives after the panel no longer wants it, and on unmount',async()=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const a=src.lastIndexOf('useEffect(() => {',src.indexOf('if (!camWanted)')),e=src.indexOf('}, [camWanted]);',a);
 assert.ok(a>0&&e>a,'the camera effect is where the test expects it');
 const js=ts.transpileModule(src.slice(a,e+'}, [camWanted]);'.length),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const run=async(late)=>{
  let effect=null,open;const granted=new Promise((r)=>{open=r;});const stopped=[],cams=[];
  const navigator={mediaDevices:{getUserMedia:()=>granted}};
  new Function('useEffect','camWanted','cam','setCam','video','setMsg','screen','navigator',js)((f)=>{effect=f;},true,null,(v)=>cams.push(v),{current:null},()=>{},'capture',navigator);
  const cleanup=effect();
  if(late)assert.equal(typeof cleanup,'function','the effect hands React a cleanup');
  if(late&&typeof cleanup==='function')cleanup();
  open({getTracks:()=>[{stop:()=>stopped.push('video')}]});await new Promise((r)=>setImmediate(r));
  return {stopped,cams,cleanup};
 };
 const late=await run(true);
 assert.deepEqual(late.stopped,['video'],'a stream granted after the panel let the camera go is stopped at once');
 assert.deepEqual(late.cams,[],'and never becomes the panel\'s camera');
 const wanted=await run(false);
 assert.equal(wanted.cams.length,1,'unchanged: a stream that arrives while wanted is the camera');assert.deepEqual(wanted.stopped,[]);
 wanted.cleanup();assert.deepEqual(wanted.stopped,['video'],'the page going away stops the camera in use');
});

// ---- SW3/SW4 (scan-sweep optimize 2026-10-13): case 13's phone-sized rule (44 px targets, 16 px fields) on every panel ----
const phoneCss=()=>fs.readFileSync(path.join(SRC,'app/globals.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const ruleOf=(css,sel)=>{const i=css.indexOf(`${sel} {`);assert.ok(i>=0,`${sel} is styled`);return css.slice(i,css.indexOf('}',i));};
const pxOf=(decl,prop)=>Number((decl.match(new RegExp(`(?:^|[;{\\s])${prop}: (\\d+)px`))||[])[1]||0);
test('SW3: every typed field on the phone is 16 px or more, so a phone does not zoom in when it is tapped',()=>{
 const css=phoneCss();
 // the .field row holds the code, the name, the question, the sentence, the plan slot and the paragraph
 assert.ok(pxOf(ruleOf(css,'.field input, .field textarea, .field select'),'font-size')>=16,'.field controls are 16 px or more');
 assert.ok(pxOf(ruleOf(css,'.ppaper-find'),'font-size')>=16,'the Paper panel\'s search box is 16 px or more');
 assert.ok(pxOf(ruleOf(css,'.pask input'),'font-size')>=16,'unchanged: the typed answers');
});
test('SW4: the phone\'s tap targets are at least 44 px tall - the tab bar, the presets, the samples and the role switch',()=>{
 const css=phoneCss();
 for(const sel of ['.pnav button','.presets button','.samples button','.pmore-row','.field input, .field textarea, .field select'])
  assert.ok(pxOf(ruleOf(css,sel),'min-height')>=44,`${sel} is at least 44 px tall`);
});

// ---- PR5: every refused join says why on the Join panel ----
const WRONG='That code is not on the TV.',TOO_MANY='Too many wrong codes. Wait five minutes, then type the code again.';
const NEWCODE='The TV has a new code. Type the code the TV shows.',NOREACH='That did not reach the desk.';
test('PR5: the join lines are the route\'s own, and carry no digit and no em dash',()=>{
 const pairing=fs.readFileSync(path.join(SRC,'lib/session/pairing.ts'),'utf8');
 assert(pairing.includes(`"${WRONG}"`)&&pairing.includes(`"${TOO_MANY}"`),'the route texts are the ones this suite expects');
 for(const l of [NEWCODE,NOREACH])assert.doesNotMatch(l,/[0-9\u2014]/);
});
// PR10 supersedes PR5's remembered-code half: the phone no longer stores the code, so there is no remembered join and no row for it (typed and QR stand)
test('PR10: a code the phone brought is no longer remembered - joinRefusal has no remembered row and says no new-code line',()=>{
 const src=fs.readFileSync(PANEL,'utf8');
 assert.doesNotMatch(src,/remembered/,'panelFor.ts has no remembered join');
 assert.doesNotMatch(src,/The TV has a new code/);
});
test('PR5: a QR code the TV does not know says so, quietly, and is forgotten',()=>{
 assert.deepEqual(P().joinRefusal({status:403,error:WRONG,how:'qr'}),{line:WRONG,shake:false,forget:true});
});
test('PR5: a cooldown refusal shows the route\'s text and keeps the stored code, typed or not',()=>{
 for(const how of ['typed','qr'])assert.deepEqual(P().joinRefusal({status:403,error:TOO_MANY,how}),{line:TOO_MANY,shake:how==='typed',forget:false},how);
});
test('PR5: no answer says it did not reach the desk and keeps the stored code',()=>{
 for(const how of ['typed','qr'])assert.deepEqual(P().joinRefusal({status:undefined,error:undefined,how}),{line:NOREACH,shake:how==='typed',forget:false},how);
});
test('PR5: any other refusal shows the route\'s text, or the wrong-code line when it sends none',()=>{
 assert.deepEqual(P().joinRefusal({status:500,error:'Boom.',how:'qr'}),{line:'Boom.',shake:false,forget:false});
 assert.deepEqual(P().joinRefusal({status:403,error:undefined,how:'qr'}),{line:WRONG,shake:false,forget:true});
 assert.deepEqual(P().joinRefusal({status:403,error:undefined,how:'typed'}),{line:WRONG,shake:true,forget:false});
});
test('PR5: a typed wrong code shakes and keeps what is stored',()=>{
 assert.deepEqual(P().joinRefusal({status:403,error:WRONG,how:'typed'}),{line:WRONG,shake:true,forget:false});
});
test('PR5: page.tsx join() sends every refusal through joinRefusal, quiet ones too',()=>{
 const src=code(PAGE);
 assert.match(src,/joinRefusal/,'page.tsx uses joinRefusal');
 const at=src.indexOf('const join = async'),body=src.slice(at,src.indexOf('const onPin',at));
 assert(at>0&&body.includes('joinRefusal('),'join() calls it');
 assert.doesNotMatch(body,/if \(quiet\) return/,'a quiet join no longer returns before saying why');
 // changed openly (PR10): the phone stores no code, so there is nothing for a refusal to forget and no remembered join
 assert.doesNotMatch(body,/desk\.pin/,'join() neither stores nor forgets a code');
 assert.match(src,/join\(q, "qr"\)/);assert.doesNotMatch(src,/"remembered"/);
});

// ---- PR10: the phone keeps no code ----
test('PR10: page.tsx writes no desk.pin to localStorage, removes a stored one on open, and has no remembered join',()=>{
 const src=code(PAGE);
 assert.doesNotMatch(src,/localStorage\.setItem\("desk\.pin"/,'no write of the code');
 assert.doesNotMatch(src,/localStorage\.getItem\("desk\.pin"/,'the code is never read back');
 assert.doesNotMatch(src,/remembered/,'no remembered ref or join');
 assert.match(src,/useEffect\(\(\) => \{[\s\S]{0,60}localStorage\.removeItem\("desk\.pin"\)[\s\S]{0,60}\}, \[\]\)/,'a stored code is removed on open');
});
test('PR10: JoinHow has no remembered',()=>{
 assert.match(fs.readFileSync(PANEL,'utf8'),/export type JoinHow = "typed" \| "qr";/);
});
test('PR10: the Forget link is offered while this device is a phone - on the panel a joined phone sees',()=>{
 const src=code(PAGE);
 assert.match(src,/s\??\.viewer === "phone" && [\s\S]{0,120}Forget this desk/,'depends on the viewer being a phone');
 const joined=src.slice(src.indexOf('screen === "joined"'),src.indexOf('screen === "profile" && <div'));
 assert.match(joined,/Forget this desk/,'a joined phone can reach it');
 assert.doesNotMatch(src,/hasDesk/,'no stored-code flag decides it');
});

// ---- PR11: a write the desk could not make is a desk fault, not a wrong code ----
const JOIN_NOT_SAVED='The desk could not save this phone, so nothing changed. Type the same code again.',JOIN_DESK_FAULT='The desk had a problem and did not join this phone. Type the same code again.';
const LEAVE_NOT_SAVED='The desk could not forget this phone, so it is still paired. Try again.',LEAVE_DESK_FAULT='The desk had a problem and did not forget this phone. It is still paired: try again.';
const FORGOTTEN='This phone will ask for the code next time.';
test('PR11: a join answered 500 or above never shakes and never forgets the code; it shows its error, or the desk-fault line',()=>{
 for(const how of ['typed','qr']){
  for(const status of [500,502])assert.deepEqual(P().joinRefusal({status,error:undefined,how}),{line:JOIN_DESK_FAULT,shake:false,forget:false},status+how);
  assert.deepEqual(P().joinRefusal({status:500,error:JOIN_NOT_SAVED,how}),{line:JOIN_NOT_SAVED,shake:false,forget:false},how);
 }
 assert.deepEqual(P().joinRefusal({status:403,error:WRONG,how:'typed'}),{line:WRONG,shake:true,forget:false});
 assert.deepEqual(P().joinRefusal({status:undefined,error:undefined,how:'typed'}),{line:NOREACH,shake:true,forget:false});
});
test('deskLine: a run that failed on the desk (its body says failure) adds no line; any other refusal says its error, whatever the status',()=>{
 const {deskLine}=P(),F='The desk could not ask (502).';
 assert.equal(deskLine({error:'The desk could not follow that. It took too long.',failure:'timeout',retry:true},F),'','a failed run: its sentence is on the TV');
 assert.equal(deskLine({error:'Asking again would end the same way.',failure:'cutoff'},F),'');
 assert.equal(deskLine({error:'Bad gateway from a proxy.'},F),'Bad gateway from a proxy.','a 502 that is not a run says its error');
 for(const b of [null,undefined,{},{error:''},{error:3}])assert.equal(deskLine(b,F),F,JSON.stringify(b));
});
test("the profile queue hands each post's failure to its caller: Done that never lands says so, and the queue goes on (TL-8: Save moved to the TV)",async()=>{
 const raw=fs.readFileSync(PAGE,'utf8').replace(/\r\n/g,'\n'); // a Windows checkout has CRLF; the slice below ends at a bare newline
 assert.match(raw,/post\(\{ type: "ask\.cancel", id: handoff\.id \}\)\)\.catch\(\(\) => setMsg\("That did not reach the desk\."\)\)/,'Done says when it did not land');
 assert.doesNotMatch(raw,/type: "profile\.(save|discard)"/,'the phone posts neither profile.save nor profile.discard');
 const at=raw.indexOf('function inOrder()'),body=raw.slice(at,raw.indexOf('\n}\n',at)+2);
 const inOrder=new Function(body.replace(/: Promise<unknown>/g,'').replace(/\(job: \(\) => Promise<unknown>\)/,'(job)')+'\nreturn inOrder;')();
 const q=inOrder(),seen=[];
 await assert.rejects(q(async()=>{seen.push(1);throw new Error('offline');}),/offline/,'the caller sees its own failure');
 await q(async()=>{seen.push(2);});assert.deepEqual(seen,[1,2],'and the next post still goes, in order');
});
test('page.tsx never reads a meaning out of a 502: the body says whether the failure is on the desk',()=>{
 assert.doesNotMatch(code(PAGE),/status\s*[!=]==\s*502/);
});
test('PR11: leaveOutcome says forgotten only for a 2xx answer',()=>{
 assert.deepEqual(P().leaveOutcome({status:200,error:undefined}),{line:FORGOTTEN,forgotten:true});
 assert.deepEqual(P().leaveOutcome({status:500,error:LEAVE_NOT_SAVED}),{line:LEAVE_NOT_SAVED,forgotten:false});
 for(const status of [500,502])assert.deepEqual(P().leaveOutcome({status,error:undefined}),{line:LEAVE_DESK_FAULT,forgotten:false},String(status));
 assert.deepEqual(P().leaveOutcome({status:undefined,error:undefined}),{line:NOREACH,forgotten:false});
});
test('PR11: page.tsx forget() waits for the desk: leaveOutcome, reconnect only when forgotten, no empty handler, no forgotten line of its own',()=>{
 const src=code(PAGE);
 const at=src.indexOf('const forget =');assert(at>0,'forget() is there');
 const body=src.slice(at,src.indexOf('\n    };',at));
 assert.match(body,/leaveOutcome\(/);
 assert.match(body,/if \(\w+\.forgotten\)\s*reconnect\(\)/,'reconnect() only when forgotten');
 assert.equal((body.match(/reconnect\(\)/g)??[]).length,1);
 assert.doesNotMatch(body,/\(\) => \{\}/,'no empty handler');
 assert.doesNotMatch(src,/This phone will ask for the code next time/,'the line lives in panelFor.ts');
});

// ---- SW11 (scan-sweep optimize 2026-10-13): the phone's one status line is announced, as the Essay panel's notes are ----
test('SW11: the status line every handler writes to is a polite live region; the Essay panel keeps its alerts',()=>{
 const tree=code(PAGE);
 const status=tree.match(/<div className="pstatus"[^>]*>/);assert.ok(status,'the status line is drawn');
 assert.match(status[0],/role="status"/,'a screen reader hears "That did not reach the desk." as it is written');
 assert.match(status[0],/aria-live="polite"/);
 assert.equal((tree.match(/role="alert"/g)||[]).length,2,'unchanged: the Essay panel\'s two alerts');
});

// ---- PH-A/B (scan-sweep optimize Lane B 2026-10-13): the phone's name field, Linga's fields, End session ----
/** A slice of the page's source, comments removed, as TypeScript turned to JS: a harness for a handler without a browser. */
const pageJs=(src)=>ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.Preserve}}).outputText;
const pageSlice=(re,what)=>{const m=re.exec(code(PAGE));assert.ok(m,`${what} is in page.tsx`);return m[0];};
test('PH-LINGA: the Linga panel\'s typed fields are 16 px or more, as SW3 holds for the rest of the phone',()=>{
 const css=fs.readFileSync(path.join(SRC,'design/linga.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 const rule=ruleOf(css,'.linga-phone input, .linga-phone select, .linga-phone textarea');
 assert.ok(pxOf(rule,'font-size')>=16,'.linga-phone input, select, textarea carry a 16 px font-size (font: inherit alone is the phone\'s 15 px)');
});
test('PH-NAMEMAX: the phone name input cannot type past the desk\'s cap',()=>{
 const store=code(path.join(SRC,'lib/session/store.ts')),max=Number((/export const PROFILE_NAME_MAX = (\d+);/.exec(store)||[])[1]);
 assert.ok(max>0,'the desk\'s cap is found');
 const page=code(PAGE),mine=Number((/const NAME_MAX = (\d+);/.exec(page)||[])[1]);
 assert.equal(mine,max,'the page restates the desk\'s cap (the store is server-only and cannot be imported into the page)');
 assert.match(page,/placeholder="Name" maxLength=\{NAME_MAX\}/,'the profile name input carries maxLength={NAME_MAX}');
});
test('PH-NAMEORDER: the profile name posts go out one at a time, so a slow early post cannot land last',async()=>{
 const js=pageJs(pageSlice(/function inOrder\(\)[\s\S]*?\n\}\n/,'inOrder'));
 const inOrder=new Function(js+';return inOrder;')();
 // a server that applies a post when it ARRIVES; an earlier post is slower than a later one
 const run=async(queued)=>{
  const applied=[];let n=0;const want='Ema Novak'.split('').map((_,i)=>'Ema Novak'.slice(0,i+1));
  const post=(name)=>{const k=n++;return new Promise((res)=>setTimeout(()=>{applied.push(name);res();},(want.length-k)*3));};
  const q=queued?inOrder():(job)=>job();
  await Promise.all(want.map((name)=>q(()=>post(name))));
  return applied[applied.length-1];
 };
 assert.notEqual(await run(false),'Ema Novak','control: un-awaited posts land out of order and the draft keeps a prefix');
 assert.equal(await run(true),'Ema Novak','queued: the draft holds the name as typed');
 const page=code(PAGE);
 assert.match(page,/nameQueue\(\(\) => post\(\{ type: "profile\.draft", patch: \{ name: e\.target\.value \} \}\)\)/,'the Profile input posts through the queue');
 assert.match(page,/nameQueue\(\(\) => post\(\{ type: "ask\.cancel", id: handoff\.id \}\)\)/,'Done waits behind the name posts (TL-8: it closes the ask, never saves)');
});
test('PH-ENDTWICE (TL-11): the phone has no End session to tap twice - no endSession, no session.end post',()=>{
 const page=code(PAGE);
 assert.doesNotMatch(page,/endSession/);assert.doesNotMatch(page,/session\.end/);assert.doesNotMatch(page,/End session/);
});

// ---- Essay recert-2 L1-daniel-15-EM3-1 / L1-barbora-43-EM1-5: the sample paragraph is a placeholder, never a value
test('the Essay box starts and resets empty; the sample is only a placeholder; a paste into it yields exactly the pasted paragraphs',()=>{
 const src=fs.readFileSync(PAGE,'utf8');
 const fresh=/const FRESH_PARAS = (\[[^\]]*\]);/.exec(src);assert.ok(fresh,'FRESH_PARAS is where the test expects it');
 const FRESH=new Function(`return ${fresh[1]};`)();
 assert.deepEqual(FRESH,[''],'one empty paragraph (setEssay maps over it), no sample text');
 assert.match(src,/useState<string\[\]>\(FRESH_PARAS\)/,'the initial paras are the empty ones');
 assert.match(src,/setParas\(FRESH_PARAS\)/,'the reset uses the same empty ones');
 const sample=/const ESSAY_PLACEHOLDER = "([^"]+)";/.exec(src);assert.ok(sample&&sample[1].length>20,'the sample lives in a placeholder constant');
 assert.ok(!fresh[1].includes(sample[1].slice(0,20)),'the sample is not in the paras');
 assert.match(src,/<textarea[^>]*placeholder=\{ESSAY_PLACEHOLDER\}[^>]*value=\{essay\}/,'the textarea shows the sample as its placeholder');
 // onEssayPaste cut out and run against stubs
 const a=src.indexOf('const onEssayPaste'),e=src.indexOf('/** The whole piece to the TV',a);assert.ok(a>0&&e>a);
 const js=ts.transpileModule(src.slice(a,src.lastIndexOf('\n',e)),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const {paragraphsOf}=require(path.join(SRC,'lib/rules/essay.ts'));
 const run=(value,pasted)=>{
  const loaded=[];let prevented=false;
  const f=new Function('paragraphsOf','setSource','setPieceId','setPieceTitle','loadParagraphs',`${js}\nreturn onEssayPaste;`)(paragraphsOf,()=>{},()=>{},()=>{},(ps)=>loaded.push(ps));
  f({preventDefault(){prevented=true;},clipboardData:{getData:()=>pasted},currentTarget:{value,selectionStart:value.length,selectionEnd:value.length}});
  return {loaded,prevented};
 };
 const pasted='First paragraph of mine.\n\nSecond paragraph of mine.';
 for(const box of [FRESH[0],''])assert.deepEqual(run(box,pasted).loaded,[paragraphsOf(pasted)],'exactly the pasted paragraphs, nothing of the sample');
 assert.deepEqual(run(FRESH[0],pasted).loaded[0],['First paragraph of mine.','Second paragraph of mine.']);
 assert.equal(run('',pasted).prevented,true);
 assert.equal(run('','one line only').prevented,false,'a paste without a blank line is left to the browser');
 // reading an empty box stays refused
 assert.match(src,/disabled=\{busy \|\| notice !== null \|\| !essay\.trim\(\)\} onClick=\{paras\.length === 1 && pieceId \? \(\) => void readPiece\(true\) : analyseParagraph\}/,'an empty box cannot be sent');
});

test('a rewrite the desk accepted is written back into the phone paragraph; one it cannot place stays on the desk',()=>{
 const R=require(path.join(SRC,'app/phone/rewriteBack.ts'));
 const src=fs.readFileSync(PAGE,'utf8');
 const paras=['I like dogs. Dogs are good.','Cats sleep a lot. It is true.'];
 // once: written, and present in the text readPiece would send
 const a=R.writeRewriteBack(paras,'Cats sleep a lot.','Cats nap for most of the day.');
 assert.equal(a.written,true);assert.equal(a.line,'');
 assert.equal(a.paras[1],'Cats nap for most of the day. It is true.');
 assert.ok(a.paras.join('\n\n').includes('Cats nap for most of the day.'),'readPiece sends paras.join');
 assert.deepEqual(paras,['I like dogs. Dogs are good.','Cats sleep a lot. It is true.'],'the input is not mutated');
 // twice (in one paragraph or across two) or not at all: unchanged, plain line
 for(const [ps,orig] of [[['Dogs run. Dogs run.','x'],'Dogs run.'],[['Dogs run.','Dogs run. More.'],'Dogs run.'],[paras,'No such sentence.'],[paras,'']]){
  const b=R.writeRewriteBack(ps,orig,'Something else.');
  assert.equal(b.written,false);assert.deepEqual(b.paras,ps);assert.equal(b.line,R.REWRITE_STAYS_ON_DESK);
 }
 assert.match(R.REWRITE_STAYS_ON_DESK,/stays on the desk/);
 assert.match(R.rewriteStaysLine(3),/^3 rewrites stay on the desk/);
 // unchanged rewrite: a no-op
 const c=R.writeRewriteBack(paras,'Cats sleep a lot.','Cats sleep a lot.');
 assert.equal(c.paras,paras);assert.equal(c.line,'');
 // the page wires it: written on r.ok, counted when not, said before the read sends
 assert.match(src,/writeRewriteBack\(paras, onSentence\.text, rewrite\)/);
 assert.match(src,/setStranded\(\(k\) => k \+ 1\)/);
 assert.match(src,/stranded \? `\$\{rewriteStaysLine\(stranded\)\}/,'readPiece says it before sending');
 assert.match(src,/data-role="essay-rewrites-stay"/);
});
test('TL-2 pins: one join in flight, the field and Join disabled while it runs; a refused QR code is remembered and not posted again',()=>{
 const src=fs.readFileSync(PAGE,'utf8');
 assert.match(src,/if \(joining\.current\) return joining\.current;/,'a second call gets the first one\'s promise');
 assert.match(src,/\.finally\(\(\) => \{ joining\.current = null; setJoinBusy\(false\); \}\)/);
 assert.match(src,/placeholder="4-digit code" value=\{pin\} disabled=\{joinBusy\}/);
 assert.match(src,/data-signal="true" disabled=\{joinBusy\} onClick=\{\(\) => join\(\)\}/);
 assert.match(src,/if \(refusal\.forget\) \{ try \{ localStorage\.setItem\(REFUSED_QR, code\)/,'the refused QR code is remembered');
 assert.match(src,/localStorage\.getItem\(REFUSED_QR\) === q/);
 assert.match(src,/if \(!refusedBefore\) void join\(q, "qr"\)/,'a remembered code is not posted again');
});

// ---------------------------------------------------------------- TL-9: the page reads the ask, answers it, and says what http cannot do

test('TL-9: the phone page follows the ask - busy hands are re-checked, a reopened stream forgets what it saw, a Parent phone gets the banner',()=>{
 const src=code(PAGE);
 assert.match(src,/BANNER\[banner\]/,'the banner draws the panel words');
 assert.match(src,/data-role": "phone-banner"|data-role="phone-banner"/,'and is findable');
 assert.match(src,/setBanner\(step\.banner\)/,'the follow step sets it');
 assert.match(src,/if \(!connected\)\s*\{?\s*seen\.current = undefined/,'a stream that dropped goes to the open ask when it is back (D5)');
 assert.match(src,/\[s, role, screen, typingNow, shot, phase, holding\]/,'the follow effect runs again when the hands become free, so a deferred move is not waiting for the next session update');
 assert.match(src,/addEventListener\("focusout", look\)/,'a field let go is seen');
});

test('TL-9: every answer carries askId of the open ask, and a page with no ask sends what it always did',()=>{
 const src=code(PAGE);
 assert.match(src,/import \{ useSession, call as rawCall \} from "@\/tv\/useSession"/,'the raw call is wrapped on this page');
 assert.match(src,/const askId = s\?\.ask\?\.phase === "open" \? s\.ask\.id : undefined/);
 assert.match(src,/rawCall\(url, askId && body && typeof body === "object" \? \{ \.\.\.body, askId \} : body\)/,'the id rides in the body of every call');
 // behaviour: cut the wrapper out and run it against a stub
 const a=src.indexOf('const askId ='),b=src.indexOf('[askId]);',a)+'[askId]);'.length-1;
 const js=ts.transpileModule(src.slice(a,b+1).replace(/: unknown/g,''),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const make=(s)=>{const sent=[];const f=new Function('s','useCallback','rawCall',`${js}\nreturn call;`);return {call:f(s,(fn)=>fn,(u,b)=>{sent.push([u,b]);}),sent};};
 const m=make({ask:{id:'a7',phase:'open'}});m.call('/api/read',{image:'x'});m.call('/api/texts',null);
 assert.deepEqual(m.sent[0],['/api/read',{image:'x',askId:'a7'}]);assert.deepEqual(m.sent[1],['/api/texts',null],'a body that is not an object goes as it is');
 const none=make({ask:null});none.call('/api/read',{image:'x'});assert.deepEqual(none.sent[0],['/api/read',{image:'x'}],'no ask open: no askId');
 const sent=make({ask:{id:'a7',phase:'sent'}});sent.call('/api/read',{image:'x'});assert.deepEqual(sent.sent[0],['/api/read',{image:'x'}],'a sent ask is answered: nothing more to attach');
});

test('TL-9: no panel offers a subject select or a lens radio - the capture subject and the essay lens are lines read from the ask and the session',()=>{
 const src=code(PAGE);
 assert.doesNotMatch(src,/<select value=\{subject\}/,'no subject select');
 assert.doesNotMatch(src,/setSubject\b|setEtype\b/,'and no state to change them');
 assert.doesNotMatch(src,/name="etype"/,'no lens radio');
 assert.match(src,/const etype = s\?\.essayType \?\? "structure"/,'the lens is the session\'s');
 assert.match(src,/data-role="essay-lens">The TV chose the lens:/,'drawn as a line');
 assert.match(src,/data-role="capture-subject">The TV is waiting for a page of/);
});

test('TL-9 (D15): the camera and voice panels say the http limit; the words are one pair of constants',()=>{
 const src=code(PAGE),{HTTP_LIMIT}=P();
 assert.match(HTTP_LIMIT.camera,/http/);assert.match(HTTP_LIMIT.camera,/no camera/);assert.match(HTTP_LIMIT.voice,/http/);assert.match(HTTP_LIMIT.voice,/no microphone/);
 for(const s of Object.values(HTTP_LIMIT))assert.doesNotMatch(s,/[\u2014\u2013]/,'no dash in the words');
 assert.match(src,/setInsecure\(!window\.isSecureContext\)/,'the page asks the browser, once');
 const cam=(src.match(/\{HTTP_LIMIT\.camera\}/g)||[]).length,voice=(src.match(/\{HTTP_LIMIT\.voice\}/g)||[]).length;
 assert.ok(cam>=2,`the capture panel and the sheet snap say it (${cam})`);assert.ok(voice>=2,`the explain talk and the essay panel say it (${voice})`);
});

// ---------------------------------------------------------------- TL-12: Linga follows its asks

test('case 11 (TL-12): Linga\'s panel follows its reply, words and prefs asks by ask id; a Linga screen alone asks nothing',()=>{
 const {panelFor,follow,ASK_PANEL}=P();
 for(const k of ['reply','words','prefs']){
  assert.equal(ASK_PANEL[k],'linga',`${k} is Linga's panel`);
  assert.equal(panelFor(session({screen:'linga-talk',subject:'english',ask:askOf(k)})),'linga',`${k}: whichever Linga screen the TV is on`);
  assert.equal(panelFor(session({screen:'units',ask:askOf(k)})),'linga',`${k}: whatever the TV screen, the ask picks the panel`);
 }
 for(const sc of SCREENS.filter(x=>x.startsWith('linga')))assert.equal(panelFor(session({screen:sc,subject:'english'})),'stay',`${sc}: no ask, no move`);
 assert.equal(panelFor(session({screen:'tonight',subject:'english'})),'stay','Linga\'s home asks nothing');
 // a new ask id on the same screen moves a phone that went to another tab; the same ask ticking on does not
 const first=session({screen:'linga-talk',subject:'english',ask:askOf('reply',undefined,'r1')});
 const a=follow(undefined,first,at('tonight'));assert.equal(a.to,'linga');
 assert.equal(follow(a.key,{...first,timer:{running:true,left:1,phase:'work'}},at('point')).to,null,'the same ask ticking on leaves the tab alone');
 assert.equal(follow(a.key,{...first,ask:askOf('reply',undefined,'r2')},at('point')).to,'linga','the next turn is a new ask: the phone goes there again');
 assert.equal(follow(a.key,{...first,ask:askOf('words',undefined,'w1')},at('point')).to,'linga','and so is the words panel');
 // closed, the phone is moved nowhere
 assert.equal(follow(a.key,session({screen:'linga-talk',subject:'english'}),at('linga')).to,null);
 // busy hands defer the move and a Parent phone is told, as for every other ask
 assert.equal(follow(undefined,first,at('point',{busy:true})).to,null,'busy hands wait');
 assert.equal(follow(undefined,first,at('tonight',{role:'parent'})).banner,'linga','a Parent phone gets the banner');
});

test('case 12 (TL-12): panelFor holds no Linga cue of its own: it does not import lingaOwns',()=>{
 const src=code(PANEL);
 assert.doesNotMatch(src,/lingaOwns/,'the screen-keyed Linga cue is gone');
 assert.doesNotMatch(src,/key:\s*"linga"/);
});
