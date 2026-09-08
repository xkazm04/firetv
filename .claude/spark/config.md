---
product: "Study Desk"
stack: "Next.js 16 (App Router, React 19, TypeScript) prototype in desk/; engines behind desk/src/lib/engines (Claude Code CLI headless for text, Ollama for vision/embeddings, ElevenLabs for speech); one server-side session as the only state"
vault: ["C:/Users/kazda/kiro/firetv/.spark"]
vault_subdir: Spark
context_map: ""
base_branch: main
active_runs_ledger: ""
locale_count: 1
---

# /spark overlay - firetv (Study Desk)

Study Desk is the homework desk on the TV: a Fire TV surface driven by a D-pad, and a phone that
is the instrument (camera, pen, keyboard, mic). The prototype in `desk/` is the design document
for the native Fire TV + AWS product, so a design decision here is a product decision.

No context map exists; targeting is provisional, from the top-level source directories:
`desk/src/lib/engines`, `desk/src/lib/desk` (the per-subject pipelines), `desk/src/lib/rules`
(decisions in code), `desk/src/lib/library` (lessons), `desk/src/lib/session` (the one store),
`desk/src/tv` + `desk/src/app/tv` (the television), `desk/src/app/phone` (the instrument),
`desk/src/app/api` (the seam between them).

## Gates

```
always: cd desk && npx tsc --noEmit -p tsconfig.json
when a TV screen changed: re-capture it with Playwright from tools/ and compare against the acceptance line
builder: cd desk && npx tsc --noEmit -p tsconfig.json
```

## Repo law

- **On Air** (`docs/DESIGN-ON-AIR.md`) is law for every TV surface: one band per screen; no two
  screens share a layout; the hint is the caption and the timer is the clock; condensed caps
  label, Barlow reads; red signals, white speaks, charcoal holds; focus is a skew with a hard red
  shadow; channel colours are thin (tags and strokes only); 5% safe zone; nothing under 28 px;
  **the TV never asks for typing**.
- **Decisions stay in code** (`desk/src/lib/rules/`): the model explains, it does not decide. A
  design that moves a decision (a tense, a sentence role, a retrieval pick, a mastery verdict)
  into a prompt is a deviation and must be raised.
- **Engines stay behind** `desk/src/lib/engines/` with a `provider` field; nothing calls the
  Claude CLI, Ollama or ElevenLabs directly from a page or a pipeline.
- **The session is the only state** (`desk/src/lib/session/store.ts`); the TV renders it, the
  phone posts events to it. No page keeps product state of its own beyond local UI state.
- **Withholding is the product**: nothing may put the answer, a verb form, or a rewritten
  sentence on screen.
- Pathspec-scoped commits; `desk/data/`, `desk/.env.local` and the vaults' PNGs are never staged.

## Rituals

(none)

## Question taste

(built by the retro)

## Skill improvement log

- 2026-09-08: three builders sharing one dev server and one `data/` dir cost real work - a session reset out from under a builder mid-run, and a fabricated memory line written into `data/learners.json` that would have been read into every later prompt. Rule for this repo: **a builder that writes learner or session data uses a scratch learner id, never the seeded `ema`**, and says in its report what it wrote.
- 2026-09-08: the TV (`desk/src/app/tv/page.tsx`, `desk/src/tv/screens.tsx`) is a client component and may not import anything filesystem-backed. `desk/src/lib/session/learners.ts` is server-only; the session hydrates `skills` at the dispatch boundary instead. Scouts should state the client/server boundary for every module a screen might want.
- 2026-09-08: `.spark/` and `.cx/` are gitignored; the overlay at `.claude/spark/config.md` is tracked and travels with the clone.
