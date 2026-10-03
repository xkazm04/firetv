"""Calculations shared by campaign reports and planted-defect tests."""
from collections import Counter

def dominant(wins, boss_wins, maximum):
    return max(wins, boss_wins)/(wins+boss_wins)>maximum if wins+boss_wins else None

def repeated(values, minimum):
    return not values or len(set(values))/len(values)<minimum

def complete_cross(rows, skills, rotations, samples):
    counts=Counter((int(r['skill']),int(r['rotation'])) for r in rows)
    return set(counts)=={(s,r) for s in range(skills) for r in range(rotations)} and all(n==samples for n in counts.values())

def paired_seed_cross(rows, skills, rotations, samples):
    if not complete_cross(rows,skills,rotations,samples):return False
    blocks=[]
    for s in range(skills):
        for slot in range(rotations):
            seeds={r['seed'] for r in rows if int(r['skill'])==s and int(r['rotation'])==slot}
            if len(seeds)!=samples:return False
            blocks.append(seeds)
    return all(seeds==blocks[0] for seeds in blocks)

def all_fight_share(wins, fights):
    return wins/fights if fights else None

def opening_loss(early, fights, maximum):
    return fights==0 or early/fights>=maximum
