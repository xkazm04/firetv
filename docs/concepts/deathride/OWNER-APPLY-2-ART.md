# Owner application 2 — art

Status: **APPLIED; required build, art, GL and browser checks pass.** Authority is section 1 of the [owner decisions](../DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md). No image generation, model calls, new illustrations, retouching or upscaling. Existing atlas cells were repacked; kept exports retain the exact reviewed hashes. The owner's degraded-resolution note remains disclosed.

Active Keep items: scrap pile, oil drums, rust pylon and league gantry; Rook, Vex, Mica and Mechanic portraits; debt contract, four ally cards and ending. The Mechanic portrait is also the garage texture. `art/owner-approvals-2026-10-03.json` records all 35 decisions, exact source/export hashes, owner authority, archive paths and fallback. `art/story-approvals.json` enables only the seven kept story/garage uses. Atlas pixels are checked against the exact archived export, not just a self-consistent page hash.

All 21 Reject decisions are excluded from active regions/catalog entries. Ox, Relay and Marrow use the original portrait aliases. Car seizure and rig reveal restore the exact pre-rework files from `bee3457`, matching the frozen base catalog hashes; their earlier unapproved status deliberately leaves their procedural cards active. The rejected new-Mechanic reuse does not serve the rig card. Its separately approved portrait use remains valid.

The retained dune is removed from the retained set, active atlas/catalog, natural-art mapping and both declared and code fallback decoration sets. The core dune still has its original drag footprint, radii, height and visual extents; `ObstaclePainter` renders its existing procedural shape because the atlas key is absent. Rejected salt crust's pre-rework comparator was that same rejected dune, so the desert set omits that decorative slot and retains procedural ground. No new replacement is invented.

## Theme gaps and fallback

| Theme | Delivered fallback and gap |
|---|---|
| Industrial | Kept scrap, drums, pylon and gantry; earlier tyres, drum, sign and metal crate replace tyre wall, stacks, hoarding and wreck. |
| Quarry | Earlier rock field and crates replace quarry face, crane, slag and wreck; kept drums and pylon remain. No distinct crane silhouette. |
| Desert | Earlier brush, sign and metal crate plus kept pylon. Salt crust/dune decoration omitted; procedural ground remains. |
| Wetland | Earlier crate, tree, drum and tyres plus kept scrap/drums. No distinct new sluice or stack silhouette. |
| Alpine | Earlier sign, rock field, rock spire, scattered tyres, brush and metal crate. The mountain guard-rail silhouette is absent. |

Theme sets may share assets and are validated for actual nonempty, available membership rather than requiring six new props or five artificially distinct candidate sets. All eight obstacle IDs retain exact gameplay metadata; this is a visual-only application.

Original visible pixels are unchanged for the remaining 60 world and all 37 UI cells. The only removed original world cell is the explicitly rejected dune. The current bundle has 269 regions and 165 logical assets, no extra pages, **31.25 MiB** declared residency with reserve, and **18.75 MiB** desktop atlas residency. Story menu bound is **1,283,072 bytes**, below the existing 1.5 MiB and shared headroom gates. These are host/declaration measurements, not new device evidence.

Rejected and historical candidate exports remain in `art/review/rework2`, with the original candidate catalogs/manifest/environment retained in `art/archive/owner-2026-10-03`. The before/after page is labeled historical and links current decisions; its scratchpad controls do not change runtime approvals. The old candidate bundlers refuse to overwrite the dated decisions. `tools/art/apply-owner-art.py` reproduces the selection from existing bytes only.

Validation: 163 core / 8 link / 35 game tests, `:app:assembleDebug`, 52 art tests, `validate_bundle`, dated owner validation, real desktop environment/face/story GL, six runtime browser suites, and 1440/390px current-report and archived-review checks pass. GL verifies enabled kept lookups, all excluded candidate lookups denied, original portrait aliases, all five theme sets, scene release, corrupt/missing/rejected/budget fallback and current story text layout. An initial game test correctly exposed its stale assumption that the rejected dune must still have an atlas region; its replacement still asserts every unchanged physical field and explicitly requires dune absence.

Current report: file:///C:/Users/kazda/kiro/firetv-deathride/deathride/evidence/owner-decisions/art/index.html

Historical review: file:///C:/Users/kazda/kiro/firetv-deathride/deathride/art/review/rework2/index.html

Campaign cleanup is complete: merge commit `c082fd4` contains `f886edc`; the clean campaign-v2 worktree and branch were removed after verifying ancestry. No Stick access or push.
