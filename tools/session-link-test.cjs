/**
 * TL-4: a dropped link is seen on both screens. reopenDelay (desk/src/tv/useSession.ts) is pure: zero before a
 * failure, then 1500 ms doubling to a 30 000 ms cap. The TV draws its band inside .stage (not the bench bar); the
 * phone's header tests `connected` before `s.joined` and holds its Send buttons while the link is down. Source pins
 * on the two pages. No store, no route, no model. Run: node tools/session-link-test.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const SRC=path.resolve(__dirname,'../desk/src');
// comments are stripped first: a pin that a comment can satisfy pins nothing
const strip=(t)=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:\\])\/\/.*$/gm,'$1');
const read=(f)=>strip(fs.readFileSync(path.join(SRC,f),'utf8'));

test('reopenDelay: 1500, 3000, 6000 ... capped at 30000; zero after a message',()=>{
  const {reopenDelay}=require(path.join(SRC,'tv/useSession.ts'));
  assert.equal(typeof reopenDelay,'function');
  assert.deepEqual([1,2,3,4,5,6].map(reopenDelay),[1500,3000,6000,12000,24000,30000]);
  assert.equal(reopenDelay(7),30000);
  assert.equal(reopenDelay(50),30000);
  assert.equal(reopenDelay(0),0);
});

test('the stream reopen uses reopenDelay and resets on a message',()=>{
  const t=read('tv/useSession.ts');
  assert.match(t,/setTimeout\(open, reopenDelay\(/);
  assert.doesNotMatch(t,/setTimeout\(open, 1500\)/);
  // the reset is the message handler's, not the declaration's `let ... attempt = 0`
  assert.match(t,/onmessage[^\n]*\battempt = 0\b/);
  // seeded: the handler's reset taken out is red, though the declaration still reads `attempt = 0`
  const seeded=t.replace(/attempt = 0; setConnected\(true\);/,'setConnected(true);');
  assert.notEqual(seeded,t,'the seed took the reset out');
  assert.doesNotMatch(seeded,/onmessage[^\n]*\battempt = 0\b/);
});

test('TV: the lost-link band is inside .stage, not the bench bar',()=>{
  const t=read('app/tv/page.tsx');
  const band=t.indexOf('Lost the desk link. Reconnecting.');
  assert.ok(band>0,'band copy present');
  const stage=t.indexOf('className="stage"'),stageEnd=t.indexOf('</div>\n      </div>\n    </div>',stage);
  assert.ok(stage>0&&band>stage,'band comes after the stage opens');
  assert.ok(stageEnd<0||band<stageEnd);
  assert.match(t.slice(stage,band),/!connected/);
  const bar=t.slice(t.indexOf('className="bar"'),stage);
  assert.doesNotMatch(bar,/Lost the desk link/);
});

test('phone: the header tests connected before s.joined; Sends are held while it is false',()=>{
  const t=read('app/phone/page.tsx');
  const h=t.match(/<div className="link">([^\n]*)/)[1];
  assert.ok(h.indexOf('!connected')>=0&&h.indexOf('!connected')<h.indexOf('s?.joined'),'connected first');
  assert.match(t,/const busy = working \|\| !connected;/);
});
