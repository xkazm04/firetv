"""Pure report metrics; the simulation and the report use declared CSV thresholds."""
def share(wins,races):
    return wins/races if races else None

def changed_share(before,after,races,limit):
    return bool(races) and abs(share(after,races)-share(before,races))>limit

def repeated(values,floor):
    return not values or len(set(values))/len(values)<floor

def crossed(cells,expected):
    return set(cells)==set(expected) and len({len(v) for v in cells.values()})==1

def early(wrecks,entries,limit):
    return bool(entries) and wrecks/entries>=limit

def unresolved(count):
    return count>0
