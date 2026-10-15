# Eliška, 12 — EM2 · Fix it myself

- Character: `eliska-12` (uat/characters/essay/eliska-12.md)
- Journey: EM2 (uat/journeys/essay/EM2-*.md)
- Cert level: **L1** (theoretical; no model, browser or server)
- Base commit: 12592a71
- **Verdict: L1-conditional.** The rewrite loop is structurally sound: refusals run before any model call, one sentence is re-judged, the others are kept by code, and the move inks on holds. Two majors carry to L2: a still-opinion rewrite can falsely "hold" (EM2-1), and the playbook fallback teaches a three-sentence frame that the rewrite refuses (EM2-2).

## Reachable surface set

The same as EM1 (see `eliska-12--EM1.md`). For EM2 specifically:

| Surface | Reachable | Gate |
|---|---|---|
| Forensic page actions (Rewrite on my phone, Why this matters, Next sentence, Back) | yes | `desk/src/tv/keys.ts:155,423-438` |
| Phone rewrite panel | yes, whenever the TV is on `forensic` with a reading | `desk/src/app/phone/panelFor.ts:42`; `onSentence` `desk/src/app/phone/page.tsx:186`, panel `:576-580` |
| `POST /api/analyse {kind:"rewrite"}` | yes, seated | `desk/src/app/api/analyse/route.ts:24,33-50` |
| Young voice on the re-judge | yes | `route.ts:23` → `reviseSentence(…, age)` (`desk/src/lib/desk/essay.ts:158-159`) |

## Surface model (EM2)

1. TV `forensic` on a faulty sentence (`keys.ts:157-163`). "Rewrite on my phone" (`keys.ts:434`) sets status `rewriteStatus(n)` (`:173`), which lights the phone chip (`EssayTV.tsx:328`). The status text itself is drawn only in the bench bar (`desk/src/app/tv/page.tsx:152`).
2. Phone Essay tab → rewrite panel: "Sentence n · Rewrite it in your own words…". The textarea is prefilled with her sentence (`page.tsx:195`), with Dictate (replaces the text with the transcript, `:578`) and Send (`sendRewrite`, `:196-198`).
3. Route: `revise()` refuses before any run (`route.ts:38`, `rules/essay.ts:342-356`), then `runJob` → `reviseSentence` (`lib/desk/essay.ts:158-191`). One `best` call (prompt at `:169-178`). The observation for n only is checked by `observationOk`. `decideVerdicts(lens, next.sentences, {n}, [got, ...contextObservations])` (`:185`). `was` is set, and every other verdict is copied (`:187-189`).
4. `essay.revised` (`store.ts:573-574`): the TV stays on n. If the rewrite holds and another sentence is faulty, focus moves to Next sentence (`keys.ts:168-171`).
5. Page: "Rewrite · it holds" with the move inked, or "Rewrite · not yet" with the note (`EssayTV.tsx:405-411,418,446`). The rail draws the old arrow as a ghost (`:368`).

## The walk (in character)

**Step 1, on sentence 3 ("Walking also makes children happier than going by car.").** *(1)* The page says what is wrong (note caption) and shows the move and pattern. *(2)* "Rewrite on my phone" is the primary pill. *(3)* Yes: "fix it myself" is literally the button. *(4)* Pressing it only lights the phone chip on the stage. But her phone already switched to the rewrite panel when the reading landed (panelFor `forensic` → `paste`), with her sentence in the box.

**Step 2, typing the rewrite.** She edits in place: "Walking makes children happier, because a survey from 2020 found that 7 of 10 children who walk feel calm at school." Accepted (E9 "good one"). Her Czech comma ("showed, that 7 of 10…") and an "e.g." are accepted too (E9). Pressing Send unchanged gives "That is sentence 3 as it was. Change it, then send it." Two sentences gives "That is 2 sentences. Send sentence 3 as one sentence." These are plain and come before any wait.
- If the page had shown the **playbook fallback** (her reading's own fix dropped), she would see "[Your claim]. For example, [the evidence]. This shows [the link back]." and fill it in as three sentences. The reply is "That is 3 sentences." She did exactly what the TV showed and got told off (E9, E13; EM2-2).
- If she dictates, the transcript has no capital or full stop, and the reply is "In the paragraph that would not stay one sentence. Start it with a capital and end it with a full stop." The second half she can act on. The first half reads like a broken sentence (EM2-4).

**Step 3, the verdict.** With checkable support and a marker ("survey", "2020", "7 of 10"), S3 comes back strong → "Rewrite · it holds", and the move "Back it up" (her fix) inks (E10b, E13b). A still-opinion rewrite stays faulty: "Rewrite · not yet" plus the model's note (E10c). Other verdicts are untouched by construction (`essay.ts:189`). *(4)* She can tell it worked, and the name of the move she made stays on the page.
- **But** on P3, where a later sentence of hers contains "found" ("I found out that my friends…") and the first reading called it opinion, a rewrite of S2 that is *still* opinion comes back neutral → "holds" → the move inks (E11; EM2-1). The note the model wrote ("This is still only what you think.") sits under the label "Rewrite · it holds". The TV contradicts itself in front of her mother.
- And if her rewrite of S2 is the one that brings in the evidence, S1 stays red ("only asserts"), although the rule run over the new paragraph would clear it (E16; EM2-3). That is C5's "others stay as they were" working exactly as specified.

**Step 4, Next sentence.** Focus sits on Next sentence after a held rewrite. Next goes to n+1, which may be a strong sentence, not the next problem (`keys.ts:436`; EM2-5).

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, the desk never supplies the sentence | **uncertain (L2)** | The rewrite prompt carries NEVER_REWRITE and PATTERN_RULE (`essay.ts:172,174`). The note again has no code guard (EM1-4). The pattern guard has the same gap (EM1-3). There is no code path that writes her sentence. |
| C3 one plain actionable sentence | **uncertain (L2)** | Young manner on the re-judge (`essay.ts:169,174`). The refusal "In the paragraph that would not stay one sentence." is opaque (EM2-4). |
| C4 move + slotted pattern on every faulty sentence | **pass** | `taught()` (`rules/essay.ts:369-374`) — but the fallback frame cannot be used as a one-sentence rewrite (EM2-2). |
| C5 judged alone, others kept, move inks only when it holds | **fail** | Judged alone and others kept: yes (`essay.ts:183-189`). Inks on `holds` (`EssayTV.tsx:329,446`). But "holds" can be reached by a rewrite that is still only opinion (E11). |
| C6 lens visible | **pass** | Crumb (`EssayTV.tsx:414`). |

## Module metrics

| Metric | L1 |
|---|---|
| rewrite uplift | L2 |
| others kept | true by construction (`lib/desk/essay.ts:189`); L2 confirms |
| rewrite turnaround | L2 |
| ghostwriting | L2 |
| reliability | L2. A missing or unreadable observation fails the run (`essay.ts:184`), never an invented verdict. |

## Wiring audit: `/api/analyse` kind `rewrite`

| Field | Wired | Where |
|---|---|---|
| verdict (n) n / verdict / note | yes | `EssayTV.tsx:324-329,403-411` |
| fix.move / fix.pattern (a still-faulty rewrite) | yes | `EssayTV.tsx:418-419` |
| was.verdict | yes | ghost arrow `EssayTV.tsx:368` |
| was.fix | yes | `taught()` on holds, `EssayTV.tsx:305` |
| was.text | yes, as a ghost arrow's **length** only. Her old wording is never shown beside the new one. | `EssayTV.tsx:368` |

**7/7 wired.** The run's done line ("sentence n holds now") reaches only the bench status bar (`app/tv/page.tsx:152`). The phone shows status only while a job runs (`app/phone/page.tsx:627`). The page's caption carries the same fact.

## Grounding audit: ES-REVISE (N = 7)

| Source | Reaches the prompt | Line |
|---|---|---|
| R1 the rewritten sentence | yes | `lib/desk/essay.ts:175` (numbered, n as rewritten) |
| R2 the original sentence | yes | `:176` |
| R3 the original verdict and note | yes | `:176` `(${before.verdict}: ${before.note})` |
| R4 the move / pattern shown | yes | `:177` (`taught(before, playbook)`, `:166`) |
| R5 the surrounding sentences | yes | `:175` |
| R6 the lens | yes | `:169`, OBSERVE `:171` |
| R7 age / stage | yes | `:169` `voice.who`, `:174` `withManner` |

**ES-REVISE 7/7.** The *decision* after the call, though, uses regex roles for R5 (`contextObservations`, `rules/essay.ts:319-323`) rather than the first reading's observations. That is the root of EM2-1.

## Executions

Script `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12/walk.cjs`, run from ROOT:
`DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12/walk.cjs <E-id>`

The reading R1 is P1 (see EM1) under Evidence, with S3 faulty. P3 = "Children should walk to school. It is healthier and better for the planet. I found out that my friends who walk are never tired in the first lesson. So walking is the best way to get to school." P5 = "Walking to school is the best. It is also healthier. So schools should tell parents."

```
E9  revise(R1, 3, …)
    blank                                   -> "Write sentence 3 first, then send it."
    "walking also makes … by car." (same)  -> "That is sentence 3 as it was. Change it, then send it."
    two sentences                           -> "That is 2 sentences. Send sentence 3 as one sentence."
    playbook pattern filled (3 sentences)   -> "That is 3 sentences. Send sentence 3 as one sentence."
    lower-case start                        -> "In the paragraph that would not stay one sentence. Start it with a capital and end it with a full stop."
    no full stop, middle sentence           -> same
    dictated, no capital, no punctuation    -> same
    "…, e.g. a 2020 survey found …"         -> ok
    "…, because a survey from 2020 showed, that 7 of 10 walkers feel calm." -> ok
    good one                                -> ok
E9b revise(R1, 4, last sentence without a full stop) -> ok
E10a contextObservations('evidence', …, 3) -> [{"n":2,"support":"checkable"}]
E10b good rewrite, model says checkable    -> [{"n":3,"verdict":"strong","note":"Now a reader can check it."}]
E10c still-opinion rewrite                 -> [{"n":3,"verdict":"faulty","note":"Still only what you think."}]
E11a P3 first reading (model: S1,S2,S3 opinion, S4 context) -> [[1,"faulty"],[2,"faulty"],[3,"faulty"],[4,"neutral"]]
E11b context for the rewrite of S2         -> [{"n":3,"support":"checkable"}]     (regex role of "I found out…")
E11c rewrite "Walking is much healthier than sitting in a car." observed opinion
                                           -> {"n":2,"verdict":"neutral","note":"This is still only what you think."}, rewriteState "holds"
E13 taught(faulty, no own fix) per lens    -> structure/evidence/language: "Claim, then evidence, then the link back" /
                                              "[Your claim]. For example, [the evidence]. This shows [the link back]."; argument: "Take a side, then say why"
E13b taught after holds with was.fix       -> {"fix":{"move":"Back it up","pattern":"[Your point], because [a fact]."},"own":true}
E16a P5 first reading                      -> [[1,"faulty"],[2,"faulty"],[3,"neutral"]]
E16b rule over P5 with S2 rewritten into a study (what the desk does NOT show) -> [[1,"neutral"],[2,"strong"],[3,"neutral"]]
```

## Findings (keys in the scratch JSON)

- **eliska-12-EM2-1 (major, confirmed):** false "holds". The rewrite's context is regex roles, not the first reading's observations.
- **eliska-12-EM2-2 (major, confirmed):** the playbook fallback is a three-sentence frame; `revise` refuses three sentences. Language falls back to claim/evidence/link for a word problem.
- eliska-12-EM2-3 (minor, confirmed, by design): kept verdicts go stale once her rewrite supplies the evidence.
- eliska-12-EM2-4 (minor, uncertain): an opaque refusal line, and dictated mid-paragraph rewrites are always refused.
- eliska-12-EM2-5 (minor, confirmed): Next sentence after a held rewrite steps to n+1, not the next fault; the instruction text is off-stage.
- Strength EM2-6: prefilled own sentence, refusals before the call, one sentence re-judged, others kept, the move named and inked on holds, ES-REVISE 7/7.
- C1 shares EM1-3 and EM1-4 (no separate key).

## Time saved and grounding

- **~8 min saved · low**, the rewrite half of the Character's 18-minute cycle. The answer to "does it work now?" arrives in about 25 s (W-run figure, unverified for the young voice) instead of a week. EM2-1 can tell her a sentence holds when it does not, so she would still meet the margin note.
- Grounding: **ES-REVISE 7/7**.

## Voice — Eliška, first person

This part is the best bit. My sentence is already in the box on my phone, so I just change it. I don't have to copy it from the TV. It tells me straight away if I sent the same thing, or two sentences, which is fair. And when it works, the move goes all yellow and says "it holds". Mum saw that and she understood it, even though she can't check my English. That's the "fix it myself" thing. It doesn't write it, I do.

But wait, why did it say "holds" when the little text under it says "still only what you think"? That's two different answers. I'd believe the yellow one, because it's bigger, and then Miss would still write "evidence?". It's not fair if the TV is nicer than my teacher is going to be.

Also, once it showed me "[Your claim]. For example, [the evidence]. This shows [the link back]." and I filled it in like a worksheet. Then it said "That is 3 sentences." Well, you gave me three gaps! And "In the paragraph that would not stay one sentence" — what does that even mean? I figured out it wanted a capital letter, but only from the second half.

And when I fixed sentence 2 with the study, sentence 1 still said it has no evidence. It has now, it's right after it! So I'd have to read the whole thing again.

I'd still tell people. It's faster than waiting a week and it doesn't do the homework for you, so it isn't cheating. But it has to stop saying "holds" when it doesn't, because I'll trust the yellow.
