"""P13f: what the app allocates and drops, read from Android heap dumps (hprof-conv'd, standard J2SE HPROF).

ART's dump (`am dumpheap` without -g) holds every object still in the heap, garbage included. This reader marks what is
reachable from the dump's roots and lists what is not: by class, and every unreachable array of 12 KiB or more (ART's
large-object threshold) with a preview of its content, so a dropped char[] shows the text it was building.

Usage: python -I tools/perf-p13f-heap.py out.json a.hprof [b.hprof]
With two dumps, objects of the second that are absent from the first are 'new' (allocated between the dumps).
"""
import collections, json, struct, sys

SIZES = {2: None, 4: 1, 5: 2, 6: 4, 7: 8, 8: 1, 9: 2, 10: 4, 11: 8}
NAMES = {4: 'boolean[]', 5: 'char[]', 6: 'float[]', 7: 'double[]', 8: 'byte[]', 9: 'short[]', 10: 'int[]', 11: 'long[]'}
LARGE = 12 * 1024


def read(path):
    data = open(path, 'rb').read()
    end = data.index(b'\0')
    idsize = struct.unpack_from('>I', data, end + 1)[0]
    assert idsize in (4, 8)
    idfmt = '>I' if idsize == 4 else '>Q'
    SIZES[2] = idsize

    def rid(o):
        return struct.unpack_from(idfmt, data, o)[0]
    strings, classnames = {}, {}
    classes = {}  # id -> (super, [(type)], statics refs)
    instances = {}  # id -> (class, offset, length)
    objarrays = {}  # id -> (class, offset, n)
    prims = {}  # id -> (type, offset, n)
    roots = set()
    o = end + 1 + 4 + 8
    while o < len(data):
        tag = data[o]; length = struct.unpack_from('>I', data, o + 5)[0]; body = o + 9; o = body + length
        if tag == 0x01:
            strings[rid(body)] = data[body + idsize:body + length].decode('utf-8', 'replace')
        elif tag == 0x02:
            classnames[rid(body + 4)] = rid(body + 8 + idsize)
        elif tag in (0x0C, 0x1C):
            p = body
            while p < o:
                sub = data[p]; p += 1
                if sub in (0xFF, 0x05, 0x07):
                    roots.add(rid(p)); p += idsize
                elif sub == 0x01:
                    roots.add(rid(p)); p += 2 * idsize
                elif sub in (0x02, 0x03, 0x08):
                    roots.add(rid(p)); p += idsize + 8
                elif sub in (0x04, 0x06):
                    roots.add(rid(p)); p += idsize + 4
                elif sub == 0xFE:
                    p += 4 + idsize
                elif sub == 0x20:
                    cid = rid(p); sup = rid(p + 4 + idsize); p += 4 + 7 * idsize + 4
                    n = struct.unpack_from('>H', data, p)[0]; p += 2
                    for _ in range(n):
                        t = data[p + 2]; p += 3 + SIZES[t]
                    n = struct.unpack_from('>H', data, p)[0]; p += 2
                    statics = []
                    for _ in range(n):
                        t = data[p + idsize]
                        if t == 2:
                            statics.append(rid(p + idsize + 1))
                        p += idsize + 1 + SIZES[t]
                    n = struct.unpack_from('>H', data, p)[0]; p += 2
                    fields = []
                    for _ in range(n):
                        fields.append(data[p + idsize]); p += idsize + 1
                    classes[cid] = (sup, fields, statics)
                elif sub == 0x21:
                    iid = rid(p); cid = rid(p + 4 + idsize); n = struct.unpack_from('>I', data, p + 4 + 2 * idsize)[0]
                    instances[iid] = (cid, p + 8 + 2 * idsize, n); p += 8 + 2 * idsize + n
                elif sub == 0x22:
                    aid = rid(p); n = struct.unpack_from('>I', data, p + 4 + idsize)[0]; cid = rid(p + 8 + idsize)
                    objarrays[aid] = (cid, p + 8 + 2 * idsize, n); p += 8 + 2 * idsize + n * idsize
                elif sub == 0x23:
                    aid = rid(p); n = struct.unpack_from('>I', data, p + 4 + idsize)[0]; t = data[p + 8 + idsize]
                    prims[aid] = (t, p + 9 + idsize, n); p += 9 + idsize + n * SIZES[t]
                else:
                    raise ValueError(f'unknown heap sub-record 0x{sub:02x} at {p - 1}')

    def name(cid):
        return strings.get(classnames.get(cid), f'class@{cid:x}')

    def refs(oid):
        if oid in instances:
            cid, off, _ = instances[oid]
            out = []
            c = cid
            while c in classes:
                sup, fields, _ = classes[c]
                for t in fields:
                    if t == 2:
                        out.append(rid(off))
                    off += SIZES[t]
                c = sup
            return out
        if oid in objarrays:
            _, off, n = objarrays[oid]
            return [rid(off + i * idsize) for i in range(n)]
        if oid in classes:
            return classes[oid][2] + [classes[oid][0]]
        return []
    seen = set(); stack = [r for r in roots if r]
    stack += list(classes)  # loaded classes (and their statics) are live
    while stack:
        x = stack.pop()
        if not x or x in seen:
            continue
        seen.add(x)
        stack.extend(refs(x))

    def size(oid):
        if oid in prims:
            t, _, n = prims[oid]; return n * SIZES[t]
        if oid in objarrays:
            return objarrays[oid][2] * idsize
        return instances[oid][2]

    def kind(oid):
        if oid in prims:
            return NAMES[prims[oid][0]]
        if oid in objarrays:
            return name(objarrays[oid][0])
        return name(instances[oid][0])

    def preview(oid):
        t, off, n = prims[oid]
        if t == 5:
            return data[off:off + min(n, 160) * 2].decode('utf-16-be', 'replace')
        if t == 8:
            return data[off:off + min(n, 160)].decode('latin-1')
        if t == 7:
            return list(struct.unpack_from('>8d', data, off)) if n >= 8 else []
        return None
    return dict(seen=seen, prims=prims, objarrays=objarrays, instances=instances, size=size, kind=kind, preview=preview,
                classes=classes, name=name)


def summarize(h, only=None):
    ids = [i for i in (*h['prims'], *h['objarrays'], *h['instances']) if only is None or i in only]
    dead = [i for i in ids if i not in h['seen']]
    by = collections.Counter(); cnt = collections.Counter()
    for i in dead:
        by[h['kind'](i)] += h['size'](i); cnt[h['kind'](i)] += 1
    large = sorted((i for i in dead if i in h['prims'] and h['size'](i) >= LARGE), key=h['size'], reverse=True)
    return {
        'objects': len(ids), 'unreachable': len(dead), 'unreachableBytes': sum(h['size'](i) for i in dead),
        'unreachableByClass': [{'class': k, 'bytes': v, 'count': cnt[k]} for k, v in by.most_common(25)],
        'unreachableLarge': {'count': len(large), 'bytes': sum(h['size'](i) for i in large),
            'arrays': [{'id': f'{i:x}', 'type': h['kind'](i), 'bytes': h['size'](i), 'length': h['prims'][i][2],
                        'preview': h['preview'](i)} for i in large]},
        'reachableLarge': sorted(({'type': h['kind'](i), 'bytes': h['size'](i), 'preview': h['preview'](i)}
                                  for i in h['prims'] if i in h['seen'] and h['size'](i) >= LARGE and (only is None or i in only)),
                                 key=lambda r: -r['bytes'])[:40],
    }


def main():
    out, paths = sys.argv[1], sys.argv[2:]
    dumps = [read(p) for p in paths]
    result = {'dumps': [{'path': p, **summarize(h)} for p, h in zip(paths, dumps)]}
    if len(dumps) == 2:
        a, b = dumps
        old = set(a['prims']) | set(a['objarrays']) | set(a['instances'])
        new = (set(b['prims']) | set(b['objarrays']) | set(b['instances'])) - old
        result['newInSecond'] = summarize(b, new)
    json.dump(result, open(out, 'w'), indent=1, default=str)
    for d in result['dumps'] + ([result['newInSecond']] if 'newInSecond' in result else []):
        print(d.get('path', 'new in second'), d['unreachable'], d['unreachableBytes'], 'large', d['unreachableLarge']['count'],
              d['unreachableLarge']['bytes'])


main()
