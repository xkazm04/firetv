package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P17: the profiler's per-frame scheduler split (perf package only), read from the render thread's own /proc schedstat. */
class SchedProfileTest {
    private class Platform(var sched: LongArray?) : ProfilePlatform {
        override fun cpuNanos() = 0L
        override fun begin(name: String) {}
        override fun end() {}
        override fun runtimeJson() = "{}"
        override fun schedNanos(out: LongArray): Boolean { val s = sched ?: return false; out[0] = s[0]; out[1] = s[1]; return true }
    }
    private fun rows(profiler: FrameProfiler): List<List<Double>> {
        val json = profiler.trace.json()
        return Regex("\\[([-0-9.,E]+)\\]").findAll(json.substringAfter("\"rows\":")).map { m -> m.groupValues[1].split(',').map(String::toDouble) }.toList()
    }

    @Test fun parsesTheKernelLine() {
        val out = LongArray(2)
        val line = "123456789 98765 4321\n".toByteArray()
        assertTrue(SchedStat.parse(line, line.size, out))
        assertArrayEquals(longArrayOf(123456789, 98765), out)
        val big = "8123456789012 77 1\n".toByteArray()
        assertTrue(SchedStat.parse(big, big.size, out))
        assertEquals(8123456789012, out[0])
        for (bad in listOf("", "12", "x 1 2", "12 \n")) assertFalse(SchedStat.parse(bad.toByteArray(), bad.length, LongArray(2)), bad)
    }

    @Test fun columnsCoverTheRowsInterval() {
        val platform = Platform(longArrayOf(1_000_000_000, 50_000_000))
        val profiler = FrameProfiler(platform)
        val run = profiler.trace.columns.indexOf("schedRunMs")
        val wait = profiler.trace.columns.indexOf("schedWaitMs")
        assertEquals(listOf(38, 39), listOf(run, wait))
        profiler.begin(0, 0.0); profiler.finish(true, 6, 0, 0, 0, 0)
        platform.sched = longArrayOf(1_009_500_000, 52_250_000)
        profiler.begin(16_683_350, .01668335); profiler.finish(true, 6, 0, 0, 0, 0)
        val r = rows(profiler)
        assertEquals(-1.0, r[0][run]); assertEquals(-1.0, r[0][wait])
        assertEquals(9.5, r[1][run], 1e-9); assertEquals(2.25, r[1][wait], 1e-9)
    }

    @Test fun offWhenThePlatformDoesNotRead() {
        val profiler = FrameProfiler(Platform(null))
        repeat(2) { profiler.begin(it * 16_683_350L, .0166); profiler.finish(true, 6, 0, 0, 0, 0) }
        val run = profiler.trace.columns.indexOf("schedRunMs")
        for (row in rows(profiler)) { assertEquals(-1.0, row[run]); assertEquals(-1.0, row[run + 1]) }
    }
}
