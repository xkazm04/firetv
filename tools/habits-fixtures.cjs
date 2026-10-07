/**
 * The fixture for the habit detectors (Study Desk v2 T3, adult card D5): desk/src/lib/rules/habits.ts.
 * Written BEFORE the detectors and committed alone. Per detector, 32 rows: 16 with the habit planted and 16 clean.
 * A planted row carries `at`, the splitSentences number (essay.ts, numbering runs on through the piece) the habit must be
 * found at; for a habit that spans sentences (a repeated opener, a long run, two claims) `at` is the first of them and a
 * hit counts when its `n` holds it. A clean row has `at: null`. The clean rows hold the near-misses that make a detector
 * over-fire. A row is changed after this commit only when it is wrong as English (the log lists any change).
 * Formats are mixed on purpose: a chat message, an email (a greeting line is sentence 1, the sign-off is the last), and
 * an essay paragraph or two. `band` (long-run only) is { wps: { p50, p90 }, sentences }, the shape styleSheet gives.
 */
const P = (text, at, extra) => ({ text, at, ...(extra || {}) });
const C = (text, extra) => ({ text, at: null, ...(extra || {}) });
const email = (...paras) => ['Hi Sam,', ...paras, 'Thanks,\nAlex'].join('\n\n');
const essay = (...paras) => paras.join('\n\n');
const BAND = { wps: { p50: 9, p90: 18 }, sentences: 40 };
const SHORT = { wps: { p50: 8, p90: 12 }, sentences: 30 };
const THIN = { wps: { p50: 9, p90: 18 }, sentences: 6 };

const vague = [
  P('The bus was late again. This is why I missed the quiz.', 2),
  P('We moved the deadline to Friday. It makes the whole week harder.', 2),
  P('Many schools ban phones in lessons. Teachers say pupils lose focus. This shows the policy works.', 3),
  P('Prices rose last year. This means families spend less on food.', 2),
  P('Sam forgot the tickets. This made everyone angry.', 2),
  P(email('I checked the invoice. It shows two charges for March.'), 3),
  P(email('The printer broke on Monday. This was a problem for the whole office.'), 3),
  P(essay('Cities grow fast.', 'This leads to more traffic and more noise.'), 2),
  P('I tried to call you twice. It proves nothing, but I am worried.', 2),
  P('The river flooded the road. It causes trouble every spring.', 2),
  P('We won the vote. This can change how the club is run.', 2),
  P('Rents keep going up. This will hurt students most.', 2),
  P(essay('Wages have stayed flat for years. Costs have not.', 'It affects young workers the most. They cannot save.'), 3),
  P('He never replied. It tells me he does not care.', 2),
  P(email('The new timetable starts in May.', 'I read the notes carefully. This does not match what we agreed.'), 4),
  P('Our team scored late. It matters because the league is close.', 2),
  C('This essay argues that homework should be shorter.'),
  C('It is raining.'),
  C('It was raining all day, so we stayed in.'),
  C(email('This is Sam from accounts.', 'Could you send the March figures?')),
  C('This morning I woke up late. The bus had already gone.'),
  C('The plan is simple. This new rule limits phones to break times.'),
  C('Last term we tried a new method. These results show it works.'),
  C('Italy is warm in June. Italians eat late.'),
  C('We argued for an hour. In the end this decision was fair.'),
  C('This is a test of the alarm.'),
  C('The cat sat on the stairs. It looked tired.'),
  C('I read the report twice. This paragraph, on page four, is the key one.'),
  C('Thanks for the lift. It will rain tomorrow, so bring a coat.'),
  C(essay('Cities grow fast.', 'This growth leads to more traffic and more noise.')),
  C('The vote ended late. Everyone agreed that this was the right result.'),
  C('Dear Sam, I hope you are well. It has been a long week here.'),
];

const hedge = [
  P('I think maybe we could meet on Friday.', 1),
  P('Perhaps it might rain later.', 1),
  P("It's sort of probably fine.", 1),
  P('I guess we could possibly leave early.', 1),
  P('We start at nine. I feel like maybe the plan is too big.', 2),
  P(email('The report is attached.', 'I think it might need another look.'), 3),
  P(email('I am not sure, but perhaps the invoice was paid twice.'), 2),
  P("He's kind of sort of upset with me.", 1),
  P(essay('The policy has costs.', 'It probably might reduce traffic, but nobody knows.'), 2),
  P('I suppose it might be better if we waited.', 1),
  P('Maybe I could perhaps come along.', 1),
  P('Thanks for the notes. I think it is possibly the wrong date.', 2),
  P('That seems fine, but I am not sure it will maybe work.', 1),
  P(email('The draft is done.', 'I guess it might be too long.', 'Tell me what you think.'), 3),
  P('It is somewhat probably the best option.', 1),
  P('The plan, I think, might need more time.', 1),
  C('Maybe we could meet on Friday.'),
  C('I think it is fine.'),
  C('It might rain later.'),
  C('Perhaps the invoice was paid twice.'),
  C('What kind of music do you like?'),
  C('I am not sure about the date.'),
  C('The result was probably correct.'),
  C(email('The report is attached.', 'I think it needs another look.', 'I might be free on Tuesday.')),
  C('I think we should leave. Maybe the train is late. Perhaps we can walk.'),
  C(essay('The policy has costs.', 'It will reduce traffic, and that is the aim.')),
  C('I guess that works.'),
  C('He might call. He might not.'),
  C('It was a sort of garden shed.'),
  C('The answer is yes. I am sure of it.'),
  C('Kind regards to your family.'),
  C('I suppose so.'),
];

const opener = [
  P('I went to the shop. I bought milk. I came home. I made tea.', 1),
  P('We left early. We took the bus. We got there late.', 1),
  P('The film was long. The seats were hard. The popcorn was stale. A friend slept.', 1),
  P(essay('Schools matter. Teachers work hard.', 'Students learn. Students grow. Students care.'), 3),
  P(email('I got your message. I will reply tomorrow. I hope that is fine.'), 2),
  P('He called. He texted. He emailed. Nobody answered.', 1),
  P('My phone died. My laptop froze. My bus broke down.', 1),
  P('She is kind. She is clever. She is late.', 1),
  P('Dogs bark. Cats purr. Dogs run. Dogs chase. Birds sing.', 1),
  P(essay('Rain fell.', 'Our trip failed. Our plan failed. Our budget failed.'), 2),
  P('First, I read. Then I wrote. Then I slept. Then I woke.', 2),
  P('It was cold. It was dark. It was quiet.', 1),
  P(email('The team won. The crowd cheered. The band played. The fans sang.'), 2),
  P('You said yes. You came late. You left early.', 1),
  P('They agreed. They signed. They paid.', 1),
  P('Prices rose. Wages fell. Prices rose again. Prices kept rising.', 1),
  C('I went to the shop. I bought milk. Then I came home.'),
  C('We left early. We took the bus. The trip was long.'),
  C('The film was long. The seats were hard.'),
  C(essay('Schools matter. Teachers work hard.', 'Students learn. Students grow.')),
  C('I went to the shop.\n\nI bought milk.\n\nI came home.'),
  C(email('I got your message.', 'I will reply tomorrow.', 'I hope that is fine.')),
  C('He called. She texted. They emailed. Nobody answered.'),
  C('She is kind. He is clever. They are late.'),
  C('Dogs bark. Cats purr. Birds sing. Fish swim.'),
  C('First, I read. Then I wrote. Later I slept.'),
  C('It was cold. It was dark.'),
  C(essay('Rain fell. Rain stopped.', 'Our trip failed. Our plan failed.')),
  C('You said yes. You came late.'),
  C('One sentence only.'),
  C(email('The team won. The crowd cheered.', 'The band played. The fans sang.')),
  C('I think so. Maybe you are right. I will try. So we agree.'),
];

// long sentences, each over 18 words; short ones well under
const LA = 'After the match finished on Saturday afternoon we all walked back to the station together and talked about what had gone wrong in the second half.';
const LB = 'The council announced that the library would close for repairs until the end of the year, although nobody could say when the work would actually begin.';
const LC = 'My brother says that he will move to another city next summer because the rent here is far too high and his job pays almost nothing.';
const LD = 'When the storm reached the coast late in the evening, the lights went out across the whole town and the roads filled with water within an hour.';
const LE = 'Our teacher explained that the experiment had failed because the temperature was never constant, which meant that every reading we took was slightly wrong.';
const SA = 'We were tired.';
const SB = 'Nobody spoke.';
const SC = 'It was fine.';
const MID = 'We walked home slowly after the long match ended today.'; // 10 words
const M14 = 'We walked home slowly after the long match and talked about it all.'; // 13 words
const E18 = 'We walked home slowly after the long match ended and then talked about it all the way.'; // 17 words, inside the band
const longrun = [
  P(`${SA} ${LA} ${LB}`, 2, { band: BAND }),
  P(`${LC} ${LD} ${SB}`, 1, { band: BAND }),
  P(`${SA} ${SB} ${LE} ${LA}`, 3, { band: BAND }),
  P(email(`${LB} ${LC}`), 2, { band: BAND }),
  P(essay(`${SA} ${SB}`, `${LD} ${LE} ${LA}`), 3, { band: BAND }),
  P(`${LA} ${LB} ${LC} ${SC}`, 1, { band: BAND }),
  P(`${SC} ${LE} ${LD}`, 2, { band: BAND }),
  P(email(`${SA}`, `${LA} ${LD}`), 3, { band: BAND }),
  P(`${M14} ${M14} ${SA}`, 1, { band: SHORT }),
  P(`${SA} ${M14} ${LB}`, 2, { band: SHORT }),
  P(`${LC} ${LB}`, 1, { band: BAND }),
  P(`${SB} ${SC} ${LA} ${LC} ${LD}`, 3, { band: BAND }),
  P(essay(`${LE} ${SA}`, `${SB} ${LB} ${LC}`), 4, { band: BAND }),
  P(email(`${LD} ${LA} ${LB}`), 2, { band: BAND }),
  P(`${LC} ${LE} ${SA} ${SB}`, 1, { band: BAND }),
  P(`${SA} ${LD} ${LB} ${SB}`, 2, { band: BAND }),
  C(`${SA} ${LA} ${SB}`, { band: BAND }),
  C(`${LA} ${SA} ${LB}`, { band: BAND }),
  C(`${LA} ${SA} ${LB} ${SB} ${LC}`, { band: BAND }),
  C(essay(`${SA} ${LA}`, `${SB} ${LB}`), { band: BAND }),
  C(`${LA} ${LB}`, { band: null }),
  C(`${LA} ${LB} ${LC}`, { band: THIN }),
  C(`${LA} ${LB}`, { band: { wps: { p50: 0, p90: 0 }, sentences: 0 } }),
  C(`${E18} ${E18} ${SA}`, { band: BAND }),
  C(`${MID} ${MID} ${MID}`, { band: BAND }),
  C(`${M14} ${M14}`, { band: BAND }),
  C(email(`${LA}`, `${SB}`, `${LB}`), { band: BAND }),
  C(`${SA} ${SB} ${SC}`, { band: BAND }),
  C(`${LC}`, { band: BAND }),
  C(`${SA} ${LB} ${SB} ${LC} ${SC}`, { band: BAND }),
  C(`${E18} ${SB} ${E18}`, { band: BAND }),
  C(`${M14} ${SC} ${M14}`, { band: SHORT }),
];

const filler = [
  P('I just really wanted to say sorry.', 1),
  P('It was actually quite a basic idea.', 1),
  P('Honestly, the film was literally amazing and totally worth it.', 1),
  P('We basically just need a plan.', 1),
  P('The test was very, very hard.', 1),
  P(email('The report is done.', 'It is really quite long and honestly very dull.'), 3),
  P('Thanks. I simply do not actually know.', 2),
  P('He was totally and utterly lost, honestly.', 1),
  P(essay('Cities grow.', 'This is basically a very important change.'), 2),
  P('I mean, it is literally just a sandwich.', 1),
  P('She really, truly, deeply cares.', 1),
  P('In order to win, we obviously need to train.', 1),
  P('Needless to say, it was definitely quite late.', 1),
  P('It was essentially just a basic repair.', 1),
  P(email('Short update.', 'We are just really behind, to be honest, and we actually need help.'), 3),
  P('At the end of the day, it was a very simple choice.', 1),
  C('I really wanted to say sorry.'),
  C('It was a basic idea.'),
  C('The film was amazing.'),
  C('We need a plan.'),
  C('The test was very hard.'),
  C('He just left.'),
  C('The justice system is very fair.'),
  C(email('The report is done.', 'It is long and rather dull.')),
  C('I really like it. It was good.'),
  C('Actually, I disagree.'),
  C(essay('Cities grow.', 'This is an important change.')),
  C('She simply left.'),
  C('We came to the town in order to see the castle.'),
  C('The reallocation of funds was quite sensible.'),
  C('That is literally what the sign says.'),
  C('I will honestly try.'),
];

const claims = [
  P('Homework should be banned. Teachers should plan better lessons instead.', 1),
  P('Schools must start later. Parents ought to stop complaining about it.', 1),
  P('Public transport is always better. Cars are the worst thing in a city.', 1),
  P('Exams are unfair. Coursework is better for everyone.', 1),
  P(essay('Cities need more trees.', 'Trees are important. Parks should never be sold.'), 2),
  P(email('I think the plan is wrong. We must change the date.'), 2),
  P('Uniforms are bad. Schools should drop them.', 1),
  P('Zoos are wrong. Animals should never be kept in cages.', 1),
  P('Tax is too high. The government should cut it.', 1),
  P('Reading is the best habit. Everyone should read every day.', 1),
  P(email('The meeting was a waste.', 'Meetings should be shorter. Managers must learn to listen.'), 3),
  P('Football is the greatest sport. Rugby is the worst.', 1),
  P('Phones are unfair on teachers. They should be locked away.', 1),
  P('Cheap flights are wrong. Trains should be cheaper.', 1),
  P(essay('Sleep is essential for students. Schools should start later.', 'Libraries need money.'), 1),
  P('Voting should be compulsory. Politicians must work harder to earn it.', 1),
  C('Homework should be banned. A survey of 200 pupils found that most sleep under eight hours.'),
  C('Schools should start later. Therefore pupils would sleep more.'),
  C('Exams are unfair. Why do we still use them?'),
  C('Uniforms cost money. According to the report, a blazer costs 60 pounds.'),
  C('Our school has a long corridor. Phones should be locked away.'),
  C('Can we move lunch? Noon works for me.'),
  C(email('I am free on Tuesday.', 'Could we meet at ten?')),
  C('Zoos are wrong. For example, elephants walk miles each day in the wild.'),
  C('We went to the museum on Friday. The tickets were free.'),
  C(essay('Sleep is essential for students.', 'Research shows that teenagers need nine hours. So schools should start later.')),
  C('The park opens at eight. Dogs are allowed.'),
  C('Reading is the best habit. This means everyone gains from it.'),
  C('Tax is too high. Why not ask people what they think?'),
  C('Hello. Thanks for the lift.'),
  C('I like the red one. It costs 12 pounds.'),
  C('Public transport is better. Studies of 40 cities found less pollution.'),
];

module.exports = {
  'vague-opener': vague,
  'hedge-stack': hedge,
  'repeated-opener': opener,
  'long-run': longrun,
  filler,
  'two-claims': claims,
  BAND, SHORT, THIN,
};
