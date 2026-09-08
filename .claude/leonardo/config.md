# /leonardo overlay - firetv (Study Desk)

## Brand direction
Study Desk is a broadcast, not a menu: the grammar of live TV graphics (lower-third, caption, clock,
wipe) on a charcoal studio floor. Motif: one diagonal signal-red band with a 2/6 px scanline overlay.
Adjectives: flat, hard-edged, condensed, calm, on air. Must never look like: neon, glow, gradients
that float, rounded app-store icons, cartoon mascots, stock "education" clip art (no apples, no
mortarboards, no lightbulbs).

## Modules (brand names)
- Math Buddy (maths, cyan) - learn and practise high-school maths, one step at a time
- Linga (english, amber) - an assistant to learn English at every level
- Essay Master (essay, green) - an analyst that helps anyone analyse written thoughts

## Palette
Authoritative tokens: `desk/src/design/on-air.css`.
- ink #14161A (ground) · paper #F2F3F5 (text, focus) · signal #E23D28 / #B8261A (the band)
- channel colours, thin only (tags, strokes): maths #7FD1E8 · english #F2C14E · essay #8FD3A1

## Output paths
- brand marks and module illustrations: `desk/public/brand/<name>.png` (served at `/brand/<name>.png`)
- exploration rounds and contact sheets: `.cx/Cx/stops/leo/` (vault, never staged)

## Defaults
- generator: Leonardo Lucid Origin (`leonardo-image.mjs`); gpt-image-2 via the Leonardo key returned FAILED on 2026-09-08
- marks: 512x512 `--style dynamic --contrast 3.5`; illustrations: 768x512 same style, generated on the ink ground (#14161A) so they sit on the card without cutting out
- every prompt carries: "flat vector, hard edges, no text, no letters, charcoal #14161A background"

## Skill improvement log
- 2026-09-08: Leonardo's gpt-image-2 route rejects sizes outside its list (768+ wide) and then FAILED at 768x768 (5 credits lost); Lucid Origin at 512x512 works in ~6 s. Keys live in `C:/Users/kazda/kiro/personas/.env`, not in this repo.
