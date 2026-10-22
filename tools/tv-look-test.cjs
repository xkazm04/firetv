/**
 * Which look a TV wait is drawn in (desk/src/tv/look.ts): before the session arrives (the look this browser remembered, else
 * neutral), on the landing (paper), on each module's own screens (Math Buddy, Linga, Essay Master), and while a page of Linga's or
 * Essay Master's subject is being read, which the On Air shell would draw as its grey page screen. Plus the remembered look: a
 * module's or the paper desk's, never a stored junk value, never changed by a screen the shell draws. Pure: no DOM, no server, no
 * model. The files that draw it (app/tv/page.tsx, tv/LookWait.tsx, design/loading-look.css) are pinned by what they import and
 * say, as a source check. Run with npm test in desk/ (directly: node tools/tv-look-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const {src}=require('./ts-load.cjs');
const L=require(path.join(src,'tv/look.ts'));
const read=(f)=>fs.readFileSync(path.join(src,f),'utf8');

const page=(subject)=>({id:'p1',subject,title:'t',img:'',w:1,h:1,items:[]});
function session(patch={}){
 return {subject:'maths',screen:'landing',focus:0,viewer:'tv',learner:{id:'ema',name:'Ema'},pages:[],pageIx:0,itemIx:0,reading:false,hint:null,lesson:null,
  english:null,essay:null,practice:null,topic:null,...patch};
}

test('before the session arrives the wait takes the remembered look, else neutral',()=>{
 assert.equal(L.lookOf(null),'neutral');
 for(const l of ['paper','maths','linga','essay']) assert.equal(L.lookOf(null,l),l);
});

test('a stored value is a look or neutral',()=>{
 for(const l of L.LOOKS) assert.equal(L.parseLook(l),l);
 for(const junk of [null,undefined,'',42,'MATHS','legacy',{},'../x']) assert.equal(L.parseLook(junk),'neutral');
});

test('the landing is paper; each module draws its own screens in its own look',()=>{
 assert.equal(L.lookOf(session({screen:'landing'}),'essay'),'paper');
 for(const screen of ['tonight','topics','prepare','practice','sheet','walk','calendar','worked','paper']) assert.equal(L.lookOf(session({screen,subject:'maths'})),'maths',screen);
 for(const screen of ['essaytype','essayplan','forensic','playbook','xray','workroom']) assert.equal(L.lookOf(session({screen,subject:'essay'})),'essay',screen);
 for(const screen of ['linga','linga-talk']) assert.equal(L.lookOf(session({screen,subject:'english'})),'linga',screen);
 assert.equal(L.lookOf(session({screen:'tonight',subject:'english'})),'linga','Linga keeps its own Tonight');
 assert.equal(L.lookOf(session({screen:'page',subject:'maths',pages:[page('maths')]})),'maths','a maths page is Math Buddy\'s');
});

test('a screen only the On Air shell draws is neutral: the shell is not a module',()=>{
 for(const screen of ['pair','joined','learner','profile','recap','break','headtohead','sentence','writing']) assert.equal(L.lookOf(session({screen,subject:'english'}),'maths'),'neutral',screen);
 assert.equal(L.lookOf(session({screen:'units',subject:'essay'})),'neutral');
});

test('a page of Linga\'s or Essay Master\'s subject being read waits in that look; a settled page, or Math Buddy\'s, does not',()=>{
 const reading=(sub,patch={})=>session({screen:'page',subject:sub,pages:[page(sub)],reading:true,...patch});
 assert.equal(L.lookOfWait(reading('english')),'linga');
 assert.equal(L.lookOfWait(reading('essay')),'essay');
 assert.equal(L.lookOfWait(reading('maths')),null,'Math Buddy\'s page screen has its own reading state');
 assert.equal(L.lookOfWait(reading('english',{reading:false})),null,'read: the page screen draws');
 assert.equal(L.lookOfWait(reading('english',{screen:'hint'})),null);
 assert.equal(L.lookOfWait(null),null);
 // the page's subject wins over the desk's current one
 assert.equal(L.lookOfWait(session({screen:'page',subject:'maths',pages:[page('essay')],reading:true})),'essay');
});

test('what is remembered: a module or the paper desk; the shell and an absent session change nothing',()=>{
 assert.equal(L.lookToRemember(session({screen:'topics'}),'neutral'),'maths');
 assert.equal(L.lookToRemember(session({screen:'landing'}),'maths'),'paper');
 assert.equal(L.lookToRemember(session({screen:'recap'}),'essay'),'essay');
 assert.equal(L.lookToRemember(null,'linga'),'linga');
 assert.equal(L.lookToRemember(session({screen:'page',subject:'english',pages:[page('english')],reading:true}),'maths'),'linga');
});

test('every look has a fixed wait line, none carrying learner text',()=>{
 for(const l of L.LOOKS){assert.ok(L.WAIT_LINE[l]&&L.WAIT_LINE[l].length<40,l);assert.match(L.WAIT_LINE[l],/^Opening [A-Za-z ]+…$/);}
 assert.equal(L.READING_LINE,'Reading the page…');
});

test('the TV page draws every wait through the look, and the look module reads no engine, store or Node built-in',()=>{
 const tv=read('app/tv/page.tsx');
 assert.match(tv,/!s \? <LookWait look=\{look\} line=\{WAIT_LINE\[look\]\} \/>/,'no session: the remembered look, not the shell');
 assert.match(tv,/lookOfWait\(s\) \? <LookWait/,'a page being read in Linga or Essay Master waits in its look');
 assert.ok(!/<div className="grid" \/>\s*<div className="safe">\{s \?/.test(tv),'the shell no longer draws the session-less stage');
 const look=read('tv/look.ts');
 const froms=[...look.matchAll(/from "([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(froms,['@/lib/session/store','@/tv/keys'],'it imports the session type and the key rows, nothing else');
 assert.match(read('app/globals.css'),/loading-look\.css/);
});
