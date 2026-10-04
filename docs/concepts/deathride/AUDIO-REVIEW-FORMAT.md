# Audio review format — 2026-10-03

All five Death Ride audio reports now use the Mage Arena review interaction
pattern: `article.card` with stable `data-direction`, `data-label` and
`data-samples`, Keep / Maybe / Reject radios, an optional owner note, persistent
theme selection, matched playback, one player at a time, repeat and Copy Markdown.
The combined entry point is [audio/index.html](../../../deathride/audio/index.html).

Read-only references: Mage Arena's `docs/audio/report.js`, `report.css`,
`audition/r1/index.html` and `audition/r2/index.html`. The r2 HTML was initially
absent, so `tools/audio/build-r2-reports.py` was read first; the r2 HTML became
available during the task and was also read. Nothing in that worktree was written
or built.
No Mage Arena page copy, project keys or owner decisions were transplanted.

## Decisions and playback

The reports contain 109 sample review cards (32 X2, 40 effects, 20 engines,
14 voices and three versions of the same 150-second composition), plus the eight
existing X2 general-note fields. X3 original, edited and repeat players remain
together on their candidate card: they are evidence for that candidate, not new
generated takes. The three music versions are individually judgeable and remain
explicitly one composition.

Fifty category selectors provide a winner, no winner, or a mix with sample IDs in
the category note. X2 has separate race music, engine, Rivet, mine blast, crunch,
pickup, UI, announcer and mechanic choices. X3 provides effect families (including
crunch-base versus crunch-retry), ten car classes, voice roles and individual
lines, and the music proof. A family winner selects a reference; it does not
replace every distinct cue or voice line. These selectors are independent of
sample judgements; Keep never silently selects a winner or changes acceptance.

Shared `deathride/audio/report.js` stores each page under `deathride.audio.x2` or
`deathride.audio.x3.effects|engines|voices|music`. Old listening notes are imported
without inferring picks; the previous music verdict survives verbatim in a note.
Malformed or denied storage leaves usable in-memory controls and an export
fallback. Existing owner choices are not prefilled, submitted or overwritten.

Copy Markdown always fills and selects a visible textarea, then attempts the
clipboard. The paste-ready block contains the page title, UTC export date and a
four-column Category / direction, Pick, Samples, Owner note table. Unreviewed
items are explicit; pipes, backslashes, HTML and multiline notes are escaped.
The destination is `deathride/audio/OWNER-AUDIO-CHOICE.md`; no report edits it.

Matching only attenuates playback toward −26 LUFS with a −3 dBTP ceiling. Quiet
or peak-limited files can remain below target; short-cue matching is approximate.
X2's original, normalized and three-cycle file modes remain. Repeat can be toggled
per player; the linear music proof explicitly makes no end-to-start seam claim.
System / Light / Dark themes share the Death Ride palette. All resources are local.

## Reproduction and evidence

`build-audition.py`, `build-x3-page.py` and `build-x3-music-page.py` share
`report_format.py`; `build-review-index.py` writes the combined index. All six
HTML outputs regenerate byte-for-byte from existing committed inputs. The X2
builder preserves the historical spend-report timestamp. No measurement,
composition, generation, API call or credit expenditure was performed.

Evidence is in [audio/review-evidence](../../../deathride/audio/review-evidence/):

- Python Playwright with installed Chrome, using real `file:///` pages and
  disposable contexts: all five reports pass; 287 existing media source/mode
  loads and muted starts; one-player exclusivity, stop, matching and repeat
  across the actual file boundary; all five music chapter seeks.
- All sample radios/notes and category winners survive reload. Clear pick keeps
  notes. Copy Markdown, escaped table cells, denied clipboard/storage, malformed
  storage and legacy note migration pass. No network requests from the reports.
- Forty light/dark layouts at 320, 390, 768 and 1440 pixels, plus System theme
  switching and four combined-index widths, have no horizontal page overflow.
  Screenshots include individual sample controls.
- `content-preservation.json` compares the prior commit: audio source URLs,
  embedded X2/music evidence and all 74 X3 provenance blocks are unchanged.
  Existing audio, acceptance, spend, ledger and owner-choice files are unchanged.
- `:core:test :link:test :game:test :app:assembleDebug` passes with installed
  Zulu Java 22 and the existing Android SDK: 144 tests, no failures or skips,
  debug APK built. An initial Java 17 attempt could not compile the existing
  tests' newer thread API; using the prior run's Java version resolved it.
  Existing SDK compatibility warnings remain. Game/runtime code is unchanged.

Browser checks do not establish human listening quality, physical mobile/Stick
playback or in-game acceptance. Original signal failures and all acceptance gates
remain visible. Zero new audio, zero credits, one local commit, no push.
