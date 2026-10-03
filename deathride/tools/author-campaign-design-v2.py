"""Author the pass-two schedule and original text. Class limits have a separate measured data authority. No art or audio mutation."""
import csv
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / 'core/src/main/resources/data'


def read(name):
    return list(csv.DictReader((DATA / (name + '.csv')).open(encoding='utf-8')))


def write(name, rows):
    # Runtime CSV deliberately has no quoting grammar.
    assert all(',' not in str(v) and '\n' not in str(v) and '"' not in str(v) for r in rows for v in r.values())
    with (DATA / (name + '.csv')).open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator='\n')
        w.writeheader()
        w.writerows(rows)


events = read('campaign')
for i, r in enumerate(events):
    r['phase'] = ['build-up'] * 4 + ['pressure', 'qualifier', 'boss']
    r['phase'] = r['phase'][i % 7] if i < 34 else 'finale'
    r['laps'] = str([8, 10, 8, 10, 12, 8, 10][i % 7] + [0, 1, 2, 2, 2][i // 7]) if i < 34 else '0'
write('campaign', events)
curve = read('career-curve')
for i, r in enumerate(curve):
    r['ratioLow'], r['ratioHigh'] = '0.80', '1.15'
    if 21 <= i < 34: r['ratioTarget'] = ['0.98','0.99','1.00','1.01','0.98','1.00','0.98'][i % 7]
    if i in [6, 13]:
        r['ratioLow'], r['ratioHigh'] = '0.85', '0.90'
    if i in [20, 27]:
        r['ratioLow'], r['ratioHigh'], r['ratioTarget'] = '0.93', '1.03', '0.98'
    if i == 34:
        r['ratioLow'], r['ratioHigh'], r['ratioTarget'] = '0.50', '0.55', '0.525'
write('career-curve', curve)
rules = read('ash-rules')
for r in rules:
    if r['key'] == 'minimumCampaignHours': r['value'] = '3'
    if r['key'] == 'maximumCampaignHours': r['value'] = '5'
write('ash-rules', rules)

lines = [
    ['The garage key survived the fire. Your sibling did not come home.', 'Marrow holds the debt and the lease on your shelter.', 'The young Mechanic keeps one light burning for you.'],
    ['Your first receipt buys more than another night indoors.', 'The Mechanic marks the part that will help this car.', 'Keep the receipt. Marrow keeps a different copy.'],
    ['Scree cuts the tires. The workshop floor catches the dust.', 'A bare frame sits beneath a quarry dispatch drum.', 'The Mechanic says the frame is for someone who has nothing.'],
    ['Relay needs a sealed gearbox carried through the sluice.', 'The job is optional. The prize still pays if you refuse.', 'Inside its lid is a crew name scraped off the debt book.'],
    ['Rook collected leases before racing for Marrow.', 'The crews need to see you hold a line under pressure.', 'Rook watches from the pit wall. This time you watch back.'],
    ['A short qualifier leaves time to prepare for Rook.', 'Clear this qualifier to open the next pair of cars.', 'Buy a car or develop this one. The contest names one rival.'],
    ['Rook puts the garage key beside the timing board.', 'Finish alive ahead of Rook to earn the crew endorsement.', 'Rook will promote you with money or a car or a useful part.'],
    ['Rook writes your name on the crew buying account.', 'A former collector has made your survival public.', 'Ox needs that same protection for the foundry shifts.'],
    ['A lender offers an advance against your next prize.', 'The fixed fee is written where you can read it.', 'The Mechanic will keep repairing your car without a loan.'],
    ['Ox races to keep the foundry furnaces lit.', 'A heavy car can own a straight and still miss a turn.', 'The crew has started counting your brake lights.'],
    ['Your sibling signed for a shipment under a false name.', 'Mica recognizes the handwriting and saves the stub.', 'The Mechanic asks you to bring every scrap home.'],
    ['This longer shift pays the same open race schedule.', 'Crew wages and your payments share a fleet account.', 'Ox has the second receipts. Someone is paying twice.'],
    ['The short qualifier opens the Pro licence.', 'Relay brings an honest serial plate from the yard.', 'Ox asks for a public contest where every crew can watch.'],
    ['Ox lays both sets of receipts on your bonnet.', 'Finish alive ahead of Ox and the crew will back your climb.', 'Stolen payments return as debt credit then cash still owed.'],
    ['Ox has forced the collector to correct the books.', 'Even if the debt is paid the stolen money belongs to you.', 'The Mechanic keeps any wallet overflow safe on the account.'],
    ['A shelter holds a glove stitched with garage wire.', 'There is fresh oil on the thumb. Your sibling is alive.', 'Vex carried someone north on the night of the fire.'],
    ['A sealed crate contains swapped ammunition.', 'The Mechanic finds it before you leave the counter.', 'The quarry dispatcher is now bolted to the bare frame.'],
    ['Vex sells fast runs to drivers with nobody to trust.', 'Marrow paid for the roadblocks on that northbound road.', 'Vex wants proof that a new sponsor will leave it open.'],
    ['The flats make a long pressure run feel endless.', 'Relay finds your payment listed as a fleet purchase.', 'The theft bought the cars now enforcing the stolen leases.'],
    ['One short qualifier opens the Elite licence.', 'Vex checks the courier route while you check the garage.', 'The next car is a different tool. Its number is not a win.'],
    ['Vex places the northbound route on the timing board.', 'Finish alive ahead of Vex to earn a courier endorsement.', 'Vex will carry your name and let the crews choose their road.'],
    ['Vex brings a recording with its missing lap restored.', 'It shows a league tow truck at the burning garage.', 'The Mechanic finally opens the locked workshop door.'],
    ['Your sibling copied the books before the garage burned.', 'Marrow paid the tow crew from the same fleet account.', 'The debt was a way to buy the people collecting it.'],
    ['Your sibling steps out from behind the parts shelves.', 'The Mechanic hid them because Marrow searched every road.', 'Fear kept the secret. Loyalty kept the door open.'],
    ['Mica gives each mountain crew a different ledger copy.', 'No single seized car can carry all the evidence away.', 'The dispatcher rig is one more thing built in pieces.'],
    ['A wet pressure run carries the copies past a checkpoint.', 'Mica stays on the radio until the last crew answers.', 'A racing grudge cannot cancel an earned endorsement.'],
    ['The short qualifier opens the Champion licence.', 'Marrow offers a private pardon in return for every copy.', 'The Mechanic refuses to trade a person for a balance.'],
    ['Mica puts the crew signatures on the timing board.', 'Finish alive ahead of Mica to earn a public endorsement.', 'The Crown gates must now admit the whole coalition.'],
    ['Mica leads the crews through the Crown gates together.', 'Rook has the sponsors. Ox has the receipts.', 'Vex has the recording. The broadcast cannot be bought back.'],
    ['The house cars wear the fleet account on their plates.', 'They use bought parts and the same road you do.', 'The Mechanic reminds you that a rating cannot choose a line.'],
    ['Relay reads both books over the open pit radio.', 'Ox names each payment and where the money went.', 'Marrow says a paid debt does not mean you own yourself.'],
    ['The Mechanic shows you the finished mine dispatcher.', 'A quarry drum feeds real half-metre mines behind the rig.', 'The engine is basic. The plan is to give you a chance.'],
    ['The longest Crown run keeps every crew in the stands.', 'Vex sends the recording beyond the league transmitters.', 'Marrow closes the exits and stops talking about money.'],
    ['A short final qualifier brings your car to the pits.', 'Marrow posts a forged ownership lien against it.', 'The Mechanic rolls the rig out where you can see it.'],
    ['Marrow takes your car even though his books are exposed.', 'The Mechanic gives you the basic rig and mine dispatcher.', 'No lap victory. Fight until Marrow is the last wreck.'],
]
cards = read('story-cards')
by_id = {r['id']: r for r in cards}
beats = read('campaign-beats')
for event, beat, text in zip(events, beats, lines):
    card = by_id[event['id']]
    for n, line in enumerate(text, 1): card['line' + str(n)] = line
    beat['beat'] = ' '.join(text)
    beat['scene'] = event['phase'] if event['phase'] != 'boss' else 'promotion'
victory = by_id['campaign-victory']
victory.update(line1='The crews return your car and tear up the forged lien.', line2='Your sibling opens the workshop beside the Mechanic.', line3='The endorsements become a league that belongs to its crews.')
write('story-cards', cards)
write('campaign-beats', beats)
mechanic = read('campaign-mechanic')
mechanic[0]['tutorial'] = 'Insured repairs come out of the prize. A loss pays. Keep the first receipts.'
mechanic[1]['tutorial'] = 'Beat the named boss alive. An ally offers money or a missing tier car or a useful part.'
mechanic[2]['tutorial'] = 'Recovered money clears debt first. Cash overflow waits safely until your wallet has room.'
mechanic[3]['tutorial'] = 'Later tiers offer different tools within the same stat cap. Try a different line or difficulty.'
write('campaign-mechanic', mechanic)
allies = read('campaign-allies')
allies[0]['joinedLine'] = 'My name opens the crew account. Your choice is money or a missing car or a useful part.'
allies[1]['joinedLine'] = 'The crew stands with you. Every stolen credit will return even after the debt is paid.'
allies[2]['joinedLine'] = 'The north road stays open. My couriers carry your name and the unedited recording.'
allies[3]['joinedLine'] = 'Every crew holds a copy. My endorsement opens the Crown gates for all of us.'
write('campaign-allies', allies)
print('Authored 35 stable events /', sum(int(r['laps']) for r in events), 'laps; original story and explicit bands.')
