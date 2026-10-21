/**
 * The writing episode's offline rules: start > write > coached > revised > finished, a coaching note that never holds a
 * model sentence, and a finished episode landing in the learner record. A stub engine only; a disposable data
 * directory, never desk/data. Run with npm test in desk/ (directly: node tools/writing-rules-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
process.env.DESK_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'desk-writing-rules-'));
const W=(f)=>require(path.join(root,'src/lib/writing',f+'.ts'));
const E=W('episode'),C=W('coach'),S=W('save'),P=W('prompts');
const L=require(path.join(root,'src/lib/session/learners.ts'));
const RE=require(path.join(root,'src/lib/rules/essay.ts'));

const DRAFT='I think screens should go away before bed. They are bright and they are fun.';
const REVISED='I think screens should go away before bed. A 2019 study of 1,000 teenagers found screen users fell asleep 30 minutes later, because the light keeps the brain awake.';
// a stub engine (the api/writing/coach route's failing-engine door is the 'down' case below): records what it was asked, answers what the test says
let said,asked=[];
const ask=(req)=>{asked.push(req);return Promise.resolve({json:{note:said}});};

test('prompts are age-fit and found by id',()=>{
  assert.ok(P.promptsFor('young').length>=2&&P.promptsFor('teen').length>=2);
  assert.ok(P.promptsFor('young').every(p=>p.band!=='teen'));
  assert.equal(P.promptById('pet').id,'pet');assert.equal(P.promptById('nope'),undefined);
});

test('an episode moves start > write > coached > revised > finished, and no step skips',()=>{
  let r=E.pick(E.START,'screens');assert.ok(r.ok);assert.equal(r.episode.stage,'write');
  assert.equal(E.coached(E.START,DRAFT,'n').ok,false,'cannot coach before a prompt');
  assert.equal(E.pick(r.episode,'pet').ok,false,'cannot pick twice');
  assert.equal(E.pick(E.START,'nope').ok,false);
  assert.equal(E.coached(r.episode,'Too short.','n').ok,false,'one sentence is not a paragraph');
  assert.equal(E.coached(r.episode,'   ','n').ok,false);
  r=E.coached(r.episode,DRAFT,'a note');assert.ok(r.ok);assert.equal(r.episode.stage,'coached');
  assert.equal(E.finished(r.episode,1).ok,false,'cannot finish unrevised');
  assert.equal(E.revised(r.episode,DRAFT).ok,false,'an unchanged paragraph is not a revision');
  r=E.revised(r.episode,REVISED);assert.ok(r.ok);assert.equal(r.episode.stage,'revised');
  r=E.finished(r.episode,123);assert.ok(r.ok);assert.equal(r.episode.stage,'finished');assert.equal(r.episode.finishedAt,123);
  assert.equal(E.revised(r.episode,REVISED+' More.').ok,false,'a finished episode takes no more steps');
});

test('the coaching never contains a full model sentence',async()=>{
  const prompt=P.promptById('screens'),own=RE.splitSentences(DRAFT).map(s=>s.text);
  // a model that hands over a sentence: the guard replaces it with the code line
  said='Screens keep teenagers awake because the blue light delays the release of melatonin in the evening.';
  let r=await C.coachNote(DRAFT,'teen',prompt,ask);
  assert.equal(r.source,'code');assert.equal(r.note,C.codeNote(DRAFT,'teen'));
  // a model that copies the learner's own run is refused too
  said='They are bright and they are fun, so say that again.';
  assert.equal((await C.coachNote(DRAFT,'teen',prompt,ask)).source,'code');
  // a note about the writing passes through
  said='Your claim has nothing a reader can check yet. What would show it is true?';
  r=await C.coachNote(DRAFT,'teen',prompt,ask);assert.equal(r.source,'model');assert.equal(r.note,said);
  // the engine was asked with a schema, the writing-coach use, and a system that forbids handing over a sentence
  assert.ok(asked.every(a=>a.schema&&a.use==='writing-coach'&&/Never write a sentence/.test(a.system)));
  // a failing engine, an empty note, a non-string note: the code line, no throw
  for(const bad of [()=>Promise.reject(new Error('down')),()=>Promise.resolve({json:{note:''}}),()=>Promise.resolve({json:{note:7}}),()=>Promise.resolve({})]){
    r=await C.coachNote(DRAFT,'teen',prompt,bad);assert.equal(r.source,'code');
  }
  // whatever note is shown supplies no sentence, in both bands and for drafts that hit each focus
  const drafts=[DRAFT,'Cats are good. Dogs are good.','Screens hurt sleep. For example, a 2019 study found 30 minutes lost. This shows it.',Array(40).fill('word').join(' ')+'. Another short one here.'];
  for(const band of ['young','teen'])for(const d of drafts)
    assert.equal(RE.suppliesSentence(C.codeNote(d,band),RE.splitSentences(d).map(s=>s.text)),false,C.codeNote(d,band));
  assert.ok(own.length>=2);
});

test('the code picks the focus from the paragraph',()=>{
  assert.equal(C.focusOf('Cats are good. Dogs are good.'),'evidence');
  assert.equal(C.focusOf(Array(40).fill('word').join(' ')+'. Another short one here.'),'length');
});

test('a finished episode lands in the seated learner record',()=>{
  let r=E.pick(E.START,'screens');r=E.coached(r.episode,DRAFT,'a note');r=E.revised(r.episode,REVISED);
  const unfinished=r.episode;
  assert.equal(S.saveEpisode('kid-1',unfinished).ok,false,'an unfinished episode is not saved');
  assert.equal(L.getLearner('kid-1').history.length,0);
  r=E.finished(unfinished,Date.now());
  const saved=S.saveEpisode('kid-1',r.episode);assert.ok(saved.ok,JSON.stringify(saved));
  const l=L.getLearner('kid-1');
  assert.equal(l.history.length,1);
  assert.equal(l.history[0].kind,'writing');assert.equal(l.history[0].label,'Screens before bed');
  assert.equal(l.writing[S.WRITING_LENS].seen,1);
  // the file is under the temp dir, not desk/data
  assert.ok(fs.readdirSync(process.env.DESK_DATA_DIR).length>0);
  // a second learner is untouched
  assert.equal(L.getLearner('kid-2').history.length,0);
});

test('the revision is read again: punctuation-only is refused, evidence added holds, none added still needs',()=>{
  const coachedEp=()=>{let r=E.pick(E.START,'screens');return E.coached(r.episode,DRAFT,'a note').episode;};
  const punct=E.revised(coachedEp(),DRAFT.replace('bed.','bed!')+' ');
  assert.equal(punct.ok,false);assert.match(punct.error,/change some of your words/i);
  assert.equal(E.revised(coachedEp(),DRAFT.replace(/ /g,'  ').toUpperCase()).ok,false,'case and spacing alone are no revision');
  const done=(rev)=>{const r=E.revised(coachedEp(),rev);assert.ok(r.ok,JSON.stringify(r));return E.finished(r.episode,1).episode;};
  const good=done(REVISED);assert.equal(good.focus,'evidence');assert.equal(good.holds,true);
  assert.match(E.checkLine(good),/coached on evidence; the revision now gives evidence/);
  const bad=done(DRAFT.replace('fun','nice'));assert.equal(bad.holds,false);
  assert.match(E.checkLine(bad),/the revision still needs evidence/);
  assert.equal(E.checkLine({}),'coached; the revision was not checked');
  assert.doesNotMatch(S.saveEpisode('kid-3',bad).detail,/revised/);
  assert.equal(E.focusHolds('length','Short one here. Another short one.'),true);
  assert.equal(E.focusHolds('length',Array(40).fill('word').join(' ')+'. Ok then.'),false);
});

test('the /writing page paints its own ground: its dark text is not left on the desk\'s dark body (stick walk 2026-10-21)',()=>{
  const src=fs.readFileSync(path.join(root,'src/writing/WritingEpisode.tsx'),'utf8');
  const main=src.match(/<main style=\{\{([^}]*)\}\}/);
  assert.ok(main,'the page has a main with a style');
  assert.match(main[1],/background:\s*"#[0-9a-f]{3,6}"/i,'a page that sets its own text colour sets its own background too');
});
