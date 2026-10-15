package dev.telestrator.tv

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** The numbers /health reports as the overlay's draw budget (design doc: under 4 ms). */
class RenderStatsTest {

    @BeforeEach
    fun clear() = RenderStats.reset()

    @Test
    fun `no frame drawn yet reads as zeros`() {
        assertEquals(RenderStats.Snapshot(0.0, 0.0, 0.0, 0), RenderStats.snapshot())
    }

    @Test
    fun `percentiles come from the recorded frames`() {
        // 1..100 ms, recorded out of order.
        (1..100).shuffled(java.util.Random(7)).forEach { RenderStats.record(it * 1_000_000L) }
        val s = RenderStats.snapshot()
        assertEquals(100, s.frames)
        assertEquals(51.0, s.p50Ms)
        assertEquals(96.0, s.p95Ms)
        assertEquals(100.0, s.maxMs)
    }

    @Test
    fun `the window keeps only the newest 120 frames`() {
        repeat(120) { RenderStats.record(50_000_000L) }
        repeat(120) { RenderStats.record(1_000_000L) }
        val s = RenderStats.snapshot()
        assertEquals(120, s.frames)
        assertEquals(1.0, s.maxMs)
    }
}
