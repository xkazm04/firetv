# P13 - Profile saves off the render thread (step 2 of 2: RaceGame on ProfileWriter)

2026-10-07, AFTKM `10.0.0.139:5555` (Android 11), isolated `dev.deathride.perf` / 8772 / private ADB 5041.
Branch `autopilot/codebase-static-analysis-sweep-57170b18`, cut from `deathride/main` cc5a6a13 (P13a: ProfileWriter,
kill seam, timing). Every figure below was measured in this session. Summaries are in `deathride/evidence/perf/p13/`.
Its `manifest.json` binds the raw logcats, traces, APK and build and gate logs, which are kept outside git in
`C:/Users/kazda/kiro/deathride-raw-evidence/p13/`. Nothing was pushed.

## Figures first

| Reading (P10 arm, 360 s, profiled) | P10 final-run1 (sync saves) | P13 run 1 | P13 run 2 |
|---|---:|---:|---:|
| Transition max, ms (bar: no frame over 100) | 308.4 | **186.1** | **117.2** |
| Transition windows over 100 ms | 41 | 31 of 57 | 32 of 58 |
| Profile save on the render thread, ms | 50.2-107.7 | 0 (submit 3.1-19.2) | 0 (submit 4.0-12.4) |
| Its garage publish, ms | 10.2-52.3 | 9.0-64.6 | 10.1-24.8 |
| Car pick request, ms | 70.1-131.3 | 18.9-118.6 | 21.7-52.5 |
| `startRace` request, ms | 139.6-273.5 | 46.6-142.7 | 56.4-106.1 |
| Rest of the start once tickets are durable (`raceLaunch`), ms | (inside startRace) | 7.9-13.2 | 7.2-10.9 |
| `finishRace` frame (settles in the sim block) | 231.6 sim (P10 prep-run1) | 95.9 sim / 104.8 work | 96.5 sim / 105.6 work |
| Writer-thread write, ms (CHOICE / TICKET / SETTLE) | - | 77.8-363.3 / 57.2-521.0 / 75.4-111.5 | 76.4-246.1 / 56.5-306.5 / 91.5-217.5 |
| Start waited for its tickets: frames / ms | - | 6-22 / 160.1-769.5 | 4-9 / 169.9-466.1 |
| PSS, MiB | 165.2-170.0 | 154.5-188.7 | 171.7-197.8 |
| Rejected inputs / host pump stalls | 0/0 / 0 | 0/0 / 0 | 0/0 / 0 |
| Host CPU at start / end (16 logical) | 100% / 100% | 96-100% / 25-35% | 17-32% / 22-28% |

**Verdict on the bar: fail in both runs.** The save itself left the render thread. Every write (25 per run) ran on the
writer thread, and none failed. The phase that moved is the request phase of the lobby-to-race switch. `startRace`
fell from 139.6-273.5 ms to 46.6-142.7 ms, a car pick from 70.1-131.3 ms to 18.9-118.6 ms, and the transition max from
308.4 ms to 117.2-186.1 ms. 31-32 of 57-58 transition windows still hold one frame over 100 ms. Each frame is
attributed below. One group is not a save at all: an off-render gap after each course switch, present in P10 too.

## The wiring (ebe59cd3, on 08fa0a72)

RaceGame on `deathride/main` still saved synchronously (reconciled: no ProfileWriter use in `game/`). The wiring is
step 1's plan with the App Master's answers. The state lives in `game/ProfileSaves.kt`, a GL-free class that RaceGame
delegates to through four hooks: publish, reverted, startReady and changed.

- **core (08fa0a72):** `ProfileWriter` takes `fun interface ProfileSaver` (`ProfileStore` implements it, durability
  steps unchanged), so game tests can hold or fail a write without the store's internal seam. Each `Completion` carries
  `writeMs`, the writer thread's wall time in `save()`.
- **create():** `saves=ProfileSaves(ProfileWriter(profileStore), ...)` right after `profileStore`, before the loads.
- **loadProfile(i):** if the seat's old profile has queued saves, it drains them (bounded at 2,000 ms, logged as
  `transition profileSwitchDrain`) before loading. Loading the same id again therefore never reads a file older than
  its queued save. The seat then gets a fresh writer slot, and `seed()` runs after a good load. A slot is one loaded
  profile, not one seat, so a late completion of the old profile is logged and never applied to the new one.
- **editProfile(i, kind, edit): Long:** same persistence check, copy and edit. Then `submit(slot, updated, kind)`,
  `profiles[i]=updated`, `saveStatus='Saving...'`, `publishGarage(i)`. It returns the job id, 0 when refused.
- **pump()**, first in the request phase of every `render()`, applies `poll()`:
  - OK with nothing pending for the slot: `'Saved'` and a publish.
  - FAILED: one revert to `durable(slot)`. That is the selected car, `Garage.apply`, `world.reset()` outside a race
    and a publish, with today's `'Save failed - change cancelled'`. The race-ticket and settle messages differ, below.
  - CANCELLED: no second revert.
- **CHOICE saves** (car pick, `buyPart`, `buyMarket`, career prep, difficulty) apply at once, as before.
- **startRace:**
  - Same validations, then career prep as a CHOICE submit.
  - Each active seat's `Economy.start` ticket is a MONEY submit on the optimistic copy. The tickets and job ids are
    held as a pending start, the TV shows `SAVING RACE TICKET...` and the call returns without `configureWorld`.
  - When every ticket job is OK, `launchRace` runs the rest of today's start: `campaignRace`, round, tickets,
    `configureWorld`, countdown, `ui.confirm`.
  - A FAILED or CANCELLED ticket drops the start with `'Save failed - race not started'`, and that seat reverts.
  - While a start is pending, start, career, garage, car, purchase and track requests are refused. Start and career
    refusals are logged once per reason. The seat's garage message reads `'Saving race ticket...'`.
- **finishRace:**
  - Each seat's settle is a MONEY submit, still inside the sim block, and the game goes to results as today.
  - The results screen shows `SAVING RESULT...` instead of the receipt until the settle is OK, and the receipt counts
    after that.
  - On FAILED or CANCELLED the seat reverts and the receipt is withdrawn with `SAVE FAILED - RESULT NOT COUNTED`.
  - `campaignAudio.settled` and `script.raceFinished` stay where they were, on the optimistic result.
- **While a settle is pending,** `startRace`, `openCareer` and `careerSelect` return early (`'Saving result...'` on
  the TV), and the lobby keeps drawing.
- **pause():** after `server.suspendLink()`, `drain(1500)`, with `transition pauseDrain drained=false` logged on a
  timeout. The libGDX version this repo pins, 1.13.5, kills the process when a GL pause takes 4,000 ms
  (`AndroidGraphics.pause`: `wait(4000)`, then `killProcess`, read from the jar's bytecode). Queued saves are never
  dropped.
- **dispose():** `close(2000)` before `server.stop()`.
- **The step-1 failure rule stands as built.** A job submitted before `poll()` reported its slot's failure is
  cancelled. A job submitted after it is written on the reverted state.
- **Diagnostics:**
  - `transition profile` keeps its fields, with `submitMs` (copy and queue) where `saveMs` was, plus `kind` and `job`.
  - New: `transition write ... writeMs=` once per completed write, `transition ticketWait frames= waitMs= status=` once
    per start, and `transition raceLaunch totalMs=`.
  - `tools/perf-p10.py` reads all of them unchanged, so it was not copied. `tools/perf-p13-saves.py` reads the new
    lines and checks the launch order. `tools/perf-p13-compare.py` builds `comparison.json`.

Choices the brief left open, made here and listed under questions: BACK (`lobby()`) drops a pending start, and the
tickets already written stay unsettled, like an abandoned race. Opening the garage is refused during a pending start,
like the other requests. A refused start is dropped, not queued.

## Tests

`gradlew.bat :core:test :link:test :game:test --rerun-tasks` on ebe59cd3: green, with core 247, link 20 (2 skipped, as
on the base) and game 85. `ProfileSavesTest` (game, 9 cases) runs a real `ProfileWriter` against a `ProfileSaver` that
can hold or fail a write. It passed in three consecutive forced runs.

| Case | What it shows |
|---|---|
| `aRaceDoesNotStartUntilBothTicketsAreDurable` | `beginStart` returns with the start pending. 20 pumps with both writes held do not launch. Release, and the start launches once, both jobs durable, with a `ticketWait ... status=durable` line. |
| `aFailedTicketStartsNoRaceAndRevertsToDurable` | Seat 1's ticket write fails: no launch, seat 1 back to `startedRaces=0`, `'Save failed - race not started'`, and the next start may be tried. |
| `aCancelledTicketStartsNoRaceAndRevertsOnce` | Career prep fails on disk, so the ticket queued behind it is CANCELLED. No launch, one revert only. |
| `aFailedChoiceRevertsThePickOnce` | Pick A fails and pick B, queued before the failure was seen, is cancelled. One revert to the original car, `'Save failed - change cancelled'`. A pick after the failure is written on the reverted state. |
| `aPendingSettleBlocksTheNextRaceUntilItIsDurable` | Both settles held: the start blocker reads `'Saving result...'`, the receipt is PENDING, then COUNTED once durable. |
| `aFailedSettleRemovesTheReceipt` | The settle write fails: receipt FAILED, profile back to the durable state (no receipt), `'Save failed - result not counted'`. |
| `requestsDuringAPendingStartAreRefused` | Start, car, purchase and track refused during a pending start. A second `beginStart` throws. After launch, nothing is refused. |
| `pauseDrainsQueuedSavesAndNeverDropsThem` | 5 queued writes are on disk before `pause()` returns. A held write makes `pause(200)` return false within 1 s and log it, and that write still lands. |
| `aProfileSwitchDrainsTheOldProfileAndIgnoresItsCompletions` | A switch drains first. The old profile's OK completion is logged and leaves the new profile untouched. |

GarageTest, ProfileWriterTest and every other existing test are unchanged and green.

## Stick runs

One APK (`f3804fcd43ed0e70...`, built from ebe59cd3 with P12's recipe: `assembleDebug -PappId=dev.deathride.perf`).
Two consecutive runs of `tools/perf-device.py --install --profile --warm-routes --tracks
scrap-1-c,foundry-1-c,salt-1-b,switchback-1-a,crown-1-a --seconds 360`, graded with the unchanged `tools/perf-p10.py`.
Both probes exited 0 (every class activated, 0/0 rejected inputs, 30.002 Hz, 0 host pump stalls), so no run was
voided or repeated. `ws` 8.18.0 was copied from the main checkout for the runs, gitignored, and removed afterwards.

From the log (`p13-saves.json`, per run):

- **Every race started after its tickets were durable:** 6 of 6 starts per run. Each `startRace pending=true` is
  followed by both ticket `write ... status=OK` lines, then `ticketWait ... status=durable`, then `race countdown`
  and `raceLaunch`. No start was refused, dropped or failed.
- **Every settle completed:** one race per run ended before the 60 s cap (the others went back to the lobby
  unsettled, as in P10). Its two settles were reported OK 111-244 ms after submit.
- **Write statuses:** 25 per run, all OK. There were no reverts and no `pauseDrain` timeouts.

### Run 1 (host 96-100% CPU at start)

| Approx. s | Work, ms | Interval, ms | Phase over budget | Request |
|---:|---:|---:|---|---|
| 0.17 | 184.5 | 31.3 | requests 154.8 | car pick 118.6 (submit 16.9, publish 64.6) and track 34.3 in one frame |
| 0.35 | 22.3 | 186.1 | - | the frame after it |
| 0.46 | 140.3 | 17.8 | requests 129.5 | `startRace` 129.1: ticket submits 17.0, publishes 52.8, rest 59.4 |
| 0.60 | 100.9 | 146.6 | simulation 68.8 | first frames after launch: sim catch-up |
| 0.71 | 43.8 | 104.3 | - | the frame after it |
| 43.39 | 104.8 | 18.3 | simulation 95.9 | `finishRace`: two settle submits 5.5+4.6, publishes 18.9+17.4, then results audio, script and UI |
| 43.50 | 7.8 | 109.4 | - | the frame after it |
| 45.75 | 101.3 | 25.9 | requests 72.3 | track switch to foundry: scene construction 63.9 |
| 45.85, 46.11 | 7.4, 8.2 | 102.6, 108.4 | prepare 3.5, 4.9 | bake-phase gap (below) |
| 47.48 | 150.5 | 14.0 | requests 143.1 | `startRace` 142.7: submits 30.8, publishes 72.8, rest 39.1 |
| 47.63 | 21.8 | 152.4 | - | the frame after it |
| 113.59, 181.01, 248.94 | 6.2-7.3 | 109.1-112.4 | prepare 3.3-3.6 | bake-phase gap, about 1 s after the salt, switchback and crown switches |

### Run 2 (host 17-32% CPU)

| Approx. s | Work, ms | Interval, ms | Phase over budget | Request |
|---:|---:|---:|---|---|
| 0.11 | 103.9 | 20.3 | requests 64.5 | car pick 52.5 and track 11.5 in one frame |
| 0.22 | 30.9 | 105.5 | - | the frame after it |
| 0.54 | 115.8 | 10.1 | requests 106.4 | `startRace` 106.1: submits 18.0, publishes 46.9, rest 41.3 |
| 0.66 | 22.5 | 117.2 | - | the frame after it |
| 0.88 | 101.1 | 38.4 | requests 76.2 | not attributed: no request line was logged near it (countdown of round 0) |
| 0.98 | 41.1 | 103.7 | - | the frame after it |
| 42.67 | 105.6 | 17.0 | simulation 96.5 | `finishRace` (as in run 1) |
| 42.78 | 10.0 | 106.9 | - | the frame after it |
| 45.81 | 10.0 | 108.5 | prepare 5.5 | bake-phase gap after the foundry switch |
| 47.08 | 102.4 | 16.2 | requests 91.2 | `startRace` 90.9: submits 18.6, publishes 27.4, rest 44.8 |
| 47.19 | 55.8 | 103.8 | - | the frame after it |
| 113.45, 180.87, 248.36 | 17.1-18.3 | 100.1-102.7 | prepare 3.1-3.8 | bake-phase gap |

Per-round transition max, run 2: 117.2, 108.5, 100.1, 100.2, 102.7 and 93.4 ms. Rounds 2-4 miss the bar only through
the bake-phase gap.

## What still exceeds 100 ms (attribution, no fix built)

1. **`startRace` request, 46.6-142.7 ms.** None of it is the write any more. Ticket submits (two deep copies and two
   queue pushes) cost 7.5-30.8 ms. The two garage publishes (`Garage.json` and `Career.json` per seat) cost
   19.1-72.8 ms. The rest, 19.1-59.4 ms, is `beginStart`'s own `publishGarage(0)` for the career message, the
   `rebuildUi()` that shows `SAVING RACE TICKET...`, and the edit copy. It exceeds 100 ms in the first two starts of
   run 1 and the first of run 2. Run 2's second start, at 90.9 ms, still makes a 102.4 ms frame.
2. **`finishRace` in the sim block, 95.9-96.5 ms (frames 104.8-105.6).** The settle submits and publishes are about
   46 ms. The remainder is today's results work (`raceAudio.results`, `script.raceFinished`, `rebuildUi`) and the
   sim step itself. P10 saw 231.6 ms here.
3. **Bake-phase gap, 100.1-112.4 ms interval with 6-18 ms of work.** It appears once per course switch, about
   1-2 s after `regionMaterials ... prepared`, on a frame that runs a scenery-bake slice (prepare 3-6 ms). The render
   thread is not working, and no save is in flight (the picks' writes had finished about 2 s earlier). P10's runs show
   the same frames: final-run1 at 66.3, 133.3, 200.1, 267.3 and 331.9 s (100.5-110.6 ms). So they predate this change.
   Their cause (GL upload in the swap, GC after the 19.66 MB region decode, or scheduling) needs a trace and was not
   taken in this run.
4. **Track switch, 101.3 ms once** (foundry, scene construction 63.9 ms in run 1). P10 measured 12.1-169.0 ms.
5. **Car pick, 118.6 ms once** (the first pick of run 1: publish 64.6 ms, with the host at 96-100%). Its other 21
   picks were 18.9-52.5 ms.
6. **Frames after a slow frame:** each item above is followed by one frame whose interval contains it.
7. **One requests-phase frame of 76.2 ms** (run 2, 0.88 s) with no request line. It is not attributed.

The next lever is therefore not the save. It is the per-start publish and UI work (items 1-2) and the bake-phase gap
(item 3, which alone keeps rounds 2-4 above 100 ms). Both are out of this run's scope.

## Input and host

No probe failure in either run: 0/0 rejected inputs, 30.002 Hz per seat, 0 host pump stalls. Run 1 started with the
host at 96-100% CPU (rustc, headless Chrome and node from other sessions) and ended at 25-35%. Run 2 ran at 17-32%. The
two runs' bar figures (186.1 and 117.2 ms max) track that: run 1's worst frames are its first car pick and first start
under the loaded host.

PSS 154.5-188.7 MiB (run 1) and 171.7-197.8 MiB (run 2). Run 2 crosses the I2 reference reading of 192 MiB.
P10 final-run1 read 165.2-170.0 MiB, and P11's 900 s soak read up to 202.0 MiB after the `/routes` warm-up. No cause
was looked for in this run.

## Limits

Two profiled 360 s runs of one APK, not a 900 s soak. Render seconds are on the `/profile` fetch clock (about 0.1 s)
and are mapped onto the log through each round's start, so the nearby requests are candidates, not proof. Only one
race per run reached `finishRace` (the probe caps a round at 60 s), so the settle path has two writes per run on the
Stick. The failure paths (FAILED and CANCELLED, revert, refused requests, the pause timeout) are proved by the tests,
not on the device. No write failed on the Stick. No optical latency or owner feel. Nothing under `app/`, `link/`,
`desktop/`, `assets/` or `art/` changed. `ProfileCodec`, the save file names, the store's durability steps and the
default sound (`AudioArm.FULL`) are unchanged.

When the runs finished, `dev.deathride.perf` was force-stopped. The owner's `dev.deathride.tv` was back in front: the
same task t330 and process 14337 as at the start, and the package was last updated 2026-10-06 23:44, before this
session.
