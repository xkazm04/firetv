# H1 - the fusion HUD system

Design before implementation, 2026-10-02. Sources: DEATH-RIDE-HUD, backlog N1/N2, completed A0-A3, D2/D3, I1-I3 and G2; art DELIVERY, OWNER-CHOICE A-D, STYLE, the three parent cards, style-fusion and FUSION-BRIDGE, and review/fusion. Direction approval is not exact asset approval. No human comfort or taste verdict is inferred.

## Inventory and drawing authority

TV coordinates currently use a 1280x720 logical stage, scaled 1.5 at 1080p. Meaningful text must be at least 20 logical px (30 physical px); meaningful standalone icons at least 28 logical px (42 physical px). Larger headline and telemetry figures establish hierarchy. Decorative chips may be smaller. Phone text uses CSS pixels and every driving target retains at least 44 CSS px; sofa floors do not apply to handheld text. Every row retains labels and simple opaque shapes when a texture is missing.

| Component / surface | Current implementation / drawing location | Target family, minimum size and fallback |
|---|---|---|
| TV lap, position and speed | RaceGame.rebuildUi, GlyphLayer; procedural text | Hot Ink separated instrument cells; 30 px labels, 48+ px position; text on soot fallback |
| TV HP and armour | RaceGame.drawOverlay hull fill, rebuildUi hull text; only health frame atlas; armour currently only garage stat | Hot Ink meter frame, labelled hull fraction and armour reduction (never a second HP pool); 30 px labels; solid bar fallback |
| TV ammo, selected weapon, mines and arming | RaceGame overlay: tiny atlas weapon/mine icons and text | Hot Ink 48 px silhouettes, actual ammo and remaining cooldown; two distinct slots; labelled fallback |
| Ten signature names, energy, phase, cooldown | RaceGame.rebuildUi; A2 text only, AbilityPainter world tells | Hot Ink reusable energy/cooldown bars plus ten unique signature icons; 30 px state text, 48 px icons; bars and full labels remain without icons |
| Minimap / six markers | RaceGame.drawMinimap procedural track/points | Hot Ink frame and quiet soot backing; route geometry stays procedural and exact, human markers enlarged; shape/number distinguishes seats |
| Countdown, GO and preparation | RaceGame drawOverlay/rebuildUi | Hot Ink meter surround, 66+ px number; opaque backing and procedural ring fallback |
| Results, standings, wreck/elimination, receipt and rematch | RaceGame drawOverlay/rebuildUi | Soot Pulp panel, Hot Ink rank/action borders, 30 px rows; receipt wraps rather than shrinking |
| TV garage parts, price, selected row, before/after stats, install errors, save state | RaceGame drawOverlay/rebuildUi, Garage.offer | Soot Pulp panel with Hot Ink icons/bars/buttons; 30 px minimum; gains/trades carry words/numbers as well as colour |
| Phone garage parts and car market, offers, consumables, loan, debt, receipt | controller renderGarage, offers/marketOffers and garageSheet | Same panel/button palette in CSS, 44 px actions, scrollable content; native text/control fallback |
| TV car selection, role, stats, car preview and circuit lesson | RaceGame lobby overlay/rebuildUi, procedural CarPainter | Hot Ink stat rows on Soot Pulp panel; Rust and Ink car presentation under existing source gates; 30 px labels; procedural car stays |
| Career progress, difficulty, unlocks, next event, guest/duel warnings | RaceGame career; controller renderCareer/careerSheet | Soot Pulp quiet panel, Hot Ink progress/actions; TV 30 px, phone scrollable text and 44 px controls; no compressed microcopy |
| Story cards and act backdrop | RaceGame career/backdrop; controller storyCard | Soot Pulp panel/portraits, Rust and Ink world context; 30 px TV wrapped story; one backdrop resident |
| Rival portraits, names, cars, PR, credits and grudges | RaceGame career atlas portraits; controller careerRivals text | Existing fusion Soot Pulp portraits, 78+ px TV; 30 px names; text identity persists if portrait unavailable |
| TV lobby title, pairing instructions, PIN, address, QR and seat count | RaceGame lobby, updateQr | Soot Pulp card with Hot Ink corners/action; 30 px labels; QR retains white quiet zone, no distressed pixels inside code |
| Phone steering pad, rail/thumb, direction hints | controller .steer/.rail/.thumb; pointer capture | Hot Ink frame with quiet centre, CSS scratches only at corners; full unchanged hit region; original controls if art unavailable |
| Phone GO, BRAKE, DRIFT, FIRE, MINE, SWAP and ABILITY | controller .pedals, independently captured holds | Hot Ink button surrounds and icon/name pairs, >=44 px targets; held/ready/disabled states use outline and words as well as colour |
| Classic / Cruise / Split and left mirror | controller applyLayout and settings | Same components in existing layout grid; no pointer ownership, throttle precedence or mirror semantics changes |
| Phone connection, lag, lost-link, pairing and reconnect | controller status, fail/neutral, pair modal | Bone on soot, rust warning edge and explicit words; neutralization untouched; no decorative overlay intercepts input |
| Phone settings / car / feel sheets, portrait rotation gate, fullscreen / optical flash | controller modal/card, rotate, flashscreen | Soot Pulp sheets, Hot Ink selectors/buttons; scrolling and native form controls; optical white flash remains exact |
| TV link-quiet warning, lower race status and seat strip | RaceGame rebuildUi; currently some text over unbacked snow | Opaque soot backing, 30 px text; separate rows/cells to prevent collisions; procedural backing always present |

## Component specification

The bridge palette is soot #171513, dark earth #39302A, ochre #A37738, rust #B4512D, dried red #6C2427, bone #DDD0A6 and sparse hazard yellow #B4A044. Full parent Hot Ink plus the unchanged bridge compiles into every HUD prompt. No franchise, brands or copied assets. Texture wear stays at corners/joints: broad quiet interiors behind all text, two-value chipped edges, no uniform noise, animated grain or shine. Selected/held controls use a bone edge and solid accent; cooldown uses an explicit remaining-time label and fill. HP is hull / max hull; armour is percentage reduction and must not look spendable.

Frames use measured transparent openings and fixed corners (NinePatch at runtime), not stretching decorative corners with the entire panel. Large panels use the shared soot/earth fill under the frame. Bars fill linearly from authoritative values and keep a minimum 18 logical px body with adjacent 20 px labels. Ability phase colour never substitutes for READY, ARMING, ACTIVE, RECOVERING, COOL or LOW ENERGY. Ten signature icons follow the A1 motifs; geometry and damage remain untouched.

Typography: a rough, original hand-cut uppercase display face for short headings if it stays readable; plain condensed bold text for values and long reading. Font files must have clear provenance. Do not distress tiny glyph strokes, force a script font on story paragraphs, or solve overflow by shrinking below the floor. Layout changes/wrapping take precedence. Use one bounded font atlas where practical; keep the existing texture guards. QR stays unstyled inside its quiet zone.

## Existing assets and missing kit

Fusion supplies three frames (health, turbo, panel), nine HUD icons (armour, engine, handling, light gun, heavy gun, fuel, scatter, spikes, sabotage), five pickups and six portraits. These are present in phase2-fusion/catalog.json and review/fusion/world-hud-frames.png / world-hud-icons.png. Preserve immutable bundles. Current runtime still loads phase2-v1; H2 will publish a new HUD bundle derived from fusion and select it explicitly.

Missing kit: one reusable wide instrument frame, one compact meter frame, one button frame, one countdown/minimap frame, and ten signature icons. Fourteen initial images, up to three attempts per asset (42 worst case), under the owner's approximately 80-image allowance. No need for separate pixels for every bar value, button state or car phase. Procedural/CSS fills carry changing values; existing panels/icons are reused. First frame and first icon are separate proof batches; inspect exact pixels and obtain both local-model observations before approving their batches. No automatic retry after a transport error; the durable stop latch and 550 cap remain unchanged.

Repack UI into its existing one 1024-square page, sizing reusable frames/icons for gameplay and recording their openings, pivots, hashes and 96 px previews. If it cannot fit, reduce decorative resolution before adding residency. Fusion's full declared art residency remains 31.25 MiB including all grid pages and 8 MiB cars reserved; runtime loads only world/UI plus tiles and one backdrop. Do not spend the reserve on HUD pages. Phone uses CSS matching the same shapes/palette, optionally the same small exports, without increasing APK GL residency.

## Verification

Build green each wave. Existing core/link/renderer and browser checks remain gates. Add focused layout/metric checks for meaningful TV text floors and actual signature state bounds; inspect all TV phases and phone sheets at 1080p and 896x414 plus a smaller landscape viewport. Test every controller layout and mirror with real CDP pointers, release/loss/settings unchanged. Missing art must leave every label/bar readable. H3 uses only dev.deathride.hud on the scanned Stick, captures actual states, separates screenshots from sustained timing, and reports strict frame misses honestly. Owner sofa readability and physical thumb reach remain pending.
