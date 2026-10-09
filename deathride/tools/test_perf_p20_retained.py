import importlib.util, random, struct, tempfile, unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('perf_p20_retained', Path(__file__).with_name('perf-p20-retained.py'))
p20 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p20)


def graph(n, edges):
    succ = [[] for _ in range(n)]
    for a, b in edges:
        succ[a].append(b)
    return succ


def brute_idom(n, succ, root):
    """Dominators by their definition: d dominates v when v is unreachable from root once d is removed."""
    def reach(skip):
        seen, stack = set(), [root] if root != skip else []
        while stack:
            v = stack.pop()
            if v in seen:
                continue
            seen.add(v)
            stack.extend(w for w in succ[v] if w != skip)
        return seen
    live = reach(None)
    doms = {v: {d for d in live if d == v or v not in reach(d)} for v in live}
    idom = [-1] * n
    for v in live:
        if v == root:
            idom[v] = root
            continue
        strict = doms[v] - {v}
        # The immediate dominator is the strict dominator that every other strict dominator dominates.
        idom[v] = next(d for d in strict if all(o in doms[d] for o in strict))
    return idom


class DominatorTest(unittest.TestCase):
    def test_shared_child_and_cycles_by_hand(self):
        # 0 root; A=1 B=2 C=3 D=4 E=5 F=6 G=7 (unreachable).
        # A and B share C (so the root dominates C); C<->D is a cycle; F->A closes a cycle back to A; G->C is garbage.
        succ = graph(8, [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (4, 3), (4, 5), (1, 6), (6, 1), (7, 3)])
        idom, order = p20.dominators(8, succ, 0)
        self.assertEqual(idom, [0, 0, 0, 0, 3, 4, 1, -1])
        self.assertEqual(order[0], 0)
        self.assertNotIn(7, order)
        own = [0, 1, 2, 4, 8, 16, 32, 64]
        ret = p20.retained(idom, order, own)
        self.assertEqual(ret[5], 16)
        self.assertEqual(ret[4], 24)
        self.assertEqual(ret[3], 28)        # the shared child is retained by neither A nor B
        self.assertEqual(ret[6], 32)
        self.assertEqual(ret[1], 33)
        self.assertEqual(ret[2], 2)
        self.assertEqual(ret[0], 63)        # the garbage node G (64) is not retained by anything
        self.assertEqual(ret[7], 0)

    def test_lengauer_tarjan_paper_graph(self):
        R, A, B, C, D, E, F, G, H, I, J, K, L = range(13)
        succ = graph(13, [(R, A), (R, B), (R, C), (A, D), (B, A), (B, D), (B, E), (C, F), (C, G), (D, L), (E, H),
                          (F, I), (G, I), (G, J), (H, E), (H, K), (I, K), (J, I), (K, I), (K, R), (L, H)])
        idom, _ = p20.dominators(13, succ, R)
        self.assertEqual(idom, [R, R, R, R, R, R, C, C, R, R, G, R, D])

    def test_random_graphs_match_the_definition(self):
        rng = random.Random(20)
        for _ in range(300):
            n = rng.randint(1, 14)
            edges = [(rng.randrange(n), rng.randrange(n)) for _ in range(rng.randint(0, 3 * n))]
            succ = graph(n, edges)
            idom, order = p20.dominators(n, succ, 0)
            self.assertEqual(idom, brute_idom(n, succ, 0), edges)
            own = [rng.randint(0, 9) for _ in range(n)]
            ret = p20.retained(idom, order, own)
            for v in order:
                subtree = [w for w in order if self._dominated(idom, w, v)]
                self.assertEqual(ret[v], sum(own[w] for w in subtree))

    @staticmethod
    def _dominated(idom, w, v):
        while True:
            if w == v:
                return True
            if idom[w] == w:
                return False
            w = idom[w]

    def test_shortest_path_parents(self):
        succ = graph(6, [(0, 1), (1, 2), (2, 3), (0, 4), (4, 3), (3, 5)])
        parent = p20.shortest(succ, [0], 6)
        self.assertEqual(parent[3], 4)
        self.assertEqual(parent[5], 3)
        self.assertEqual(parent[0], -1)


class Hprof:
    """A minimal ART-style dump (JAVA PROFILE 1.0.3, 4-byte ids) built record by record."""

    def __init__(self):
        self.out = bytearray(b'JAVA PROFILE 1.0.3\0' + struct.pack('>IQ', 4, 0))
        self.heap = bytearray()
        self.sid = 1000

    def string(self, text):
        self.sid += 1
        b = struct.pack('>I', self.sid) + text.encode()
        self.out += struct.pack('>BII', 0x01, 0, len(b)) + b
        return self.sid

    def load(self, cid, name):
        nid = self.string(name)
        self.out += struct.pack('>BIIIII', 0x02, 0, 16, cid, cid, 0) + struct.pack('>I', nid)
        # (serial, class id, stack serial, name id) - the serial reuses the class id

    def info(self, name):
        self.heap += struct.pack('>BII', 0xFE, ord(name[0].upper()), self.string(name))

    def cls(self, cid, sup, size, fields, statics=()):
        b = struct.pack('>BIIIIIIII', 0x20, cid, 0, sup, 0, 0, 0, 0, 0) + struct.pack('>IH', size, 0)
        b += struct.pack('>H', len(statics))
        for name, t, value in statics:
            b += struct.pack('>IB', self.string(name), t) + (struct.pack('>I', value) if t in (2, 10) else b'')
        b += struct.pack('>H', len(fields))
        for name, t in fields:
            b += struct.pack('>IB', self.string(name), t)
        self.heap += b

    def inst(self, oid, cid, values):
        data = b''.join(struct.pack('>I', v) for v in values)
        self.heap += struct.pack('>BIIII', 0x21, oid, 0, cid, len(data)) + data

    def prim(self, oid, t, payload, n):
        self.heap += struct.pack('>BIIIB', 0x23, oid, 0, n, t) + payload

    def root(self, sub, oid, extra=b''):
        self.heap += struct.pack('>BI', sub, oid) + extra

    def bytes(self):
        return bytes(self.out + struct.pack('>BII', 0x1C, 0, len(self.heap)) + self.heap + struct.pack('>BII', 0x2C, 0, 0))


class ReaderTest(unittest.TestCase):
    def build(self, heap_ids=True):
        h = Hprof()
        OBJ, STR, REF, WEAK, HOLD = 0x10, 0x11, 0x12, 0x13, 0x14
        for cid, name in ((OBJ, 'java.lang.Object'), (STR, 'java.lang.String'), (REF, 'java.lang.ref.Reference'),
                          (WEAK, 'java.lang.ref.WeakReference'), (HOLD, 'dev.deathride.game.Holder')):
            h.load(cid, name)
        if heap_ids:
            h.info('image')
        h.cls(OBJ, 0, 8, [('shadow$_klass_', 2), ('shadow$_monitor_', 10)])
        h.cls(STR, OBJ, 16, [('count', 10), ('hash', 10), ('value', 2)])
        h.cls(REF, OBJ, 12, [('referent', 2)])
        h.cls(WEAK, REF, 12, [])
        if heap_ids:
            h.info('app')
        h.cls(HOLD, OBJ, 20, [('a', 2), ('b', 2), ('n', 10)], statics=[('COUNT', 10, 3)])
        H1, H2, H3, ARR, S, SV, WR = 0x100, 0x101, 0x102, 0x200, 0x300, 0x304, 0x400
        h.inst(H1, HOLD, [ARR, S, 7, HOLD, 0])            # Holder's fields, then Object's
        h.inst(H2, HOLD, [H1, 0, 1, HOLD, 0])             # garbage pointing at live data
        h.inst(H3, HOLD, [0, 0, 2, HOLD, 0])              # only a referent reaches it
        h.prim(ARR, 10, bytes(16000), 4000)               # int[4000]: 16,016 B, a large object
        h.inst(S, STR, [2, 0, SV, STR, 0])
        h.prim(SV, 8, b'hi', 2)                           # the String's characters, inline in ART
        h.inst(WR, WEAK, [H3, WEAK, 0])
        h.root(0x03, H1, struct.pack('>II', 1, 0))        # java-frame
        h.root(0x8E, H1, struct.pack('>II', 1, 0))        # jni-monitor on the same object: first kind kept
        h.root(0x01, WR, struct.pack('>I', 0x999))        # jni-global
        h.root(0x8D, 0x777)                               # vm-internal on an object not in the dump
        f = tempfile.NamedTemporaryFile(suffix='.hprof', delete=False)
        f.write(h.bytes())
        f.close()
        self.addCleanup(Path(f.name).unlink)
        return p20.Dump(f.name)

    def test_heaps_sizes_roots_and_retention(self):
        d = self.build()
        r = p20.analyse(d, 't')
        app = r['perHeap']['app']
        self.assertEqual(app['objects'], 8)
        self.assertEqual(app['reachableObjects'], 6)     # Holder class, H1, int[], String, its chars, the WeakReference
        self.assertEqual(r['app']['reachableBytes'], 4 + 24 + 16016 + 24 + 16)
        self.assertEqual(r['app']['onlyThroughReferentBytes'], 24)
        self.assertEqual(r['perHeap']['image']['reachableObjects'], 4)
        self.assertEqual(r['roots']['java-frame'], 1)
        self.assertEqual(r['roots']['jni-global'], 1)
        top = r['topRetained'][0]
        self.assertEqual(top['class'], 'dev.deathride.game.Holder')
        self.assertEqual(top['retained'], 24 + 16016 + 24)
        self.assertEqual(top['path']['root'], 'java-frame')
        big = r['largeArrays']['largest'][0]
        self.assertEqual((big['type'], big['bytes'], big['heldBy'], big['owner']),
                         ('int[]', 16016, 'dev.deathride.game.Holder.a', 'dev.deathride.game.Holder'))
        groups = {g['owner']: g['bytes'] for g in r['byOwnerGroup']}
        self.assertEqual(groups['dev.deathride.game'], 4 + 24 + 16016 + 24)
        self.assertEqual(sum(groups.values()), r['app']['reachableBytes'])

    def test_converted_dump_without_heap_ids(self):
        d = self.build(heap_ids=False)
        r = p20.analyse(d, 't')
        self.assertEqual(r['heaps'], ['default'])
        self.assertEqual(r['app']['reachableBytes'], 4 + 24 + 16016 + 24 + 16)

    def test_the_dumps_gc_line_read_by_perf_p18_gc(self):
        log = tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False)
        log.write('10-09 10:00:00.000 1 2 I x: Background concurrent copying GC freed 5(1MB) AllocSpace objects, 1(2MB) LOS '
                  'objects, 30% free, 60MB/84MB, paused 1ms total 120ms\n'
                  '10-09 10:00:01.000 1 2 I x: Explicit concurrent copying GC freed 9(3MB) AllocSpace objects, 2(4MB) LOS '
                  'objects, 49% free, 51MB/99MB, paused 90us total 300.5ms\n'
                  '10-09 10:00:02.000 1 1 I x: hprof: heap dump "/data/local/tmp/p20-a.hprof" starting...\n'
                  '10-09 10:00:03.000 1 2 I x: Explicit concurrent copying GC freed 9(3MB) AllocSpace objects, 2(4MB) LOS '
                  'objects, 49% free, 40MB/80MB, paused 90us total 300.5ms\n')
        log.close()
        self.addCleanup(Path(log.name).unlink)
        g = p20.gc_for_dump(log.name, 'p20-a.hprof')
        self.assertEqual((g['gc']['usedMB'], g['gc']['footprintMB'], g['gc']['explicit']), (51, 99, True))
        r = p20.recon({'app': {'reachableMiB': 50.0}, 'perHeap': {'zygote': {'reachableMiB': 2.0}}}, g)
        self.assertEqual((r['appDiffPercent'], r['verdict']), (-2.0, 'within 10%'))

    def test_growth_between_two_dumps(self):
        a = {'perClass': {'X': 100, 'Y': 50}, 'count': {'X': 1, 'Y': 1}, 'owner': {'dev.deathride|A': 150}}
        b = {'perClass': {'X': 400, 'Z': 8}, 'count': {'X': 4, 'Z': 1}, 'owner': {'dev.deathride|A': 408}}
        g = p20.grow('b', 'c', a, b)
        self.assertEqual(g['appReachableDeltaBytes'], 258)
        self.assertEqual(g['grewByClass'][0], {'class': 'X', 'bytes': 300, 'objects': 3, 'from': 100, 'to': 400})
        self.assertEqual(g['shrankByClass'][0]['class'], 'Y')


if __name__ == '__main__':
    unittest.main()
