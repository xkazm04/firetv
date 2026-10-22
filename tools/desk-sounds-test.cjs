/**
 * The TV's effects and music (desk/src/lib/desk/sounds.ts, owner picks of audition A1): which cue a session change sounds,
 * and which theme plays under a screen. A cue marks only what the screen already shows; the first session sounds nothing;
 * music plays on the desk home and the break only. The assets each cue and theme names exist in desk/public/audio.
 * Run with npm test in desk/ (directly: node tools/desk-sounds-test.cjs). No model is called.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-sounds-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;
const src=(f)=>path.join(root,'src',f);
const store=require(src('lib/session/store.ts'));
const {cueBetween,musicFor}=require(src('lib/desk/sounds.ts'));
after(()=>{clearInterval(globalThis.__desk?.ticker);fs.rmSync(data,{recursive:true,force:true});});

const base=()=>({...store.fresh(),joined:true});
const at=(screen,extra={})=>({...base(),screen,...extra});
const hint=(stage,h1,h2)=>({key:'k',problem:'p',stage,hint1:h1?{hint:h1,next:''}:null,hint2:h2?{hint:h2,next:''}:null,askedQ:''});
const walk=(ix,verdicts)=>at('walk',{walkIx:ix,practice:{items:verdicts.map((verdict,i)=>({n:i+1,question:'q',verdict}))}});

test('the first session the TV sees sounds nothing', () => {
  assert.equal(cueBetween(null,at('break')),undefined);
  assert.equal(cueBetween(undefined,walk(0,['right'])),undefined);
});

test('a phone joining sounds the welcome, once', () => {
  assert.equal(cueBetween({...base(),joined:false},base()),'paired');
  assert.equal(cueBetween(base(),base()),undefined);
});

test('the break sounds as it begins, not on every tick of it', () => {
  assert.equal(cueBetween(at('tonight'),at('break')),'break');
  assert.equal(cueBetween(at('break'),at('break')),undefined);
});

test('a hint card sounds when its text lands, and again for the second stage', () => {
  assert.equal(cueBetween(at('hint',{hint:hint(1,null)}),at('hint',{hint:hint(1,'Which quantity is unknown?')})),'hint');
  const one=at('hint',{hint:hint(1,'a')});
  assert.equal(cueBetween(one,one),undefined);
  assert.equal(cueBetween(one,at('hint',{hint:hint(2,'a','b')})),'hint');
  assert.equal(cueBetween(at('tonight'),at('hint',{hint:null})),undefined, 'an empty hint card is still on its way');
});

test('the walk sounds the verdict the card already wears', () => {
  const v=['right','wrong','unsure',undefined];
  assert.equal(cueBetween(at('sheet'),walk(0,v)),'right');
  assert.equal(cueBetween(walk(0,v),walk(1,v)),'again');
  assert.equal(cueBetween(walk(1,v),walk(2,v)),undefined, 'unsure has no sound');
  assert.equal(cueBetween(walk(2,v),walk(3,v)),undefined, 'an unmarked item has no sound');
  assert.equal(cueBetween(walk(0,v),walk(0,v)),undefined, 'staying on a card is not a new verdict');
});

test('no verdict sounds off the walk: withholding holds', () => {
  const v=['right'];
  assert.equal(cueBetween(at('sheet',{practice:{items:[{n:1,question:'q',verdict:'right'}]}}),at('practice',{practice:{items:[{n:1,question:'q',verdict:'right'}]},walkIx:0})),undefined);
  assert.equal(cueBetween(walk(0,v),at('sheet',{practice:walk(0,v).practice})),undefined);
});

test('music is the home and the break only; the modules are silent', () => {
  assert.equal(musicFor(at('landing')),'landing');
  assert.equal(musicFor(at('break')),'break');
  for (const s of ['tonight','hint','walk','linga','linga-talk','forensic','writing','paper']) assert.equal(musicFor(at(s)),undefined,s);
});

test('every cue and theme has its file', () => {
  for (const c of ['select','back','paired','hint','right','again','break']) assert.ok(fs.existsSync(path.join(root,'public/audio/sfx',`${c}.mp3`)),c);
  for (const t of ['landing','break']) assert.ok(fs.existsSync(path.join(root,'public/audio/music',`${t}.mp3`)),t);
});
