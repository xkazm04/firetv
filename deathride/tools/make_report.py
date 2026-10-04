"""Build this variant's offline report from its own evidence. No network or sibling dependency."""
from pathlib import Path
import base64, html, json, re, xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[2]
evidence=root/'evidence'
presentation=(root/'project/game/src/main/kotlin/dev/deathride/game/Presentation.kt').read_text()
slip='FOLLOW_CAMERA=true' in presentation
name='Slipstream' if slip else 'Apex'
accent='#ffab76' if slip else '#c6f55c'
app_id='dev.deathride.slipstream' if slip else 'dev.deathride.apex'
def read(path):
    data=Path(path).read_bytes()
    return data.decode('utf-16') if data.startswith(b'\xff\xfe') else data.decode('utf-8-sig',errors='replace')
def load(name): return json.loads(read(evidence/name))
def fmt(v): return f'{v:.3f}'.rstrip('0').rstrip('.')
def triple(d): return ' / '.join(fmt(d[k]) for k in ('p50','p95','max'))
def image(file): return 'data:image/png;base64,'+base64.b64encode((evidence/file).read_bytes()).decode()
probe=load('probe.json'); soak=load('soak-summary.json'); apk=load('apk-check.json'); browser=load('browser-check.json')
assert soak['completed'], 'Finish the real-time desktop soak before writing the verdict.'
assert apk['applicationId']==app_id and (root/'deathride.apk').exists()
core_tests=[]; link_tests=[]; systemout=''
for p in sorted(evidence.glob('TEST-*.xml')):
    tree=ET.fromstring(read(p)); assert int(tree.attrib.get('failures',0))==0 and int(tree.attrib.get('errors',0))==0
    tests=list(tree.findall('testcase'))
    (link_tests if 'LinkTest' in p.name else core_tests).extend(tests)
    systemout+='\n'+(tree.findtext('system-out') or '')
assert len(core_tests)==(14 if slip else 12) and len(link_tests)==3
race_match=re.search(r'race seconds min=([0-9.]+) max=([0-9.]+)',systemout)
race_band='–'.join(fmt(float(x)) for x in race_match.groups())
slip_match=re.search(r'Full-lock slip after 2 s: ([0-9.]+) degrees; coast after 1 s: ([0-9.]+)',systemout)
braking=re.search(r'Braking distance: 15 m/s -> ([0-9.]+) m; 25 m/s -> ([0-9.]+) m',systemout)
audit=soak['allocationAudit']; assert audit is not None
frames=soak['minute15']['frameTimeMs']['sinceStart']
window=probe['windows'][-1]['stats']
concept=("A close-camera racer built around catching a slide. Touch anywhere to anchor your steering thumb, tap the brake to loosen the rear, and countersteer to recover. The TV follows the action while a minimap keeps the rest of the circuit in view." if slip else "A whole-track racer you can read at a glance. Absolute thumb steering and planted lateral grip put the car where you point it. Scan in, hold GO, and race five rivals for three laps.")
bets=("Force-limited tire grip + yaw inertia", "Relative thumb drag", "Look-ahead camera + minimap") if slip else ("Direct yaw + planted lateral grip", "Absolute steering strip", "Fixed whole-track camera")
feel=("The brake unloads lateral grip; yaw has a 0.12 s response time and a restoring term. The countersteer test reduced a 21.85° slide to 9.60° in 0.2 simulated seconds. This is a physics result, not a comfort or perceived-latency claim." if slip else "A 4.5% thumb dead zone keeps the straight calm; input changes transmit immediately. High lateral grip makes small corrections settle quickly. Powered low-speed steering lets a head-on wall hit be driven out without reverse or teleport.")
notes=f'''# {name}

## The bets
{'; '.join(bets)}. Compared with {'Apex' if slip else 'Slipstream'}, this changes the handling model, steering ergonomics and camera policy, not just coefficients or colors. Both share the same authoritative input contract and always race six cars.

## How it feels
{feel} Top speed is capped at 30 m/s. There is no input prediction. An input older than 250 ms holds its last steering and drops throttle and brake. Releasing a touch explicitly recenters steering.

## Verified vs not measured
{len(core_tests)} core tests and three link tests pass. Twenty seeded six-car races finished three laps. The warmed simulation allocated zero bytes over 10,000 steps. Desktop GL, QR decoding, two browser controllers, simultaneous touch, reconnect identity, stale/order rejection, a 60-second approximately 30 Hz probe, and a 900-second 1080p desktop soak were checked. APK ABI/manifest/label inspection passed. Stick launch, optical latency, physical Android phones, Wi-Fi contention, remote hardware, thermal behavior and owner feel: **not measured**.

## Known limits
Consequential decision: retain the 60 Hz Kotlin simulation and latest-state TCP mailboxes; do not hide late input with prediction. Hardware tail latency still decides Gate G0. Plain-HTTP Chromium did not expose wake lock on the LAN test; fullscreen/orientation/vibration are optional. No offline PWA install is promised. Reservations survive reconnect until the lobby's Up/reset or process exit. Three-minute race ceiling; unfinished cars are marked. Two phone seats; no gamepad-axis mapping. Lifetime timing percentiles use declared bounded histograms; maxima remain exact. Verdict: **STOP at G0 pending Stick measurements and the owner's playtest**.
'''
assert len(notes.split())<400

slices=[
('S0','partial',f'Android APK + three ABIs built; desktop GL runs. Device install/launch not measured.'),
('S1','done',f'{len(core_tests)} JVM tests: deterministic replay, handling, checkpoint laps, walls, recovery; desktop keyboard pipeline checked.'),
('S2','partial','Two browser controllers and 60 s load probe pass; two physical Android phones not measured.'),
('S3','partial','Live /stats, clock-corrected consume age, log output and single-frame flash wired; Stick/optical numbers not measured.'),
('S4','done','Six cars, two-circle impulses, three skill tiers, bounded AI trace; 20/20 seeded races finish all cars.'),
('S5','partial','Model/control tuning and recovery tests complete; owner playtest and hardware-based tuning not measured.'),
('S6','done','Evidence and stop verdict written. Gate G0 remains closed; no Phase 1 content.')]

measured=[
('Simulation regression suite',f'{len(core_tests)} core + 3 link tests pass','JVM, behavioral assertions'),
('Three-lap six-car AI race',race_band+' s','20 seeds, 120 finishers; JVM sim'),
('Full-lock slip / 1 s coast speed',fmt(float(slip_match[1]))+'° / '+fmt(float(slip_match[2]))+' m/s','1 scripted trajectory each; JVM sim'),
('Brake distance from 15 / 25 m/s',fmt(float(braking[1]))+' / '+fmt(float(braking[2]))+' m','1 scripted stop each; JVM sim'),
('Transport RTT, idle',triple(probe['idleRttMs'])+' ms',f"n={probe['idleRttMs']['n']}; Windows loopback"),
('Transport RTT, steering load P1',triple(probe['loadRttMsSlot0'])+' ms',f"n={probe['loadRttMsSlot0']['n']}; {fmt(probe['actualHz'])} Hz; 60 s, loopback"),
('Transport RTT, steering load P2',triple(probe['loadRttMsSlot1'])+' ms',f"n={probe['loadRttMsSlot1']['n']}; 60 s, loopback"),
('Input age consumed, P1 / P2',triple(window['slots'][0]['inputAgeMs']['last10s'])+' / '+triple(window['slots'][1]['inputAgeMs']['last10s'])+' ms',f"Last 10 s; n={window['slots'][0]['inputAgeMs']['last10s']['count']} / {window['slots'][1]['inputAgeMs']['last10s']['count']}; corrected clocks; not optical"),
('Desktop frames, entire soak',triple(frames)+' ms',f"n={frames['count']}; 1920×1080, six AI cars; includes startup"),
('Desktop frames, minute 1 / 15',triple(soak['minute1']['frameTimeMs']['last10s'])+' / '+triple(soak['minute15']['frameTimeMs']['last10s'])+' ms',f"Exact 10 s windows; n={soak['minute1']['frameTimeMs']['last10s']['count']} / {soak['minute15']['frameTimeMs']['last10s']['count']}"),
('Simulation step, desktop soak',triple(soak['minute15']['simStepMs']['sinceStart'])+' ms',f"n={soak['minute15']['simStepMs']['sinceStart']['count']}; lifetime histogram"),
('JVM heap, minute 1 / 15',fmt(soak['minute1']['heapUsedMB'])+' / '+fmt(soak['minute15']['heapUsedMB'])+' MB','One sample each; desktop heap; excludes native/GL memory'),
('Warmed simulation allocation','0 bytes / 10,000 steps','Desktop thread allocation counter; unit-test gate'),
('Render allocation audit',f"{audit['zeroAllocationFrames']} / {audit['frames']} frames allocated 0 bytes",'Includes transitions and diagnostic captures; desktop only'),
('Real-time desktop soak',fmt(soak['durationSeconds'])+' s',f"{soak['raceStarts']} race starts; automated AI + rematches")]

not_measured=[
('Stick install, model, Fire OS, actual ABI/RAM','not measured'),
('Stick 1080p frame time, 2 cars: p50 / p95 / max / n','not measured'),
('Stick 1080p frame time, 6 cars: p50 / p95 / max / n','not measured'),
('Optical input-to-photon: p50 / p95 / max; 30 taps at 240 fps','not measured'),
('Real Wi-Fi idle/load RTT, loss/order and consumed input age','not measured'),
('Stick 15-minute thermal soak; minute 1 vs 15 frame tails','not measured'),
('Stick heap/PSS/CPU budget; actual output resolution','not measured'),
('Wi-Fi band, physical phone models, competing-stream run','not measured'),
('Physical-phone wake lock, fullscreen, vibration, orientation; iOS','not measured'),
('QR-to-driving time on Stick; comfort over 10 minutes','not measured'),
('Owner playtest: connected steering, slide recovery, comfort, rematch, lateness','not measured')]

command_rows=json.loads(read(evidence/'commands.json'))
verdict=f'''# Death Ride — {name}: S6 spike verdict

## Recommendation

**STOP at Gate G0.** Deliver this runnable candidate for the Stick trial; do not start Phase 1 until the owner's optical measurements and playtest clear the gate. This is an evidence boundary, not a measured hardware kill-criterion failure.

## Built and observed

{concept}

Standalone Android APK ({app_id}), Kotlin simulation, libGDX Android/LWJGL3 renderers, Ktor HTTP/WebSocket server, and plain-HTTP phone controller. Development device: Windows 11 desktop, NVIDIA GeForce RTX 4090, Java 17 (and a Java 22 build check where logged). Browser: Chromium 136 headless, 896×414 with touch emulation. Physical Fire TV, phone models and Wi-Fi band: not measured.

Tiers: T0 source exists; T1 APK/build/static validation; T2 real desktop server and controllers connected; T3 scripted behavior and JVM tests; T4 owner perception is not measured. Screenshots are desktop captures, not device evidence.

## Numbers

Timing triples below are p50 / p95 / max. Lifetime quantiles use declared bounded histograms; last-10-second values and maxima are exact. Full JSON and logs are in `../../../evidence/` relative to this document.

| Metric | Value | Sample / method / device |
|---|---|---|
'''
for title,value,method in measured: verdict+=f'| {title} | {value} | {method} (T3) |\n'
verdict+='\nThe probe observed zero sequence gaps/out-of-order inputs during its steady load and zero outstanding acknowledgements at its end. Its later failure injections intentionally caused one stale rejection and one out-of-order rejection; these are included in the final diagnostic counters. The simulation soak has no human controllers. Actual thermal behavior is not established.\n\n'
verdict+='| Hardware / perception metric | Value |\n|---|---|\n'
for title,value in not_measured: verdict+=f'| {title} | {value} |\n'
verdict+='''
## Owner playtest

What the owner did: not measured.

What the owner saw: not measured.

What the owner felt: not measured.

1. Does steering feel connected? not measured.
2. Can I recover from a slide? not measured by an owner (scripted dynamics are tested).
3. Is the phone comfortable for ten minutes? not measured.
4. Would I race again? not measured.
5. Does anything feel late? not measured.

## Risks

Shrank: build/native packaging, deterministic contact/lap behavior, six-car completion, bounded render/simulation storage, pairing, reconnect identity, simultaneous thumb controls and stale-frame handling all have local evidence.

Grew or remain open: Fire OS GL/lifecycle differences; ARM frame-time maxima and GC; TCP head-of-line tails on real Wi-Fi; phone wake lock unavailable on insecure origins; physical ergonomics and perceived steering; camera comfort and readability on a real couch. The desktop GPU is substantially stronger than a Stick and the RTT tests did not cross a Wi-Fi radio.

No prediction was added to conceal lag. The TV keeps the newest complete input, rejects old sequences and old corrected timestamps, holds steering and drops propulsion/braking after 250 ms. The source retains a fixed 60 Hz simulation; the 30 Hz time-basis test only covers isolated handling.

## Hardware gate procedure

Install the APK through the owner's Wi-Fi package-install workflow. Record the Stick model, Fire OS version, active ABI, phone models and Wi-Fi band. Scan into a two-phone race and collect `/stats` for idle/load, including a competing-stream run. Film both screens at 240 fps for at least 30 FLASH TEST taps. Report optical p50/p95/max. Run continuous six-car racing for 15 minutes and record minute-1/minute-15 tails and heap. Let the owner answer the five questions above.

Proposed rubric: optical p50 ≤120 ms and p95 ≤180 ms; six-car frame p95 ≤16.7 ms, max ≤33 ms. No growing 60-second latency tail. If optical p95 remains >250 ms after the feel pass, or six cars cannot hold 30 fps, stop and let the owner choose a change. None of these hardware thresholds is certified by this delivery.
'''

def rows(items): return ''.join('<tr>'+''.join('<td>'+html.escape(str(c))+'</td>' for c in row)+'</tr>' for row in items)
slice_html=''.join(f'<tr><td class="slice">{a}</td><td><span class="badge {b}">{b}</span></td><td>{html.escape(c)}</td></tr>' for a,b,c in slices)
commands_html=''.join('<tr><td><code>'+html.escape(x['command'])+'</code></td><td>'+html.escape(x['result'])+'</td><td>'+(' · '.join('<a href="evidence/'+html.escape(file)+'">'+html.escape(file)+'</a>' for file in x.get('files',[])))+'</td></tr>' for x in command_rows)
evidence_intro=f'{len(core_tests)} simulation tests · 3 transport tests · 20 seeded races · two browser controllers · 15-minute desktop soak.'
limits='Plain-HTTP wake lock is unavailable in the LAN Chromium test. Keep the phone display awake through its system setting if needed. Reservations persist until Up/reset or process exit. Two phone seats; a 180-second race ceiling marks unfinished cars. No gamepad-axis mapping or offline installation guarantee. Clock-corrected age is an estimate; histogram resolution/caps are explicit in /stats.'
drive='Touch anywhere on the left pad, then drag relative to that anchor. Tap BRAKE into a bend and countersteer.' if slip else 'The left strip maps directly to steering: center is neutral, left and right are full lock. Lift to recenter.'
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride / @@NAME@@</title>
<style>
:root{--bg:#0c151d;--panel:#14232d;--line:#2c3c47;--ink:#eff4ef;--muted:#a5b7c0;--accent:@@ACCENT@@}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}a{color:var(--accent);text-underline-offset:4px}header,main,footer{max-width:1160px;margin:auto;padding:0 34px}header{display:flex;align-items:center;justify-content:space-between;padding-top:32px;padding-bottom:28px;border-bottom:1px solid var(--line)}.wordmark{font-size:13px;font-weight:800;letter-spacing:.16em}nav{display:flex;gap:23px;font-size:12px}nav a{text-decoration:none;color:var(--muted)}.eyebrow{font:11px/1.4 ui-monospace,monospace;letter-spacing:.17em;text-transform:uppercase;color:var(--accent)}.hero{display:grid;grid-template-columns:1.15fr 1fr;gap:50px;padding:66px 0 44px;align-items:end}h1{font-size:clamp(58px,8.7vw,112px);line-height:.95;letter-spacing:-.075em;text-transform:uppercase;margin:18px 0 25px;font-weight:800}.concept{font-size:19px;color:#ccdadf;max-width:620px}.brief{border-left:2px solid var(--accent);padding-left:25px}.brief div{border-bottom:1px solid var(--line);padding:13px 0;font-size:15px}.brief span{color:var(--muted);font:11px ui-monospace,monospace;margin-right:18px}.actions{display:flex;gap:12px;align-items:center;margin-top:30px;flex-wrap:wrap}.button{display:inline-block;background:var(--accent);color:var(--bg);padding:12px 20px;border-radius:4px;font-weight:750;font-size:13px;text-decoration:none}.secondary{font-size:13px;color:var(--ink)}.status{padding:15px 20px;border:1px solid var(--line);border-left:3px solid #efb881;border-radius:3px;color:#c8d5db;font-size:13px;margin-bottom:28px}.status strong{color:#efb881}.screen{margin:0;background:#071018;border:1px solid var(--line);border-radius:8px;overflow:hidden}.screen img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain}.screen figcaption{display:flex;justify-content:space-between;font:11px ui-monospace,monospace;padding:13px 18px;color:var(--muted);border-top:1px solid var(--line)}.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.tabs button{background:transparent;border:1px solid var(--line);color:var(--muted);padding:7px 16px;font:12px system-ui;border-radius:4px;cursor:pointer}.tabs button.on{color:var(--accent);border-color:var(--accent)}section{padding:48px 0 8px}h2{font-size:28px;letter-spacing:-.045em;margin:0 0 20px}h3{font-size:17px;margin:10px 0}p{margin:0 0 18px}.grid>*,.hero>*{min-width:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:34px}.card{border-top:1px solid var(--line);padding-top:21px}.card p{font-size:14px;color:var(--muted)}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);margin:30px 0}.facts div{background:var(--bg);padding:20px 16px}.facts b{font-size:38px;letter-spacing:-.05em;font-weight:600}.facts span{display:block;font:10px ui-monospace,monospace;color:var(--muted);letter-spacing:.14em}.table-scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px;text-align:left}td,th{padding:13px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.slice{font:14px ui-monospace,monospace}.badge{font:10px ui-monospace,monospace;display:inline-block;padding:3px 8px;white-space:nowrap;border-radius:3px;background:#22333a;color:var(--accent)}.badge.partial{color:#efb881;background:#302a25}details{border:1px solid var(--line);padding:18px 20px;border-radius:5px;margin:14px 0}summary{cursor:pointer;font-weight:600;font-size:14px}details[open] summary{margin-bottom:20px}pre{overflow:auto;background:#081018;border:1px solid var(--line);padding:16px;color:#d2e4d1;font-size:12px;line-height:1.8;border-radius:4px}code{font:12px ui-monospace,monospace;overflow-wrap:anywhere}.small{font-size:12px;color:var(--muted)}.verdict{margin-top:46px;border:1px solid var(--line);padding:30px;background:var(--panel);border-left:4px solid var(--accent);border-radius:5px}.verdict h2{margin:10px 0 15px}.verdict p{color:#c4d2d8;font-size:14px}.verdict a{font-size:13px}footer{padding-top:35px;padding-bottom:45px;display:flex;justify-content:space-between;color:var(--muted);font-size:11px}ol{padding-left:22px}li{padding-bottom:11px;font-size:14px;color:#c8d5db}@media(max-width:760px){header,main,footer{padding-left:20px;padding-right:20px}.hero{grid-template-columns:1fr;gap:15px;padding-top:42px}.grid{grid-template-columns:1fr;gap:12px}nav{gap:12px}.facts b{font-size:31px}.brief{display:none}h1{font-size:clamp(48px,12vw,84px)}td,th{padding:10px 7px}.screen figcaption{font-size:9px}.screen figcaption span:last-child{display:none}}@media print{body{background:white;color:black}details{display:block}.tabs,nav,.actions{display:none}a{color:black}.screen{break-inside:avoid}}
</style></head><body><header><div class="wordmark">DEATH RIDE</div><nav><a href="#drive">PLAY</a><a href="#proof">EVIDENCE</a><a href="#verdict">VERDICT</a></nav></header><main>
<div class="hero"><div><div class="eyebrow">Phase 0 / driving study / 30 Sep 2026</div><h1>@@NAME@@</h1><p class="concept">@@CONCEPT@@</p><div class="actions"><a class="button" href="deathride.apk" download>DOWNLOAD DEBUG APK ↗</a><a class="secondary" href="project/README.md">Build & technical guide</a></div></div><div class="brief">@@BETS@@</div></div>
<div class="status"><strong>Desktop verified. Hardware gate pending.</strong> Stick launch, optical input-to-photon and owner feel are <b>not measured</b>.</div>
<div class="tabs"><button class="on" data-shot="race">THE RACE</button><button data-shot="lobby">PAIRING</button><button data-shot="controller">YOUR PHONE</button><button data-shot="results">THE FINISH</button></div>
<figure class="screen"><img id="shot" src="@@RACEIMG@@" alt="Desktop game capture"><figcaption><span id="caption">ACTUAL DESKTOP CAPTURE / NOT A STICK SCREENSHOT</span><span>PLACEHOLDER SHAPES ONLY</span></figcaption></figure>
<div class="facts"><div><b>06</b><span>CARS ON TRACK</span></div><div><b>02</b><span>PHONE SEATS</span></div><div><b>03</b><span>LAPS TO FINISH</span></div><div><b>60</b><span>SIM STEPS / SECOND</span></div></div>
<section id="drive"><div class="eyebrow">01 / Put it on the couch</div><h2>Scan. Hold GO. Find the corner.</h2><div class="grid"><div><ol><li>Install <b>deathride.apk</b> through your existing Wi-Fi APK transfer/package-installer workflow. Launch it from Apps.</li><li>Connect phone and TV to the same LAN. Scan the lobby QR, or open its address and type the PIN. Rotate the phone to landscape.</li><li>@@DRIVE@@ Hold GO with your right thumb. Select on the Fire remote starts the race; the phone can also start it.</li><li>Back returns to the lobby. Select rematches from results. Up in the lobby clears pairing; a reconnecting browser keeps its car.</li></ol></div><div class="card"><h3>Build either variant alone.</h3><pre>gradlew.bat :app:assembleDebug -PappId=@@APPID@@ -PappLabel="Death Ride @@NAME@@"
gradlew.bat :core:test
gradlew.bat :desktop:run</pre><p>These properties are optional; defaults are <code>dev.deathride.tv</code> / <code>Death Ride</code>. Output: <code>app/build/outputs/apk/debug/app-debug.apk</code>. In PowerShell, quote each entire <code>-P...</code> argument. APK size: @@SIZE@@ MB.</p><p>Desktop: W takes car 1, WASD drives, Enter starts/rematches, Escape returns/exits. Java 17+, SDK platform 36, and <code>ANDROID_HOME</code> are required.</p></div></div></section>
<section id="proof"><div class="eyebrow">02 / What exists, what passed</div><h2>A runnable spike. An open hardware question.</h2><p class="small">@@EVIDENCEINTRO@@</p><div class="table-scroll"><table><thead><tr><th>Slice</th><th>Status</th><th>Evidence / remaining gate</th></tr></thead><tbody>@@SLICES@@</tbody></table></div>
<details><summary>Measured locally — every timing triple is p50 / p95 / max</summary><p class="small">Windows desktop / NVIDIA RTX 4090; JVM tests and headless Chromium. These are not Stick or physical-phone figures. Full maxima include startup stalls.</p><div class="table-scroll"><table><thead><tr><th>Metric</th><th>Value</th><th>Method / sample</th></tr></thead><tbody>@@MEASURED@@</tbody></table></div><p class="small">Raw evidence: <a href="evidence/probe.json">two-client probe</a> · <a href="evidence/soak-summary.json">desktop soak</a> · <a href="evidence/browser-check.json">touch browser</a> · <a href="evidence/apk-check.json">APK inspection</a>. Zero acknowledgements outstanding after the load; the later stale/order injections deliberately add two rejected frames.</p></details>
<details><summary>Not measured — the remaining device and playtest numbers</summary><table><tbody>@@UNMEASURED@@</tbody></table><p class="small">Owner did / saw / felt: not measured. All five playtest answers remain not measured. Proposed targets are a rubric, not results: optical p50 ≤120 ms / p95 ≤180 ms; six-car frames p95 ≤16.7 ms / max ≤33 ms.</p></details>
<details><summary>Verification command ledger, including failed attempts</summary><p class="small">Commands ran from this variant's project unless a path is explicit. Java 17 was selected for normal runs; the separately marked Java 22 check used PATH. Supporting file reads/edits are recorded at the end. No device bridge or emulator was run.</p><div class="table-scroll"><table><thead><tr><th>Command</th><th>Observed result</th><th>Log</th></tr></thead><tbody>@@COMMANDS@@</tbody></table></div></details>
</section>
<section><div class="grid"><div class="card"><h3>Measure the part that matters.</h3><p>Open <code>http://&lt;tv-ip&gt;:8765/stats</code> for 10-second and lifetime frame/sim timing, per-slot consume age, stale/drop/order counters, connections and JVM heap. The same serializer logs under <code>DeathRide</code> every ten seconds.</p><p>Tap <b>FLASH TEST</b> at the bottom of the phone. The phone turns white and the TV renders one white frame. Film both at 240 fps for at least 30 taps; count frames between flashes. RTT is not input-to-photon.</p></div><div class="card"><h3>Known limits.</h3><p>@@LIMITS@@</p><p>@@FEEL@@</p></div></div></section>
<div class="verdict" id="verdict"><div class="eyebrow">03 / S6 recommendation</div><h2>Stop at G0. Test the Stick next.</h2><p>Build, native packaging, deterministic races, collision recovery, pairing and stale-input handling have local evidence. Fire OS/ARM frame tails, real Wi-Fi head-of-line delay, thermal stability and perceived feel remain open. Plain-HTTP wake lock is a confirmed browser constraint.</p><p>Keep Phase 1 closed until optical latency and the owner's three-lap playtest clear the gate. No hardware kill criterion was measured here.</p><a href="project/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md">Complete S6 record ↗</a> &nbsp; <a href="NOTES.md">Design notes ↗</a></div>
</main><footer><span>DEATH RIDE / @@NAME@@ / PHASE 0</span><span>Original placeholders. No combat, art programme or audio.</span></footer>
<script>const shots=@@SHOTS@@;document.querySelectorAll('[data-shot]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('.tabs .on').classList.remove('on');b.classList.add('on');document.getElementById('shot').src=shots[b.dataset.shot];document.getElementById('caption').textContent=b.dataset.shot==='controller'?'CHROMIUM TOUCH VIEW / NOT A PHYSICAL PHONE':'ACTUAL DESKTOP CAPTURE / NOT A STICK SCREENSHOT'}));</script></body></html>'''
replacements={
'NAME':name,'ACCENT':accent,'APPID':app_id,'CONCEPT':html.escape(concept),'DRIVE':html.escape(drive),
'BETS':''.join(f'<div><span>0{i+1}</span>{html.escape(bet)}</div>' for i,bet in enumerate(bets)),
'RACEIMG':image('race.png'),'SIZE':fmt(apk['apkBytes']/1048576),'EVIDENCEINTRO':evidence_intro,
'SLICES':slice_html,'MEASURED':rows(measured),'UNMEASURED':rows(not_measured),'COMMANDS':commands_html,
'LIMITS':html.escape(limits),'FEEL':html.escape(feel),
'SHOTS':json.dumps({k:image(k+'.png') for k in ('race','lobby','controller','results')})}
for key,value in replacements.items(): page=page.replace('@@'+key+'@@',value)
assert '@@' not in page
(root/'project/docs/concepts/DEATH-RIDE-SPIKE-VERDICT.md').write_text(verdict,encoding='utf-8')
(root/'index.html').write_text(page,encoding='utf-8')
(root/'NOTES.md').write_text(notes,encoding='utf-8')
print(f'{name}: offline report, S6 verdict and {len(notes.split())}-word notes written from evidence.')
