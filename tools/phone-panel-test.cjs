/**
 * The phone follows the TV. Every TV screen whose copy asks the learner to do something on the phone (snap,
 * type, paste, dictate, tell, answer, open...) moves the phone to the panel that does it - when the TV's screen
 * CHANGES into that hand-off, never on a same-screen update, so a tab the learner picked stays picked.
 *
 * The hand-off screens are DERIVED from the TV source, not listed: the TV's dispatchers (app/tv/page.tsx,
 * maths/MathsTV.tsx, essay/EssayTV.tsx; Linga's screens through lingaOwns) name the component that draws each
 * screen, and a screen is a hand-off when that component - or a top-level helper of its file it reaches - asks
 * for a phone action in its (comment-stripped) copy, or carries Linga's on-your-phone badge.
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

// ---------------------------------------------------------------- sessions

const page={id:'p1',subject:'maths',title:'Sheet one',img:'',w:100,h:100,items:[{n:1,key:'k1',text:'x + 1 = 2',band:[0,10],cy:5}]};
const set=(marked)=>({topic:'linear-equations',marked,items:[{n:1,question:'x + 1 = 2',verdict:marked?'unsure':undefined}]});
function session(patch={}){
 return {joined:true,subject:'maths',screen:'units',awaiting:null,pages:[],pageIx:0,practice:null,jobs:{},conversation:null,draft:null,essayType:null,
  timer:{running:false,left:1500,phase:'work'},...patch};
}
/** The phone: where it is and whether the learner's hands are on it (typing, a shot held, recording). */
const at=(panel='tonight',patch={})=>({panel,role:'student',busy:false,...patch});

/**
 * For each derived hand-off screen: the state in which the TV makes the ask, and the phone panel that does it.
 * `from` is the session the TV comes from and the panel the learner had picked there.
 */
const JOINED_FROM={s:session({screen:'units'}),panel:'tonight'};
const LINGA={s:session({screen:'linga-talk'}),panel:'linga'};
const FIXTURES={
 landing:{s:session({joined:false,screen:'landing'}),panel:'join',from:JOINED_FROM,why:'Open the address on your phone (the session ended: back to the code)'},
 pair:{s:session({joined:false,screen:'pair'}),panel:'join',from:JOINED_FROM,why:'Scan, or open ... on your phone and type the code'},
 joined:{s:session({screen:'joined'}),panel:'joined',from:{s:session({joined:false,screen:'pair'}),panel:'join'},why:'Snap the page on the phone - a fresh join lands on the confirmation'},
 profile:{s:session({screen:'profile',draft:{id:'new',name:''}}),panel:'profile',why:"Type the name on the phone's Profile tab"},
 tonight:{s:session({screen:'tonight',awaiting:'maths'}),panel:'capture',why:'Waiting for the Math Buddy page. Snap it on the phone'},
 practice:{s:session({screen:'practice',practice:set(false)}),panel:'practice',why:'snap the whole sheet with the phone'},
 sheet:{s:session({screen:'sheet',practice:set(true)}),panel:'practice',why:'Tell the desk on the phone how you got there'},
 walk:{s:session({screen:'walk',practice:set(true)}),panel:'practice',why:'Tell the desk on the phone how you got there'},
 page:{s:session({screen:'page',pages:[page],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'p1',error:'x',startedAt:0}}}),panel:'capture',why:'The desk could not read this page. Snap it again on the phone'},
 essaytype:{s:session({screen:'essaytype',subject:'essay'}),panel:'paste',why:'Paste, type or dictate one paragraph on the phone'},
 sentence:{s:session({screen:'sentence',subject:'english',english:null}),panel:'say',why:'Say one sentence on your phone (nothing checked yet)'},
 forensic:{s:session({screen:'forensic',subject:'essay'}),panel:'paste',why:'Rewrite on my phone'},
 essayplan:{s:session({screen:'essayplan',subject:'essay'}),panel:'paste',why:'Say it on the phone: the plan slot is sent from the Essay tab'},
};
for(const sc of SCREENS)if(sc.startsWith('linga'))FIXTURES[sc]={s:session({screen:sc,subject:'english'}),panel:'linga',why:'Linga: answer on your phone',linga:true};
/** Hand-offs the TV makes that no phone panel does: the phone stays, and the gap is named. */
const NO_PANEL={lesson:'circle on the phone to ask about this frame - no phone panel circles a lesson frame'};

/** The phone after the TV moves from `from` to `to`: the panel it shows once both renders have run. */
function walk(from,to){
 const {follow}=P();
 const a=follow(undefined,from.s,at(from.panel));const p1=a.to??from.panel;
 const b=follow(a.key,to,at(p1));return b.to??p1;
}
/** Linga's ten screens are one hand-off (one owner, one panel): counted once. */
const ROWS=()=>{const r=Object.entries(FIXTURES).filter(([,f])=>!f.linga);const l=Object.entries(FIXTURES).find(([,f])=>f.linga);return l?[...r,['linga-*',l[1]]]:r;};

// ---------------------------------------------------------------- cases

test('case 1: the hand-off screens are derived from the TV source, and every one is decided',()=>{
 console.log(`# derived hand-off screens (${HANDOFF_SCREENS.length}): ${HANDOFF_SCREENS.join(', ')}`);
 assert.ok(HANDOFF_SCREENS.length>=10,'the scan finds the TV\'s phone asks');
 const decided=new Set([...Object.keys(FIXTURES),...Object.keys(NO_PANEL)]);
 assert.deepEqual(HANDOFF_SCREENS.filter(sc=>!decided.has(sc)),[],'a TV screen that asks for the phone must be given its panel here');
 assert.deepEqual([...decided].filter(sc=>!HANDOFF_SCREENS.includes(sc)),[],'no hand-written hand-off the TV source does not make');
});

test('case 2: every hand-off screen maps to the panel that does what it asks',()=>{
 const {panelFor}=P();
 for(const [sc,f] of Object.entries(FIXTURES))assert.equal(panelFor(f.s),f.panel,`${sc}: ${f.why}`);
 for(const sc of Object.keys(NO_PANEL))assert.equal(panelFor(session({screen:sc,lessonPaused:true})),'stay',`${sc}: ${NO_PANEL[sc]}`);
 assert.equal(panelFor(session({screen:'tonight',subject:'english'})),'linga','Linga\'s Tonight is Linga\'s (lingaOwns)');
});

test('case 3: a screen that asks nothing of the phone maps to "stay"',()=>{
 const {panelFor}=P();
 for(const sc of SCREENS.filter(x=>!HANDOFF_SCREENS.includes(x)))assert.equal(panelFor(session({screen:sc})),'stay',sc);
 assert.equal(panelFor(session({screen:'tonight'})),'stay','Tonight with no page asked for asks nothing yet');
 assert.equal(panelFor(session({screen:'page',pages:[page]})),'stay','a page that read is the TV\'s to show');
 assert.equal(panelFor(session({screen:'pair'})),'stay','a joined phone is not sent back to the code');
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

test('case 5 GUARD: a tab the learner picks survives every same-screen update',()=>{
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
 // walking the marked set is one hand-off: sheet -> walk does not pull the learner back
 const k2=follow(undefined,FIXTURES.sheet.s,at('practice')).key;
 assert.equal(follow(k2,FIXTURES.walk.s,at('tonight')).to,null,'sheet -> walk leaves the learner where they went');
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

test('case 7 GUARD: typing, a shot held unsent or a recording is never taken away; the hand-off is spent',()=>{
 const {follow}=P();
 const k=follow(undefined,session({screen:'units'}),at('say')).key;
 const s1=follow(k,FIXTURES.essaytype.s,at('say',{busy:true}));
 assert.equal(s1.to,null,'busy on Say it: the phone stays');
 assert.equal(follow(s1.key,FIXTURES.essaytype.s,at('say')).to,null,'hands free again, same screen: not pulled away later');
});

test('case 8: the Parent role is never moved; arrival never opens the camera unasked',()=>{
 const {follow}=P();
 const k=follow(undefined,session({screen:'units'}),at('parent',{role:'parent'})).key;
 for(const [sc,f] of Object.entries(FIXTURES))if(f.s.joined)assert.equal(follow(k,f.s,at('parent',{role:'parent'})).to,null,sc);
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
 assert.equal(panelFor(session({screen:'tonight',awaiting:'maths'})),'capture');
 assert.equal(panelFor(session({screen:'tonight',awaiting:'english'})),'capture');
 // an essay wait: the Essay panel, from a phone that has joined, and from one on another tab
 const waiting=session({screen:'tonight',subject:'essay',awaiting:'essay'});
 assert.equal(panelFor(waiting),'paste','the TV waiting for an essay page: Essay panel, not Capture');
 assert.equal(walk(JOINED_FROM,waiting),'paste');
 assert.equal(follow(undefined,waiting,at('join')).to,'paste','a join while the TV waits for an essay lands on the Essay panel (no camera to open)');
 // an essay page whose read failed (a page from before this change) is not asked for again by camera
 const epage={...page,id:'e1',subject:'essay'};
 const unread=session({screen:'page',subject:'essay',pages:[epage],jobs:{read:{id:'j2',kind:'read',phase:'failed',key:'e1',error:'x',startedAt:0}}});
 assert.equal(panelFor(unread),'paste','an unread essay page: Essay panel, not Capture');
 assert.equal(panelFor(session({screen:'page',pages:[page],jobs:{read:{id:'j1',kind:'read',phase:'failed',key:'p1',error:'x',startedAt:0}}})),'capture','a maths page that would not read is still snapped again');
 // the phone page never offers Capture with an essay anywhere
 assert.ok(!['capture'].includes(panelFor(session({screen:'essaytype',subject:'essay'}))),'the lens home is the Essay panel');
});

test('case 11 (W3): the capture panel no longer offers Essay Master - not in the subject list, not among the samples',()=>{
 const src=code(PAGE);
 const capture=src.slice(src.indexOf('{screen === "capture" && ('),src.indexOf('{screen === "practice" && s'));
 const options=[...capture.matchAll(/<option value="(\w+)">/g)].map(m=>m[1]);
 assert.deepEqual(options,['maths','english'],'the capture subject list is Math Buddy and Linga');
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
 assert.match(src,/camWanted = screen === "capture" \|\| \(screen === "practice" && !!s\?\.practice && !s\.practice\.marked && route === "snap"\)/);
 // the box's own cap is the rule's: the one number
 const rules=fs.readFileSync(path.join(SRC,'lib/rules/maths.ts'),'utf8');
 assert.match(rules,/export const TYPED_ANSWER_MAX = 40;/);assert.match(src,/TYPED_ANSWER_MAX/);
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
 assert.equal(panelFor(session({screen:'essayplan',subject:'essay'})),'paste');
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
