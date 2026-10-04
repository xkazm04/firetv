# H3 - HUD evidence and owner handoff

**H3 evidence complete; build and functional checks pass. Frame-tail and zero-loss input gates remain open; owner feel is unmeasured.** The HUD APK is installed and left at a fresh lobby. No push. Browse the [evidence gallery](../../../deathride/evidence/hud/h3/index.html) and [timing figure](../../../deathride/evidence/hud/h3/timing.png).

Measurement design before device work, 2026-10-02. Use only dev.deathride.hud / port 8768 on the /24-discovered AFTKM. Verify APK identity before install and preserve read-only before/after dev.deathride.tv package records. No push. H2's desktop/browser evidence is not a Stick result.

Capture lobby/QR and car selection, garage/shop, career/story/rivals, countdown, active race instruments, all ten signature identities and observed phase states, wreck/results, link quiet and Home/resume. Keep actual ordinary-input screenshots separate from any diagnostic fixture; do not claim a screenshot is frame-synchronous with a preceding HTTP observation. Check all phone layouts/mirrors, sheets and loss states on the real listener. Sofa legibility and physical-phone reach remain owner pending.

Run a new complete 66,000-race matrix on the unchanged core (40,000 on roster, 4,000 off roster, 16,000 paired early observations, 6,000 homogeneous rotation), namespace abilities/acceptance-v2. Audit strictly and compare every outcome field with A3. Preserve H0's smaller exact-replay sample as a separate check. No tuning change is justified by identical outcomes. Run headless work at BelowNormal; finish it before the final device timing sample to avoid a contended driver host.

Final timing protocol: 900 seconds, two ordinary 30 Hz controllers, all ten classes/five courses, guns/mines/abilities enabled, no in-run screenshots, host driver AboveNormal. Retain rejected inputs and pump stalls. Report active-window p50/p95/max and step distribution, since-start/transition maximum separately, discarded simulation time, real PSS samples and actual owned texture residency. Unchanged targets: p95 16.7 ms, active max 33 ms, art 32 MiB, owned textures 52 MiB, PSS 192 MiB and warm growth <=8 MiB. A passing median never turns a failing tail into a pass.

Final truth ladder is exists -> valid -> wired -> behaves -> felt. Only the owner supplies felt. Final build requires core/link/renderer tests and APK plus applicable existing browser checks; preserve historical checks' failures and update obsolete fixture assumptions explicitly. Record one owner checklist, final evidence/source/APK hashes, a status row and one session entry before the H3 commit.

## Presentation review and corrections

The real 1920x1080 AFTKM captures exposed two misleading weapon labels: mines could say READY during opening protection, and an empty or signature-locked weapon could say READY. Both gun and mine labels now derive ARMING / EMPTY / LOCKED / COOL / READY from the actual combat and ability state. A renderer test uses a live core World to verify firing is rejected when those labels reject it. Its initial single-entrant fixture correctly triggered last-survivor resolution; the accepted fixture retains a stationary full grid. The failed test log is retained.

The lap instrument now fits the full authored 18/18, 21/21 and 24/24 counters without shrinking the heading. Speed retains enough space for three digits. The preparation notice occupies the header's secondary line, outside the QR/car panels; during a race it uses the backed lower status strip. Garage armour and mount icons now represent their actual part. Brakes retain explicit text instead of an unrelated shield. None of these changes affects simulation, economy, controller input or generation spend.

The result receipt now labels PRIZE / PIT / BANKED / BANK as separate amounts. The previous arithmetic-style label implied prize minus pit always equalled banked income, omitting debt repayment or the credit cap. A real result (115 prize, 69 pit, 40 banked after repayment) exposed the error. The economy itself is unchanged.

The real-GL audit checks all 35 story headings and wrapped story bodies with production glyph advances, plus all ten signature names and every authored lap counter. The longest heading is 667.72 logical pixels within 677. Body text is nominal 20 logical / 30 px at 1080p, headings 38 logical, icons 32 logical; a nominal font size is not a claim about every glyph's ink height. Missing catalog/pages, invalid metadata, zero art budget and unapproved cars still exercise fallback successfully. The HUD bundle validates at 88 logical assets / 192 packed regions / 31.25 MiB including car reserve; runtime loads 98 regions because the unapproved car grid is not enabled.

## Evidence handling

All evidence is under `deathride/evidence/hud/h3`; H0-H2 remain separate. `gallery` is the first attempt which sampled career texture telemetry before refresh. `gallery-reviewed` subsequently passed ten selections, 25 course preparations, story/rival data, Home/resume and an ordinary Quill result. Its link capture caught the backed panel before its text refresh, so the final gallery waits for both stale consumption and neutral throttle. No failed attempt is overwritten.

`stick/visual` was interrupted by the shared default ADB daemon disappearing. HUD tools now use their own host server port 5039, always targeting the /24-discovered device and package `dev.deathride.hud`. `stick-isolated` contains the successful intermediate 720-second visual exercise and browser checks. The gallery records telemetry before and after screenshot readback: a filename such as ACTIVE describes the requested phase, and a short effect can have advanced to recovery in the image. HUD states and actual activation packets are separate evidence. The final runs bind their own APK hash.

The final renderer/phone build passes 120 core, 3 link and 6 renderer tests, APK packaging and desktop distribution. Fresh desktop checks pass pairing/reload/multitouch, combat switching and independent release, all six ability layout/mirror combinations, eighteen small-landscape layout bounds checks, four sheets and real offline/reconnect. Real-browser checks do not establish physical-phone reach, optical latency or secure-context capabilities on the LAN.

## Full mine/balance replay

**PASS: 66,000 fresh races / 78 cells, strict audit and exact A3 replay.** All CSV fields for every seed match the accepted A3 matrix, including terminal hashes, outcomes, damage and ability use. This supersedes H0's small merge-regression sample. The independent [audit](../../../deathride/evidence/hud/h3/balance/audit.md), [comparison](../../../deathride/evidence/hud/h3/balance-comparison.json) and compressed raw rows are retained. No simulation/data changes were made by the HUD work.

The on-roster weighted class shares span 47.24-52.76%; skill and course advantages pass their declared checks. All homogeneous rotation orders agree. There are no one-shots or early-lap lead losses in the declared paired career observations (2,000 on and 2,000 off per scenario). These are AI-proxy observations, not human fairness results.

| Mine setting | Old 5 m baseline | Accepted A3 and HUD |
|---|---|---|
| Blast / displayed ring radius | 5 m | 0.5 m, provisional owner decision |
| Effective trigger | 1.6 m | min(1.6 m cap, 0.5 m blast) = 0.5 m |
| Base damage | 24 | 24 |
| Arming / lifetime | 1.4 s / 18 s | unchanged |
| AI clearance | blast + body radius + 2 m margin | same radius-based rule |

A3's retained [before/after comparison](../../../deathride/evidence/abilities/a3/mine-before-after.json) pairs 66,000 races: 25,603 terminal hashes and 1,697 winning driver slots changed, with zero changed winning classes. That comparison includes A3's recovery correction and compares complete configurations; it does not isolate mine damage. HUD repeats the corrected endpoint exactly. Retain 24 damage and the configured 1.6 m cap: a wider effective trigger can detonate outside its hit area, and the passing replay supplies no balance witness requiring more damage. Body overlap remains authoritative. Actual usefulness and the readability of such a small mine remain owner checks.

## Device coverage and APK binding

The /24 scan found AFTKM at `10.0.0.139:5555`. Every install, launch and force-stop targeted `dev.deathride.hud`; the Java activity namespace remains `dev.deathride.tv.MainActivity` inside that separate package. The original TV package was only inspected read-only.

The delivery APK is **559999a93fb0b601408123ea04ad08af2db7cc273d87bd9a186fc067327efb4b**. `gallery-accepted`, `stick-accepted`, `header-final` and the sustained timing run use this APK. It passes all four browser suites on the real listener, including six independent ability layout/mirror checks and eighteen viewport/layout/mirror target checks. The header-only harness initially missed its WebSocket open event; the corrected handler order passes and both logs remain.

The 720-second `stick-final/visual` run used **da03b96cdb6a2e94f54a0153d599ba2518a57cb946e99aef3f90f36f34842ebc**, immediately before the one-line receipt wording correction. Race HUD, assets, simulation and controller code are identical between these two APKs. It records 57 requested TV signature-phase captures, all ten identities/activations, READY through recovery/cooldown, empty mines, locked guns and wrecks. Each controller sent 21,603 inputs at 30 Hz; five per controller were rejected, so **its zero-loss input gate fails**. No pump stalls or ADB reconnections occurred. Short phases can advance between telemetry and image acquisition; inspect the rendered label, not only the filename.

The accepted gallery covers unpaired/paired lobby and QR, all ten car selections, all 25 courses, garage and scrolled phone shop, career/story/rivals, Home/resume, ordinary 18-lap career start, countdown/GO, race, link quiet and wreck/results with the corrected receipt. Header captures directly show PREPARING CIRCUIT separated from the QR and car copy on Switchback and Ridge. A complete desktop `--no-art` run also reaches the race with readable procedural instruments, bars, minimap and status (`procedural-*.png`). It is an explicit desktop failure-injection fixture, not another Stick claim.

LOW ENERGY and NO SIGNATURE are defensive labels, not observed production states in these runs; current recharge/cooldown tuning restores sufficient energy before another normal activation and all ten shipped cars have signatures. No synthetic screenshot is presented as ordinary play.

## Final sustained timing and input gates

The final APK ran for **900.195 seconds** with screenshots disabled, two ordinary 30 Hz controllers, mines/guns/signatures enabled, and an AboveNormal host driver after headless and browser work finished. There were 17 started practice rounds, six results, 752 observed windows and 593 complete active windows. Cycling intentionally interrupts some rounds. All ten signatures activated and appeared ACTIVE in HUD telemetry; peak simultaneous committed abilities was five. Mines used the actual 0.5 m blast and effective trigger, with 287 shots and thirteen live at peak. This is ordinary mortal-car play, not a forced maximum-effects fixture.

| Measurement | Final HUD observation | Unchanged gate / result |
|---|---|---|
| Active frame p50 range | 16.583-16.860 ms | 16-18 ms: pass |
| Worst active-window frame p95 | 20.951 ms | <=16.7 ms: **fail** |
| Active frame maximum | 35.476 ms | <=33 ms: **fail** |
| All-window frame maximum | 232.737 ms | Startup/transitions retained separately |
| Simulation step p50 / worst p95 / maximum, active | 1.215-1.961 / 3.405 / 13.528 ms | Distribution, not frame time |
| Simulation discarded time | 806 ms since app start; zero in complete active windows | Transitions remain included in since-start total |
| Inputs per controller | 27,006 sent; 27,000 accepted; six rejected | Zero loss: **fail** |
| Host pump stalls / ADB reconnects | zero / zero | No driver stall or reconnect observed |
| Actual process PSS | 104.38-113.56 MiB | <=192 MiB: pass |
| Warm first/last median PSS | 107.48 / 109.85 MiB; +2.36 MiB | Growth <=8 MiB: pass |
| Owned textures / runtime art | 31.97 / 10.75 MiB | <=52 / <=32 MiB: pass |
| Thermal status | 0 throughout sampled observations | Recorded observation |

All twelve rejected inputs cluster at host seconds 264.08-265.68, with acknowledgement RTT 263.4-293.3 ms. Worst active-window input-age p95 was 229.5 / 230.4 ms for the two seats; since-start stale-consumption samples were 92 / 70. These facts do not identify where delay occurred. No engine/network tuning or relaxed threshold hides the failure. A3 already left the same frame-tail and zero-loss categories open (worst p95 20.914 ms, active maximum 48.153 ms, five rejected inputs total); these separate runs are not a controlled before/after measurement and do not prove a HUD performance improvement or regression.

The [summary](../../../deathride/evidence/hud/h3/stick-timing/timing/summary.json), gzip raw observations, exact round-trip archive hashes and [standalone figure](../../../deathride/evidence/hud/h3/timing.png) retain the evidence. Ten-second windows overlap: their percentiles are neither averaged nor added. The absence of growth beyond the declared threshold during fifteen minutes does not prove indefinite leak freedom. Scripted LAN traffic does not measure optical latency or physical-phone comfort.

## Spend, provenance and truth ladder

The final read-only canonical ledger snapshot at 17:42 UTC records **433/550 weekly images reserved, zero videos, stop latch clear**. HUD reserved **22 calls for fourteen selected images**, below the approximately eighty-image limit. The increase from the initial 401 includes eleven reservations by other work. No H3 generation, unguarded transport retry, quota bypass or stop clearing occurred. Existing shared-account, per-asset, proof-before-batch and local-grade gates remain in force. Both local grading observations and disagreements, rejected attempts and direct visual review remain available; selection is not exact-pixel owner approval.

| Tier | Established evidence | Limit |
|---|---|---|
| Exists | Fourteen selected HUD assets, original cut-letter font, TV implementation and phone CSS | No external font or new sound asset |
| Valid | Fresh bundle validation: 88 logical assets, 192 packed regions, 31.25 MiB with reserved cars; one UI page; H2's 39 art tests | Historical portable Part 3 owner hash still predates appended section D and fails honestly; its old artifact is preserved |
| Wired | 98 runtime art regions, ten signature identities, every inventoried TV/phone surface, actual Stick listener and installed APK | Unapproved car grid remains behind its approval gate and uses procedural cars |
| Behaves | 129 JVM tests, APK/desktop build, four browser suites on desktop and Stick, real GL/fallback checks, full exact 66,000-race replay and the recorded device states | Strict frame-tail and zero-loss input gates fail; defensive labels not observed are identified above |
| Felt | [Owner checklist](../../../deathride/OWNER-CHECKS.md) supplied with concrete good/bad observations | Sofa readability, exact HUD pixels/font, physical-phone reach, mine usefulness, human fairness and fun remain unmeasured |

The [installed APK receipt](../../../deathride/evidence/hud/h3/installed-apk.json) verifies the on-device file against the delivery APK. The [TV preservation record](../../../deathride/evidence/hud/h3/tv-preservation.json) confirms unchanged version and install timestamps for the unrelated TV package. [Source identities](../../../deathride/evidence/hud/h3/source-hashes.json) include working-tree SHA-256 and Git blob identities after line-ending filters; the [evidence manifest](../../../deathride/evidence/hud/h3/manifest.json) binds all retained H3 files. Failed and intermediate attempts remain explicitly named, rather than being replaced by the passing gallery.

Git attributes now preserve the accepted HUD bundle and H3 evidence bytes verbatim. Restaging the bundle retains its actual CRLF metadata rather than normalizing it to LF; the diff ignoring end-of-line whitespace is empty, with no pixel or semantic changes. All 491 manifested evidence files match their staged bytes, and all 306 source/bundle identities match staged Git blobs.

Remaining work is specific: diagnose the measured frame tails and clustered late inputs without weakening gates; collect the owner's physical viewing/phone verdict and provisional mine feedback; obtain exact-source car approval separately; and handle the stale historical Part 3 audit in its owning art stream. Sound remains absent. No owner approval or human feel result is implied by completing H0-H3.
