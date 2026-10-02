# K2 — Offline campaign direction review

2026-10-02 · design first · `deathride/campaign`

## Presentation contract

Present [K1](K1-campaign-directions.md) as one static offline page at [directions/index.html](../../../deathride/campaign/directions/index.html). One full article/card per direction uses the same reading order: premise, tone/art/audio, structure, progression, rival table, mechanics/costs, three sample cards, three taunts, risks and model needs. K1 is the narrative authority; K2 does not select or implement a campaign.

Use an editorial magazine layout: large serif titles, restrained rust/ochre/green accents, paper/soot surfaces, numbered navigation and a comparison matrix before the long reads. All substantive content lives in HTML; JavaScript only enhances a dark/light toggle with optional local preference storage. No CDN, fetch, external font, server, build or network dependency. Default to system color scheme; content remains complete without JavaScript. Provide a skip link, semantic headings/tables, visible keyboard focus, text labels, responsive columns, horizontally scrollable wide tables and a printable light layout.

Each card includes an inline SVG of its distinct structure and an inline SVG of the common **design-intent** player/field PR curve. The structure must explain its event counts and real choice points. The PR sketch marks 7/14/21/28 promotion dips, the final 35 exception and ratio units; adjacent text discloses G2's measured misses and makes clear that the sketch is neither measured performance nor win probability. Curves share a scale to prevent misleading comparison.

Only Ash has cast overlap. Reference the six existing PNG portraits under `art/review/fusion/pixels` by relative paths, without copying, modifying or regenerating them. New casts stay text-only, explicitly labeled; do not give a new character an existing person's portrait. Every image and diagram has a useful text alternative. The page is offline when opened within the repository; distributing it separately requires the referenced portraits.

The matrix compares direction scope (separate from common PR correction), existing-system fit, replayability intent, fusion/tone fit, content volume and risk. A bottom decision panel links [CHOICES-TEMPLATE.md](../../../deathride/campaign/CHOICES-TEMPLATE.md): pick, fuse or reject, then three decisions about structure, dramatic tone and build boundaries. Nothing is submitted or sent by the page. The template is the requested future owner handoff, not a question asked during execution.

## Verification plan

Check content/diagram counts and all local asset/document links. Open the exact `file://` page in a headless browser at desktop and narrow mobile widths, in dark and light modes and with JavaScript disabled. Check image load, navigation, theme control, storage-denied fallback, overflow, headings/tables and browser errors; inspect desktop/mobile captures outside the repository. Record results here and in the K2 session entry. No gameplay tests, simulations, APK/device runs or generated media are justified by this presentation-only change; no play or owner-feel claim follows from browser checks.

## Results

Completed [the offline page](../../../deathride/campaign/directions/index.html) and [choices template](../../../deathride/campaign/CHOICES-TEMPLATE.md). The page carries K1's full four direction profiles, with 24 cast rows, 12 three-line sample cards, 12 taunts, four structure diagrams, four comparable PR sketches and six unmodified local portrait references. Shared grounding and the ten-class/ability table are in a native expandable disclosure. The matrix and each card separate narrative scope from the shared PR correction. All local page, note and template links resolve.

**Browser verification:** 13 configurations passed against the exact `file://` page, using installed Chromium with Playwright: 1440, 1024, 768, 390 and 320 px, each in dark/light; JavaScript disabled at 390 px in both system schemes; and denied `localStorage` with working theme fallback, keyboard skip link and A4 print export. Checked all six images decode, unique IDs, SVG accessible-label references, cast/card/taunt counts, local links and anchors, direction navigation, theme persistence, zero page errors and zero HTTP requests. The first narrow run found a 350 px SVG minimum expanding its grid column at 320 px; corrected grid/figure minimum sizing keeps horizontal scrolling inside diagrams/tables. Expanded source disclosure also passed no-page-overflow checks at 320/390/1440 px.

Inspected desktop dark, mobile light, Ash article, comparison matrix and route/map diagram captures. Figures include text alternatives and captions; sample-card lines may naturally wrap on a narrow display. Wide tables and sketches intentionally scroll within their own region. Print export completed; this is not a comprehensive screen-reader, physical-phone or cross-browser certification. Browser navigation checks use reduced motion to keep automated capture/scrolling stable.

Final HTML SHA-256: `CCB2DB7132ABF3EE0F8FBDBB61A15D9324EED72852A650432220559514D4A65B`. Temporary verification scripts, PNG captures, PDF and final `browser-check.json` are outside the repository in `%TEMP%/deathride-campaign-triage-20261002`; only Markdown and the static HTML are delivered. No build step is needed to open the page. Portrait paths require this repository layout; no CDN or copied assets are involved.

No game code/data/assets changed, no gameplay builds or simulations run, no Grok/ElevenLabs calls and no push. K1/K2 deliverables are complete. The remaining work is the owner's pick/fuse/reject decision, followed by a separately scoped implementation and its balance/feel evidence; no selected direction, new campaign playtest or owner approval is claimed.
