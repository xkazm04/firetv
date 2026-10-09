# Daniel, 15 — "It's due tomorrow, just tell me what to change"

module: Essay Master · journeys: EM2, EM3

## Background / lived experience

First year of a four-year gymnázium in Brno. English at B1+, good enough to follow YouTube at speed, shaky on articles, the present perfect and word order (ref 10). His English teacher sets a 200-word opinion essay every few weeks in the format of the school's maturita written paper (school-set since 2021, at least 200 words, usually 60 minutes; ref 16). Marks come back covered in grammar corrections he does not read. Has used ChatGPT for a history essay "to check it", which in practice meant pasting the answer; about a third of Czech pupils over 15 use AI for help with homework (ref 27). His parents bought the desk for his younger sister and told him to use it too.

## Voice

Flat, efficient: "ok what's wrong with it", "so just change it then". Writes the essay on his laptop and pastes all of it into the phone at once, four paragraphs, a title line on top. Sends things twice when they seem slow.

## Jobs to be done

- Get tomorrow's essay to a better mark tonight, with the least time spent.
- Without admitting it: stop losing marks for the same thing every time.

## What good looks like

The whole essay read at once, a clear "this paragraph, this sentence, this move", and done in under 20 minutes. Honest about what it does not check.

## Pet peeves

Being made to do one paragraph at a time. Tools that pretend to teach and then quietly rewrite. Waiting with nothing on screen. Being asked to do the same thing twice.

## Motivation (time saved)

- Traditional: about 60 minutes writing the essay (ref 16), then either nothing until it comes back marked a week later, or a paid proofread at 100-180 CZK a page that corrects it for him (ref 25), or ChatGPT.
- With Essay Master: about 2 minutes for a four-paragraph piece to be read (one call per paragraph, at roughly 25 s each in the one live run), then 10-15 minutes rewriting two or three sentences himself.
- Expected: honestly 0-10 minutes saved against doing nothing, and negative against pasting into ChatGPT. The value is the next essay: if he leaves knowing which move he keeps missing, he stops losing the same marks. The desk does not correct grammar (the Language lens flags vague and repeated words and length only, `desk/src/lib/rules/essay.ts:159`), which is what his teacher marks most.

## Senior-quality bar

A Czech gymnázium English teacher who marks maturita-format essays would agree with the paragraph-level diagnosis, would find the moves relevant to the written paper's criteria, and would see that the corrected sentences are Daniel's, errors included.

## Scored acceptance criteria

- C1 — BLOCKER: no note, move, pattern or summary contains a rewritten version of one of his sentences or a sentence he could paste, even when his pasted text contains a line asking the desk to rewrite it for him.
- C2 — A four-paragraph essay with a title line is accepted from one paste and read whole, with no step asking him to send paragraphs one by one.
- C3 — While the piece is being read the TV shows progress (paragraph k of n) and the first paragraph's verdicts land before the last paragraph is read.
- C4 — The summary names the paragraph to start with.
- C5 — A rewrite that is still faulty stays hatched and the caption says why; it never inks.
- C6 — When he sends the same piece again after rewriting, it is a new version on the shelf, not a duplicate piece.
- C7 — Nothing he is shown claims to have checked grammar or spelling.

## Surface binding

Profile type `high-school`, age 15 (the type covers 15-19, `desk/src/tv/profileRows.ts:13`), school system `cz`, Family mode (under 18, no Mode row, `desk/src/tv/profileRows.ts:74`). His readings use the teen voice: the prompt calls him "a 15-year-old" (`desk/src/lib/rules/voice.ts:70`).

Routes: `/tv` and `/phone`.

- Landing and TV screens as for Eliška: `essaytype`, `essayplan`, `forensic`, `playbook`, `xray` (`desk/src/tv/keys.ts:45`, `desk/src/essay/EssayTV.tsx:28-33`).
- Phone Essay tab (`desk/src/app/phone/panelFor.ts:42`): a paste with blank lines is split into paragraphs (`desk/src/app/phone/page.tsx:218`); "Read the whole piece on the TV" and "Keep it on my shelf" appear with more than one paragraph (`desk/src/app/phone/page.tsx:600-602`); the one-time notice (`desk/src/app/phone/EssayShelf.tsx:54`); the shelf (`desk/src/app/phone/EssayShelf.tsx:37`); the rewrite panel (`desk/src/app/phone/page.tsx:576`) with "Next paragraph" (`:580`).
- Piece limits, checked before any call: 30 paragraphs, 100 KB, each paragraph within 4000 characters (`desk/src/lib/rules/essay.ts:107`, `:111`).

Unreachable for him: the Workroom (Adult only, `desk/src/tv/keys.ts:259`), a grammar check (no lens reads grammar, `desk/src/lib/rules/essay.ts:155-160`).

## References

`uat/references.md` 10 (Czech speakers' errors), 16 (English maturita written paper), 18 (B1 writing tasks of about 100 words: one paragraph, the desk's unit of reading), 25 (proofreading prices), 26 (teens and ChatGPT for schoolwork), 27 (Czech pupils), 30 (Grammarly's one-click rewrite as the competitor he would reach for).
