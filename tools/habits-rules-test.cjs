/**
 * The habit detectors' precision table and gate (Study Desk v2 T3, adult card D5): desk/src/lib/rules/habits.ts, measured on
 * tools/habits-fixtures.cjs (written first, committed alone). Per detector the suite prints:
 *   planted found at their sentence | planted missed | planted found at another sentence | clean rows flagged
 * The gate is zero false positives: a hit on a clean row, or a planted row found only at another sentence. A missed planted
 * row is recorded and does not fail. A detector that cannot reach zero is out of SHIPPED (kept in the file, its rows kept
 * here), and the SHIPPED row below pins SHIPPED to exactly the detectors that pass, so the list cannot drift from the table.
 * Then the hit shape (n are real sentence numbers, quote is an exact slice), the English-only rule, and openHabits
 * (a habit seen in two different pieces; a withheld detector never opens one; long-run with no band is no hit).
 * No model is called. Run with npm test in desk/ (directly: node tools/habits-rules-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const src=(f)=>path.join(root,'src',f);
const {detect,detectAll,openHabits,SHIPPED,HABITS,MIN_BAND_SENTENCES}=require(src('lib/rules/habits.ts'));
const {splitSentences}=require(src('lib/rules/essay.ts'));
const {styleSheet}=require(src('lib/rules/style.ts'));
const fx=require('./habits-fixtures.cjs');

const measure=(habit)=>{
  const t={found:0,missed:0,other:0,flagged:0,planted:0,clean:0,falseAt:[]};
  fx[habit].forEach((row,i)=>{
    const hits=detect(habit,row.text,row.band);
    if(row.at==null){t.clean++;if(hits.length){t.flagged++;t.falseAt.push(`clean row ${i}: ${JSON.stringify(row.text)} -> n ${JSON.stringify(hits.map((h)=>h.n))}`);}}
    else{t.planted++;if(!hits.length)t.missed++;else if(hits.some((h)=>h.n.includes(row.at)))t.found++;else{t.other++;t.falseAt.push(`planted row ${i} at ${row.at}: ${JSON.stringify(row.text)} -> n ${JSON.stringify(hits.map((h)=>h.n))}`);}}
  });
  return t;
};
const table=HABITS.map((h)=>[h,measure(h)]);
const passes=(t)=>t.flagged===0&&t.other===0;

test('the fixture: at least 30 rows a detector, at least half clean, every label a real sentence',()=>{
  assert.deepEqual([...HABITS].sort(),['filler','hedge-stack','long-run','repeated-opener','two-claims','vague-opener']);
  for(const h of HABITS){
    const rows=fx[h];assert.ok(rows.length>=30,h+' rows');
    assert.ok(rows.filter((r)=>r.at==null).length*2>=rows.length,h+' is at least half clean');
    for(const r of rows)if(r.at!=null)assert.ok(r.at>=1&&r.at<=splitSentences(r.text).length,h+' label '+r.at+' in '+JSON.stringify(r.text));
  }
});

test('precision table: found at their sentence | missed | found at another sentence | clean flagged (the gate: zero false positives)',()=>{
  console.log('\n  '+'detector'.padEnd(16)+'planted  found  missed  other  | clean  flagged  | gate');
  for(const [h,t] of table)console.log('  '+h.padEnd(16)+String(t.planted).padStart(7)+String(t.found).padStart(7)+String(t.missed).padStart(8)+String(t.other).padStart(7)+'  |'+String(t.clean).padStart(6)+String(t.flagged).padStart(9)+'  |  '+(passes(t)?'pass':'FAIL (withheld)')+(SHIPPED.includes(h)?'':'  [not shipped]'));
  console.log('  SHIPPED: '+SHIPPED.join(', '));
  for(const h of SHIPPED){const t=table.find((x)=>x[0]===h)[1];if(!passes(t))console.log('  '+h+' false positives:\n    '+t.falseAt.join('\n    '));}
  for(const h of SHIPPED){const t=table.find((x)=>x[0]===h)[1];assert.equal(t.flagged,0,h+' flags a clean row');assert.equal(t.other,0,h+' finds a planted habit at another sentence');}
});

test('SHIPPED is exactly the detectors that pass the gate, and at least 3 ship',()=>{
  assert.deepEqual([...SHIPPED].sort(),table.filter(([,t])=>passes(t)).map(([h])=>h).sort());
  assert.ok(SHIPPED.length>=3,'fewer than 3 detectors ship');
});

test('every hit names real sentences and quotes the text exactly',()=>{
  for(const h of HABITS)for(const row of fx[h]){
    const ss=splitSentences(row.text);
    for(const hit of detect(h,row.text,row.band)){
      assert.equal(hit.habit,h);assert.ok(hit.n.length>=1);
      for(const n of hit.n)assert.ok(n>=1&&n<=ss.length);
      assert.ok(row.text.includes(hit.quote),h+' quote is not a slice of '+JSON.stringify(row.text));
      assert.equal(hit.para,ss[hit.n[0]-1].para??0);
    }
  }
  // a line break inside a paragraph is folded to a space in the sentence, but the quote stays the writer's own text
  const t='The bus was late again.\nThis is why I missed\nthe quiz.';
  const hits=detect('vague-opener',t);assert.equal(hits.length,1);assert.equal(hits[0].quote,'This is why I missed\nthe quiz.');
});

test('English only: a text with nothing English to read returns no hits; a non-string never throws',()=>{
  for(const h of HABITS){
    assert.deepEqual(detect(h,'今日は雨です。これは問題です。それは大変です。',fx.BAND),[]);
    assert.deepEqual(detect(h,'Esto es un problema. Esto es muy grande. Esto cambia todo.',fx.BAND).length,0);
    assert.deepEqual(detect(h,'',fx.BAND),[]);assert.deepEqual(detect(h,undefined),[]);assert.deepEqual(detect(h,42),[]);
  }
});

test('long-run: the band is the writer\'s own, from styleSheet over their texts; a thin one is no band',()=>{
  const own=[];for(let i=0;i<30;i++)own.push('We walked home. It was late. The shop was shut now. I was tired and hungry too.');
  const band=styleSheet(own);assert.ok(band.sentences>=MIN_BAND_SENTENCES);assert.ok(band.wps.p90>0);
  const long='After the match finished on Saturday afternoon we all walked back to the station together and talked about it. When the storm reached the coast late in the evening the lights went out across the whole town at once.';
  assert.equal(detect('long-run',long,band).length,1);
  assert.deepEqual(detect('long-run',long,styleSheet(own.slice(0,2))),[]);
  assert.deepEqual(detect('long-run',long),[]);assert.deepEqual(detect('long-run',long,null),[]);
});

const A='The bus was late again. This is why I missed the quiz.';   // vague-opener
const B='We walked in. The day was fine.';                          // nothing
test('openHabits: a habit in one piece is not open',()=>{
  assert.deepEqual(openHabits([{id:'p1',text:A},{id:'p2',text:B}]),[]);
});
test('openHabits: a habit in two pieces is open, with both ids',()=>{
  const r=openHabits([{id:'p1',text:A},{id:'p2',text:'Sam forgot the tickets. This made everyone angry.'},{id:'p3',text:B}]);
  assert.deepEqual(r,[{habit:'vague-opener',pieces:['p1','p2']}]);
});
test('openHabits: the same id twice counts once',()=>{
  assert.deepEqual(openHabits([{id:'p1',text:A},{id:'p1',text:A}]),[]);
  assert.deepEqual(openHabits([{id:'p1',text:A},{id:'p1',text:A},{id:'p2',text:A}]),[{habit:'vague-opener',pieces:['p1','p2']}]);
});
test('openHabits: a withheld detector never makes a habit open',()=>{
  const both=[{id:'p1',text:A},{id:'p2',text:A}];
  assert.deepEqual(openHabits(both,null,[]),[]);
  assert.deepEqual(openHabits(both,null,['hedge-stack']),[]);
  assert.deepEqual(openHabits(both,null,['vague-opener']),[{habit:'vague-opener',pieces:['p1','p2']}]);
  for(const [h,t] of table)if(!SHIPPED.includes(h))assert.ok(!openHabits(fx[h].filter((r)=>r.at!=null).slice(0,2).map((r,i)=>({id:'w'+i,text:r.text})),fx.BAND).some((o)=>o.habit===h));
});
test('openHabits: long-run with no band gives no hit, with a band it can open',()=>{
  const LA=fx['long-run'][0].text;
  assert.deepEqual(detect('long-run',LA),[]);
  assert.deepEqual(openHabits([{id:'p1',text:LA},{id:'p2',text:LA}]).filter((o)=>o.habit==='long-run'),[]);
  assert.deepEqual(openHabits([{id:'p1',text:LA},{id:'p2',text:LA}],fx.BAND).filter((o)=>o.habit==='long-run'),SHIPPED.includes('long-run')?[{habit:'long-run',pieces:['p1','p2']}]:[]);
});
test('detectAll runs the shipped detectors only',()=>{
  const all=detectAll(A);assert.ok(all.every((h)=>SHIPPED.includes(h.habit)));
  assert.deepEqual(detectAll(A,null,[]),[]);
});
