# MB2 · Practise a topic and get it marked

promotion: discovery

## Goal (user's words)

"Teach me the one thing I'm shaky on, give me a few to do on paper, and tell me honestly which ones I got wrong and where."

## Definition of done

- They pick the topic they are shaky on, or the one school is about to teach, and get a short set of questions at their level. Where the desk has one, they see a worked lesson first.
- They work the set on paper and hand it in by photo or by typing the answers. It comes back marked: right, wrong, or an honest "not sure".
- On each one they got wrong, they see where in their working it went wrong. They can explain how they got there or have one more go.
- Every tick is one a teacher would give, and nothing wrong is ticked right.
- They can ask for six more of the same, or put the set away, and Tonight later shows where they left off.

## Levels

- **L1** (walker over code): Topics or Get ready for school, then worked, practice, sheet and walk, and the phone's practice panel (snap or typed, second go, explain). Read from `desk/src/tv/keys.ts`, `desk/src/tv/sheetRows.ts`, `desk/src/tv/prepareRows.ts`, `desk/src/maths/MathsTV.tsx`, `desk/src/lib/desk/mark.ts`, `desk/src/lib/rules/school.ts`.
- **L2** (not runnable yet): **marking a snapped sheet** needs the vision engine, local Ollama with the qwen 27B model, to read the child's handwriting (`desk/src/lib/desk/mark.ts`). The **typed-answers route needs no vision**: it is marked by code alone (`desk/src/app/api/mark/route.ts`). So L2 could still cover practice → typed answers → sheet → walk → second go live, with the photo marking left open.

## Characters

nela-12 · vojtech-18 · owen-17
