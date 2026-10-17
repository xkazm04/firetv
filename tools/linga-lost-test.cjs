/**
 * Run with npm run test:rules in desk/ (directly: node tools/linga-lost-test.cjs). L3, pool P14: spoken English changes
 * the scene, a pilot inside "The lost jacket" (lib/english/lostfound.ts). A code parser narrows a seeded lost-property
 * shelf from the learner's replies; the learner's thing stays in server memory; code alone finds it; the turn's one
 * model call only phrases it. No live model call (the engine is stubbed at its seam); a disposable data directory under
 * the OS temp dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'linga-lost-'));
process.env.DESK_DATA_DIR=dataDir;
const engine=require(path.join(root,'src/lib/engines/text.ts'));
let answer=async()=>({json:{},provider:'test',ms:1});
const calls=[];
engine.text=(req)=>{calls.push({use:req.use,prompt:JSON.parse(req.prompt)});return answer(req);};
const L=require(path.join(root,'src/lib/english/lostfound.ts'));
const {englishCommand}=require(path.join(root,'src/lib/english/conversation.ts'));
const {lingaView,viewText}=require(path.join(root,'src/lib/english/view.ts'));
const {dispatch,getSession}=require(path.join(root,'src/lib/session/store.ts'));
const {getLearner}=require(path.join(root,'src/lib/session/learners.ts'));
after(()=>{clearInterval(globalThis.__desk?.ticker);try{fs.rmSync(dataDir,{recursive:true,force:true});}catch(e){console.warn('linga-lost-test: temp dir left behind',e.message);}});

const DIMS=['kind','colour','size','pattern','place'];
/** a seeded generator for the test's own choices, apart from the module's */
function rand(seed){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const pick=(r,xs)=>xs[Math.floor(r()*xs.length)];
/** The oracle: a structured description {is, not} applied to a thing, written here independently of the module. */
const fits=(x,spec)=>Object.entries(spec.is).every(([d,v])=>x[d]===v)&&spec.not.every(g=>!g.every(([d,v])=>x[d]===v));
const ids=xs=>xs.map(x=>x.id).sort();

// ---- the words a description is said in: several reviewed ways per attribute, as an A1/A2 learner says them
const KIND_WORD={jacket:['jacket','coat'],bottle:['bottle','water bottle'],bag:['bag','backpack','school bag']};
const SAY={
 kind:(v,r)=>pick(r,[`Where is my ${pick(r,KIND_WORD[v])}?`,`I lost my ${pick(r,KIND_WORD[v])}.`,`My ${pick(r,KIND_WORD[v])}.`]),
 colour:(v,r)=>pick(r,[`It is ${v}.`,`It's ${v}.`,`${v[0].toUpperCase()+v.slice(1)}.`,`The ${v} one.`]),
 size:(v,r)=>pick(r,[`The ${v} one.`,`It is ${v}.`,`It's ${v==='big'?pick(r,['big','large']):pick(r,['small','little'])}.`]),
 pattern:(v,r)=>v==='plain'?pick(r,['It is plain.','No pattern.']):pick(r,[`It has ${v}.`,`With ${v}.`,v==='stripes'?'It is striped.':'It has stars on it.']),
 place:(v,r)=>({gym:pick(r,['I left it in the gym.','It was in the sports hall.']),playground:pick(r,['I left it on the playground.','It was outside.']),classroom:pick(r,['It was in my classroom.','I left it in class.']),canteen:pick(r,['I left it in the canteen.','It was at lunch.'])})[v],
};
const NOT={
 kind:v=>`It is not a ${v}.`,colour:(v,r)=>pick(r,[`Not ${v}.`,`It isn't ${v}.`,`Not the ${v} one.`]),size:v=>`It isn't ${v}.`,
 pattern:v=>v==='plain'?null:`Without ${v}.`,place:v=>({gym:'Not in the gym.',playground:'It was not outside.',classroom:'Not in the classroom.',canteen:'Not in the canteen.'})[v],
};
/** A random description that holds together: 1-3 named attributes (mostly a value some thing on the shelf has) and at most one ruled-out one or pair, as text and as structure. */
function description(r,items){
 for(;;){
  const spec={is:{},not:[]},parts=[];
  const named=[...DIMS].sort(()=>r()-.5).slice(0,1+Math.floor(r()*3));
  for(const d of named){const v=r()<.75?pick(r,items)[d]:pick(r,L.LOST_VALUES[d]);spec.is[d]=v;parts.push(SAY[d](v,r));}
  const roll=r();
  if(roll<.35){const d=pick(r,DIMS.filter(x=>!(x in spec.is)));const v=pick(r,L.LOST_VALUES[d]);const t=NOT[d](v,r);if(t){spec.not.push([[d,v]]);parts.push(t);}}
  else if(roll<.5){const pair=[...DIMS.filter(x=>x==='colour'||x==='size')];const g=pair.map(d=>[d,pick(r,L.LOST_VALUES[d])]);if(g.every(([d])=>!(d in spec.is))){spec.not.push(g);parts.push(`Not the ${g[1][1]} ${g[0][1]} one.`);}}
  if(spec.not.some(g=>g.every(([d,v])=>spec.is[d]===v)))continue;
  return {text:parts.join(' '),spec};
 }
}

test('the parser reads the reviewed vocabulary, negation and its alternatives, and abstains on a hedge, an "or" or a contradiction',()=>{
 const is=(text,want)=>{const r=L.readReply(text);assert.equal(r.kind,'description',`${text}: ${JSON.stringify(r)}`);assert.deepEqual(r.d.is,want.is??{},text);assert.deepEqual(r.d.not,want.not??[],text);};
 is('it is blue',{is:{colour:'blue'}});
 is('The big one.',{is:{size:'big'}});
 is('not red',{not:[[['colour','red']]]});
 is('where is my bottle',{is:{kind:'bottle'}});
 is("It isn't big",{not:[[['size','big']]]});
 is("it's not the red one, it's the blue one",{is:{colour:'blue'},not:[[['colour','red']]]});
 is('Not the big red one',{not:[[['size','big'],['colour','red']]]});
 is('I lost my small green backpack with stripes in the gym',{is:{size:'small',colour:'green',kind:'bag',pattern:'stripes',place:'gym'}});
 is('no it is blue',{is:{colour:'blue'}});
 is('No, the yellow one',{is:{colour:'yellow'}});
 is("It doesn't have stars",{not:[[['pattern','stars']]]});
 is('It has no pattern',{is:{pattern:'plain'}});
 is('I left it outside at break',{is:{place:'playground'}});
 is('My coat is large and navy',{is:{kind:'jacket',size:'big',colour:'blue'}});
 for(const t of ['Hello!','Can you help me, please?','Thank you very much','Which one?','I am Tomas','Sorry, can you say that again?','It is pink'])assert.equal(L.readReply(t).kind,'unknown',t);
 const abstains=(t,why)=>{const r=L.readReply(t);assert.equal(r.kind,'abstain',`${t}: ${JSON.stringify(r)}`);if(why)assert.equal(r.why,why,t);};
 abstains('maybe blue','unsure');abstains("I don't know, maybe it is big",'unsure');abstains('I think it is a bit big','unsure');
 abstains('red or blue','two-choices');abstains('Is it the big one or the small one?','two-choices');abstains('no blue','two-choices');abstains('not the bag with stars','two-choices');
 abstains('it is red and blue','contradiction');abstains('the big small one','contradiction');abstains('It is red, not red','contradiction');abstains('my jacket and my bottle','contradiction');
 // a hedge that names nothing is dropped, and the rest still counts
 is("I don't remember the colour, but it is big",{is:{size:'big'}});
});

test('verify 1: across 40 seeded inventories (three variants) every accepted description keeps exactly the things that match it, and puts aside exactly the rest',()=>{
 const variants=new Set(),outcomes={};let accepted=0,abstained=0,checks=0;
 for(let seed=1;seed<=40;seed++){
  const shelf=L.shelfOf(seed),target=shelf.items.find(x=>x.id===shelf.target);
  variants.add(target.kind);
  assert.equal(shelf.items.length,5);assert.equal(new Set(shelf.items.map(x=>DIMS.map(d=>x[d]).join('/'))).size,5,`seed ${seed}: five different things`);
  assert.equal(L.publicTask(shelf.items).found,null);
  const r=rand(seed*7919);
  let task=L.publicTask(shelf.items);
  for(let n=0;n<40;n++){
   const {text,spec}=description(r,shelf.items),read=L.readReply(text);
   if(read.kind!=='description'){abstained++;continue;}
   // the parser's reading is the spoken structure: it keeps exactly what the oracle keeps, over the whole shelf
   assert.deepEqual(ids(shelf.items.filter(x=>L.matches(x,read.d))),ids(shelf.items.filter(x=>fits(x,spec))),`seed ${seed}: "${text}"`);
   accepted++;
   const table=L.onTable(task),next=L.settle(task,text,shelf.target);
   const left=table.filter(x=>fits(x,spec)),again=shelf.items.filter(x=>!task.checked.includes(x.id)&&fits(x,spec)),keep=left.length?left:again;
   if(task.found){assert.deepEqual(next.out,task.out);assert.equal(next.found,task.found);}
   else if(!keep.length){assert.deepEqual(next.out,task.out,`"${text}": nothing on the shelf fits, nothing changes`);assert.equal(next.last.outcome,'none');}
   else if(keep.length===1&&keep[0].id===shelf.target){assert.equal(next.found,shelf.target);assert.equal(next.last.outcome,'found');}
   else if(keep.length===1){assert.equal(next.found,null);assert.equal(next.last.outcome,'not-yours');assert.ok(next.checked.includes(keep[0].id));assert.deepEqual(ids(L.onTable(next)),ids(shelf.items.filter(x=>!next.checked.includes(x.id))));}
   else{
    assert.equal(next.found,null);
    assert.deepEqual(ids(L.onTable(next)),ids(keep),`seed ${seed}: "${text}" keeps exactly the matching things`);
    assert.deepEqual(ids(next.items.filter(x=>next.out.includes(x.id))),ids(shelf.items.filter(x=>!keep.includes(x))),`and puts aside exactly the rest`);
    assert.equal(next.last.outcome,left.length?(left.length===table.length?'same':'narrowed'):'again');
   }
   checks++;outcomes[next.last.outcome]=(outcomes[next.last.outcome]??0)+1;
   // carry the table on, and start again from a full shelf now and then
   task=next.found||r()<.2?L.publicTask(shelf.items):next;
  }
 }
 console.log(`verify 1: 40 inventories, variants ${[...variants].sort().join('/')}, ${accepted} accepted descriptions checked against the oracle (${checks} settled: ${Object.entries(outcomes).map(([k,n])=>`${k} ${n}`).join(', ')}), ${abstained} abstained`);
 assert.deepEqual([...variants].sort(),['bag','bottle','jacket'],'at least three distinct variants');
 assert.ok(accepted>=30*20);
});

test('verify 2: contradictory or ambiguous descriptions never recover an item, nor move the table',()=>{
 let tried=0;
 for(let seed=1;seed<=40;seed++){
  const shelf=L.shelfOf(seed),t=shelf.items.find(x=>x.id===shelf.target),r=rand(seed);
  const other=d=>pick(r,L.LOST_VALUES[d].filter(v=>v!==t[d]));
  // a table down to the learner's thing and one more: one more true word would find it
  const start=L.publicTask(shelf.items),near=shelf.items.find(x=>x.id!==t.id&&x.kind===t.kind);
  const two={...start,out:shelf.items.filter(x=>x!==t&&x!==near).map(x=>x.id)};
  const bad=[
   `It is ${t.colour} and ${other('colour')}.`,`Maybe it is ${t.colour}.`,`${t.colour} or ${other('colour')}?`,`It is ${t.size}, not ${t.size}.`,
   `The ${t.size} ${other('size')} one.`,`I don't know, maybe the ${t.size} one.`,`no ${t.colour}`,`My ${t.kind} and my ${pick(r,L.LOST_KINDS.filter(k=>k!==t.kind))}.`,
   `Is it ${t.place==='gym'?'in the gym':'outside'} or in the canteen?`,`I think it is a bit ${t.size}.`,`It is ${t.colour}. It is ${other('colour')}.`,`not the ${t.kind} with stars`,
  ];
  for(const task of [start,two])for(const text of bad){
   const next=L.settle(task,text,shelf.target);tried++;
   assert.equal(next.found,null,`seed ${seed}: "${text}" recovered an item`);
   assert.deepEqual(next.out,task.out,`seed ${seed}: "${text}" moved the table`);
   assert.equal(next.last.outcome,'unclear',`seed ${seed}: "${text}" -> ${next.last.outcome}`);
  }
 }
 console.log(`verify 2: ${tried} contradictory or ambiguous replies over 40 inventories: 0 recoveries, 0 table changes`);
});

// ---- the scene, end to end, with the engine stubbed
let counter=0;
const command=(action,extra={})=>{const s=getSession();return englishCommand({action,learnerId:s.learner.id,episodeId:s.conversation?.id,commandId:`lost-${++counter}`,...extra});};
function fresh(){dispatch({type:'reset'});dispatch({type:'learner.set',id:'ema'});dispatch({type:'subject',subject:'english'});}
const PARTNER='Let me look on the table. Can you tell me more?';
/** Start the lost scene with a chosen seed (the module draws its seed from Math.random at start). */
async function begin(seed,sceneId='lost'){
 answer=async()=>({json:{title:'The lost jacket',goal:'Find what you lost.',opening:'Hello! Did you lose something?'},provider:'test',ms:1});
 const real=Math.random;if(seed!==undefined)Math.random=()=>(seed+.5)/0x7fffffff;
 try{await command('start',{sceneId,replace:true});}finally{Math.random=real;}
}
async function say(text,json={}){
 answer=async()=>({json:{reply:PARTNER,observations:[],...json},provider:'test',ms:1});
 await command('turn',{text,mode:'speech',lastTurnId:getSession().conversation.turns.at(-1).id});
}
const lost=()=>getSession().conversation.lost;
const picture=async()=>(await command('lost-picture')).picture;
const seedOf=kind=>{for(let s=1;s<5000;s++){const sh=L.shelfOf(s);if(sh.items.find(x=>x.id===sh.target).kind===kind)return s;}};

test('verify 3: a fabricated model completion claim leaves the task as code left it',async()=>{
 fresh();await begin(seedOf('jacket'));
 const before=structuredClone(lost());
 const claim={reply:'Here is your jacket! I found it for you.',found:true,lost:{found:before.items[0].id,out:before.items.slice(1).map(x=>x.id)},lostProperty:{found:'yours'},step:{reached:true,quote:'Thank you'}};
 await say('Thank you',claim);
 const after1=lost();
 assert.deepEqual(after1.items,before.items);assert.deepEqual(after1.out,before.out);assert.deepEqual(after1.checked,before.checked);assert.equal(after1.found,null);
 assert.equal(after1.last.outcome,'unknown');
 // and with a real description, the table is what code decides from the reply, whatever the model claims
 const p=await picture(),c=getSession().conversation;
 const want=L.settle(after1,`It is ${p.colour}.`,before.items.find(x=>x.colour===p.colour&&x.kind===p.kind&&x.size===p.size&&x.pattern===p.pattern&&x.place===p.place).id);
 await say(`It is ${p.colour}.`,claim);
 assert.deepEqual(lost().out,want.out);assert.equal(lost().found,want.found);
 assert.equal(getSession().conversation.turns.at(-1).text,claim.reply,'the partner line itself lands (it passed the gate)');
 assert.ok(c.id===getSession().conversation.id);
 console.log(`verify 3: model claimed found:true and a forged lost state on two turns; task unchanged on the unknown reply (found null, out [${after1.out}]), and equal to code's own settle on the described one`);
});

test('verify 4: the learner\'s thing is absent from every screen payload, and the phone gets it only by asking',async()=>{
 fresh();const seed=seedOf('bag');await begin(seed);
 const shelf=L.shelfOf(seed),target=shelf.items.find(x=>x.id===shelf.target);
 assert.deepEqual(lost(),L.publicTask(shelf.items),'the session task is built from the public items alone');
 const thing=await picture();
 assert.deepEqual(thing,{kind:target.kind,colour:target.colour,size:target.size,pattern:target.pattern,place:target.place});
 const check=label=>{
  const json=JSON.stringify(getSession()),v=lingaView(getSession(),{}),vj=JSON.stringify(v);
  assert.equal(lost().found,null,label);
  for(const text of [json,vj,viewText(v)]){
   assert.doesNotMatch(text,/"target"|"picture"|__lingaLost/,label);
   assert.ok(!text.includes(JSON.stringify(thing)),`${label}: the phone's picture is not in a payload`);
  }
  assert.deepEqual(Object.keys(lost()).sort(),['askAbout','checked','found','items','last','out'],`${label}: only the public fields`);
  // the hero carries the same public task, nothing more
  assert.deepEqual(v.hero.lost,lost(),label);
 };
 check('at start');
 // the session JSON is the same whichever thing is the learner's: move the hidden half, nothing on a screen changes
 const before=JSON.stringify(getSession()),convId=getSession().conversation.id;
 for(const x of shelf.items){globalThis.__lingaLost.set(convId,x.id);assert.equal(JSON.stringify(getSession()),before);}
 globalThis.__lingaLost.set(convId,shelf.target);
 await say(`Where is my ${thing.kind}?`);check('after a description');
 await say('Sorry, can you say that again?');check('after a clarification request');
 const prompt=calls.at(-1).prompt;
 assert.deepEqual(prompt.lostProperty,L.lostFacts(lost()),'the partner gets the public facts and nothing else');
 assert.equal(prompt.lostProperty.found,null);assert.ok(prompt.lostProperty.askAbout);
 console.log(`verify 4: session, view and viewText checked at start and after two turns: no hidden key, no picture; the session JSON is identical for all 5 possible hidden targets`);
});

/**
 * A simulated A1/A2 learner: sees only the phone's picture and the TV's table (the public task), and answers what the
 * partner asks about (askAbout) in short sentences of their own: no help, no cue, no phrase supplied by the partner.
 * Three styles: "says" names the thing's own value; "rules-out" says what it is not ("Not red.", "It isn't big."), from a
 * thing still on the table; "corrects" first says a wrong colour, then puts it right.
 */
const PLACE_SAID={gym:'I left it in the gym.',playground:'I left it outside.',classroom:'It was in my classroom.',canteen:'I left it in the canteen.'};
const OWN={colour:x=>`It is ${x.colour}.`,size:x=>`The ${x.size} one.`,kind:x=>`My ${x.kind}.`,pattern:x=>x.pattern==='plain'?'It is plain.':`It has ${x.pattern}.`,place:x=>PLACE_SAID[x.place]};
const NOT_SAID={colour:v=>`Not ${v}.`,size:v=>`It isn't ${v}.`,kind:v=>`It is not a ${v}.`,pattern:v=>v==='plain'?null:`Without ${v}.`,place:v=>({gym:'Not in the gym.',playground:'It was not outside.',classroom:'Not in the classroom.',canteen:'Not in the canteen.'})[v]};
async function journey(seed,style){
 fresh();calls.length=0;await begin(seed);
 const thing=await picture(),said=[],path=[];
 assert.ok(thing,'the phone has its picture');
 const evidence=getLearner('ema').english.evidence.length,achievements=JSON.stringify(getLearner('ema').english.achievements);
 const reply=async t=>{said.push(t);await say(t);path.push(lost().last.outcome);};
 await reply(`Excuse me, where is my ${thing.kind}?`);
 await reply('Sorry, can you say that again?');
 if(style==='corrects')await reply(`It is ${L.LOST_COLOURS.find(c=>c!==thing.colour&&L.onTable(lost()).some(x=>x.colour===c))??thing.colour}.`);
 for(let n=0;n<10&&!lost().found;n++){
  const d=lost().askAbout;if(!d)break;
  const other=style==='rules-out'?L.onTable(lost()).find(x=>x[d]!==thing[d]):undefined,no=other&&NOT_SAID[d](other[d]);
  await reply(no||OWN[d](thing));
 }
 const turns=getSession().conversation.turns.filter(t=>t.role==='learner').length;
 return {thing,said,path,found:lost().found,turns,modelCalls:calls.length,turnCalls:calls.filter(c=>c.use==='linga-turn').length,
  evidenceAdded:getLearner('ema').english.evidence.length-evidence,achievementsSame:JSON.stringify(getLearner('ema').english.achievements)===achievements};
}
/** A seed whose learner's thing is `kind` and has a twin on the shelf (same kind and colour) that differs only in `dim`: kind and colour alone do not find it. */
const seedWith=(kind,dim)=>{for(let s=1;s<20000;s++){const sh=L.shelfOf(s),t=sh.items.find(x=>x.id===sh.target);if(t.kind===kind&&sh.items.some(x=>x!==t&&DIMS.every(k=>k===dim?x[k]!==t[k]:x[k]===t[k])))return s;}};

test('verify 5: simulated A1/A2 journeys complete three distinct variants, one model call per turn, no supplied answers, no credit from the task',async()=>{
 const rows=[];
 for(const [kind,dim,style] of [['jacket','size','says'],['bottle','pattern','rules-out'],['bag','place','corrects']]){
  const seed=seedWith(kind,dim),shelf=L.shelfOf(seed),j=await journey(seed,style);
  assert.equal(j.found,shelf.target,`${kind} (seed ${seed}): found, after ${j.said.join(' | ')}`);
  assert.equal(j.turnCalls,j.turns,'one model call per normal turn');assert.equal(j.modelCalls,j.turns+1,'and one for the opening; the picture costs none');
  assert.ok(j.path.includes('unknown'),'a clarification request changed nothing');
  if(style==='rules-out')assert.ok(j.said.some(t=>/^(Not|It isn't|Without|It is not)/.test(t)),'a negation did the work');
  // a wrong colour first: the one thing it leaves is someone else's (its name label), or the right colour looks at the shelf again
  if(style==='corrects')assert.ok(j.path.includes('again')||j.path.includes('not-yours'),'the wrong colour was put right');
  // no answer phrase supplied: the partner's lines carry no word of the vocabulary, help was never asked
  for(const [w] of L.VOCAB)assert.doesNotMatch(PARTNER.toLowerCase(),new RegExp(`\b${w}\b`));
  assert.ok(!getSession().conversation.help?.rung,'no help rung revealed');
  assert.equal(j.evidenceAdded,0,'finding it writes no evidence');assert.ok(j.achievementsSame,'and moves no skill');
  // the TV draws the found thing on the hook, greys the rest; the viewText line says so
  const v=lingaView(getSession(),{});assert.ok(v.hero.lost.found);assert.match(viewText(v),/Lost property: found and hung on the hook/);
  // once found, it stays found: a later model claim or reply changes nothing
  const done=structuredClone(lost());await say('It is red and blue',{found:false});assert.deepEqual(lost().out,done.out);assert.equal(lost().found,done.found);
  rows.push(`${kind}, twin differs in ${dim}, style ${style} (seed ${seed}): ${j.turns} turns, ${j.modelCalls} model calls (${j.turnCalls} turn + 1 opening) -> found\n    ${j.said.map((t,i)=>`"${t}" [${j.path[i]}]`).join(' > ')}`);
 }
 console.log('verify 5:\n  '+rows.join('\n  '));
});

test('the TV corridor draws the table from the public task: on it, put aside (greyed), and the found thing on the hook',()=>{
 const React=require(path.join(root,'node_modules/react'));
 const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {Corridor}=require(path.join(root,'src/english/art/Corridor.tsx'));
 const shelf=L.shelfOf(seedOf('bottle')),t0=L.publicTask(shelf.items);
 const html=lost=>renderToStaticMarkup(React.createElement(Corridor,lost?{lost}:{}));
 const plain=html();assert.doesNotMatch(plain,/linga-lost-item/);assert.match(plain,/stroke-dasharray="8 7"/,'without a task the corridor is as it was');
 const start=html(t0);assert.equal((start.match(/data-state="table"/g)||[]).length,5);assert.doesNotMatch(start,/data-state="out"/);
 const target=shelf.items.find(x=>x.id===shelf.target),aside=L.settle(t0,`It is ${target.colour}.`,shelf.target);
 const mid=html(aside);assert.equal((mid.match(/data-state="out"/g)||[]).length,aside.out.length);assert.match(mid,/grayscale/);
 const found={...t0,found:shelf.target,out:shelf.items.filter(x=>x.id!==shelf.target).map(x=>x.id)};
 const end=html(found);assert.match(end,/data-role="linga-lost-found"/);assert.doesNotMatch(end,/stroke-dasharray="8 7"/,'the hook outline is filled');
 // the picture carries no word naming the thing: the only text is the plaque
 const texts=[...end.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);assert.deepEqual(texts,['LOST PROPERTY']);
});

test('only the lost scene has the task; a restart that loses the hidden half stands it down',async()=>{
 fresh();calls.length=0;await begin(undefined,'rover');
 assert.equal(getSession().conversation.lost,undefined);await say('Which way should I go?');
 assert.ok(calls.every(c=>!('lostProperty' in c.prompt)),'no other scene is told about a table');
 assert.equal(await picture(),null);
 fresh();await begin(seedOf('jacket'));
 assert.ok(lost());globalThis.__lingaLost.delete(getSession().conversation.id);
 await say('It is red.');
 assert.equal(getSession().conversation.lost,null,'the task stood down');assert.equal(await picture(),null);
 await say('It is blue.');assert.equal(getSession().conversation.lost,null);
 assert.equal(lingaView(getSession(),{}).hero.lost,undefined,'the corridor goes back to its plain picture');
});
