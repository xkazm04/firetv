---
id: 0005
kind: gotcha
scope: path:desk/
date: 2026-10-05
supersedes: null
refs: [path:AGENTS.md]
---

The text between `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->` in
`desk/AGENTS.md` is written by `next dev` (`node_modules/next/dist/server/lib/generate-agent-files.js`).
`desk/CLAUDE.md` is only `@AGENTS.md`. Removing or rewording the block from a diff only makes `next dev`
re-create the change. Commit it as Next writes it, and put desk-specific guidance **below** the END
marker. For that reason the root `AGENTS.md` is the canonical guidance (`guidance.canonical`), and
`desk/AGENTS.md` is not declared a generated projection. Source: the block's own text in `desk/AGENTS.md`.
