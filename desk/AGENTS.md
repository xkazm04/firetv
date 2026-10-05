<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Study Desk (desk/): what is specific here

The repo-wide authority is [../AGENTS.md](../AGENTS.md): commands, the architecture map,
constraints and the Definition of Done. When the two disagree, that file wins. The block above is
written by `next dev`. Edit only below it.

- Gate: `npm test` here (`tsc --noEmit`, then every rules suite in `test:rules`). A new suite is appended at the end of `test:rules`.
- Decisions stay in `src/lib/rules/`. Engines stay behind `src/lib/engines/`. `src/lib/session/store.ts` is the only state.
- No live model calls in the gate. Never touch `data/`: tests set `DESK_DATA_DIR` to a temp directory.
- In a worktree, run a second dev server with `next dev --webpack`. Turbopack rejects the junctioned `node_modules`.
