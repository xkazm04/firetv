"""Build the offline Z4 review from committed content and frozen Z1/Z3 evidence."""
from pathlib import Path
import csv
import gzip
import hashlib
import html
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'ai/design'
DATA = ROOT / 'core/src/main/resources/data'
REPORT = ROOT / 'evidence/ai/z3/report.json'
r = json.loads(REPORT.read_text(encoding='utf-8'))
pacing = r['pacing']
before, after = (r['versions'][v] for v in ('before', 'after'))
sources = [REPORT]

def read(name):
    path = DATA / (name + '.csv')
    sources.append(path)
    return list(csv.DictReader(path.open(encoding='utf-8-sig')))

def esc(value):
    return html.escape(str(value), quote=True)

def num(value, digits=1):
    return '—' if value is None else f'{float(value):,.{digits}f}'

def pct(value):
    return num(100 * value, 2) + '%'

def rate(wins, n):
    return f'{wins:,}/{n:,} ({pct(wins/n)})'

def table(id, caption, headers, rows):
    return (f'<div class="table-wrap" tabindex="0" role="region" aria-label="{esc(caption)}"><table id="{id}"><caption>{esc(caption)}</caption><thead><tr>'
            + ''.join(f'<th scope="col">{esc(h)}</th>' for h in headers) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{esc(c)}</td>' for c in row) + '</tr>' for row in rows)
            + '</tbody></table></div>')

decisions = []
def decision(id, label, evidence, explanation):
    decisions.append(dict(id=id, label=label, evidence=evidence))
    return (f'<article class="card" data-direction="{esc(id)}" data-label="{esc(label)}" data-samples="{esc(evidence)}">'
            f'<h3>{esc(label)}</h3><p>{esc(explanation)}</p></article>')

def reviews(cards, label='Record owner choices'):
    return f'<details class="review-section"><summary>{esc(label)}</summary><div class="cards">{cards}</div></details>'

def source(name):
    return f'<a href="../../core/src/main/resources/data/{name}.csv">{name}.csv</a>'

def section(id, title, body):
    return f'<section id="{id}" class="review-section"><h2>{title}</h2>{body}</section>'

temperaments, personas, plans, phases, weaknesses, bosses = (read(n) for n in
    ('ai-temperaments', 'ai-personas', 'ai-plans', 'ai-phases', 'ai-weaknesses', 'ai-bosses'))
rivals = {x['id']: x for x in read('rivals')}
abilities = {x['car']: x for x in read('abilities')}
events = read('campaign')
cars = read('cars')
tiers = {x['id']: int(x['rank']) for x in read('roster-tiers')}
redesigns = read('course-redesigns')
courses = read('course-pacing')
controls = {x['key']: x['value'] for x in read('ai-control-rules')}
read('event-pacing')
read('combat')
traits = {
    'Needle': 'Race first; avoid deliberate contact; dart into a clear straight.',
    'Line': 'Race first; carry straight-line speed with Flywheel.',
    'Bastion': 'Close bruiser; align a forward Shoulder charge.',
    'Comet': 'Straight-line overtaker; wait for a clear, settled Turbine run.',
    'Trail': 'Race first; use Ground Bite in loose-surface corners.',
    'Flint': 'Brawler with ranged Punch Lance; consider ability every second decision.',
    'Quill': 'Contact fighter; align Bone Rack with a car in front or behind.',
    'Vandal': 'Block and brawl; drop Scrambler when a rear target is present.',
    'Kestrel': 'Ranged hunter; prefer leaders and align a forward Arc Harpoon.',
    'Bulwark': 'Heavy bruiser; use Plate Brace near a rear threat or while damaged.',
    'rig': 'Mine layer; automatic speed-gated dispatcher, with no unseen target knowledge.'
}
ability_rules = {
    'DASH': 'Clear straight, settled, minimum speed', 'SURGE': 'Clear straight, settled, minimum speed',
    'CHARGE': 'Target ahead, straight, settled, minimum speed', 'TURBINE': 'Clear straight, settled, minimum speed',
    'GRIP': 'Loose surface, corner, minimum speed', 'LANCE': 'Target ahead on straight',
    'SPIKES': 'Target ahead or behind, minimum speed', 'PATCH': 'Target behind, minimum speed',
    'HARPOON': 'Target ahead on straight', 'GUARD': 'Nearby target; rear threat or own damage',
    'DISPATCHER': 'Automatic at minimum speed; no target required'
}
body = []
body.append('''<header><p class="eyebrow">DEATH RIDE / Z4 / OWNER REVIEW / 04 OCT 2026</p>
<h1>Opponents with intent.<br>Races with room to unfold.</h1>
<p class="lede">Review the opponent temperaments, bounded leader hunts and shorter lap schedule. The implementation passes correctness checks; the balance evidence still has material gaps.</p>
<div class="callout"><strong>The owner rule stays:</strong> promotion requires surviving and winning the boss race in first place. Marrow’s finale remains last car running. There is no visible hunt cue.</div>
<nav aria-label="Report sections"><a href="#findings">Findings</a><a href="#temperaments">Cars</a><a href="#personas">Rivals</a><a href="#strategy">Race plans</a><a href="#weakness">Boss tactics</a><a href="#pacing">35 events</a><a href="#courses">Courses</a><a href="#simulation">Simulation</a><a href="#stick">Stick</a><a href="#export-section">Export choices</a></nav>
<div class="report-toolbar"><label for="theme">Appearance <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><a href="#export-section">Copy Markdown</a></div>
<p id="status" class="status" role="status" aria-live="polite"></p>
<p class="small">Static and offline. Choices start unselected, stay in this browser, and do not apply changes to the game. Expand the owner-choice panels to record Keep, Maybe or Reject and a note. Export before moving this folder or changing browsers.</p></header>''')

body.append(section('findings', 'Read these findings first', '''
<div class="numbers"><div class="number"><strong>367 → 192</strong><span>ordinary laps</span></div><div class="number"><strong>340.4 → 267.4 s</strong><span>successful lead-exit median</span></div><div class="number"><strong>0 / 667</strong><span>after Rookie completions, each buyer</span></div></div>
<ul class="findings"><li><strong>Rookie careers remain unresolved:</strong> all 667 Rookie proxies per buyer reach the 70-attempt censor against fixed Club opposition. Matching Rookie difficulty has achievable boss wins, but a full Rookie-difficulty career is not proven.</li>
<li><strong>Live timeouts rise from 1 to 735 of 11,520 entries:</strong> 732 are under-tier diagnostics and three are current-tier Rookie entries. The lap-scaled watchdog was not extended.</li>
<li><strong>Shorter races do not establish a shorter campaign:</strong> successful Club/Pro median driving time is 3.775–4.465 hours. Retries and a different completing population matter; menus and pit time are excluded.</li>
<li><strong>The last ordinary boss entry-power gate still misses:</strong> 1.031818 versus a 1.03 ceiling for both after buyer policies.</li>
<li><strong>Marrow is harder:</strong> rig wins fall from 766/3,072 (24.93%) to 488/3,072 (15.89%); 274 after draws remain. This is not a 50/50 balance claim.</li>
<li><strong>Pressure is bounded, not uniformly tight:</strong> hunters supply 16.54% of leader damage; median/p90 leader-rank changes are 1/4. The maximum 129 includes close rank oscillations.</li></ul>
<p>Opening stock/current-tier Club medians meet 120–180 s; ordinary bosses meet 240–360 s. Foundry’s opening p90 is 237.90 s. Faster builds, weak builds and human driving can fall outside those ranges.</p>'''))

rows = []
for t in temperaments:
    a = abilities['MechanicRig' if t['id']=='rig' else t['id']]
    rows.append([t['id'], traits[t['id']], t['contact'], t['block'], t['rangeCarLengths'], t['laneRisk'],
                 f"{t['leaderWeight']} / {t['nearWeight']} / {t['damageWeight']}",
                 f"{a['name']}: {ability_rules[a['kind']]}; every {t['abilityEvery']} decision(s)", t['driftUse']])
body.append(section('temperaments', '01 / Each car starts with a temperament',
    '<p>Contact and block are willingness dials, not hit probabilities. Range is in the acting car’s lengths; lane risk controls road margin, never grip. Target weights are leader / nearby / damaged. All current drift-use dials are zero. Ability tells, energy, cooldown and recovery still apply.</p>'
    + table('temperament-table', 'All 11 chassis defaults', ['Car','Intent','Contact','Block','Range (lengths)','Lane risk','Target weights','Ability rule / cadence','Drift use'], rows)
    + f'<p class="small">Sources: {source("ai-temperaments")}, {source("abilities")}.</p>'
    + reviews(''.join(decision('car-'+t['id'], t['id']+' temperament', 'ai-temperaments.csv / '+t['id'], traits[t['id']]) for t in temperaments), 'Review 11 car temperaments')))

rows = []
for p in personas:
    v = rivals[p['id']]
    rows.append([v['name'],v['car'],v['style'],p['contact'],p['block'],p['rangeCarLengths'],p['laneRisk'],
                 f"{p['leaderWeight']} / {p['nearWeight']} / {p['damageWeight']}",p['cornerMarginMps'],p['cornerBlock']])
body.append(section('personas', '02 / Named rivals add their own habits',
    '<p>These are additive offsets on the car they actually drive. Contact/block clamp to 0–1; lane risk clamps to 0.3–0.7. Corner margin changes requested corner speed; a negative offset brakes later. The existing rival lane, passing, weapon-range and mine settings also remain in force.</p>'
    + table('persona-table','All six named-rival offsets', ['Rival','Authored car','Style','Δ contact','Δ block','Δ range','Δ lane risk','Δ target weights','Corner margin (m/s)','Corner block'],rows)
    + table('rival-style-table','Existing rival style factors (separate authorities)', ['Rival','Lane bias (m)','Pass distance ×','Fire range ×','Heavy range ×','Mines'],
            [[x['name'],x['laneBiasM'],x['passDistanceScale'],x['fireRangeScale'],x['heavyRangeScale'],x['mines']] for x in rivals.values()])
    + f'<p class="small">Sources: {source("ai-personas")}, {source("rivals")}.</p>'
    + reviews(''.join(decision('rival-'+p['id'],rivals[p['id']]['name']+' persona','ai-personas.csv / '+p['id'],rivals[p['id']]['style']) for p in personas),'Review six rival personas')))

phase_labels = ['0–18% of own race progress','18–65%, unless on final lap','65% onward, unless on final lap','Actual final lap overrides fraction; CSV 1.0 is the sentinel']
body.append(section('strategy', '03 / Race plans and hunter rules',
    '<p>Driving still uses three modes: DRIVE, OVERTAKE and RECOVER. A strategy layer chooses intent; ordinary steering, throttle, brakes and combat execute it. Roles and position change engagement. Elimination uses all-in throughout, with start protection still enforced.</p>'
    + table('phase-table','The four race phases', ['Phase','When','Field pressure','Rival pressure','Boss pressure','Leader multiplier'],
            [[x['id'],phase_labels[i],x['fieldPressure'],x['rivalPressure'],x['bossPressure'],x['leaderPressure']] for i,x in enumerate(phases)])
    + table('plan-table','Decision skill plans (not chassis tiers)', ['Skill','Hunter budget','Perception (lengths)','Commit (s)','Lease (s)','Hit recovery (s)','Switch margin'],
            [[x[k] for k in ['id','hunters','perceptionCarLengths','commitSeconds','leaseSeconds','hitRecoverySeconds','switchMargin']] for x in plans])
    + '''<ul><li>Seed-rotated hunter eligibility: Rookie 0, Club 1, Pro 2, Champion 3. The budget is not a promise that every eligible car attacks.</li>
<li>Hunts may target either current leader, human or AI, and may wreck them. Public rank supplies no hidden location or health. A target must be locally visible, within seven car lengths and unobstructed.</li>
<li>Four-second start protection remains. Two intentional attackers maximum per target, shared by hunters, normal attacks, contact, guns and offensive abilities.</li>
<li>Commitment and a score-switch margin prevent rapid target flipping. Death, finish, recovery, loss of visibility or leaving the leader duo can release a hunt immediately. Leases expire in simulation time; hits release the claim and trigger recovery.</li>
<li>Already fired shots, armed mines and committed abilities resolve normally. The two-slot cap does not erase those effects or accidental collisions.</li>
<li>No hunt marker, warning or new controller input. Difficulty changes decisions, never engine power or grip. Deterministic 60 Hz stepping and one HP authority remain.</li></ul>
<p>In Marrow’s elimination fight only, hit recovery is scaled to 10% (0.12–0.14 s); the authored visible-target passing gap is preserved. Ordinary races retain the table above.</p>'''
    + f'<p class="small">Sources: {source("ai-phases")}, {source("ai-plans")}, {source("ai-control-rules")}, {source("combat")}.</p>'
    + reviews(decision('race-phases','Four-phase race plan','ai-phases.csv','Settle, pressure, all-in, then actual final-lap commitment.')
              + decision('hunter-rules','Bounded, symmetric leader hunt','ai-plans.csv / Z3 pressure','Keep the per-skill hunter budgets, local perception, two shared claims, commitment and recovery. No visible cue.'))))

tactics = {
    'armor':'Bias close contact and Hammer range against weak armour or visible hull damage.',
    'handling':'Block near the target in corners; reduce requested speed when blocking.',
    'grip':'Bias deliberate contact in corners to exploit poor traction.',
    'acceleration':'Block or brake-check a nearby following target; request 82% speed.',
    'speed':'Strengthen straight-line lane pressure on a target ahead.',
    'slots':'Align ranged pressure; adjust heavy-weapon range preference.',
    'mass':'Bias ramming and rear mine opportunities against a fragile light car.'
}
body.append(section('weakness','04 / Bosses exploit visible weaknesses',
    '<p>Effective installed stats are compared with the player car’s tier peers and class-identity weakness. Current damage is sampled only while the player is visible. The strongest weighted weakness selects a tactic; it does not bypass range, weapon availability, attack slots or recovery.</p>'
    + table('weakness-table','Seven data-driven weakness tactics',['Weak stat','Tactic','Action','Deficit weight','Damage weight','Identity weight'],
            [[x['stat'],x['tactic'],tactics[x['stat']],x['deficitWeight'],x['damageWeight'],x['identityWeight']] for x in weaknesses])
    + table('boss-health-table','Extended boss maximum HP',['Boss','Maximum HP ×'],[[rivals[x['id']]['name'],x['healthMultiplier']] for x in bosses])
    + '<p>Boss multipliers are independent of difficulty. They increase the existing maximum HP, with no hidden damage reduction or second pool; settlement normalizes condition. Reset does not compound health. Relay has no boss-health row because Relay is not a boss entrant.</p>'
    + f'<p class="small">Sources: {source("ai-weaknesses")}, {source("ai-bosses")}.</p>'
    + reviews(decision('boss-tactics','Visible weakness tactics','ai-weaknesses.csv','Exploit the player’s relative weak stat and visible damage using existing actions.')
              + decision('boss-health','Extended boss health','ai-bosses.csv / final duel','Ordinary bosses have 1.15–1.20× HP; Marrow has 1.05×. The first-place promotion rule remains binding.'))))

rows, detail_rows = [], []
for i,(event,p) in enumerate(zip(events,pacing['events'])):
    assert event['id']==p['event']
    if event['type']=='ELIMINATION':
        bd,ad = before['duel'],after['duel']
        rows.append([f"{i+1:02d} / {event['id']}",event['name'],event['course'],'0 → 0','Elimination; own duration','Not lap-derived',num(bd['seconds']['median']),num(ad['seconds']['median']),num(ad['seconds']['p90']),f"{ad['n']} fights; {ad['draws']} draws",'Median 268.3 s; no lap envelope gate'])
        continue
    b,a = before['physical']['events'][i],after['physical']['events'][i]
    bs,cs = b['bands']['0'],a['bands']['0']
    envelope = a['envelope']
    check = 'Interpolated target; no separate endpoint gate'
    if envelope:
        check = 'Median inside envelope' if envelope[0]<=cs['finishSeconds']['median']<=envelope[1] else 'MEDIAN MISSES'
        if cs['finishSeconds']['p90']>envelope[1]:check += '; p90 above'
    rows.append([f"{i+1:02d} / {event['id']}",event['name'],f"{p['oldCourse']} → {p['course']}" if p['oldCourse']!=p['course'] else p['course'],
                 f"{p['oldLaps']} → {p['laps']}",f"{num(p['targetSeconds'],0)} s"+(f" / {envelope[0]}–{envelope[1]} s" if envelope else ''),
                 f"{num(p['oldEstimatedSeconds'])} → {num(p['estimatedSeconds'])}",num(bs['finishSeconds']['median']),num(cs['finishSeconds']['median']),num(cs['finishSeconds']['p90']),
                 f"{cs['finished']}/{cs['n']} finished; {cs['timeouts']} timeout",check])
    for band in ('0','4','17'):
        x,y=b['bands'][band],a['bands'][band]
        detail_rows.append([f"{i+1:02d} / {event['id']}",band,num(x['finishSeconds']['median']),num(y['finishSeconds']['median']),num(y['finishSeconds']['p90']),f"{y['finished']}/{y['n']}",y['timeouts'],y['n']-y['finished']-y['timeouts']])
body.append(section('pacing','05 / All 35 events, measured against the time targets',
    '<p>Every division opens at a 150 s authoring target (allowed 120–180 s). Ordinary level finals target 300 s (240–360 s); intermediate targets interpolate. Laps are nearest target / reference lap, clamped to 2–6. The schedule has 192 ordinary laps versus 367. The owner’s roughly-half direction is met in aggregate; many events still use six laps.</p>'
    '<p><strong>Reading the table:</strong> solo estimates exclude launch, traffic and combat. Measured ordinary medians and p90 use Club lead decisions, both stock current-tier peers and fixed Club opposition: eight entries per ordinary event, forty per boss. “Finished” includes non-winners. The last row is the separate 3,072-fight elimination study, including draws.</p>'
    + table('event-table','All 35 event IDs; seconds unless stated',['Event','Name','Course','Laps before → after','Target / endpoint envelope','Solo estimate before → after','Before median','After median','After p90','After outcome denominator','Endpoint finding'],rows)
    + '<details><summary>All ordinary events by upgrade band (0, 4, 17 installed upgrades)</summary>'
    + table('event-band-table','Current-tier Club lead: successful finish durations and unresolved outcomes',['Event','Band','Before median (s)','After median (s)','After p90 (s)','After finished / n','Timeouts','Other non-finishes'],detail_rows)+'</details>'
    + '<p>The complete library also includes older, legally unlocked under-tier cars and all three lead skills. Its 735 live timeouts are not removed from the results: see the outcome table below. These reference medians do not certify human pacing.</p>'
    + reviews(''.join(decision('pacing-'+cup,cup.title()+' division pacing','campaign.csv / events '+str(j*7+1)+'–'+str(j*7+7),
                        'Review the first-visit and final duration, lap count and full-field tail together. '+('The finale is elimination, not laps.' if cup=='crown' else 'Ordinary final target: 240–360 seconds.'))
                       for j,cup in enumerate(dict.fromkeys(x['cup'] for x in events))))))

rows=[]
for x in redesigns:
    c=next(c for c in courses if c['course']==x['course'])
    laps_by_tier = ' / '.join(num(next(c for c in courses if c['course']==x['course'] and int(c['tier'])==tier)['referenceLapSeconds']) for tier in range(5))
    rows.append([x['course'],x['kind'],num(x['lengthM']),c['nodes'],c['turnChanges'],c['surfaceChanges'],c['features'],c['obstacles'],laps_by_tier])
body.append(section('courses','06 / Longer roads, four new finals',
    '<p>Seventeen original roads were lengthened; four dedicated double-bend finals add distance, corners and loose-surface transitions with sparse existing obstacles. All 25 original courses remain in the campaign, with 29 measured courses total. Road/car scale, approved art, themes and props remain. No art was generated.</p>'
    + table('course-table','All 21 lengthened or new courses',['Course','Change','Length (m)','Nodes','Turn changes','Surface changes','Features','Obstacles','Reference lap s: tiers 0 / 1 / 2 / 3 / 4'],rows)
    + '<p>Final survey: 2,320/2,320 measurements completed. The first longer-road pilot retained 121 four-lap survey timeouts at 240 s. A 360 s final survey horizon collects four-lap timings; it does not extend the race acceptance watchdogs. Geometry-linter failures and course revisions are retained in Z1 evidence.</p>'
    + f'<p class="small">Sources: {source("course-redesigns")}, {source("course-pacing")}, <a href="../../evidence/ai/z1/pacing.json">Z1 pacing measurements</a>.</p>'
    + reviews(decision('lengthened-courses','Lengthened courses and four new finals','course-redesigns.csv / Z1 pacing','Use road length and added decisions to support race duration, preserving track scale and the existing obstacle system.'))))

sim = '''<p>Fresh paired before/after libraries contain 11,520 entries each. “Before” is the frozen pre-pacing Z0 runtime; “after” includes course/lap changes, AI strategy and effects on rivals’ subsequent purchases. An archived owner report differed in two normalized resources, so it was not treated as an exact control. Two 2,000-career buyer cohorts per version resample these finite physical outcomes; they are not independent end-to-end physical or human careers.</p>'''
sim += table('outcome-table','All ordinary physical outcomes (includes under-tier diagnostic entries)', ['Metric','Before','After'],[
    ['Entries',before['physical']['n'],after['physical']['n']],
    ['Successful lead finishes',before['physical']['finished'],after['physical']['finished']],
    ['Live watchdog timeouts',before['physical']['timeouts'],after['physical']['timeouts']],
    ['Other non-finishes',before['physical']['n']-before['physical']['finished']-before['physical']['timeouts'],after['physical']['n']-after['physical']['finished']-after['physical']['timeouts']],
    ['First-place wins',rate(before['physical']['wins'],before['physical']['n']),rate(after['physical']['wins'],after['physical']['n'])],
    ['Successful finish median / p90 (s)',num(before['physical']['finishSeconds']['median'])+' / '+num(before['physical']['finishSeconds']['p90']),num(after['physical']['finishSeconds']['median'])+' / '+num(after['physical']['finishSeconds']['p90'])],
    ['Early lead wrecks before lap one (<5% gate)',rate(before['physical']['early'],before['physical']['n']),rate(after['physical']['early'],after['physical']['n'])]])
sim += '<h3>Boss-race first-place wins, by event and lead skill</h3><p>Current-tier peers, all three upgrade bands; fixed Club reference opponents. Each cell contains 120 physical entries (two cars × three bands × twenty seeds). These rates are separate from the resampled career completion table and from the selected game-difficulty cross.</p>'
physical = {}
for version in ('before','after'):
    physical[version] = []
    for name in ('physical','boss-extra'):
        path = ROOT / f'evidence/ai/z3/raw/{version}/{name}.csv.gz'
        sources.append(path)
        with gzip.open(path, 'rt', encoding='utf-8-sig', newline='') as stream:
            physical[version].extend(csv.DictReader(stream))
current_boss_rows=[]
for i in (6,13,20,27):
    for skill,label in enumerate(('Rookie','Club','Pro')):
        counts=[]
        for version in ('before','after'):
            group=[x for x in physical[version] if int(x['round'])==i and int(x['skill'])==skill
                   and tiers[cars[int(x['car'])]['tier']]==int(events[i]['playerTier'])]
            finished=[x for x in group if x['finished'].lower()=='true' and float(x['hp'])>0]
            wins=sum(int(x['position'])==1 for x in finished)
            timeouts=sum(x['finished'].lower()!='true' and float(x['hp'])>0 for x in group)
            assert len(group)==120
            counts.append((wins,len(group),len(finished),timeouts))
        b,a=counts
        current_boss_rows.append([f"{i+1} / {events[i]['name']}",events[i]['playerTier'],label,rate(b[0],b[1]),rate(a[0],a[1]),f'{a[2]}/{a[1]}',a[3]])
sim += table('boss-win-table','Current-tier paired ordinary boss-race win rates',['Boss event','Chassis tier','Lead skill','Before wins / n','After wins / n','After finishes','After timeouts'],current_boss_rows)
sim += '<details><summary>Boss-race wins including all legal under-tier entries</summary><p>These broader cells include older unlocked cars, so their denominators grow with the event’s tier ceiling.</p>'
boss_rows=[]
for i in (6,13,20,27):
    for b,a in zip(before['physical']['events'][i]['skills'],after['physical']['events'][i]['skills']):
        boss_rows.append([f"{i+1} / {events[i]['name']}",events[i]['playerTier'],a['skill'],rate(b['wins'],b['n']),rate(a['wins'],a['n']),f"{a['finished']}/{a['n']}",a['timeouts']])
sim += table('boss-all-tier-table','All-legal-tier paired ordinary boss-race win rates',['Boss event','Tier ceiling','Lead skill','Before wins / n','After wins / n','After finishes','After timeouts'],boss_rows)+'</details>'
sim += '<details><summary>Separate difficulty cross: all 36 skill/opposition cells</summary><p>4,608 races, both lead slots, all entrants resolved; player and field power unchanged across difficulty. These boss tests do not prove a full Rookie-difficulty career.</p>'
sim += table('difficulty-table','After difficulty cross',['Boss event','Lead decisions','Opponent difficulty','Wins / n'],[[x['event'],['Rookie','Club','Pro'][x['lead']],['Rookie','Club','Pro'][x['opposition']],rate(x['wins'],x['n'])] for x in r['difficulty']['cells']])+'</details>'
sim += '<h3>Completions, censoring and driving hours</h3><p>Each cohort stops at 70 attempts. Censored is an unfinished observation, not a claimed permanent failure or a completion. Driving hours exclude menus, story and pit time. Successful medians condition on finishing and therefore compare different surviving populations.</p>'
cohort_rows=[]
for buyer,label in [('race','Race-aware buyer'),('pr','Highest-PR buyer')]:
    for version in ('before','after'):
        c=r['versions'][version]['cohorts'][buyer]
        for g in c['groups']:
            cohort_rows.append([label,version,g['skill'],f"{g['completed']}/{g['n']}",g['censored'],num(g['completedHoursMedian'],3),num(g['completedHoursP90'],3),num(g['censoredHoursMedian'],3)])
sim += table('cohort-table','2,000 conditional careers per buyer and version',['Buyer','Version','Lead skill','Completed / n','Censored','Completed median h','Completed p90 h','Censored median h'],cohort_rows)
sim += '<p>Totals: race-aware completions 669 → 868, censoring 1,331 → 1,132; PR-buyer completions 8 → 905, censoring 1,992 → 1,095. Bankruptcy is zero in every cohort. Every recorded boss promotion remains first place. This does not establish the old 4–6 hour campaign target or a shorter completed campaign.</p>'
sim += table('boss-ratio-table','First-entry player / field power ratios; failures remain open',['Buyer','Version','Boss event','Ratio','Declared band','Gate'],
    [[buyer,version,x['event'],num(x['firstEntryRatio'],6),'–'.join(map(str,x['band'])),'PASS' if x['bandPass'] else 'MISS'] for buyer in ('race','pr') for version in ('before','after') for x in r['versions'][version]['cohorts'][buyer]['bosses']])
sim += '<h3>Elimination finale and retained tuning</h3><p>The initial after duel pilot had 5/768 rig wins and 314 draws. Preserving Marrow’s passing gap alone gave 10/768 wins and 365 draws. The selected Z3 candidate uses 1.05× HP and 10% hit recovery in elimination only. Ordinary boss multipliers and recovery were not changed. Pilot samples are not added to final denominators.</p>'
sim += table('duel-table','Final paired 512-seed duel study; draw horizon 600 s',['Lead skill','Before wins / n','After wins / n','Before losses / draws','After losses / draws','After boss share of resolved','After median / p90 s'],
    [[a['skill'],rate(b['wins'],b['n']),rate(a['wins'],a['n']),f"{b['losses']} / {b['draws']}",f"{a['losses']} / {a['draws']}",pct(a['resolvedDominantShare']),num(a['seconds']['median'])+' / '+num(a['seconds']['p90'])] for b,a in zip(before['duel']['skills'],after['duel']['skills'])])
sim += '<p>Final totals before: 766 wins / 2,004 losses / 302 draws. After: 488 / 2,310 / 274. After held-out seed blocks 128–511: 361 wins / 1,732 losses / 211 draws across 2,304 fights; boss share of resolved fights 82.75%. All skills pass the existing 85% dominance ceiling, zero-one-shot and under-5% early-wreck gates. Passing those gates does not mean equal win chances.</p>'
pressure=after['pressure']
sim += '<h3>Leader pressure and fairness</h3>'
sim += table('pressure-table','Impact-time leader ranks; cumulative observations until lead exit',['Metric','Before','After'],[
    ['Hunter-role share of leader damage','Not instrumented in legacy baseline',pct(pressure['hunterRoleShare'])],
    ['Live hunt-intent share of leader damage','Not instrumented in legacy baseline',pct(pressure['huntIntentShare'])],
    ['Leader damage / hunter-role / live hunt-intent damage (HP)','Not instrumented',f"{num(pressure['leaderDamage'])} / {num(pressure['hunterRoleDamage'])} / {num(pressure['huntIntentDamage'])}"],
    ['Hunt decisions / entries with hunts','No strategy layer',f"{pressure['huntDecisions']:,} / {pressure['racesWithHunts']:,} of {pressure['n']:,}"],
    ['Maximum simultaneous intentional target claims','Not measured by this instrument',pressure['maxAttackers']],
    ['Leader-rank changes median / p90 / maximum','Not instrumented',f"{num(pressure['leaderChanges']['median'],0)} / {num(pressure['leaderChanges']['p90'],0)} / {num(pressure['leaderChanges']['maximum'],0)}"],
    ['Early lead wrecks, ordinary library','0 / 11,520','0 / 11,520'],['Early wrecks / one-shots, duel','0 / 0 in 3,072','0 / 0 in 3,072']])
sim += '<p>Hunters and live hunt intent are distinct damage attributions. A projectile may land after its lease ends. Rank changes include close oscillations and are not verified overtakes. Campaign observations stop at lead finish, wreck or watchdog; unresolved peers at that point can still be racing normally. The decision trace retains only its last 1,024 rows and reports truncation; cumulative damage/claim/rank counters cover the full observed interval. No uniform tight-pack or human fairness guarantee follows.</p>'
sim += '<h3>Class winner share and skill versus power</h3><p>60,120 contested races: five tiers × two builds × three courses × 334 paired seeds × six grid rotations. All entrants resolved. The limit is 55% on the declared mix (25% technical / 50% straight / 25% loose), not on every individual course. No paired pre-change roster study was run in Z3; the table and chart are after-only.</p>'
roster_rows=[]
for t in r['roster']['tiers']:
    for car,share in t['mixedWinnerShare'].items():
        roster_rows.append([t['tier'],t['build'],car,pct(share),*[pct(t['courses'][course]['winnerShare'][car]) for course in ('technical','straight','loose')],'PASS' if t['winnerShareWithinLimit'] else 'MISS'])
sim += table('class-table','Winner shares for every class/build',['Tier','Build','Car','Weighted mix','Technical','Straight','Loose','55% mix gate'],roster_rows)
sim += '<p>The developed Quill pilot missed at 55.73%; the larger final sample measures 53.22%. Every peer has a best and worst course. Complete slot crosses, paired seeds and the 99% hash-diversity floor pass. Independent homogeneous timing (6,000 races) agrees with all fifteen contested timing orders.</p>'
sim += table('skill-table','36,072 races on one declared technical course',['Pair','Forward Champion margin (s)','Skill-swap effect (s)','Declared forward / effect gates','Extra both-direction reversal'],
    [[x['lower']+' / '+x['upper'],num(x['swaps'][0]['championMarginSeconds'],2),num(x['swapEffectSeconds'],2),'PASS' if x['forwardSkillPass'] and x['swapEffectPass'] else 'MISS','PASS' if x['passBoth'] else 'MISS'] for x in r['skill']['cases']])
sim += '<p>All nine agile/lower-tier Champion margins and all nine material skill-swap effects pass. The stronger diagnostic demanding reversed finishing order in both directions passes only Flint/Vandal; eight pairs miss. Chassis/course identity can still outweigh decision skill in that direction. All skill entrants resolved; difficulty never changed physics power.</p>'
sim += '<h3>Instrument self-review</h3><p>Nineteen planted/control cases and eighteen Python metric tests pass, including alarms for wrong promotion, early wrecks, excessive claims, seed repetition and missing rotations. Final-core replay exactly reproduces 34 campaign rows and 360 roster rows. A byte allowlist limits reuse to code unaffected by the elimination-only tuning. Replays add no samples. Correctness tests cover deterministic replay, active-step zero allocation, save migration and free retry; balance misses above are not waived.</p>'
sim += '<div class="charts">'+''.join(f'<figure><img src="../../evidence/ai/z3/{name}.svg" alt="{esc(alt)}" loading="lazy"><figcaption>{esc(alt)} · <a href="../../evidence/ai/z3/{name}.svg">Open standalone SVG</a></figcaption></figure>' for name,alt in [
    ('race-times','Before/after reference race durations; see the 35-event table for denominators and tails'),
    ('career-hours','Successful campaign driving hours; censored runs are excluded from completed-hour distributions'),
    ('class-wins','After-only class winner shares on the declared course mix')])+'</div>'
sim += reviews(decision('career-balance','Career completion and retry balance','Z3 cohorts / boss ratios','Rookie completion remains unproven; final ordinary boss power ratio still misses. Keep the first-place rule.')
    + decision('duel-balance','Finale difficulty','Z3 final duels / held-out seeds','The rig wins 15.89% overall after tuning; 274 draws remain. The finale is harder than before.')
    + decision('leader-pressure','Observed leader pressure','Z3 pressure / early-wreck metrics','Hunters deal 16.54% of leader damage with at most two intentional claims. No early lead wrecks observed.')
    + decision('class-balance','Class share and skill effects','Z3 roster / rotation / skill','All ten class/build mixes pass 55%. Eight of nine strict both-direction skill reversals miss.'))
body.append(section('simulation','07 / Before and after: the full balance picture',sim))

stick_path=ROOT/'evidence/ai/z4/stick/summary.json'
if stick_path.exists():
    sources.append(stick_path)
    s=json.loads(stick_path.read_text(encoding='utf-8'))
    device_body=s['reviewHtml']
else:
    device_body='<p class="callout">PENDING: the prior run was interrupted after observing a hunt. Its incomplete race is not a duration or functional pass. A resumed isolated run is in progress.</p>'
body.append(section('stick','08 / Fire TV Stick check',device_body
    + reviews(decision('stick-observation','Stick behaviour and pacing','Z4 isolated dev.deathride.ai run','Review the measured scripted race and frame-time limitations. Human driving feel and optimisation are separate follow-up work.'))))

body.append(section('sources','Evidence and scope', '''<ul>
<li><a href="../../evidence/ai/z3/report.json">Z3 machine-readable report</a> · <a href="../../evidence/ai/z3/README.md">protocol and limitations</a> · <a href="../../evidence/ai/z3/pilots/manifest.json">retained pilots</a></li>
<li><a href="../../evidence/ai/z3/ordinary-reuse-audit.json">ordinary-code reuse audit</a> · <a href="../../evidence/ai/z3/roster-final-core-replay.json">exact roster replay</a> · <a href="../../evidence/ai/z3/release/passed.json">Z3 correctness checks</a></li>
<li><a href="../../evidence/ai/z4/release/passed.json">Z4 required release checks</a> · <a href="../../evidence/ai/z4/review-final/result.json">Z4 final offline browser checks</a>: 177 core / 8 link / 37 game tests, debug APK, six runtime browser suites and this owner-page check pass.</li>
<li><a href="../../../docs/concepts/deathride/Z4-owner-review-and-stick.md">Z4 design note</a> · <a href="../../../docs/concepts/DEATH-RIDE-AI-PACING.md">owner constraints and wave status</a></li>
<li><a href="manifest.json">This page’s source hashes and decision IDs</a>. The report sourceCommit identifies the parent while the candidate was being tuned; runtime provenance manifests identify the executing bytes.</li></ul>
<p>No Grok or ElevenLabs calls, new art, publication or push. Owner choices are preferences; they cannot turn a failed technical or balance gate into a pass.</p>'''))
body.append('''<section id="export-section" class="review-section export"><h2>Export the owner review</h2>
<p>The four-column Markdown table follows the audio review format. Unreviewed decisions remain “Not reviewed”. Notes are escaped for HTML and Markdown table syntax.</p>
<div class="report-toolbar"><button type="button" id="copy">Copy Markdown</button><button type="button" id="refresh-export">Refresh preview</button></div>
<label for="export">Markdown preview / manual copy fallback</label><textarea id="export" readonly spellcheck="false"></textarea></section>''')

OUT.mkdir(parents=True,exist_ok=True)
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><title>Death Ride — AI and race pacing owner review</title>
<link rel="stylesheet" href="../../audio/report.css"><link rel="stylesheet" href="review.css"><script src="review.js" defer></script></head>
<body data-round="deathride.ai.z4.review" data-page-title="AI and race pacing"><main>'''+''.join(body)+'</main></body></html>\n'
(OUT/'index.html').write_text(page,encoding='utf-8',newline='\n')
def source_hash(path):
    raw=path.read_bytes()
    if path.suffix!='.gz':raw=raw.replace(b'\r\n',b'\n')
    return hashlib.sha256(raw).hexdigest()
manifest=dict(schema=1,scope='Static Z4 owner review; no inferred choices',hashMode='SHA-256; text CRLF normalized to LF; gzip bytes unchanged',decisions=decisions,
    counts=dict(temperaments=len(temperaments),personas=len(personas),plans=len(plans),phases=len(phases),weaknesses=len(weaknesses),events=len(events),changedCourses=len(redesigns)),
    sources={str(p.relative_to(ROOT)).replace('\\','/'):source_hash(p) for p in sorted(set(sources))})
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'Wrote {OUT / "index.html"}: {len(decisions)} decisions, {len(events)} events')
