# X3 wave 4 — campaign voice lines

Owner board:
file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/voices/index.html

Text was written before synthesis in `deathride/audio/x3/voices/SCRIPT.md` and the
guarded plan. Fourteen original lines, 960 characters: six announcer beats (debt,
boss, ally, seizure, death-duel, freedom) and eight Mechanic beats (welcome, repair,
books, ally help, seizure, basic mine rig, duel, aftermath). No Marrow voice invented.
Copy follows `OWNER-CAMPAIGN-CHOICE.md`, not the older sibling plot still in game
data. It does not decide ally payout UI, the seized car's return, or duel field size.

Callum is the existing account voice `N2lVS1w4EtoT3dr4eOWO` with the selected noir
settings (stability .55, similarity .75, style .30). Harry is existing account voice
`SOYHLrjzK2X1ezoPC6cr` (stability .45, similarity .75, style .25); hesitant syntax
and short breaths suggest nervous helpfulness. These settings do not prove that
delivery was achieved. Model remains `eleven_multilingual_v2`; no voice cloning.

Each line is individually skippable and captioned in cue data; scene exit stops
it. Seizure, ally and no-laps dialogue are prepared cue IDs but must remain gated
until the corresponding new campaign event states exist. In particular, the old
`duel` flag still uses a lap race and is not a valid trigger for “No laps”. This
audio wave does not rewrite the campaign rules. Shop welcome and early debt/boss
briefing are compatible with current screens; narration text remains visible even
when sound is missing or muted.

Acceptance separates signal quality from transcription fidelity, voice identity,
pronunciation (especially Marrow) and emotional delivery. No ASR or human listen is
available here; those columns remain unmeasured and the board exposes every line.
Mono 22,050 Hz WAV, -18 ±1 LUFS, <=-1 dBTP after editing; measured silence/decoded
duration/clipping with raw failures retained. Dry-run 960 credits, one existing
X3 session; total allowance after this wave 6,400/9,000. Results follow below.

Result: 14 generated lines, 13 final signal passes. `mechanic.seizure` has four
long interior pauses and 55.52% measured silence, above the 45% voice ceiling;
it remains a visible failed candidate, with caption and silent fallback in data.
No threshold waiver, hidden retime or paid retry. Its delivery needs owner listening.
The other 13 lines add 2,562,480 decoded bytes, bringing all installed clips to
3,970,682 bytes (52 unique files), under the 6 MiB decoded budget.

Wave charge/header-confirmed 960; session conservative charge 6,400/9,000, confirmed
headers 1,759 across effects/engines/voice. Shared balance 23,873 before -> 23,040
immediately after at 21:54:05 UTC; decrease 833 is not a per-project invoice.
Chrome checks 28 players, eight layouts, speaker filtering, exclusive playback,
stop and persistent/exportable notes. Artifact/key audit passes. No spoken-word,
style or physical-device pass is claimed. One commit for wave 4; never push.
