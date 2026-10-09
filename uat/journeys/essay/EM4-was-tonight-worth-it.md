# EM4 · Was tonight worth it?

promotion: discovery

## Goal (user's words, a parent)

"After the evening, show me what she actually did, in words I understand, and convince me none of it was written for her."

## Definition of done

- After the evening the parent sees, on the TV and on the phone, what was read and how much needed work, in words they understand without reading the essay.
- Nothing in the recap or the week's page quotes the child's writing or offers sentences.
- The week's page agrees with what they saw on the sofa.
- They know where the writing went and how to delete it.
- They can decide whether to keep using the desk.

## Levels

- **L1 (always).** A walker over the TV recap and its essay tile, the phone's Recap tab in the Parent role, the Sunday page, the learner record a reading writes, the one-time notice and the shelf's delete.
- **L2 through `tools/essay-ui-test.cjs`, partly.** W6 (End session on the phone's Tonight tab to the TV recap, timed; the TV recap and the phone's Recap tab screenshotted, its text recorded) and W7 (learners.json holds one `writing` history entry and the lens record) bear on it, and `--reread` shows the lens home after a restart. It does **not** cover: the Parent role (the harness stays in the Student role), the Sunday page's lines (rendered under the recap but never asserted), the notice and the shelf's delete, more than one reading in an evening, and whether a parent understands any of it. Checking "nothing quotes the child's writing" needs the harness to compare the recap and Sunday page text with the paragraph's sentences.

## Characters

`barbora-43`.
