package dev.telestrator.core

import kotlin.math.hypot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

/**
 * Normalized space is per axis (x over the picture width, y over its height), so on a 16:9 picture
 * one unit of y is 0.5625 of one unit of x on screen. Every distance core measures must be in
 * content-width units - the unit the TV draws radii in (ContentRect.w) - or a ring dragged straight
 * down lands 1.78x too large and the eraser misses what the viewer sees.
 */
class MetricTest {

    private val aspect = 16.0 / 9.0

    private fun shape(tool: String, from: List<Double>, to: List<Double>): Annotation {
        val e = PenEngine("c")
        e.accept(PenMessage.Shape(tool, from, to), 0)
        return e.doc.annotations.single()
    }

    @Test
    fun `case 1 - a ring dragged straight down is drawn the size of the drag`() {
        val c = shape("circle", listOf(0.5, 0.5), listOf(0.5, 0.6)) as Annotation.Circle
        assertEquals(0.05625, c.radius, 1e-9)
        // 0.1 of a 1080 px picture height is 108 px; the TV draws the radius in width units.
        assertEquals(108f, ContentRect.fit(1920f, 1080f, aspect).w(c.radius), 1e-3f)
    }

    @Test
    fun `case 2 GUARD - a horizontal drag is unchanged and the spotlight floor still holds`() {
        val c = shape("circle", listOf(0.5, 0.5), listOf(0.6, 0.5)) as Annotation.Circle
        assertEquals(0.1, c.radius, 1e-12)
        val s = shape("spotlight", listOf(0.5, 0.5), listOf(0.5, 0.51)) as Annotation.Spotlight
        assertEquals(0.03, s.radius, 1e-12)
    }

    @Test
    fun `case 3 - a diagonal spotlight takes the on-screen length of the drag`() {
        val s = shape("spotlight", listOf(0.5, 0.5), listOf(0.6, 0.6)) as Annotation.Spotlight
        assertEquals(hypot(0.1, 0.05625), s.radius, 1e-6)
        assertEquals(0.114735, s.radius, 1e-6)
    }

    private val ring = Annotation.Circle("c", 0, 10_000, center = listOf(0.5, 0.5), radius = 0.1)

    @Test
    fun `case 4 - the top of a ring as drawn is on the ring`() {
        assertEquals("c", HitTest.pick(listOf(ring), 0.5, 0.5 - 0.1 * aspect, Metric(aspect))?.id)
    }

    @Test
    fun `case 5 - empty air inside a ring is not the ring`() {
        assertNull(HitTest.pick(listOf(ring), 0.5, 0.4, Metric(aspect)))
    }

    @Test
    fun `case 6 - the whole drawn spotlight is grabbable, top to bottom`() {
        val spot = Annotation.Spotlight("sp", 0, 10_000, center = listOf(0.5, 0.5), radius = 0.1)
        assertEquals("sp", HitTest.pick(listOf(spot), 0.5, 0.66, Metric(aspect))?.id)
    }

    @Test
    fun `case 7 - the tolerance band is as tall as it is wide`() {
        val horizontal = Annotation.Stroke(
            "h", 0, 10_000,
            points = listOf(listOf(0.2, 0.5, 0.5), listOf(0.8, 0.5, 0.5)),
        )
        val vertical = Annotation.Stroke(
            "v", 0, 10_000,
            points = listOf(listOf(0.5, 0.2, 0.5), listOf(0.5, 0.8, 0.5)),
        )
        // 0.04 of the height is 0.0225 of the width on screen, the same as the side tap below.
        assertEquals("h", HitTest.pick(listOf(horizontal), 0.5, 0.54, Metric(aspect))?.id)
        assertEquals("v", HitTest.pick(listOf(vertical), 0.5225, 0.5, Metric(aspect))?.id)
    }
}
