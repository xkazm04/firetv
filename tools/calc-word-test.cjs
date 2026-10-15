/**
 * The M3a sweep (v2 slice M3a, Calculus 1 completed: word problems and multi-part questions): the kill test for the word
 * templates of desk/src/lib/rules/calc-word.ts. Each template is drawn over SEEDS seeds (at least 500) and the sweep counts:
 *   1. problems not well formed: a part whose spec rules/calc wellFormed refuses (or a problem of fewer than two parts);
 *   2. problems not fair: a part's answer given away by the stem, its own line or another part's line (leaksCalc);
 *   3. worked answers checkAnswer does not mark right: the template's exact answer per part, and for the two story templates
 *      the sweep's own answer from the drawn numbers (its own arithmetic), each marked by rules/calc checkAnswer;
 *   4. stem numbers the code did not draw: a numeral in the stem or a part line, outside the function the stem prints, that
 *      is not one of the drawn numbers, and any number word.
 * Accept: the four counts are 0 for every template in SHIPPED. Kill: a template with a non-zero count that its generator or
 * check cannot fix is withheld (out of SHIPPED, its code and rows kept); this suite fails when a shipped template does not
 * pass. It prints the table. Controls prove each count can fail.
 * Pure: no store, no route, no model, no network. Run with npm test in desk/ (directly: node tools/calc-word-test.cjs).
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const W=require(path.join(root,'src/lib/rules/calc-word.ts'));
const C=require(path.join(root,'src/lib/rules/calc.ts'));
const H=require(path.join(root,'src/lib/rules/chain.ts'));

const SEEDS=500;
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
const frac=(n,d)=>{const g=gcd(n,d);return d/g===1?String(n/g):`${n/g}/${d/g}`;};
/** The sweep's own answers from the drawn numbers, where the story is simple enough to work by hand. */
const OWN={
 'sphere-rates':([q,r])=>[`${q}/(${4*r*r}*pi)`,frac(2*q,r)],
 'rectangle-perimeter':([P])=>[frac(P*P,16),`${P}*sqrt(2)/4`],
};

/** One template over the seeds: the four counts, and the first few failures by name. */
function sweep(id,seeds=SEEDS){
 const c={drawn:0,dry:0,notWellFormed:0,notFair:0,notRight:0,undrawn:0,why:[]};
 for(let seed=1;seed<=seeds;seed++){
  const w=W.drawWord(id,seed),worked=W.workedWord(id,seed);
  if(!w||!worked){c.dry++;continue;}
  c.drawn++;
  if(!W.wellFormedWord(w)){c.notWellFormed++;c.why.push(`${seed} not well formed`);}
  if(!W.fairWord(w)){c.notFair++;c.why.push(`${seed} not fair`);}
  const answers=[worked,...(OWN[id]?[OWN[id](w.drawn)]:[])];
  for(const set of answers)w.parts.forEach((p,i)=>{if(C.checkAnswer(p.spec,set[i]).verdict!=='right'){c.notRight++;c.why.push(`${seed} (${p.part}) ${set[i]}`);}});
  const extra=W.undrawn(w);
  if(extra.length){c.undrawn++;c.why.push(`${seed} prints ${extra.join(', ')}`);}
 }
 return c;
}
const RESULTS={};
for(const t of W.WORD_TEMPLATES)RESULTS[t.id]=sweep(t.id);
const passes=(c)=>c.dry===0&&c.notWellFormed===0&&c.notFair===0&&c.notRight===0&&c.undrawn===0;

test('M3a sweep controls: each count is able to fail - a malformed part, a stem that prints an answer, a wrong worked answer, an undrawn number and a number word',()=>{
 const w=W.drawWord('rectangle-perimeter',7);
 assert.ok(w&&W.wellFormedWord(w)&&W.fairWord(w)&&!W.undrawn(w).length,'the control starts from a passing draw');
 const P=w.drawn[0],k=P/4;
 // 1. a part whose spec is not well formed (an extremum at an end), and a problem of one part
 assert.equal(W.wellFormedWord({...w,parts:[w.parts[0],{...w.parts[1],spec:{shape:'extremum',f:'x',on:[0,1],kind:'max'}}]}),false);
 assert.equal(W.wellFormedWord({...w,parts:[w.parts[0]]}),false,'a multi-part question has at least two parts');
 // 2. the stem printing part (a)'s answer, part (b)'s line printing it, part (a)'s own line printing it
 assert.equal(W.fairWord({...w,stem:`${w.stem} Its largest area is ${k*k} square metres.`}),false);
 assert.equal(W.fairWord({...w,parts:[w.parts[0],{...w.parts[1],line:`Its largest area is ${k*k}. What is the shortest length its diagonal can have?`}]}),false);
 assert.equal(W.fairWord({...w,parts:[{...w.parts[0],line:`Show that the largest area is ${k*k} square metres.`},w.parts[1]]}),false);
 // 3. a worked answer that is not the truth
 assert.equal(C.checkAnswer(w.parts[0].spec,String(k*k+1)).verdict,'wrong');
 assert.notEqual(C.checkAnswer(w.parts[1].spec,`${k}sqrt(3)`).verdict,'right');
 // 4. a number the code did not draw, a number word, a function that is not the parts' own
 assert.deepEqual(W.undrawn({...w,stem:`${w.stem} It is ${P+1} metres from the wall.`}),[String(P+1)]);
 assert.deepEqual(W.undrawn({...w,stem:w.stem.replace('a perimeter','twice a perimeter')}),['twice']);
 const m=W.drawWord('cubic-max-min',3);
 assert.ok(m.fn&&W.undrawn(m).length===0);
 assert.deepEqual(W.undrawn({...m,fn:'x^3 + 1'}).slice(0,1),['fn x^3 + 1'],'the function the stem prints must be the parts\' own');
});

test('M3a sweep: the rules a draw is held to - seeded and deterministic, a bad seed is null, the answers never travel',()=>{
 for(const t of W.WORD_TEMPLATES){
  assert.deepEqual(W.drawWord(t.id,42),W.drawWord(t.id,42),`${t.id}: the same seed draws the same problem`);
  assert.notDeepEqual(W.drawWord(t.id,42),W.drawWord(t.id,43),`${t.id}: another seed draws another`);
  for(const bad of [-1,1.5,'7',NaN,2**32,null])assert.equal(W.drawWord(t.id,bad),null,`${t.id}: seed ${bad}`);
  const w=W.drawWord(t.id,5);
  assert.equal(w.topic,t.topic);
  assert.ok(w.parts.length>=2&&w.parts.map((p)=>p.part).join('')==='ab'.slice(0,w.parts.length),`${t.id}: parts (a), (b)`);
  const keys=JSON.stringify(w);for(const k of ['"answer"','"solution"','"truth"','"value"','"worked"'])assert.equal(keys.includes(k),false,`${t.id}: ${k} on the problem`);
  for(const p of w.parts)assert.ok(C.CALC_SHAPES.includes(p.spec.shape),'one of the nine shapes');
 }
 assert.equal(W.drawWord('no-such-template',1),null);
 // the spine's own shape lists: each template uses only its topic's shapes
 const {CALC1_SPINE}=require(path.join(root,'src/lib/library/calculus1.spine.ts'));
 for(const t of W.WORD_TEMPLATES){const shapes=CALC1_SPINE.find((x)=>x.id===t.topic).shapes;for(let s=1;s<=20;s++)for(const p of W.drawWord(t.id,s).parts)assert.ok(shapes.includes(p.spec.shape),`${t.id}: ${p.spec.shape} is on ${t.topic}'s list`);}
 // one template per topic, and the three topics of the card
 assert.deepEqual(W.WORD_TEMPLATES.map((t)=>t.topic).sort(),['calc1-extrema','calc1-optimisation','calc1-related-rates']);
});

for(const t of W.WORD_TEMPLATES)test(`M3a sweep ${t.id}: ${SEEDS} seeds, the four counts`,()=>{
 const c=RESULTS[t.id];
 assert.equal(c.drawn+c.dry,SEEDS);
 if(W.SHIPPED.includes(t.id))assert.ok(passes(c),`${t.id} is shipped but fails: ${c.why.slice(0,5).join('; ')}`);
 else assert.equal(passes(c),false,`${t.id} passes the sweep but is withheld`);
});

test('M3a sweep: the parts as items - consecutive numbers, the stem on each, named 5(a) and 5(b), asked with the stem',()=>{
 const w=W.drawWord('sphere-rates',11);
 const items=[{n:1,question:'Find f\'(2) for f(x) = x^3.'},...W.wordItems(w,2)];
 assert.deepEqual(items.slice(1).map((i)=>[i.n,i.part,i.stem===w.stem,i.question===w.parts[i.n-2].line]),[[2,'a',true,true],[3,'b',true,true]]);
 assert.deepEqual(items.map((_,i)=>W.itemName(items,i)),['1','2(a)','2(b)']);
 assert.deepEqual(items.map((_,i)=>W.partPlace(items,i)),[null,{label:'a',q:2,first:true},{label:'b',q:2,first:false}]);
 assert.equal(W.askedText(items[0]),items[0].question,'a single item is asked as it is');
 assert.equal(W.askedText(items[2]),`${w.stem} (b) ${w.parts[1].line}`);
 assert.equal(W.itemName(items,9),'');
 // a stray part letter with no stem is a single item
 assert.equal(W.partPlace([{n:1,question:'q',part:'a'}],0),null);
});

test('M3a sweep: a right working on a part rings nothing - the chain is true or null on every line, never false',()=>{
 const rect=W.drawWord('rectangle-perimeter',1),h=rect.drawn[0]/2,k=h/2;
 const cube=W.drawWord('cubic-max-min',1);
 assert.equal(cube.fn,'x^3 + 3x^2 - 24x + 6','seed 1 draws this cubic (the rows below work it)');
 const sph=W.drawWord('sphere-rates',1),[q,r]=sph.drawn;
 const rows=[
  [rect.parts[0].spec,[`A = x(${h} - x)`,`A' = ${h} - 2x`,`${h} - 2x = 0`,`x = ${k}`,`A = ${k*k}`]],
  [rect.parts[1].spec,[`d = sqrt(x^2 + (${h} - x)^2)`,`x = ${k}`,`d = ${k}sqrt(2)`]],
  [cube.parts[0].spec,[`f(x) = ${cube.fn}`,'f\'(x) = 3x^2 + 6x - 24','3x^2 + 6x - 24 = 0','x = 2','f(2) = -22','f(-4) = 86']],
  [sph.parts[0].spec,['V = 4/3 pi r^3','dV/dt = 4 pi r^2 dr/dt',`${q} = 4 pi (${r*r}) dr/dt`,`dr/dt = ${q}/(${4*r*r}pi)`]],
  [sph.parts[1].spec,['S = 4 pi r^2','dS/dt = 8 pi r dr/dt',`= ${2*q}/${r}`]],
 ];
 for(const [spec,lines] of rows){
  const held=H.chainChecks(spec,lines);
  assert.equal(held.includes(false),false,`${JSON.stringify(spec)}: ${lines.join(' | ')} -> ${JSON.stringify(held)}`);
  assert.equal(H.chainPen(spec,lines),null);
 }
 // and a slip in a part's working is still rung where it sits (the chain works per part as on a single item): the side set up
 // from the whole perimeter, and a derivative slipped
 assert.equal(H.chainPen(rect.parts[0].spec,[`A = x(${2*h} - x)`]),0);
 assert.equal(H.chainPen(rect.parts[0].spec,[`A = x(${h} - x)`,`A' = ${h} - x`]),1);
 // the capital label is the function on these shapes; on an integral shape it is still an antiderivative (rules/chain)
 assert.deepEqual(H.tagLines(rect.parts[0].spec,[`A = x(${h} - x)`]).lines.map((l)=>l.tag),['=']);
 assert.deepEqual(H.tagLines({shape:'antiderivative',f:'2x'},['F = x^2 + C']).lines.map((l)=>l.tag),['int']);
});

test('M3a sweep: the table',()=>{
 const rows=W.WORD_TEMPLATES.map((t)=>{const c=RESULTS[t.id];return `| ${t.id} | ${t.topic} | ${c.drawn} of ${SEEDS} | ${c.notWellFormed} | ${c.notFair} | ${c.notRight} of ${c.drawn*W.drawWord(t.id,1).parts.length*(OWN[t.id]?2:1)} | ${c.undrawn} | ${W.SHIPPED.includes(t.id)?'shipped':'withheld'} |`;});
 console.log(['| template | topic | drawn | not well formed | not fair | worked answers not right | stem numbers not drawn | |','|---|---|---|---|---|---|---|---|',...rows].join('\n'));
 for(const t of W.WORD_TEMPLATES)assert.equal(W.SHIPPED.includes(t.id),passes(RESULTS[t.id]),`${t.id}: shipped exactly when it passes`);
});

// ---------------------------------------------------------------- the corpus table (docs/CALCULUS-1-SYLLABUS.md, "What a photographed page reads into")

test('M3a corpus: what the printed questions read into - 13 of 31 single specs as before, and the multi-part reader (c13-q1 refused: its maximum is at an end)',()=>{
 const {CALCULUS_1}=require(path.join(root,'src/lib/library/calculus1.ts'));
 const all=CALCULUS_1.topics.flatMap((t)=>t.examples);
 const qs=all.filter((e)=>e.kind==='question'),pages=all.filter((e)=>e.kind==='page');
 const read=(e)=>{const one=C.specFromQuestion(e.plain);if(one)return {kind:'single',shape:one.shape};const parts=C.partsFromQuestion(e.plain);return parts?{kind:'parts',shape:parts.map((p)=>`${p.shape} ${p.kind}`).join(' + ')}:null;};
 const rows=qs.map((e)=>({id:e.id,r:read(e)}));
 const by=(k)=>rows.filter((x)=>x.r&&x.r.kind===k);
 const shapes={};for(const x of by('single'))(shapes[x.r.shape]??=[]).push(x.id);
 console.log(['| examples | read into a spec | read into parts | of which shape |','|---|---|---|---|',
  `| ${qs.length} questions (plain) | ${by('single').length} | ${by('parts').length} | ${Object.entries(shapes).map(([s,ids])=>`${s} ${ids.length} (${ids.join(', ')})`).join(', ')} |`,
  `| ${pages.length} page lines (plain) | ${pages.filter((e)=>C.specFromQuestion(e.plain)).length} | ${pages.filter((e)=>C.partsFromQuestion(e.plain)).length} | - |`,
  `| ${[...qs,...pages].filter((e)=>e.tex).length} TeX forms of the above | ${[...qs,...pages].filter((e)=>e.tex&&C.specFromQuestion(e.tex)).length} | ${[...qs,...pages].filter((e)=>e.tex&&C.partsFromQuestion(e.tex)).length} | - |`].join('\n'));
 // the single reads are exactly the thirteen the doc lists: no question that read before changes its spec
 assert.equal(qs.length,31);
 assert.deepEqual(by('single').map((x)=>x.id),['c04-q1','c05-q1','c05-q2','c05-q3','c07-q1','c08-q1','c09-q1','c10-q2','c11-q1','c11-q2','c14-q1','c20-q1','c21-q1']);
 assert.deepEqual(Object.fromEntries(Object.entries(shapes).map(([s,ids])=>[s,ids.length])),{limit:5,derivative:6,'definite-integral':2});
 assert.deepEqual(by('parts'),[],'no corpus question reads into parts today');
 // c13-q1 is the multi-part phrasing, read and refused whole: its maximum (65) is at the end x = 5, which an extremum refuses
 const c13=qs.find((e)=>e.id==='c13-q1');
 assert.equal(C.partsFromQuestion(c13.plain),null);
 assert.equal(C.wellFormed({shape:'extremum',f:'x^3 - 12x',on:[-3,5],kind:'max'}).why,'The extremum is at an endpoint, not where the derivative is zero.');
 assert.ok(C.wellFormed({shape:'extremum',f:'x^3 - 12x',on:[-3,5],kind:'min'}).ok,'the minimum alone would read; the desk does not claim half a task');
 assert.deepEqual(C.partsFromQuestion(c13.plain.replace('[-3, 5]','[-3, 3]')),[{shape:'extremum',f:'x^3 - 12x',on:[-3,3],kind:'max'},{shape:'extremum',f:'x^3 - 12x',on:[-3,3],kind:'min'}],'on [-3, 3] both are inside and it reads');
 // the reader's phrasings: either order, 'values', 'largest and smallest', the interval words; never a single extremum, never junk
 assert.deepEqual(C.partsFromQuestion('Find the minimum and maximum values of x^3 - 12x on [-3, 3]').map((p)=>p.kind),['min','max']);
 assert.deepEqual(C.partsFromQuestion('Find the largest and smallest values of y = x^3 - 3x on the interval (-1.5, 1.5)').map((p)=>p.kind),['max','min']);
 for(const t of ['Find the maximum value of f(x) = x^3 - 12x on [-3, 3].','Find the maximum and minimum of f(x) = x^3 - 12y on [-3, 3]','Find the maximum and minimum of f(x) = x^3 - 12x on [3, -3]',42,null,'','x'.repeat(400)])assert.equal(C.partsFromQuestion(t),null,String(t).slice(0,60));
 assert.equal(C.specFromQuestion('Find the maximum and minimum of f(x) = x^3 - 12x on [-3, 3]'),null,'specFromQuestion does not read a two-part task as one of its parts');
 // the kind reader carries the parts, so a page task's hint is leak-checked against both answers
 const K=require(path.join(root,'src/lib/rules/kinds.ts'));
 const q=K.readQuestion('Find the maximum and minimum of f(x) = x^3 - 12x on [-3, 3]');
 assert.equal(q.kind,'calc');assert.equal(q.calc,null);assert.equal(q.school,null);assert.equal(q.parts.length,2);
 assert.deepEqual(K.readQuestion('Find the maximum value of f(x) = x^3 - 12x on [-3, 3].').parts,null,'a single read carries no parts');
});
