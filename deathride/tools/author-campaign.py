"""Q0 authored plot data. No generated art or external story material."""
import csv
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = root / 'core/src/main/resources/data'
with (data/'story-cards.csv').open(newline='', encoding='utf-8') as f:
    cards = list(csv.DictReader(f))
edits = {
'scrap-1': ('The key survived the fire.', 'Marrow kept your sibling debt and your name.', 'The young Mechanic opens the shop with shaking hands.'),
'scrap-3': ('Scree hides yesterday under fresh stone.', 'The Mechanic patches your tires before dawn.', 'A bare frame waits behind his parts counter.'),
'scrap-6': ('A scorched receipt survives behind a tool rack.', 'Part of your payment never reached the debt.', 'Marrow calls the missing money a handling charge.'),
'scrap-7': ('Rook blocks the road out of the Yards.', 'Win this race and he will promote your name.', 'Cash or a car or a fitted part: you choose.'),
'foundry-1': ('Rook has put his name beside yours.', 'Ox races to keep his foundry crew employed.', 'The Mechanic follows with a truck full of parts.'),
'foundry-5': ('Crew wages appear as penalties in the debt book.', 'Your diverted payments bought Marrow private fleet.', 'Ox brings the receipts that can prove it.'),
'foundry-7': ('Ox lays duplicate receipts on your bonnet.', 'Beat him and his crew will stand behind you.', 'The diverted money goes back on your account.'),
'salt-1': ('Ox has forced the collector to correct the books.', 'Future payments now reach the debt in full.', 'Vex knows where the missing driver went.'),
'salt-3': ('Someone switched the ammunition in a sealed crate.', 'The Mechanic catches it before you leave the shop.', 'He keeps the empty dispatcher for his bare frame.'),
'salt-7': ('Vex has kept the northbound address safe.', 'Win and he will carry your name to the next division.', 'His promotion comes as cash or a car or a part.'),
'switchback-1': ('Cold air reaches the engine before dawn.', 'Mica waits above the last town.', 'The Mechanic has hidden your sibling in his workshop.'),
'switchback-3': ('Your sibling calls from the safe workshop.', 'The Mechanic was afraid to tell you until now.', 'He stayed because someone had to keep a door open.'),
'switchback-6': ('Marrow offers to clear only your family debt.', 'The Mechanic turns down a price for your location.', 'Mica sends the private deal back unsigned.'),
'switchback-7': ('Mica divides the evidence among the crews.', 'Beat her and she will promote the driver carrying it.', 'No single wreck can burn every copy now.'),
'crown-3': ('Relay reads the duplicate entries over the pit radio.', 'Ox confirms where your payments went.', 'Even a cleared balance cannot satisfy Marrow.'),
'crown-4': ('The Mechanic fits the mine dispatcher in his rig.', 'A plain engine. A rough seat. A real chance.', 'He does not ask you to trust another secret.'),
'crown-5': ('Vex gives every crew an unedited race recording.', 'Marrow has run out of numbers to hide behind.', 'He starts talking about ownership instead.'),
'crown-6': ('Marrow demands your car as collateral after this race.', 'The Mechanic rolls his bare rig out of the shop.', 'One more result before the debt becomes a death fight.'),
'crown-7': ('Marrow seizes your car under a fabricated lien.', 'The Mechanic gives you his rig and mine dispatcher.', 'No lap victory. Last car running ends his reign.'),
}
for row in cards:
    if row['id'] in edits:
        for i, line in enumerate(edits[row['id']], 1): row[f'line{i}'] = line
with (data/'story-cards.csv').open('w', newline='', encoding='utf-8') as f:
    w=csv.DictWriter(f, fieldnames=cards[0]); w.writeheader(); w.writerows(cards)
with (data/'campaign.csv').open(newline='', encoding='utf-8') as f: events=list(csv.DictReader(f))
hubs=['The Yards','Foundry row','The flats and quarry','The mountain workshop','The Crown pits']
with (data/'campaign-beats.csv').open('w', newline='', encoding='utf-8') as f:
    w=csv.writer(f);w.writerow(['event','hub','scene','mechanic','contract','beat'])
    for i,e in enumerate(events):
        w.writerow([e['id'],hubs[i//7], 'seizure' if i==34 else 'promotion' if e['boss']=='1' else 'story',
                    'rig' if i>=31 else 'shop', 'delivery' if i in (3,12,31) else 'grudge' if i==25 else 'clean' if i==17 else 'optional',
                    ' '.join(cards[i][f'line{n}'] for n in (1,2,3))])
    
