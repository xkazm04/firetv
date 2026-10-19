"""P20 (card 13, research; no verdict reads it): what survives a GC, read from Android heap dumps.

Reads ART's own dump (`am dumpheap`) or its hprof-conv'd copy. The record walk is perf-p13f-heap.py's, copied here and
extended (that file is unchanged): ART's heap ids (HEAP_DUMP_INFO: app, zygote, image), its extra root kinds, field names
and class loaders. hprof-conv drops the heap ids and folds ART's extra root kinds into ROOT_UNKNOWN, so the heap split and
the root kinds need the raw file; both files hold the same objects and references.

Per dump:
- reachable objects and shallow bytes per heap (app, zygote, image);
- for the app heap, retained bytes from a dominator tree (Lengauer-Tarjan) rooted at the dump's GC roots. ART reaches
  classes through class tables the dump does not list as references, so every loaded class is also a root (as in
  perf-p13f-heap.py). java.lang.ref.Reference.referent is not a strong reference: what only a referent reaches is
  reported apart;
- the top 30 retained objects, with class, shallow and retained bytes and one shortest path to a root (the root kind,
  then class.field steps);
- retained bytes grouped by owner: each app-heap object goes to its nearest dominator of class dev.deathride.* (grouped
  by package and by class); without one, to its nearest com.badlogic.* / io.ktor.* / kotlinx.* dominator, then kotlin.*,
  android.*, then java.*; plus bitmaps and large arrays (12 KiB or more) with what holds them;
- with --gc-log, the reconciliation: the app heap's reachable bytes beside the survivors ART logged for the dump's own
  GC (the last GC line before the dump's `hprof: heap dump "..." starting` line), read with perf-p18-gc.py's reader.
With --grow A:B (two dumps of one run): what grew between them, by class and by owner.

Shallow sizes are ART's (32-bit heap references, 8-byte alignment): an instance is its class's object size; an array is
its 12-byte header (16 for 8-byte elements) plus its data; a String holds its characters inline (ART's dump writes them
as a separate array, which is counted inside the String); a class counts its static fields only (a lower bound).

Usage: python -I tools/perf-p20-retained.py OUT.json LABEL=DUMP [LABEL=DUMP ...] [--gc-log LOGCAT] [--grow A:B]
       (the logcat line is matched by LABEL's dump file name on the device: --remote LABEL=p20-a.hprof)
"""
import argparse, collections, json, re, struct, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SIZES = {2: None, 4: 1, 5: 2, 6: 4, 7: 8, 8: 1, 9: 2, 10: 4, 11: 8}
NAMES = {4: 'boolean[]', 5: 'char[]', 6: 'float[]', 7: 'double[]', 8: 'byte[]', 9: 'short[]', 10: 'int[]', 11: 'long[]'}
FMT = {4: '>?', 5: '>H', 6: '>f', 7: '>d', 8: '>b', 9: '>h', 10: '>i', 11: '>q'}
LARGE = 12 * 1024
MIB = 1048576
ROOTS = {0xFF: 'unknown', 0x01: 'jni-global', 0x02: 'jni-local', 0x03: 'java-frame', 0x04: 'native-stack',
         0x05: 'sticky-class', 0x06: 'thread-block', 0x07: 'monitor-used', 0x08: 'thread-object',
         0x89: 'interned-string', 0x8A: 'finalizing', 0x8B: 'debugger', 0x8C: 'reference-cleanup',
         0x8D: 'vm-internal', 0x8E: 'jni-monitor'}
# Root sub-record body sizes after the object id, in bytes of (id, u4) units: (extra ids, extra u4s).
ROOT_EXTRA = {0xFF: (0, 0), 0x05: (0, 0), 0x07: (0, 0), 0x89: (0, 0), 0x8A: (0, 0), 0x8B: (0, 0), 0x8C: (0, 0),
              0x8D: (0, 0), 0x01: (1, 0), 0x02: (0, 2), 0x03: (0, 2), 0x08: (0, 2), 0x8E: (0, 2), 0x04: (0, 1),
              0x06: (0, 1)}
INST, OARR, PARR, CLASS = 0, 1, 2, 3
TIERS = (('dev.deathride.',), ('com.badlogic.', 'io.ktor.', 'kotlinx.'), ('kotlin.',),
         ('android.', 'androidx.', 'com.android.'), ('java.', 'javax.', 'sun.', 'libcore.', 'dalvik.', 'jdk.', 'org.'))
TIER_NAMES = ('dev.deathride', 'library', 'kotlin', 'android', 'java')


def align8(n):
    return (n + 7) & ~7


# ---------------------------------------------------------------------------------------------------------------- graph

def dominators(n, succ, root):
    """Immediate dominators by Lengauer-Tarjan (the simple version, path compression), iterative.

    n nodes 0..n-1, succ[v] the successors of v, root the start. Returns (idom, order): idom[v] is v's immediate dominator
    (idom[root] = root, -1 when v is unreachable) and order the reachable nodes in DFS preorder (root first)."""
    dfnum = [-1] * n
    parent = [-1] * n
    order = []
    stack = [(root, -1)]
    while stack:
        v, p = stack.pop()
        if dfnum[v] != -1:
            continue
        dfnum[v] = len(order)
        order.append(v)
        parent[v] = p
        for w in reversed(succ[v]):
            if dfnum[w] == -1:
                stack.append((w, v))
    pred = [[] for _ in range(n)]
    for v in order:
        for w in succ[v]:
            pred[w].append(v)
    semi = dfnum[:]
    label = list(range(n))
    ancestor = [-1] * n
    idom = [-1] * n
    bucket = collections.defaultdict(list)

    def evaluate(v):
        if ancestor[v] == -1:
            return v
        path = []
        u = v
        while ancestor[ancestor[u]] != -1:
            path.append(u)
            u = ancestor[u]
        for x in reversed(path):
            a = ancestor[x]
            if semi[label[a]] < semi[label[x]]:
                label[x] = label[a]
            ancestor[x] = ancestor[a]
        return label[v]

    for i in range(len(order) - 1, 0, -1):
        w = order[i]
        for v in pred[w]:
            u = evaluate(v)
            if semi[u] < semi[w]:
                semi[w] = semi[u]
        bucket[order[semi[w]]].append(w)
        p = parent[w]
        ancestor[w] = p
        for v in bucket.pop(p, ()):
            u = evaluate(v)
            idom[v] = u if semi[u] < semi[v] else p
    for i in range(1, len(order)):
        w = order[i]
        if idom[w] != order[semi[w]]:
            idom[w] = idom[idom[w]]
    idom[root] = root
    return idom, order


def retained(idom, order, own):
    """Retained size of every reachable node: its own size plus everything it dominates (reverse preorder)."""
    out = [0] * len(idom)
    root = order[0]
    for v in reversed(order):
        out[v] += own[v]
        if v != root:
            out[idom[v]] += out[v]
    return out


def shortest(succ, sources, n):
    """Multi-source BFS: parent[v] on one shortest path from a source (-1 at a source, -2 unreached)."""
    parent = [-2] * n
    queue = collections.deque()
    for s in sources:
        if parent[s] == -2:
            parent[s] = -1
            queue.append(s)
    while queue:
        v = queue.popleft()
        for w in succ[v]:
            if parent[w] == -2:
                parent[w] = v
                queue.append(w)
    return parent


# ---------------------------------------------------------------------------------------------------------------- reader

class Dump:
    """One heap dump: every object as a node, its references, its heap and the dump's roots."""

    def __init__(self, path):
        data = Path(path).read_bytes()
        self.data = data
        end = data.index(b'\0')
        self.version = data[:end].decode()
        idsize = struct.unpack_from('>I', data, end + 1)[0]
        assert idsize in (4, 8)
        self.idsize = idsize
        idfmt = '>I' if idsize == 4 else '>Q'
        self.idfmt = idfmt
        sizes = dict(SIZES)
        sizes[2] = idsize
        self.sizes = sizes
        rid = lambda o: struct.unpack_from(idfmt, data, o)[0]
        strings, classnames = {}, {}
        index = {}                  # object id -> node
        kind, ref, off, count, heap = [], [], [], [], []   # per node: INST/OARR/PARR/CLASS, class id or prim type, ...
        ids = []
        classes = {}                # class id -> dict(super, loader, size, fields [(name, type)], statics [(name, type, value)])
        roots = {}                  # object id -> root kind (first seen)
        heaps = ['default']
        cur = 0
        self.heap_records = 0

        def add(oid, k, r, o, n):
            if oid in index:
                return
            index[oid] = len(ids)
            ids.append(oid); kind.append(k); ref.append(r); off.append(o); count.append(n); heap.append(cur)
        o = end + 1 + 4 + 8
        while o < len(data):
            tag = data[o]
            length = struct.unpack_from('>I', data, o + 5)[0]
            body = o + 9
            o = body + length
            if tag == 0x01:
                strings[rid(body)] = data[body + idsize:body + length].decode('utf-8', 'replace')
            elif tag == 0x02:
                classnames[rid(body + 4)] = rid(body + 8 + idsize)
            elif tag in (0x0C, 0x1C):
                p = body
                while p < o:
                    sub = data[p]
                    p += 1
                    if sub in ROOT_EXTRA:
                        x, y = ROOT_EXTRA[sub]
                        roots.setdefault(rid(p), ROOTS[sub])
                        p += idsize * (1 + x) + 4 * y
                    elif sub == 0x90:  # UNREACHABLE (Dalvik): not a root
                        p += idsize
                    elif sub == 0xFE:  # HEAP_DUMP_INFO: the heap of every following object
                        name = strings.get(rid(p + 4), str(struct.unpack_from('>I', data, p)[0]))
                        if name not in heaps:
                            heaps.append(name)
                        cur = heaps.index(name)
                        self.heap_records += 1
                        p += 4 + idsize
                    elif sub == 0x20:
                        cid = rid(p)
                        sup = rid(p + idsize + 4)
                        loader = rid(p + 2 * idsize + 4)
                        isize = struct.unpack_from('>I', data, p + 7 * idsize + 4)[0]
                        p += 7 * idsize + 8
                        n = struct.unpack_from('>H', data, p)[0]
                        p += 2
                        for _ in range(n):
                            p += 3 + sizes[data[p + 2]]
                        n = struct.unpack_from('>H', data, p)[0]
                        p += 2
                        statics = []
                        for _ in range(n):
                            t = data[p + idsize]
                            statics.append((rid(p), t, p + idsize + 1))
                            p += idsize + 1 + sizes[t]
                        n = struct.unpack_from('>H', data, p)[0]
                        p += 2
                        fields = []
                        for _ in range(n):
                            fields.append((rid(p), data[p + idsize]))
                            p += idsize + 1
                        classes[cid] = {'super': sup, 'loader': loader, 'size': isize, 'fields': fields, 'statics': statics}
                        add(cid, CLASS, cid, 0, 0)
                    elif sub == 0x21:
                        iid = rid(p)
                        cid = rid(p + idsize + 4)
                        n = struct.unpack_from('>I', data, p + 2 * idsize + 4)[0]
                        add(iid, INST, cid, p + 2 * idsize + 8, n)
                        p += 2 * idsize + 8 + n
                    elif sub == 0x22:
                        aid = rid(p)
                        n = struct.unpack_from('>I', data, p + idsize + 4)[0]
                        cid = rid(p + idsize + 8)
                        add(aid, OARR, cid, p + 2 * idsize + 8, n)
                        p += 2 * idsize + 8 + n * idsize
                    elif sub == 0x23:
                        aid = rid(p)
                        n = struct.unpack_from('>I', data, p + idsize + 4)[0]
                        t = data[p + idsize + 8]
                        add(aid, PARR, t, p + idsize + 9, n)
                        p += idsize + 9 + n * sizes[t]
                    elif sub == 0xC3:  # PRIMITIVE_ARRAY_NODATA (Android): the array without its contents
                        aid = rid(p)
                        n = struct.unpack_from('>I', data, p + idsize + 4)[0]
                        add(aid, PARR, data[p + idsize + 8], -1, n)
                        p += idsize + 9
                    else:
                        raise ValueError(f'unknown heap sub-record 0x{sub:02x} at {p - 1}')
        self.strings, self.classnames, self.classes = strings, classnames, classes
        self.index, self.ids, self.kind, self.ref, self.off, self.count, self.heap = index, ids, kind, ref, off, count, heap
        self.heaps = heaps
        self.roots = roots
        self._layout = {}
        self._isref = {}
        self.string_class = next((c for c in classes if self.name(c) == 'java.lang.String'), None)
        self.reference_class = next((c for c in classes if self.name(c) == 'java.lang.ref.Reference'), None)
        self._graph()

    # names and layout
    def name(self, cid):
        return self.strings.get(self.classnames.get(cid), f'class@{cid:x}')

    def node_class(self, v):
        k = self.kind[v]
        if k == INST or k == CLASS:
            return self.name(self.ref[v])
        if k == OARR:
            return self.name(self.ref[v])
        return NAMES[self.ref[v]]

    def layout(self, cid):
        """[(offset, field name, type)] of an instance's fields, the class's own first, then each superclass's."""
        if cid not in self._layout:
            out, o, c = [], 0, cid
            while c in self.classes:
                for nid, t in self.classes[c]['fields']:
                    out.append((o, self.strings.get(nid, '?'), t))
                    o += self.sizes[t]
                c = self.classes[c]['super']
            self._layout[cid] = out
        return self._layout[cid]

    def is_reference(self, cid):
        if cid not in self._isref:
            c, hit = cid, False
            while c in self.classes and not hit:
                hit = c == self.reference_class
                c = self.classes[c]['super']
            self._isref[cid] = hit
        return self._isref[cid]

    def labelled(self, v):
        """[(field label, target object id, strong)] of node v."""
        data, k, rid = self.data, self.kind[v], self.idfmt
        out = []
        if k == INST:
            cid, base = self.ref[v], self.off[v]
            weak = self.is_reference(cid)
            for o, nm, t in self.layout(cid):
                if t == 2:
                    x = struct.unpack_from(rid, data, base + o)[0]
                    if x:
                        out.append((nm, x, not (weak and nm == 'referent')))
        elif k == OARR:
            base = self.off[v]
            for i in range(self.count[v]):
                x = struct.unpack_from(rid, data, base + i * self.idsize)[0]
                if x:
                    out.append((f'[{i}]', x, True))
        elif k == CLASS:
            c = self.classes[self.ref[v]]
            for nid, t, o in c['statics']:
                if t == 2:
                    x = struct.unpack_from(rid, data, o)[0]
                    if x:
                        out.append(('static ' + self.strings.get(nid, '?'), x, True))
            if c['loader']:
                out.append(('<loader>', c['loader'], True))
        return out

    def refs(self, v):
        """(strong, referent) target ids of node v, without labels (the graph's fast path)."""
        data, k, rid = self.data, self.kind[v], self.idfmt
        if k == INST:
            cid, base = self.ref[v], self.off[v]
            weak = self.is_reference(cid)
            strong, soft = [], []
            for o, nm, t in self.layout(cid):
                if t == 2:
                    x = struct.unpack_from(rid, data, base + o)[0]
                    if x:
                        (soft if weak and nm == 'referent' else strong).append(x)
            return strong, soft
        if k == OARR:
            n = self.count[v]
            fmt = ('>%dI' if self.idsize == 4 else '>%dQ') % n
            return [x for x in struct.unpack_from(fmt, data, self.off[v]) if x], []
        if k == CLASS:
            return [x for _, x, _ in self.labelled(v)], []
        return [], []

    def fields(self, v):
        """{name: value} of an instance's fields (references as ids)."""
        out = {}
        if self.kind[v] != INST:
            return out
        for o, nm, t in self.layout(self.ref[v]):
            fmt = self.idfmt if t == 2 else FMT[t]
            out.setdefault(nm, struct.unpack_from(fmt, self.data, self.off[v] + o)[0])
        return out

    def _graph(self):
        n = len(self.ids)
        index = self.index
        succ = [None] * (n + 1)
        weak = []
        for v in range(n):
            strong, soft = self.refs(v)
            succ[v] = [w for w in map(index.get, strong) if w is not None]
            weak.extend(w for w in map(index.get, soft) if w is not None)
        # The strings' characters: ART writes them as an array the String points to; they live inside the String.
        inline = set()
        if self.string_class is not None:
            for v in range(n):
                if self.kind[v] == INST and self.ref[v] == self.string_class:
                    val = self.fields(v).get('value')
                    w = index.get(val) if val else None
                    if w is not None and self.kind[w] == PARR:
                        inline.add(w)
        own = [0] * (n + 1)
        for v in range(n):
            k = self.kind[v]
            if k == INST:
                c = self.classes.get(self.ref[v])
                size = c['size'] if c and c['size'] else self.count[v]
                if self.ref[v] == self.string_class:
                    val = self.fields(v).get('value')
                    w = index.get(val) if val else None
                    chars = self.count[w] * SIZES[self.ref[w]] if w is not None and w in inline else 0
                    own[v] = align8(size + chars)
                else:
                    own[v] = align8(size)
            elif k == OARR:
                own[v] = align8(12 + 4 * self.count[v])
            elif k == PARR:
                es = SIZES[self.ref[v]]
                own[v] = 0 if v in inline else align8((16 if es == 8 else 12) + es * self.count[v])
            else:
                own[v] = sum(SIZES[t] if t != 2 else 4 for _, t, _ in self.classes[self.ref[v]]['statics'])
        self.inline = inline
        self.own = own
        self.weak_targets = weak
        # The super-root (node n) points at every root: the dump's root records, then every loaded class.
        rootkind = {}
        for x, kd in self.roots.items():
            w = index.get(x)
            if w is not None:
                rootkind.setdefault(w, kd)
        for v in range(n):
            if self.kind[v] == CLASS:
                rootkind.setdefault(v, 'class')
        self.rootkind = rootkind
        succ[n] = sorted(rootkind)
        self.succ = succ
        self.n = n
        self.super_root = n


# ---------------------------------------------------------------------------------------------------------------- report

def tier_of(cls):
    for i, prefixes in enumerate(TIERS):
        if cls.startswith(prefixes):
            return i
    return None


def path_to_root(d, parent, v):
    chain = []
    while v != -1 and v is not None:
        chain.append(v)
        v = parent[v] if parent[v] >= 0 else -1
    chain.reverse()
    root = chain[0]
    steps = []
    for a, b in zip(chain, chain[1:]):
        lbl = next((nm for nm, x, _ in d.labelled(a) if d.index.get(x) == b), '?')
        steps.append(f'{d.node_class(a)}.{lbl}')
    steps.append(d.node_class(chain[-1]))
    return {'root': d.rootkind.get(root, '?'), 'rootClass': d.node_class(root), 'steps': steps}


def analyse(d, label):
    n, R = d.n, d.super_root
    idom, order = dominators(n + 1, d.succ, R)
    app = d.heaps.index('app') if 'app' in d.heaps else None
    in_app = (lambda v: d.heap[v] == app) if app is not None else (lambda v: True)
    own_app = [d.own[v] if v < n and in_app(v) else 0 for v in range(n + 1)]
    ret = retained(idom, order, own_app)
    reach = set(order)
    reach.discard(R)
    parent = shortest(d.succ, d.succ[R], n + 1)

    per_heap = collections.OrderedDict()
    for hname in d.heaps:
        per_heap[hname] = {'objects': 0, 'bytes': 0, 'reachableObjects': 0, 'reachableBytes': 0}
    for v in range(n):
        h = per_heap[d.heaps[d.heap[v]]]
        h['objects'] += 1
        h['bytes'] += d.own[v]
        if v in reach:
            h['reachableObjects'] += 1
            h['reachableBytes'] += d.own[v]
    for h in per_heap.values():
        h['reachableMiB'] = round(h['reachableBytes'] / MIB, 2)
        h['unreachableMiB'] = round((h['bytes'] - h['reachableBytes']) / MIB, 2)
    weak_only = {w for w in d.weak_targets if w not in reach}
    # What only a referent reaches (soft, weak, phantom, finalizer): walk from those targets through unreached nodes.
    stack, wo = list(weak_only), set()
    while stack:
        v = stack.pop()
        if v in wo or v in reach:
            continue
        wo.add(v)
        stack.extend(d.succ[v])
    app_reach = sum(own_app[v] for v in reach)

    # Owners: nearest dominator in each tier, propagated in preorder (an idom precedes its children).
    near = [[-1] * (n + 1) for _ in TIERS]
    tier = [None] * (n + 1)
    for v in range(n):
        k = d.kind[v]
        if k == INST or k == CLASS:
            tier[v] = tier_of(d.node_class(v))
    for v in order:
        p = idom[v]
        for t in range(len(TIERS)):
            near[t][v] = v if tier[v] == t else (near[t][p] if v != R else -1)

    def owner(v):
        for t in range(len(TIERS)):
            o = near[t][v]
            if o != -1:
                return t, o
        return None, -1

    by_group, by_class = collections.Counter(), collections.Counter()
    by_class_count = collections.Counter()
    for v in reach:
        b = own_app[v]
        if not b:
            continue
        t, o = owner(v)
        if t is None:
            g, oc = '(no owner: ' + d.rootkind.get(root_of(parent, v), '?') + ')', '(none)'
        else:
            oc = d.node_class(o)
            g = oc.rsplit('.', 1)[0] if t == 0 else TIER_NAMES[t]
        by_group[g] += b
        by_class[(TIER_NAMES[t] if t is not None else '-', oc)] += b
        by_class_count[d.node_class(v)] += 1

    # Top retained objects (app bytes), each with one shortest path to a root.
    top = sorted((v for v in reach), key=lambda v: -ret[v])[:30]
    tops = []
    for v in top:
        t, o = owner(v)
        tops.append({'class': d.node_class(v), 'heap': d.heaps[d.heap[v]], 'shallow': d.own[v], 'retained': ret[v],
                     'retainedMiB': round(ret[v] / MIB, 2), 'idomClass': d.node_class(idom[v]) if idom[v] != R else '(root)',
                     'owner': d.node_class(o) if o != -1 else None, 'path': path_to_root(d, parent, v)})

    # Large arrays (12 KiB or more) and bitmaps, with what holds them.
    large = []
    for v in reach:
        if d.kind[v] in (PARR, OARR) and own_app[v] >= LARGE:
            t, o = owner(v)
            p = parent[v]
            fld = next((nm for nm, x, _ in d.labelled(p) if d.index.get(x) == v), '?') if p >= 0 else '(root)'
            large.append({'type': d.node_class(v), 'bytes': own_app[v], 'length': d.count[v],
                          'heldBy': f'{d.node_class(p)}.{fld}' if p >= 0 else d.rootkind.get(v, '?'),
                          'idomClass': d.node_class(idom[v]) if idom[v] != R else '(root)',
                          'owner': d.node_class(o) if o != -1 else None})
    large.sort(key=lambda r: -r['bytes'])
    large_by = collections.Counter()
    large_n = collections.Counter()
    for r in large:
        large_by[(r['owner'], r['heldBy'], r['type'])] += r['bytes']
        large_n[(r['owner'], r['heldBy'], r['type'])] += 1
    bitmaps = []
    for v in reach:
        if d.kind[v] == INST and d.node_class(v) == 'android.graphics.Bitmap':
            f = d.fields(v)
            t, o = owner(v)
            bitmaps.append({'width': f.get('mWidth'), 'height': f.get('mHeight'), 'retained': ret[v],
                            'nativePixelsEstimate': (f.get('mWidth') or 0) * (f.get('mHeight') or 0) * 4,
                            'owner': d.node_class(o) if o != -1 else None, 'path': path_to_root(d, parent, v)})
    per_class = collections.Counter()
    for v in reach:
        if own_app[v]:
            per_class[d.node_class(v)] += own_app[v]
    root_counts = collections.Counter(d.rootkind.values())
    return {
        'label': label, 'version': d.version, 'heapRecords': d.heap_records, 'heaps': d.heaps, 'objects': n,
        'roots': dict(root_counts.most_common()),
        'perHeap': per_heap,
        'app': {'heap': 'app' if app is not None else '(no heap ids: every object)',
                'reachableBytes': app_reach, 'reachableMiB': round(app_reach / MIB, 2),
                'onlyThroughReferentBytes': sum(own_app[v] for v in wo), 'onlyThroughReferentObjects': len(wo),
                'stringCharsInline': len(d.inline)},
        'topRetained': tops,
        'byOwnerGroup': [{'owner': g, 'bytes': b, 'MiB': round(b / MIB, 2), 'share': round(b / app_reach, 4)}
                         for g, b in by_group.most_common()],
        'byOwnerClass': [{'tier': t, 'owner': c, 'bytes': b, 'MiB': round(b / MIB, 2), 'share': round(b / app_reach, 4)}
                         for (t, c), b in by_class.most_common(60)],
        'largeArrays': {'count': len(large), 'bytes': sum(r['bytes'] for r in large),
                        'byHolder': [{'owner': k[0], 'heldBy': k[1], 'type': k[2], 'count': large_n[k], 'bytes': b,
                                      'MiB': round(b / MIB, 2)} for k, b in large_by.most_common(40)],
                        'largest': large[:40]},
        'bitmaps': {'count': len(bitmaps), 'nativePixelsEstimate': sum(b['nativePixelsEstimate'] for b in bitmaps),
                    'list': sorted(bitmaps, key=lambda b: -b['nativePixelsEstimate'])[:20]},
        'perClass': dict(per_class.most_common()),
        'perClassCount': dict(by_class_count),
        '_byOwnerClass': {f'{t}|{c}': b for (t, c), b in by_class.items()},
    }


def root_of(parent, v):
    while parent[v] >= 0:
        v = parent[v]
    return v


# ------------------------------------------------------------------------------------------------------- reconciliation

def p18_gc_reader():
    """perf-p18-gc.py's own reader (its LINE and UNIT), loaded without running its main()."""
    src = (HERE / 'perf-p18-gc.py').read_text()
    src = src[:src.rindex('\nmain()')]
    ns = {'__name__': 'perf_p18_gc'}
    exec(compile(src, str(HERE / 'perf-p18-gc.py'), 'exec'), ns)
    return ns


def gc_for_dump(logcat, remote):
    """The last GC line before the dump's `hprof: heap dump "...remote" starting` line, and the dump's own line."""
    ns = p18_gc_reader()
    LINE, UNIT = ns['LINE'], ns['UNIT']
    last, gcs = None, []
    for ln in Path(logcat).read_text(errors='replace').splitlines():
        m = LINE.search(ln)
        if m:
            last = {'line': ln.strip(), 'young': bool(m[1]), 'explicit': 'Explicit' in ln,
                    'freedMiB': round(int(m[3]) * UNIT[m[4]], 2), 'losFreedMiB': round(int(m[6]) * UNIT[m[7]], 2),
                    'freePercent': int(m[8]), 'usedMB': int(m[9]), 'footprintMB': int(m[10])}
            gcs.append(last)
        if 'hprof: heap dump' in ln and remote in ln and 'starting' in ln:
            return {'gc': last, 'dumpStart': ln.strip(), 'gcsBefore': gcs[-3:]}
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out', type=Path)
    ap.add_argument('dumps', nargs='+', help='LABEL=PATH')
    ap.add_argument('--gc-log', type=Path)
    ap.add_argument('--remote', action='append', default=[], help='LABEL=device file name')
    ap.add_argument('--grow', action='append', default=[], help='A:B, two labels of one run')
    a = ap.parse_args()
    remote = dict(x.split('=', 1) for x in a.remote)
    results, keep = [], {}
    for item in a.dumps:
        label, path = item.split('=', 1)
        d = Dump(path)
        r = analyse(d, label)
        r['path'] = path
        if a.gc_log and label in remote:
            g = gc_for_dump(a.gc_log, remote[label])
            r['reconciliation'] = recon(r, g)
        keep[label] = {'perClass': r.pop('perClass'), 'count': r.pop('perClassCount'), 'owner': r.pop('_byOwnerClass')}
        results.append(r)
        print(label, r['app'], {h: v['reachableMiB'] for h, v in r['perHeap'].items()}, r.get('reconciliation', {}).get('verdict'),
              flush=True)
        del d
    out = {'what': __doc__.strip().split('\n\n')[0], 'dumps': results}
    grows = []
    for pair in a.grow:
        x, y = pair.split(':')
        grows.append(grow(x, y, keep[x], keep[y]))
    if grows:
        out['grew'] = grows
    a.out.write_text(json.dumps(out, indent=1, default=str) + '\n')


def recon(r, g):
    if not g or not g['gc']:
        return {'verdict': 'no GC line before the dump', 'gc': g}
    used = g['gc']['usedMB']
    app = r['app']['reachableMiB']
    zyg = r['perHeap'].get('zygote', {}).get('reachableMiB', 0.0)
    return {'gc': g['gc'], 'dumpStart': g['dumpStart'], 'artSurvivorsMB': used, 'appReachableMiB': app,
            'appPlusZygoteReachableMiB': round(app + zyg, 2),
            'appDiffPercent': round(100 * (app - used) / used, 1),
            'appPlusZygoteDiffPercent': round(100 * (app + zyg - used) / used, 1),
            'verdict': 'within 10%' if abs(app - used) <= 0.1 * used else 'differs by more than 10%: explain before ranking'}


def grow(x, y, a, b):
    rows = []
    for c in set(a['perClass']) | set(b['perClass']):
        dv = b['perClass'].get(c, 0) - a['perClass'].get(c, 0)
        dn = b['count'].get(c, 0) - a['count'].get(c, 0)
        if dv or dn:
            rows.append({'class': c, 'bytes': dv, 'objects': dn, 'from': a['perClass'].get(c, 0), 'to': b['perClass'].get(c, 0)})
    rows.sort(key=lambda r: -r['bytes'])
    own = []
    for c in set(a['owner']) | set(b['owner']):
        dv = b['owner'].get(c, 0) - a['owner'].get(c, 0)
        if dv:
            own.append({'owner': c, 'bytes': dv, 'from': a['owner'].get(c, 0), 'to': b['owner'].get(c, 0)})
    own.sort(key=lambda r: -r['bytes'])
    total = sum(b['perClass'].values()) - sum(a['perClass'].values())
    return {'from': x, 'to': y, 'appReachableDeltaBytes': total, 'appReachableDeltaMiB': round(total / MIB, 2),
            'grewByClass': rows[:30], 'shrankByClass': rows[::-1][:15], 'grewByOwner': own[:25], 'shrankByOwner': own[::-1][:10]}


if __name__ == '__main__':
    main()
