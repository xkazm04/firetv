# MB3 · My Calculus course, checked

promotion: discovery

## Goal (user's words)

"I'm on Calculus. Give me problems on this week's topic at a real university level, check my working, and show me the line where I slipped. No answers."

## Definition of done

- Their profile is on the Calculus course they take, and Tonight and Topics show that course, not school maths.
- A set on the topic they pick is first-year university level, in the notation of the course.
- Their handwritten working is read and marked. Equivalent answers count as right. Anything the desk cannot compare is "not sure", not wrong.
- On a wrong item, the slip named is the slip they made, and a graph shows where it helps.
- A problem from their own course sheet, snapped, gets hints in the course's methods and never the result. When the desk has no lessons for the course, it says so.

## Levels

- **L1** (walker over code): the profile's Maths course row, Tonight's two doors, Topics on the Calculus spine, practice, sheet and walk with the plot, page and hint with the Calculus stance, and Units' "No lessons" line. Read from `desk/src/lib/library/paths.ts`, `desk/src/lib/library/calculus1.spine.ts`, `desk/src/lib/rules/calc*.ts`, `desk/src/lib/desk/{items,mark,hint}.ts`, `desk/src/maths/MathsTV.tsx`.
- **L2** (not runnable yet): two parts need vision on local Ollama with the qwen 27B model. One is **reading handwritten calculus working** for marking (one vision call a sheet; the verdict is code's). The other is **reading a snapped course sheet** for hints. Typed answers are marked by code, so L2 could cover the typed route on a Calculus set without vision. Writing the set itself is a text-engine call (claude-cli), not vision.

## Characters

matyas-19

Coverage note: no Character in this wave is on the Calculus 2 path (`calc2`). This journey's definition of done applies to it unchanged.
