# kristyna-17 × EM1 · What does my paragraph do? (recert-2)

- Character: kristyna-17
- Journey: EM1 What does my paragraph do?
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** Every open row still holds; no commit since 782afdfb touches the language check, word lists, prompt or Essay tab copy.

## Reachable surface (now)

- Same as recert-1: single-paragraph read, language check (`essay.ts:171-177`), refusal at `route.ts:146`, English-list rules, prompt at `lib/desk/essay.ts:86-104`, plan read via `keys.ts:445`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM1-1 | **recurs** (major 9, unchanged) | essay.ts:13-15,258,271-273,410 still English-only lists; analyse/route.ts:146 refuses only when paragraphIsEnglish says no (essay.ts:171-177). No commit since 782afdfb touched these. | - |
| EM1-2 | **recurs** (major 9, unchanged) | lib/desk/essay.ts:86-104: system and prompt carry voice, lens, numbered sentences, counts; no task, kind, history or memory. Unchanged since recert-1. | - |
| EM1-3 | **recurs** (minor 6, unchanged) | lib/desk/essay.ts:86-96 English system prompt has no language line; CHECKS lines (essay.ts:308) English. Only a leaked Czech paragraph reaches it. | - |
| EM1-4 | **recurs** (minor 3, unchanged) | voice.ts:70 essay: "a 15-year-old"; bandOf (voice.ts:34-38) teen for age 14+. | - |
| EM1-5 | **recurs** (minor 3, unchanged) | essay.ts:207 still computes links; EssayTV.tsx:476 figs lists sentences, claims, evidence, connectors, words avg only; grep `.links` outside rules: 0 hits. | - |
| EM1-6 | **recurs** (major 9, unchanged) | essay.ts:149-177 unchanged: ENGLISH_WORDS keeps my, a, to, do, by, so; CZECH_WORDS omits them; floor 0.15/0.25. The recert-1 repro paragraphs follow from the same arithmetic; no commit touched it. | - |
| EM1-7 | **recurs** (minor 6, unchanged) | page.tsx:705-708 Essay tab copy and profileRows.ts:20 still name no language; keys.ts:445 posts the plan text as an essay read so the refusal comes only there (route.ts:146); planFit at essay.ts:683 judges from English frames. | - |

## New findings

None.

## Notes

- git log 782afdfb..HEAD on the touched files: only 2bf64f3e, 6b003c59, 390d9408, ae2544b5; none bears on these rows. Line numbers re-found at HEAD. No model, no browser; L2 owns the Czech-marker verdict and live note language.
