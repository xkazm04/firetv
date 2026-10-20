# Code-only recert of recert-13 LT-viktor-67-J4-1 and LT-tomas-9-J4-2

Base d1959706 + 610e9492. No model call. **L2 live recert owed (operator)** on both rows; neither is closed in the ledger sense (resolution stays open). The stamp is `code_recert` on each row in findings.json.

## Fidelity

recert-13 did not record `scene.cue`. The three learners played plan topics (viktor "Ask about school", tomas "Show me your Minecraft world", petra "My hotel room is not clean"); their cues are the ones recert-8..12 recorded for the same topics (marked `plan ... observed`). The rework-8 cases now use those: viktor `Try: What did you do at school today?`, tomas `Try: I like to build. My favourite block is...`, petra `Try: I have a problem. The room is very cold.`. The exact recert-13 cue strings are model-generated and live only in desk/data (not read). Viktor's recert-13 cue rung (`Hi Sam! How is school today?`) is a ladder rung, not scene.cue.

## sceneTaskFor per real cue (after 610e9492)

Empty reasons: unfinished starter (ellipsis or blank), over QUIZ_MAX (80), out of band (fitsBand, e.g. past tense at A1), repeat of partner line. Static scenes and speaking-practice scenes are against a neutral partner line; the three plan topics against their recert-13 partner line.

| Scene | Cue | A1 | A2 |
|---|---|---|---|
| meet | Try: Hi, I'm Alex. What is your name? | PHRASE: Hi, I'm Alex. | PHRASE: Hi, I'm Alex. |
| weekend | Try: I enjoy this because… | EMPTY (unfinished starter) | EMPTY (unfinished starter) |
| rover | Try asking: Which way should I go? | PHRASE: Which way should I go? | PHRASE: Which way should I go? |
| team | Try offering: How about we do this together? | PHRASE: How about we do this together? | PHRASE: How about we do this together? |
| booking | Try asking: Could you check the date, please? | PHRASE: Could you check the date, please? | PHRASE: Could you check the date, please? |
| teacher | Try asking: Could you say that again, please? | PHRASE: Could you say that again, please? | PHRASE: Could you say that again, please? |
| project | Try: I could draw the pictures. What would you like to do? | PHRASE: I could draw the pictures. | PHRASE: I could draw the pictures. What would you like to do? |
| lost | Try asking: Excuse me, I lost my jacket. Can you help me? | PHRASE: Excuse me, I lost my jacket. | PHRASE: Excuse me, I lost my jacket. Can you help me? |
| interview | Try: I changed something, so that… | EMPTY (unfinished starter) | EMPTY (unfinished starter) |
| date | Try: I prefer something different. What do you enjoy about that? | PHRASE: I prefer something different. | PHRASE: I prefer something different. What do you enjoy about that? |
| conflict | Try: I need this part. Could we agree on a time? | PHRASE: Could we agree on a time? | PHRASE: I need this part. Could we agree on a time? |
| sp-about-you | Try: My name is… I really like… because… | EMPTY (unfinished starter) | EMPTY (unfinished starter) |
| sp-pictures | Try: I like this one because… Do you like it? | EMPTY (out of band) | EMPTY (out of band) |
| sp-then-and-next | Try: Last weekend I… Next summer I'm going to… | EMPTY (unfinished starter) | EMPTY (unfinished starter) |
| sp-one-photo | Try: In this photo I can see… They are… It looks like… | EMPTY (unfinished starter) | EMPTY (unfinished starter) |
| sp-choose-together | Try: What about…? I think … is better because… Shall we choose…? | EMPTY (out of band) | EMPTY (out of band) |
| sp-what-do-you-think | Try: In my opinion… I feel… What do you think? | EMPTY (out of band) | EMPTY (out of band) |
| plan viktor (recert-8/9 observed) | Try: What did you do at school today? | EMPTY (out of band) | PHRASE: What did you do at school today? |
| plan viktor (recert-8 observed) | Try: How was school today? What did you do? | EMPTY (out of band) | PHRASE: How was school today? |
| plan viktor (recert-13 cue rung, not scene cue) | Try: Hi Sam! How is school today? | PHRASE: Hi Sam! How is school today? | PHRASE: Hi Sam! How is school today? |
| plan tomas (recert-8/9 observed) | Try: I like to build. My favourite block is... | PHRASE: I like to build. | PHRASE: I like to build. |
| plan tomas (recert-9 observed) | Try: I like to build a big house. | PHRASE: I like to build a big house. | PHRASE: I like to build a big house. |
| plan tomas (recert-11 observed) | Try: I like to build ... in Minecraft. | EMPTY (out of band) | EMPTY (out of band) |
| plan tomas (observed) | Try: I like Minecraft. I have a house with a garden. | PHRASE: I have a house with a garden. | PHRASE: I like Minecraft. I have a house with a garden. |
| plan tomas (observed) | Try: I build a ___. It is ___. | EMPTY (out of band) | EMPTY (out of band) |
| plan petra (recert-10/11 observed) | Try: I have a problem. The room is very cold. | PHRASE: The room is very cold. | PHRASE: I have a problem. The room is very cold. |
| plan petra (recert-12 observed) | Try: The shower in my room is cold. Can you fix it today? | PHRASE: The shower in my room is cold. | PHRASE: The shower in my room is cold. Can you fix it today? |
| plan petra (recert-8 observed) | Try: Excuse me. The shower is cold. Can you help, please? | PHRASE: Can you help, please? | PHRASE: Can you help, please? |
| plan petra (recert-8 observed) | Try: The room is very cold. Can you help, please? | PHRASE: The room is very cold. | PHRASE: The room is very cold. Can you help, please? |

## Defect found and fixed

Before 610e9492 the tomas cue (unfinished starter) gave "" at A1 and A2, so with no model task the loop reached type-your-own with no task phrase ever offered. sceneTaskFor now falls back to the longest finished sendable sentence of the cue ("I like to build."). Blanks and mid-cue ellipses are never a phrase.

## Open sub-case

viktor-67 A1: the recorded cue is a past-tense question; the band rule keeps it out at A1, so the task phrase depends on the model supplying help.task. Not fixable in help.ts without offering an out-of-band phrase. Clause stamped `code: open`.
