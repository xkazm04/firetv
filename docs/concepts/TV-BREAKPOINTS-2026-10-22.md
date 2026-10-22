# TV viewport, sizing and safe-area conventions (2026-10-22)

Research (stage 1) and an audit of the Study Desk TV surfaces against it (stage 2). Numbers are from the
sources named; where a source was secondhand or silent, that is said.

## 1. What the platforms say

| Topic | Finding | Source |
|---|---|---|
| Design canvas | Fire TV: design for a full 1920x1080 screen, 320 dpi (xhdpi), which is 960x540 dp; the same app is shown at 720p or 1080p and resources are scaled. Android TV: design at 960x540 dp (MDPI), assets for 1080p, system downscales to 720p. | [Amazon design guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html), [Android TV layouts](https://developer.android.com/design/ui/tv/guides/styles/layouts) |
| CSS viewport on a Fire TV WebView/Silk | Commonly reported as 960x540 CSS px at devicePixelRatio 2 for 1080p and 4K devices alike (third-party reports, not official; Amazon's FAQ says Silk and Amazon WebView are not identical). Measure `innerWidth` / `devicePixelRatio` on the device. Amazon's own 720p-content tip is `initial-scale=1.5`. | [Ionic forum report](https://forum.ionicframework.com/t/android-tv-webview-resolution-seems-to-be-1-2-hd-960x540-for-all-devices-hd-4k-8k/246839), [Amazon: customizing your web app](https://developer.amazon.com/docs/fire-tv/customizing-your-web-app.html), [Amazon web hybrid FAQ](https://www.developer.amazon.com/docs/fire-tv/web-hybrid-app-faq.html) |
| Tizen | App resolution 1920x1080 on UHD model groups, 1280x720 on FHD; the TV scales to the panel; a non-16:9 app is scaled to 1920 wide and shows whitespace or scrollbars; a custom size is set with `<meta name="viewport" content="width=...">`. | [Samsung: managing screen resolution](https://developer.samsung.com/tv/develop/guides/fundamentals/managing-screen-resolution/) |
| webOS | No official viewport figure found; a forum post says apps run at 1920x1080 at most (secondhand). LG's guideline asks for text readable from about 3.5 m (10 ft) and gives no pixel value. | [LG UI guideline v4.18](https://webostv.developer.lge.com/assets/netcast/LG_Smart_TV_and_Media_Product_UI_Guideline_v4_18.pdf) |
| Overscan / safe area | Keep UI out of the outer 5% of each edge; focused item and text inside the inner 90%. At 1080p that is 96 px left/right and 54 px top/bottom. Android TV: 48 dp / 27 dp at 960x540 (the same 5%). Many modern TVs have no overscan, so this is a conservative guard. Background art should bleed past the edges, not be clipped to the safe box. | Amazon and Android TV pages above |
| Body text | Amazon: body at least 14sp, about 19 px at 720p and 28 px at 1080p. One 10-ft guide uses 24 px body, 18 px only for non-essential labels. tvOS floor is 29 pt. | Amazon; [10ft UI article](https://pascalpotvin.medium.com/designing-a-10ft-ui-ae2ca0da08b7); [tvOS guideline summary](https://skills.cat/skills/ehmo/platform-design-skills/tvos-design-guidelines) |
| Focus indicator | Amazon: clearly indicate focus; prefer less saturated, cooler colours; selected state on Select. No stroke width given anywhere. Practical rule from the 10-ft article: even-pixel lines, never under 2 px. | Amazon; 10ft UI article |
| Target size | Remote input, so no minimum is specified; size is set by D-pad spacing and legibility instead. | Amazon |

Not found (do not rely on them): an official focus-ring thickness or contrast ratio for TV web apps; an official
devicePixelRatio for 4K Fire TV models.

## 2. Recommended practice (the numbers)

1. **One fixed 1920x1080 stage, scaled as a whole** by `k = min(frameW/1920, frameH/1080)`, centred, letterboxed
   in the stage's own dark ground. This gives the same layout at 960x540 (k 0.5), 1280x720 (0.667), 1920x1080 (1),
   3840x2160 (2) and any other aspect ratio (pillar or letterbox bars, never a reflow).
2. **Never break layout at a size**: no breakpoints on the stage. The three real cases are a 960x540 CSS viewport
   at dpr 2 (Fire TV), 1920x1080 at dpr 1, and 3840x2160 at dpr 1 (desktop browser or a 4K signage panel).
3. **Safe area 5%**: 96 px sides, 54 px top and bottom on the 1920x1080 stage; text and the focused item inside it;
   decoration may bleed.
4. **Type floor on the 1080p stage**: body 28 px or more (this repo uses 32), secondary labels 22 px or more,
   nothing essential below 20 px; the 18 px class is for decoration only.
5. **Focus**: a change of shape or ground, not only colour; at least 3 px stroke or a filled swap with a hard
   shadow of 10 px or more; contrast of the focused item against its ground at least 4.5:1.
6. **Line length** of reading text about 45-75 characters (max about 1150 px at 42 px here).

## 3. Audit: Study Desk against this

| Area | Today | Verdict |
|---|---|---|
| Stage fit | `desk/src/app/tv/page.tsx`: one 1920x1080 stage (2880x1620 for the bench's Desk display), `zoom = min(w/1920, h/1080)`, centred, re-fitted by a ResizeObserver. A zoom, not a scale(), for raster cost (STICK-PERFORMANCE-2026-10-21). Playwright check below: 1280x720 zoom 0.667, 1920x1080 1, 3840x2160 2, 2560x1080 zoom 1 with 320 px bars each side. | Conforms. |
| Operator bar on the device | Hidden by the stick app (`KeyBridge.kt`) so the stage gets the whole window; on a PC the bar costs about 40 px of height. | Conforms on device. |
| Safe area | `.safe { inset: 54px 96px }` for On Air screens; the landing, Essay and Maths keep the 5% themselves; the ruler is the 1728 px safe width. | Conforms. |
| Viewport meta | `width=device-width, initial-scale=1, viewport-fit=cover`. | Fine: the WebView's CSS width is whatever the device reports, and the stage fits it. |
| Focus | On Air: white skewed fill plus 12-14 px hard signal-red shadow; 3 px borders; scale 1.04. | Conforms. |
| Type | Body 32, headline 52, buttons 36, caption 42. But about 100 rules sit at 20-22 px (eyebrows, kickers, labels) and two Essay TV rules sat at 18 px. | 18 px fixed (below). 20-22 px labels are at the lower edge: recommendation. |

### Changed in this pass
- `desk/src/design/essay-specimen.css`: `.em-tag` and `.em-twin-ch dt` from 18 px to 22 px (the only TV rules under 20 px).

### Recommendations left (bigger than a safe CSS tweak)
- Raise the 20-21 px labels (Maths `mb-lab`, `mb-kick`, `mb-strand`, `mb-pstrand`, `mb-cell2 .k`, Essay `em-lbl`, `em-key`, Linga `lo-plate-label`) to 24 px where the box allows; each needs a visual check because most are uppercase with wide tracking.
- Measure the real WebView on the Stick and a 4K Fire TV (`innerWidth`, `devicePixelRatio`) and record it here; the 960x540 / dpr 2 claim is third-party.
- Add a Playwright size matrix (1280x720, 1920x1080, 3840x2160, 2560x1080) to the TV capture runbook.
- The landing's `CHOOSE` / `SELECT` hint chips are about 20 px; fold into the landing owner's next pass.
