# LT run 2026-09-15-lt-j1b — Linga

Engine: codex-cli/gpt-6-astra for tutor, Character and judge · 5 Characters · 5 min wall clock · registry: none
Certification level: **LT (text-live)**. Findings are `verdict: uncertain` until verified; nothing here is L2.

## Scorecard

| Character | Journey | Verdict | Criteria | Placement | Pitch at band | Moments correct | Breaches | Steps | Min | Ended |
|---|---|---|---|---|---|---|---|---|---|---|
| lukas-24 | J1 | conditional | 2/2 | B2 vs B2 · exact |  |  | 0 | 10 | 4.4 | done |
| oksana-34 | J1 | conditional | 4/4 | B1 vs B1 · exact |  |  | 0 | 10 | 4.2 | done |
| ondrej-16 | J1 | pass | 3/3 | B1 vs B1 · exact |  |  | 0 | 10 | 4.1 | done |
| petra-38 | J1 | conditional | 3/4 | B1 vs A2 · near |  |  | 0 | 10 | 3.7 | done |
| tomas-9 | J1 | fail | 2/3 | A1 vs A1 · exact |  |  | 0 | 10 | 3.2 | done |

## Metrics (units in uat/rubric.md)

- **placement:** exact 4 · near 1 · miss 0
- **judge agreement:** 24/25 (96%)
- **topic fit:** fit n/a · safe n/a
- **pitch:** at band n/a · below 0 · above 0
- **moment precision:** n/a
- **boundaries:** 0 breach(es)
- **reliability:** tutor 68 calls, 0 failed, avg 10s · character 50 calls, 0 failed, avg 10s · judge 5 calls, 0 failed, avg 61s

## Findings by impact

- **blocker · rank 18** `LT-tomas-9-J1-1` (clarity) — Instructions exceed his reading and listening capacity
  - expected: Tiny instructions he understands, with check tasks requiring about 15 English words or fewer.
  - got: Long onboarding questions and task wording leave him responding to Minecraft as a familiar keyword.
  - evidence: #3: "I heard Minecraft, but I don't know what else she said." #6 contains 25 task words including options. #8: "This is too much English, but I like Minecraft."
  - acceptance: Keep the complete task reading load near 15 words and demonstrate that this beginner understands the requested action, including after Czech or don't-know responses.
- **major · rank 9** `LT-petra-38-J1-1` (trust) — The verdict smooths over mixed evidence
  - expected: A credible near placement explains the difference between understanding guests, using familiar phrases and handling unfamiliar speech.
  - got: B1 is reported with high confidence in the facts and a consistency claim on screen, despite an A2 production observation. Petra remains doubtful.
  - evidence: #7's recorded assessment says "small grammar errors ... kept your English at A2 here". #10 says "your answers agreed with each other". Petra reacts: "B1 is higher than I think, because on phone I still don't understand sometimes."
  - acceptance: Explain the mixed skill evidence and uncertainty in plain language; avoid claiming agreement without reconciling the A2 observation with B1.
- **minor · rank 6** `LT-lukas-24-J1-1` (senior-quality) — The next focus is plausible but insufficiently personal or actionable
  - expected: A teacher-like next focus tied to an actual answer and his goal of feeling comfortable in social conversations.
  - got: A broad vocabulary recommendation without an example, a concrete practice action, or a connection to his dating anxiety. This leaves the personalized-feedback part of the definition of done only partly met.
  - evidence: #4: "asking someone out for coffee without sounding awkward"; #10: "Practise using more precise and varied vocabulary to explain subtle differences between ideas." His final reaction remains: "dates still make me nervous."
  - acceptance: Tie the next focus to one quoted response and provide one natural alternative or short exercise relevant to his stated social goal, without treating ordinary conversational language as an error.
- **minor · rank 6** `LT-oksana-34-J1-1` (senior-quality) — The summary overstates the past problem-solving evidence
  - expected: Describe the abilities demonstrated, or elicit a past problem-solving account before crediting its sequence.
  - got: The summary credits explaining steps taken to solve a delivery problem. Her strongest sequence explains a routine; the past example gives only one action.
  - evidence: #8: “First I check which deliveries are most urgent” describes habitual planning. #9: “we sometimes changed delivery order after speaking with warehouse” supplies a brief past example. #10 nevertheless says, “You can explain the steps you took to solve a delivery problem.”
  - acceptance: Summarise demonstrated delivery planning and reason-giving; reserve past problem-solving claims for an answer that actually demonstrates them.
- **minor · rank 6** `LT-ondrej-16-J1-1` (senior-quality) — B1 narration receives too little credit
  - expected: Accept connected, understandable B1 narration while identifying grammar to practise.
  - got: The app marked the B1 speaking response partial despite successful narration and explanation.
  - evidence: #8: “He don't want to mine again, so we decided to build mob farm. We never tried that before and we needed more XP.” The corresponding facts verdict is “partial”, citing basic verb forms.
  - acceptance: Grade this response pass at B1 while retaining verb-form feedback; distinguish communicative success from grammatical accuracy.
- **minor · rank 6** `LT-petra-38-J1-2` (senior-quality) — The next focus is too general to act on
  - expected: A teacher-like next step tied to her demonstrated difficulty and stated goal.
  - got: The focus mentions guests but offers no specific sentence pattern, example or phone-comprehension practice.
  - evidence: #4: "And phone call is difficult for me." #10: "Practise using clear, accurate sentences to help guests in new situations."
  - acceptance: Give one concrete next exercise or useful phrase grounded in her answers, such as practising a guest complaint over the phone.
- **minor · rank 6** `LT-tomas-9-J1-2` (senior-quality) — Next focus repeats a demand he could not meet
  - expected: A small, achievable next step built from his successful words.
  - got: The focus introduces an activity sentence without a simpler bridge from "I like Minecraft."
  - evidence: #8: "I like Minecraft. Já nevím." #10 proposes "I like to build houses." His reaction: "that Minecraft sentence is too hard and I want to play now."
  - acceptance: Offer one short, immediately repeatable phrase using familiar words before expanding to an activity sentence.
- **minor · rank 6** `LT-tomas-9-J1-3` (trust) — Confidence wording overlooks guessed recognition
  - expected: An accurate A1 result with an explanation that reflects limited demonstrated understanding.
  - got: The result claims consistent evidence even though one correct selection was explicitly a guess.
  - evidence: #5: "I don't know these words, but I will try the first one." #10: "your answers agreed with each other" and "You can pick a simple reply"; facts.placement records confidence "high".
  - acceptance: Distinguish successful selections from demonstrated comprehension and qualify confidence when productive evidence is sparse.

## What passed

- `LT-lukas-24-J1-2` The B2 result is credible and appropriately qualified — Exact B2 placement, supported by successful explanation and comparison, presented as an estimate rather than certification.
- `LT-lukas-24-J1-3` Clear tasks incorporate his adult goals without embarrassment — He reaches the verdict after five tasks, with no recorded retry or outside help. Dating and interview goals both appear in the check.
- `LT-oksana-34-J1-2` The check respects her language and professional goal — The introduction permits her own language, and subsequent prompts use her Friday interview and logistics experience.
- `LT-oksana-34-J1-3` She reaches an acceptable level with a supported next focus — She completes five tasks without a shown retry or outside help, accepts B1, and receives an article focus supported by repeated omissions.
- `LT-ondrej-16-J1-2` Exact placement with feedback grounded in his answers — B1 placement, an accurate description of demonstrated skills, and useful verb corrections.
- `LT-ondrej-16-J1-3` Relevant tasks earned engagement and a completed check — He completed three introductory questions and five placement tasks, then accepted the verdict without recorded help or retries.
- `LT-petra-38-J1-3` A short, understandable route reaches the result — Three introductory questions and five tasks lead directly to the verdict; no retry or outside help appears.
- `LT-petra-38-J1-4` Hotel scenarios make the check relevant — Tasks use guest requests and realistic service problems, helping Petra engage despite anxiety.
- `LT-tomas-9-J1-4` He reaches an appropriate level with a personal summary — He reaches the verdict after five tasks, receives exact A1 placement, and sees his Minecraft response reflected.

## Voices

**Lukáš · J1** (time saved: 0 min · low)

> So, B2 sounds believable. I could explain my answers, and the check didn't make me feel stupid. I liked that I mentioned dates and it actually used a date situation without making it weird. The interview question felt relevant too.
> I would try it again, but the final advice was a bit vague. More precise vocabulary—okay, but what would I actually say differently over coffee? One example from my answer would help me trust the advice more. I haven't seen its corrections or how it handles flirting yet.
> Seven minutes sounded reasonable; I can't tell from this whether the actual waits were worth it. I wouldn't claim it saved me coaching time yet. I'd tell a friend the level check seems sensible, but I'd want some real conversation practice before recommending it for date confidence.

**Oksana · J1** (time saved: 0 min · low)

> I would use it again for interview practice. It listened when I said logistics and Friday, and I did not have to explain twice that I am Ukrainian. The questions about carriers, delays and costs felt relevant. B1 seems believable, and I recognise the missing articles in my answers.
> The final summary is a little generous: I explained my normal planning, but I have not yet rehearsed a complete story about a problem I solved. That is what I need next, with useful corrections.
> The five tasks felt manageable. I cannot judge the actual waits from this record. This gave me a starting point, but I would not count it as an interview rehearsal or claim coaching time saved yet. I would tell a colleague it is worth trying for a level check; I still need to see how well it coaches an actual interview.

**Ondřej · J1** (time saved: 0 min · medium)

> B1 is fair. The Minecraft questions actually gave me something to say, especially choosing between games. It noticed what I could explain and gave me actual verb forms to fix, so the final screen felt believable. Marking my lava story only partly right seems harsh: I explained what happened and why we changed plans. Still, nobody lectured me or made me feel stupid. I’d try it again if the practice stays this relevant. I didn’t test whether I could break it this time. I wouldn’t claim it saved me time—I wasn’t doing voluntary English practice before—and I can’t judge the waits from this run. I’d tell a teammate the level check was surprisingly decent.

**Petra · J1** (time saved: 0 min · low)

> I would try it again because the hotel questions felt useful. The cold room and forgotten bag are problems I understand, and I did not feel laughed at when I struggled. Nothing shown worried me as a parent, although I have not seen the children's practice. B1 surprised me. I can say familiar sentences at reception, but unexpected phone calls are still difficult. I wanted the result to explain that difference. The advice to use clear, accurate sentences does not tell me what to practise tomorrow. I cannot judge the corrections yet because this was only the level check. The short route felt manageable, but I cannot say how much time it saved or whether the waits were worthwhile from this record. I would tell a colleague it is worth trying for hotel English, with some caution about trusting the level.

**Tomáš · J1** (time saved: 0 min · low)

> Jo, Minecraft! I liked that it knew my game. I got to the end, and A1 is probably okay. But there were lots of English words. Sometimes I only heard Minecraft. I picked the first wood answer because I didn't know. Does that really show what I can say? Nobody was mean when I said nevím. The last sentence about building houses was too hard. I want one tiny thing I can say, then something funny. Seven minutes sounded long; I wanted to play at the end. I'd try again if it used tiny questions. I wouldn't tell my friends to try this check yet.
