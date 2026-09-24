---
vault: ["C:/Users/kazda/kiro/firetv/.contest"]
vault_subdir: Contest
arena: .contest/arena
participants: "claude:claude-opus-5-5@xhigh,codex:gpt-6-sol@high"
judges: ""
variants: 3
timeout_min: 60
---

# /contest overlay - firetv (Study Desk)

Study Desk is a homework desk on a Fire TV, driven by a D-pad, with a phone as the instrument
(camera, keyboard, microphone). Its three learning modules - Math Buddy (maths), Linga (English),
Essay Master (writing) - are branded as standalone apps. The prototype is the Next.js app in
`desk/`; a contest entry is a static page, never a change to `desk/`.

## Engines

Claude resolves to `~/.local/bin/claude.exe`. Codex resolves through the npm shim in
`C:\nvm4w\nodejs` (0.155); the stale `%APPDATA%\npm` install rejects gpt-6 models, so if PATH ever
prefers it set `CONTEST_CODEX_BIN="C:\nvm4w\nodejs\node.exe|C:\nvm4w\nodejs\node_modules\@openai\codex\bin\codex.js"`.

## Data

Stage each module's material from the prototype's own source (`desk/src/lib/library/syllabus.ts`,
`desk/src/lib/english/{curriculum,placement}.ts`, `desk/src/lib/library/lessons.data.ts`,
`desk/src/tv/{profileRows,mathsRows,writingRows}.ts`) as `data/<module>.js` + `.json` with a
`SCHEMA.md`, under `.contest/staging/<module>/`. Include the screen's real states as named
scenarios, and require `?state=<scenario>` so the visual pass can drive each one.

## Taste

- **A television, not a book.** Read from a sofa three metres away. A verdict is a picture; prose
  lives in one caption slot and nowhere else. Roughly 25 words or fewer of visible body text. Empty
  states are two words, not an explanation.
- **Show only the learner's own comparison.** Never render every option and let them find
  themselves in it.
- **First impression outranks completeness.** The landing is the first thing a learner sees; a
  premium, confident first frame matters more than covering every feature.
- **Practical before spectacular.** The owner has twice picked the variant with the best `utility`
  over the conceptually boldest one. The short path to the real task wins.
- **Ten-foot rules are law**: 1920x1080 stage, 5% safe zone, nothing under 28 px except 20-22 px
  labels that never carry meaning alone, D-pad only, focus that cannot be missed.

## Skill improvement log
- 2026-09-24: a TV landing brief should require `?state=<scenario>` and number-key cycling; a scripted D-pad pass (every state, Right, Enter, font census scaled by the stage transform) replaced the click/wheel visual pass and found 23-27 px text the frames hid.
- 2026-09-24: when the owner asks for a second page per shortlisted style, scaffold with `refine` and replace its task and bar sections (its bar is desktop-sized); check each shortlist letter against the owner's description before running - one pick named B/2 described B/1.
- 2026-09-24: the vault router skips refinement rounds (`if (root.parent) return`), so after `refine` every router card still opens round 1 and the owner reviewed the wrong build; a hand-built `.contest/Contest/router-r2.html` under the owner's round-1 letters fixed it. Proposal for the method: overlay a refine round on its parent row the way `reveal` is overlaid.
- 2026-09-24: for a /tv port, style-contract needs a load+settle wait (the session SSE stream defeats networkidle), a scripted drive to the same content the winner shows, and roles probed down to text-bearing elements on both sides before capture.
