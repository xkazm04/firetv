# MB1 · Tonight's sheet, together

promotion: discovery

## Goal (user's words)

"Put tonight's maths sheet on the TV so we can go through it together. Give us the next step when we're stuck, never the answer."

## Definition of done

- The sheet they were given is on the TV, read as the problems that are actually on it, and they can move from one problem to the next.
- On the problem they are stuck on, they get a first hint and, if needed, a second that goes one step further. Neither hint gives the answer.
- When the desk has no lesson for the problem, it says so plainly. When it has one, the lesson opens at the part that matters.
- The parent beside them can follow every line on the TV and never feels the desk did the homework.
- The evening ends with a recap that says what was worked on and what needed a second hint.

## Levels

- **L1** (walker over code): the homework door, the page, the hint and the lesson, the phone's capture and "Point & ask", the recap. Read from `desk/src/tv/keys.ts`, `desk/src/maths/MathsTV.tsx`, `desk/src/app/phone/`, `desk/src/lib/desk/hint.ts`.
- **L2** (not runnable yet): the core of this journey is **reading the snapped page**. `desk/src/lib/desk/read.ts` calls the vision engine, which is local Ollama with the qwen 27B model (see `uat/env.md`). L2 waits for that host. Without it, L2 could still run against the prototype's sample sheets on the capture panel, but the read itself still goes through vision, so nothing of this journey's core is checkable today. The hints use the text engine (claude-cli) and do not need vision.

## Characters

nela-12 · radka-41 · matyas-19 · vojtech-18
