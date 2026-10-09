# EM3 · The whole essay

promotion: discovery

## Goal (user's words)

"Here is my whole essay. Tell me which paragraph to fix first, and what move it needs."

## Definition of done

- The Character sends a whole piece of several paragraphs in one go and sees it being read paragraph by paragraph on the TV.
- They leave knowing which paragraph needs which move first.
- A paragraph that fails to come back does not lose the rest of the reading.
- They choose whether the piece is kept, are told where the text goes before it is kept, and can open it later as a new version or delete it.

## Levels

- **L1 (always).** A walker over the phone's paragraph split, the whole-piece read, the piece limits, the one-time notice, the shelf and the forensic page's paragraph gaps.
- **L2: not covered by `tools/essay-ui-test.cjs`.** The harness sends one paragraph with kind `essay` (`tools/essay-ui-test.cjs:104-106`); it never sends a piece, so only W1 (seat and pair) and W2 (Enter to the lens home) apply. An L2 for this journey needs the harness extended: a multi-paragraph paste, "Read the whole piece on the TV", the 428 notice answered, a poll for each paragraph landing (`essay.progress`), the shelf listed, opened and deleted.

## Characters

`daniel-15`, `kristyna-17`.
