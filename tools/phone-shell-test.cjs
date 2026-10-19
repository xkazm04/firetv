/**
 * TL-10: the phone shell fits 360-414 px (TV-led design, section 4). The ten tabs are gone: a 48 px top strip, one
 * body, and a bar of at most three items, 12 characters a label, one line each. barItems/primaryLabel/moreRows
 * (app/phone/phoneBar.ts) are pure and tested as logic; the CSS (globals.css) and the page source (page.tsx) are pinned.
 * No store, no route, no model. Run: node tools/phone-shell-test.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const ts=require('./ts-load.cjs').ts();
const SRC=path.resolve(__dirname,'../desk/src');
const BAR=path.join(SRC,'app/phone/phoneBar.ts'),PAGE=path.join(SRC,'app/phone/page.tsx');
const B=()=>require(BAR);
/** A source with its comments removed (TypeScript's own parser and printer), so a pin never matches a comment. */
const code=(file)=>{const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);return ts.createPrinter({removeComments:true}).printFile(sf);};
/** The same, on one line with every run of white space a single space: the printer breaks statements across lines. */
const flat=(file)=>code(file).replace(/\s+/g,' ');
const css=()=>fs.readFileSync(path.join(SRC,'app/globals.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const ruleOf=(sel)=>{const i=css().indexOf(`${sel} {`);assert.ok(i>=0,`${sel} is styled`);const c=css();return c.slice(i,c.indexOf('}',i));};
const KINDS=['name','page','sheet','answers','question','explain','second','paper','paragraph','rewrite','slot','sentence','reply','words','prefs','private'];
const CTXS=[{},{snap:true},{holding:true},{paragraphs:5},{paragraphs:1},{snap:true,holding:true,paragraphs:9}];

test('TL-10: the AskKind list here is the store\'s',()=>{
 const m=code(path.join(SRC,'lib/session/store.ts')).match(/export type AskKind = ([^;]+);/);
 assert.deepEqual([...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]).sort(),[...KINDS].sort());
});

test('TL-10: not joined the bar is empty; joined with no ask it is Recap and More',()=>{
 const {barItems}=B();
 assert.deepEqual(barItems({joined:false,ask:null}),[]);
 assert.deepEqual(barItems({joined:false,ask:{kind:'page',phase:'open'}}),[],'an ask cannot put a bar on a phone that has not joined');
 assert.deepEqual(barItems({joined:true,ask:null}).map(i=>i.label),['Recap','More']);
});

test('TL-10: an ask open is Cancel and its primary; an ask sent is a disabled Sent and More',()=>{
 const {barItems}=B();
 const open=barItems({joined:true,ask:{kind:'paragraph',phase:'open'},primary:{paragraphs:5}});
 assert.deepEqual(open.map(i=>[i.id,i.label]),[['cancel','Cancel'],['primary','Read all']]);
 const sent=barItems({joined:true,ask:{kind:'paragraph',phase:'sent'}});
 assert.deepEqual(sent.map(i=>[i.id,i.label,!!i.disabled]),[['primary','Sent',true],['more','More',false]]);
});

test('TL-10: in every state the bar holds three items or fewer and every label is 12 characters or fewer',()=>{
 const {barItems,BAR_MAX_ITEMS,BAR_MAX_LABEL}=B();
 assert.equal(BAR_MAX_ITEMS,3);assert.equal(BAR_MAX_LABEL,12);
 let n=0;
 for(const joined of [false,true])for(const phase of [null,'open','sent'])for(const kind of KINDS)for(const primary of CTXS)for(const primaryOff of [false,true]){
  const items=barItems({joined,ask:phase?{kind,phase}:null,primary,primaryOff});n++;
  assert.ok(items.length<=3,`${joined}/${phase}/${kind}: ${items.length} items`);
  for(const i of items)assert.ok(i.label.length>0&&i.label.length<=12,`"${i.label}" (${kind}) is 12 characters or fewer`);
 }
 assert.ok(n>500);
});

test('TL-10: the primary label of each ask, from the design table',()=>{
 const {primaryLabel}=B();
 const want={name:'Done',page:'Use page',sheet:'Send sheet',answers:'Send',question:'Ask',explain:'Send',second:'Send',paper:'Send',paragraph:'Read this',rewrite:'Send',slot:'Send',sentence:'Check',reply:'Send',words:'Send',prefs:'Save',private:'Done'};
 for(const k of KINDS)assert.equal(primaryLabel(k),want[k],k);
 assert.equal(primaryLabel('page',{snap:true}),'Snap');assert.equal(primaryLabel('sheet',{snap:true}),'Snap');
 assert.equal(primaryLabel('explain',{holding:true}),'Listening');
 assert.equal(primaryLabel('paragraph',{paragraphs:5}),'Read all');assert.equal(primaryLabel('paragraph',{paragraphs:1}),'Read this');
 assert.equal(primaryLabel('answers',{snap:true,holding:true}),'Send','a context that does not belong to the kind changes nothing');
});

test('TL-10: More holds Recap, This week, Tonight\'s list, Forget this desk (a phone\'s own) and how the two work together',()=>{
 const {moreRows}=B();
 assert.deepEqual(moreRows(true).map(r=>r.label),['Recap','This week','Tonight\'s list','Forget this desk','How the TV and phone work together']);
 assert.ok(!moreRows(false).some(r=>r.id==='forget'),'a guest has nothing to forget');
});

test('TL-10: .pnav button is one line, shrinks (min-width 0), 48 px tall at least, 14 px / 600, 12 px side padding',()=>{
 const r=ruleOf('.pnav button');
 assert.match(r,/flex: 1 1 0;/);assert.match(r,/min-width: 0;/);assert.match(r,/min-height: 48px;/);
 assert.match(r,/font-size: 14px;/);assert.match(r,/font-weight: 600;/);
 assert.match(r,/white-space: nowrap;/);assert.match(r,/overflow: hidden;/);assert.match(r,/text-overflow: ellipsis;/);
 assert.match(r,/padding: 0 12px;/);
});

test('TL-10: the bar is sticky, 56 px plus the safe area; the strip is sticky and 48 px; the 40/60 split is Cancel and its primary',()=>{
 const bar=ruleOf('.pnav');
 assert.match(bar,/position: sticky;/);assert.match(bar,/bottom: 0;/);assert.match(bar,/min-height: 56px;/);assert.match(bar,/padding-bottom: env\(safe-area-inset-bottom\);/);
 const top=ruleOf('.ptop');
 assert.match(top,/position: sticky;/);assert.match(top,/top: 0;/);assert.match(top,/height: 48px;/);
 assert.match(ruleOf('.ptop .link'),/text-overflow: ellipsis;/);
 assert.match(css(),/\.pnav button\[data-bar="cancel"\] \{ flex: 2 1 0; \}/);
 assert.match(css(),/\.pnav button\[data-bar="cancel"\] \+ button\[data-bar="primary"\] \{ flex: 3 1 0; \}/);
});

test('TL-10: the More sheet is 70vh at most, scrolls, and its rows are 56 px and full width',()=>{
 const s=ruleOf('.pmore-sheet');assert.match(s,/max-height: 70vh;/);assert.match(s,/overflow-y: auto;/);
 const r=ruleOf('.pmore-row');assert.match(r,/height: 56px;/);assert.match(r,/width: 100%;/);
});

test('TL-10: page.tsx has no tab list, no role switch, and the bar comes from barItems',()=>{
 const p=code(PAGE);
 assert.doesNotMatch(p,/\["capture", "Capture"\]/,'the ten tabs are gone');
 assert.doesNotMatch(p,/Point & ask"\], \["linga"/);
 assert.doesNotMatch(p,/className="who"/,'the Student/Parent toggle left the strip');
 assert.doesNotMatch(p,/>Student</);
 assert.match(p,/barItems\(\{/);assert.match(p,/items\.map\(/);
 assert.match(p,/<div className="pnav"/);
});

test('TL-10: the strip is a link dot and one line, TV_WORDS after "TV:"',()=>{
 const p=code(PAGE);
 assert.match(p,/className="dot" data-live=/);
 assert.match(p,/· TV: \{TV_WORDS\[s\.screen\]/);
});

test('TL-10: joined with no ask the body is the idle card with the design\'s words and no button',()=>{
 const p=code(PAGE);
 const i=p.indexOf('data-role="phone-idle"');assert.ok(i>0);
 const card=p.slice(i,p.indexOf('</div>',i));
 assert.match(card,/Look at the TV\. It will ask this phone when it needs a photo, your words or your voice\./);
 assert.doesNotMatch(card,/<button/);
 assert.match(p,/const idle = !!s\?\.joined && !handoff && !peek;/);
 assert.match(p,/Not \{s\.learner\.name\}\? On the TV's desk/,'the switch line moved to the How view, off the idle card');
});

test('TL-10: the panels show only before a join or with an ask open',()=>{
 assert.match(code(PAGE),/const showPanels = \(!s\?\.joined \|\| asking\) && !peek;/);
});

test('TL-10: Cancel posts ask.cancel with the ask\'s id; the primary of private posts the same',()=>{
 const p=flat(PAGE);
 assert.match(p,/id === "cancel" && handoff\) void post\(\{ type: "ask\.cancel", id: handoff\.id \}\)/);
});

test('TL-10: the page posts no timer.start and no timer.pause (the clock is the TV\'s alone)',()=>{
 const p=flat(PAGE);
 assert.doesNotMatch(p,/timer\.start/);assert.doesNotMatch(p,/timer\.pause/);assert.doesNotMatch(p,/\btimer\./);
});

test('TL-10: More closes by a tap outside and by popstate; Forget this desk is a row of it, moved off the old panel',()=>{
 const p=flat(PAGE);
 assert.match(p,/addEventListener\("popstate"/);assert.match(p,/removeEventListener\("popstate"/);
 assert.match(p,/history\.pushState\(\{ pmore: 1 \}/);
 assert.match(p,/className="pmore" role="presentation" onClick=\{closeMore\}/);
 assert.match(p,/moreRows\(s\?\.viewer === "phone"\)/);
 assert.match(p,/id === "forget"\) \{ void forget\(\); return; \}/);
 assert.match(p,/s\?\.viewer === "phone" && <button key=\{r\.id\} className="pmore-row" data-row="forget"/,'the row is a phone\'s own');
 assert.match(code(BAR),/Forget this desk/);
});

test('TL-10: Recap and This week are read-only views: opening them is a state change, never a post',()=>{
 const p=flat(PAGE);
 const fn=p.slice(p.indexOf('const pickMore'),p.indexOf('const primary'));
 assert.match(fn,/openPanel\(|openView\(/);assert.doesNotMatch(fn,/post\(/);assert.doesNotMatch(fn,/call\(/);
 assert.match(p,/if \(id === "recap"\) openPanel\("parent"\)/);assert.match(p,/else if \(id === "recap"\) openPanel\("parent"\);/);
});
