// One revise round (references/challenge.md section 5): applies the critic's one change per card.
const fs = require('fs');
const read = (h) => JSON.parse(fs.readFileSync(`cards/${h}.json`, 'utf8'));
const out = [];

const essay = read('essay-master');
const eA = essay.cards[0];
eA.acceptance[0] = "case 1: Structure lens, THREE-style paragraph 'Homework is pointless. Teachers give too much. It ruins evenings.'; engine.text stubbed (as tools/essay-rules-test.cjs:16) to observe job 'claim' on all three AND to send a legacy verdict:'strong' on each. Rule pinned: a claim observed with no sentence observed as evidence after it is faulty only for the FIRST such claim; later unsupported claims are neutral; a claim followed by an evidence sentence that carries an EVIDENCE marker is strong -> sentence 1 faulty, 2 and 3 neutral; the legacy verdict field is ignored (node:test, tools/essay-rules-test.cjs)";
eA.revised = "critic: case 1 now states the structure rule it pins";

const linga = read('linga');
const lA = linga.cards[0];
lA.acceptance[4] = "case 5: pure table, creditOf(quote, skill, shown) from credit.ts: ('Yes, thanks','contact',[]) -> 'none'; ('Where did Pip go','repair',[]) -> 'none'; ('Which bridge do you mean','repair',[]) -> 'own'; ('Which way should I go','request',['Which way should I go?']) -> 'helped'; ('I enjoy drawing because it is calm','describe',[]) -> 'own' (node:test, tools/linga-credit-test.cjs)";
const before = lA.body;
lA.body = lA.body.replace('sorry, pardon, what, which, where, how, say, spell, understand', 'sorry, pardon, say, spell, understand; bare wh-words (what, which, where, how) are not repair markers on their own');
if (lA.body === before) throw new Error('linga A marker list not found');
lA.revised = "critic: bare wh-words dropped from the repair markers; case 5 pins 'Where did Pip go' -> none and adds 'Which bridge do you mean' -> own";

const critic = JSON.parse(fs.readFileSync('critic.json', 'utf8'));
const final = [];
for (const h of ['math-buddy', 'linga', 'essay-master']) {
  const doc = h === 'linga' ? linga : h === 'essay-master' ? essay : read(h);
  for (const c of doc.cards) {
    const v = critic.cards.find((x) => x.host === h && x.slot === c.slot);
    const mean = +((v.ambition.score + v.grounding.score + v.falsifiability.score) / 3).toFixed(2);
    final.push({ ...c, critic: { verdict: v.verdict, final_verdict: v.verdict === 'void' ? 'void' : 'build', ambition: v.ambition.score, grounding: v.grounding.score, falsifiability: v.falsifiability.score, mean, rank: +(c.impact * mean).toFixed(1), deck_line: v.deck_line } });
  }
}
fs.writeFileSync('cards/essay-master.json', JSON.stringify(essay, null, 2) + '\n');
fs.writeFileSync('cards/linga.json', JSON.stringify(linga, null, 2) + '\n');
final.sort((a, b) => b.critic.rank - a.critic.rank);
fs.writeFileSync('cards-final.json', JSON.stringify({ run: 'challenge-2026-10-07', base: '27c66e1e', cards: final }, null, 2) + '\n');
for (const c of final) console.log(c.critic.rank, c.context, c.slot, c.critic.verdict, c.title);
