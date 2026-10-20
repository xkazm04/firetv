/**
 * The commit-provenance check (tools/commit-provenance.cjs) reads agent authorship from trailers: `Co-Authored-By:`
 * names the agent, `Agent-Lane:` the lane. Every case feeds it hand-made commit messages in the shape `git log` prints
 * (FORMAT), including the shapes this repository's history holds today: a lane commit with only `Ascent-Resolves:`
 * trailers and a prose `Lane:` line, and a session commit with a Claude `Co-Authored-By:`. No git, no network.
 * Run directly: node tools/commit-provenance-test.cjs
 */
const assert=require('node:assert/strict');
const {test}=require('node:test');
const P=require('./commit-provenance.cjs');

/** One commit as `git log --format=%x1e%H%x1f%s%x1f%B` prints it. */
const rec=(sha,message)=>`\x1e${sha}\x1f${message.split('\n')[0]}\x1f${message}\n`;
const LEGACY_LANE=['fix: Added pre-merge live-record drift check workflow','','Lane: cycle 1 on ascent/loop-20261005154017-xkazm04-firetv.','','Agent summary:','I resolved two of the three items.','','Ascent-Resolves: b2ab9a31-da71-45c3-b013-063d8233bb3e','Ascent-Resolves: 315b7e46-5487-4646-874f-e43ff2dbed59'].join('\n');
const SESSION=['feat(desk): calculus course path','','Pushed after the gate.','','Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>'].join('\n');
const STRUCTURED=['fix: Added desk boundary check','','Agent summary:','Added the check.','','Agent-Lane: ascent/loop-20261005160107-xkazm04-firetv','Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>','Ascent-Resolves: 346ff3cb-3fb0-440d-936c-d479023d2cdc'].join('\n');
const HUMAN=['docs: owner decisions 2026-10-04','','Reviewed with Jane.','','Co-Authored-By: Jane Doe <jane@example.com>'].join('\n');
const SUBJECT_ONLY='Merge branch deathride/tracks';

test('case 1: the trailer block is the last paragraph, and only when every line is a trailer or a continuation',()=>{
 assert.deepEqual(P.trailersOf(SESSION),[{key:'co-authored-by',value:'Claude Sonnet 5.5 <noreply@anthropic.com>'}]);
 assert.deepEqual(P.trailersOf('subject\r\n\r\nbody\r\n\r\nAgent-Lane: a/b\r\n  continued\r\n'),[{key:'agent-lane',value:'a/b continued'}]);
 assert.deepEqual(P.trailersOf('Co-Authored-By: X <noreply@anthropic.com>'),[],'a subject is never a trailer block');
 assert.deepEqual(P.trailersOf('subject\n\nSee: this line is prose\nand so is this one'),[]);
});

test('case 2: today\'s lane commit is AI-marked lane work whose lane is prose and whose agent is unnamed',()=>{
 const [c]=P.parseLog(rec('248c03ce',LEGACY_LANE));
 assert.equal(c.aiMarked,true);
 assert.equal(c.laneWork,true);
 assert.equal(c.lane,null);
 assert.equal(c.proseLane,'ascent/loop-20261005154017-xkazm04-firetv');
 assert.deepEqual(c.resolves,['b2ab9a31-da71-45c3-b013-063d8233bb3e','315b7e46-5487-4646-874f-e43ff2dbed59']);
 const [f]=P.findingsOf([c]);
 assert.equal(f.missing.length,2);
 assert.match(f.missing[0],/Co-Authored-By/);
 assert.match(f.missing[1],/only a prose line/);
});

test('case 3: a lane commit with Agent-Lane and an agent Co-Authored-By has nothing missing',()=>{
 const [c]=P.parseLog(rec('aaaa1111',STRUCTURED));
 assert.equal(c.lane,'ascent/loop-20261005160107-xkazm04-firetv');
 assert.deepEqual(c.agents,['Claude Opus 5.5']);
 assert.deepEqual(P.findingsOf([c]),[]);
});

test('case 4: a session commit needs only its agent; a human commit, even with a human co-author, is never a finding',()=>{
 const cs=P.parseLog(rec('bbbb2222',SESSION)+rec('cccc3333',HUMAN)+rec('dddd4444',SUBJECT_ONLY));
 assert.deepEqual(cs.map((c)=>c.aiMarked),[true,false,false]);
 assert.equal(cs[0].laneWork,false);
 assert.deepEqual(P.findingsOf(cs),[]);
});

test('case 5: Ascent-Resolves alone marks lane work that owes an Agent-Lane trailer',()=>{
 const [c]=P.parseLog(rec('eeee5555','fix: something\n\nCo-Authored-By: Codex <noreply@openai.com>\nAscent-Resolves: 1a26d20e'));
 assert.deepEqual(P.findingsOf([c]).map((f)=>f.missing),[['it is lane work (Ascent-Resolves) with no Agent-Lane trailer']]);
});

test('case 6: the report groups AI commits by lane and agent and says where the lane name came from',()=>{
 const cs=P.parseLog(rec('1',LEGACY_LANE)+rec('2',LEGACY_LANE)+rec('3',STRUCTURED)+rec('4',SESSION)+rec('5',HUMAN));
 assert.deepEqual(P.reportOf(cs),[
  {lane:'ascent/loop-20261005154017-xkazm04-firetv',agent:'(no agent trailer)',source:'prose',commits:2},
  {lane:'(no lane)',agent:'Claude Sonnet 5.5',source:'-',commits:1},
  {lane:'ascent/loop-20261005160107-xkazm04-firetv',agent:'Claude Opus 5.5',source:'trailer',commits:1},
 ]);
});

test('case 7: --check warns and passes; --strict fails on the same history; a clean range passes both',()=>{
 const dirty=()=>rec('248c03ce',LEGACY_LANE)+rec('bbbb2222',SESSION), clean=()=>rec('aaaa1111',STRUCTURED)+rec('cccc3333',HUMAN);
 const warn=P.run(['--check','origin/main..HEAD'],dirty);
 assert.equal(warn.code,0);
 assert.equal(warn.lines.filter((l)=>l.startsWith('::warning')).length,1);
 assert.match(warn.lines[0],/2 commit\(s\), 2 AI-marked, 1 without a structured trailer/);
 const strict=P.run(['--check','origin/main..HEAD','--strict'],dirty);
 assert.equal(strict.code,1);
 assert.ok(strict.lines.some((l)=>l.startsWith('::error')));
 assert.equal(P.run(['--check','a..b','--strict'],clean).code,0);
 assert.equal(P.run(['--check'],clean).code,2);
});

test('case 8: the report mode asks git for the last 200 commits when no range is given',()=>{
 const asked=[];
 const r=P.run([],(range,max)=>{asked.push([range,max]);return rec('3',STRUCTURED);});
 assert.deepEqual(asked,[[null,200]]);
 assert.equal(r.code,0);
 assert.ok(r.lines.includes('| ascent/loop-20261005160107-xkazm04-firetv | Claude Opus 5.5 | trailer | 1 |'));
});
