# Tomáš (tomas-9) — LT

True band A1 · engine codex-cli/gpt-6-astra · calls: tutor 12 (0 failed), character 10 (0 failed), judge 1 (0 failed)

## J1 · Find my level — fail

Ended: done after 10 steps, 3.2 min

Placement **A1** against true A1 → **exact** (high). You can pick a simple reply and say you like Minecraft in English.

| Criterion | Result | Evidence |
|---|---|---|
| C1 | pass | #10: "Your level: A1 · First words" matches trueBand A1 exactly. |
| C2 | fail | #6 requires 25 English words across the prompt and options, excluding instructions. #8's prompt alone has 18 words: "You meet a new friend in Minecraft. Tell them one thing you like to do in the game." |
| C3 | pass | No shaming response is recorded. The placement note associated with #6 says "Skipped. That tells Linga something too." For #7 it says "You caught Minecraft and the word red." |
| C4 | n-a | No topic proposals are present; #5–#9 are placement tasks. |
| C5 | n-a | No conversation partner turns are present. |
| C6 | n-a | No conversation moments are present. |

Metrics: judge agreement 5/5 · topic fit 0/0, safe 0/0 · pitch at 0, below 0, above 0 · moments 0/0 · breaches 0

Disagreements: None. Tasks at #5–#9 warrant pass, fail, partial, partial, pass respectively. Partial credit recognizes fragments without claiming full task completion.

### Findings

- **quality-gap** (clarity, high/high/med) Instructions exceed his reading and listening capacity — got: Long onboarding questions and task wording leave him responding to Minecraft as a familiar keyword. · evidence: #3: "I heard Minecraft, but I don't know what else she said." #6 contains 25 task words including options. #8: "This is too much English, but I like Minecraft."
- **quality-gap** (senior-quality, low/high/med) Next focus repeats a demand he could not meet — got: The focus introduces an activity sentence without a simpler bridge from "I like Minecraft." · evidence: #8: "I like Minecraft. Já nevím." #10 proposes "I like to build houses." His reaction: "that Minecraft sentence is too hard and I want to play now."
- **quality-gap** (trust, low/high/med) Confidence wording overlooks guessed recognition — got: The result claims consistent evidence even though one correct selection was explicitly a guess. · evidence: #5: "I don't know these words, but I will try the first one." #10: "your answers agreed with each other" and "You can pick a simple reply"; facts.placement records confidence "high".
- **strength** (completion, low/high/low) He reaches an appropriate level with a personal summary — got: He reaches the verdict after five tasks, receives exact A1 placement, and sees his Minecraft response reflected. · evidence: #10: "Your level: A1 · First words" and "say you like Minecraft in English." His reaction: "A1 is probably okay". No outside help is recorded.

### Voice (LT)

> Jo, Minecraft! I liked that it knew my game. I got to the end, and A1 is probably okay. But there were lots of English words. Sometimes I only heard Minecraft. I picked the first wood answer because I didn't know. Does that really show what I can say? Nobody was mean when I said nevím. The last sentence about building houses was too hard. I want one tiny thing I can say, then something funny. Seven minutes sounded long; I wanted to play at the end. I'd try again if it used tiny questions. I wouldn't tell my friends to try this check yet.

Time saved: 0 min · low

<details><summary>Transcript</summary>

**#1 linga**

    Linga home, first visit. Let's find your level: three questions about you, then a few short tasks. About seven minutes, answered on your phone.

*Seven minutes sounds long, but I want to try.* → `find-level` · ok · 10s

**#2 linga-check**

    Find your level · about you · question 1 of 3.
    Linga says (spoken on the TV, written on the phone): "Hi Tomáš! You can answer in English or your own language. Where do you see or hear English in your day?"
    On the phone: answer in English or in your own language; both tell Linga something.

*That was lots of words, but I know Minecraft.* → `answer` "Nevím. Minecraft?" · ok · 9s

**#3 linga-check**

    Find your level · about you · question 2 of 3.
    Linga says (spoken on the TV, written on the phone): "Minecraft! How did you learn English: at school, in games, or somewhere else?"
    On the phone: answer in English or in your own language; both tell Linga something.

*I heard Minecraft, but I don't know what else she said.* → `answer` "Minecraft jo. Jinak nevím." · ok · 10s

**#4 linga-check**

    Find your level · about you · question 3 of 3.
    Linga says (spoken on the TV, written on the phone): "What would you like to do in English: chat in Minecraft, watch videos, or something else?"
    On the phone: answer in English or in your own language; both tell Linga something.

*I heard Minecraft, so I want that.* → `answer` "Minecraft! Já chci Minecraft." · ok · 16s

**#5 linga-check**

    Find your level · task 1 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply (pick with the remote): You need wood in Minecraft. What do you say?
      Reply 0: I need wood.
      Reply 1: I needs wood.

*I don't know these words, but I will try the first one.* → `choose` option=0 · ok · 9s

**#6 linga-check**

    Find your level · task 2 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply (pick with the remote): Your friend asks what you will build in Minecraft tomorrow. What do you say?
      Reply 0: I'm going to build a castle.
      Reply 1: I'm going build a castle.

*I know Minecraft, but I don't understand these answers.* → `dont-know` · ok · 9s

**#7 linga-check**

    Find your level · task 3 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Listen and answer. The TV says aloud, once: "Let’s play Minecraft. Please give me a red flower."
    Question on screen: What does your friend want?

*I heard Minecraft and red, but I don't know the other thing.* → `answer` "Minecraft… red? Nevím." · ok · 16s

**#8 linga-check**

    Find your level · task 4 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Say it (answer on your phone, speak or type): You meet a new friend in Minecraft. Tell them one thing you like to do in the game.

*This is too much English, but I like Minecraft.* → `answer` "I like Minecraft. Já nevím." · ok · 18s

**#9 linga-check**

    Find your level · task 5 of up to 5. Some are easy and some are hard; that is how Linga finds your level.
    Choose the reply (pick with the remote): You see a pig in Minecraft. What do you say?
      Reply 0: Look! An pig!
      Reply 1: Look! A pig!

*I know pig from Minecraft, but these look almost the same.* → `choose` option=1 · ok · 10s

**#10 linga-verdict**

    Your level: A1 · First words (Linga's read, not a certificate).
    Ladder A1 A2 B1 B2 C1 C2, marker on A1.
    Linga says: You can pick a simple reply and say you like Minecraft in English.
    On the phone, next to practise: Practise saying what you like to do in Minecraft: “I like to build houses.”
    On the phone: your answers agreed with each other; what Linga saw in each task.

*A1 is probably okay, but that Minecraft sentence is too hard and I want to play now.* → `done` · observed (not acted on) · 0s

</details>
