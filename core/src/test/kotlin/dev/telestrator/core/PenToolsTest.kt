package dev.telestrator.core

import kotlin.math.abs
import kotlin.math.hypot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class SmoothingTest {

    private fun line(n: Int) = (0..n).map { listOf(it / n.toDouble(), 0.5, 0.5) }

    @Test
    fun `decimation drops samples from a finger that is not moving`() {
        val jittery = List(50) { listOf(0.5 + it * 1e-5, 0.5, 0.5) }
        val out = Smoothing.decimate(jittery)
        assertEquals(2, out.size, "a stationary finger should collapse to its endpoints")
        assertEquals(jittery.first(), out.first())
        assertEquals(jittery.last(), out.last())
    }

    @Test
    fun `decimation keeps the shape of a real gesture`() {
        val stroke = line(40)
        val out = Smoothing.decimate(stroke, minDistance = 0.004)
        assertTrue(out.size in 10..41, "unexpected point count: ${out.size}")
        assertEquals(stroke.first(), out.first())
        assertEquals(stroke.last(), out.last())
    }

    @Test
    fun `the curve starts and ends exactly on the finger's own samples`() {
        val pts = listOf(
            listOf(0.1, 0.5, 0.5), listOf(0.3, 0.2, 0.5),
            listOf(0.6, 0.8, 0.5), listOf(0.9, 0.4, 0.5),
        )
        val cubics = Smoothing.toCubics(pts)
        assertEquals(3, cubics.size)
        assertEquals(0.1, cubics.first().x0, 1e-9)
        assertEquals(0.5, cubics.first().y0, 1e-9)
        assertEquals(0.9, cubics.last().x1, 1e-9)
        assertEquals(0.4, cubics.last().y1, 1e-9)
    }

    @Test
    fun `a straight line stays straight after smoothing`() {
        val cubics = Smoothing.toCubics(line(8))
        // Control points of a straight run must sit on the line, or the stroke bulges.
        cubics.forEach {
            assertEquals(0.5, it.c1y, 1e-9)
            assertEquals(0.5, it.c2y, 1e-9)
        }
    }

    @Test
    fun `zero tension degenerates to the raw polyline`() {
        val pts = listOf(listOf(0.0, 0.0, 0.5), listOf(0.5, 1.0, 0.5), listOf(1.0, 0.0, 0.5))
        val cubics = Smoothing.toCubics(pts, tension = 0.0)
        cubics.forEach {
            assertEquals(it.x0, it.c1x, 1e-9)
            assertEquals(it.y1, it.c2y, 1e-9)
        }
    }

    @Test
    fun `fewer than two points cannot make a curve`() {
        assertTrue(Smoothing.toCubics(emptyList()).isEmpty())
        assertTrue(Smoothing.toCubics(listOf(listOf(0.5, 0.5, 0.5))).isEmpty())
    }

    @Test
    fun `pressure widens the stroke and a device reporting nothing draws a constant line`() {
        val base = 0.006
        assertTrue(Smoothing.widthFor(base, 1.0) > Smoothing.widthFor(base, 0.0))
        // A touchscreen with no pressure sensor reports 0.5 for every sample.
        val flat = List(5) { Smoothing.widthFor(base, 0.5) }
        assertEquals(1, flat.distinct().size)
        // Out-of-range values from a misbehaving browser must not produce a negative width.
        assertTrue(Smoothing.widthFor(base, -3.0) > 0.0)
    }
}

class HitTestTest {

    private val stroke = Annotation.Stroke(
        "s", 0, 10_000,
        points = listOf(listOf(0.2, 0.5, 0.5), listOf(0.8, 0.5, 0.5)),
    )
    private val circle = Annotation.Circle("c", 0, 10_000, center = listOf(0.5, 0.5), radius = 0.2)
    private val arrow = Annotation.Arrow("ar", 0, 10_000, from = listOf(0.1, 0.1), to = listOf(0.3, 0.1))

    @Test
    fun `distance to a segment clamps at the ends instead of using the infinite line`() {
        // Straight out from the middle.
        assertEquals(0.1, HitTest.pointToSegment(0.5, 0.6, 0.2, 0.5, 0.8, 0.5), 1e-9)
        // Beyond the end: distance must grow along the axis, not stay at zero.
        assertEquals(0.2, HitTest.pointToSegment(1.0, 0.5, 0.2, 0.5, 0.8, 0.5), 1e-9)
    }

    @Test
    fun `a tap on the ink picks the stroke and a tap away from it picks nothing`() {
        assertEquals("s", HitTest.pick(listOf(stroke), 0.5, 0.51)?.id)
        assertNull(HitTest.pick(listOf(stroke), 0.5, 0.9))
    }

    @Test
    fun `a circle is grabbed by its ring, not by the space it encloses`() {
        assertNotNull(HitTest.pick(listOf(circle), 0.7, 0.5), "on the ring")
        assertNull(HitTest.pick(listOf(circle), 0.5, 0.5), "the middle of a ring is not the ring")
    }

    @Test
    fun `a spotlight is grabbed anywhere inside it`() {
        val spot = Annotation.Spotlight("sp", 0, 10_000, center = listOf(0.5, 0.5), radius = 0.2)
        assertNotNull(HitTest.pick(listOf(spot), 0.5, 0.5))
        assertNull(HitTest.pick(listOf(spot), 0.95, 0.95))
    }

    @Test
    fun `the most recently drawn annotation wins where they overlap`() {
        val overlapping = Annotation.Stroke(
            "top", 0, 10_000,
            points = listOf(listOf(0.2, 0.505, 0.5), listOf(0.8, 0.505, 0.5)),
        )
        assertEquals("top", HitTest.pick(listOf(stroke, overlapping), 0.5, 0.5)?.id)
    }

    @Test
    fun `tolerance is honoured`() {
        assertNull(HitTest.pick(listOf(arrow), 0.2, 0.15, tolerance = 0.01))
        assertNotNull(HitTest.pick(listOf(arrow), 0.2, 0.15, tolerance = 0.1))
    }
}

class HistoryTest {

    private fun a(id: String) = Annotation.Arrow(id, 0, 10, from = listOf(0.0, 0.0), to = listOf(1.0, 1.0))

    @Test
    fun `undoing an erase puts the annotation back where it was, not on the end`() {
        val list = mutableListOf<Annotation>(a("1"), a("2"), a("3"))
        val h = History()

        val removed = list.removeAt(1)
        h.record(Op.Remove(1, removed))
        assertEquals(listOf("1", "3"), list.map { it.id })

        assertTrue(h.undo(list))
        assertEquals(listOf("1", "2", "3"), list.map { it.id }, "order must be preserved")
    }

    @Test
    fun `clear is one undoable operation, not one per annotation`() {
        val list = mutableListOf<Annotation>(a("1"), a("2"), a("3"))
        val h = History()
        h.record(Op.ClearAll(list.toList()))
        list.clear()

        assertTrue(h.undo(list))
        assertEquals(3, list.size)
        assertFalse(h.canUndo)
    }

    @Test
    fun `drawing after an undo abandons the redo branch`() {
        val list = mutableListOf<Annotation>()
        val h = History()
        list += a("1"); h.record(Op.Add(a("1")))
        h.undo(list)
        assertTrue(h.canRedo)

        list += a("2"); h.record(Op.Add(a("2")))
        assertFalse(h.canRedo, "a new drawing must not leave a stale redo target")
    }

    @Test
    fun `undo and redo on an empty history are no-ops rather than errors`() {
        val list = mutableListOf<Annotation>()
        val h = History()
        assertFalse(h.undo(list))
        assertFalse(h.redo(list))
    }
}

class PenToolsEngineTest {

    private fun pen(phase: String, vararg pts: Pair<Double, Double>, hold: String? = null) =
        PenMessage.Pen(phase = phase, hold = hold, pts = pts.map { listOf(it.first, it.second, 0.5, 0.0) })

    private fun drawLine(e: PenEngine, tMs: Long, y: Double = 0.5, hold: String? = null) {
        e.accept(pen("down", 0.2 to y, hold = hold), tMs)
        e.accept(pen("move", 0.5 to y, hold = hold), tMs)
        e.accept(pen("up", 0.8 to y, hold = hold), tMs)
    }

    @Test
    fun `the eraser removes what was tapped and undo brings it back in order`() {
        val e = PenEngine("c")
        drawLine(e, 1000, y = 0.3)
        drawLine(e, 1000, y = 0.5)
        drawLine(e, 1000, y = 0.7)
        assertEquals(3, e.annotationCount)

        e.accept(PenMessage.Erase(x = 0.5, y = 0.5), 1000)
        assertEquals(2, e.annotationCount)
        val ys = e.doc.annotations.map { (it as Annotation.Stroke).points[0][1] }
        assertEquals(listOf(0.3, 0.7), ys)

        e.accept(PenMessage.Undo, 1000)
        assertEquals(
            listOf(0.3, 0.5, 0.7),
            e.doc.annotations.map { (it as Annotation.Stroke).points[0][1] },
        )
    }

    @Test
    fun `the eraser ignores annotations that are not on this frame`() {
        val e = PenEngine("c")
        drawLine(e, 1000)
        // Same place on screen, but the drawing belongs to a moment 60 seconds away.
        e.accept(PenMessage.Erase(x = 0.5, y = 0.5), 61_000)
        assertEquals(1, e.annotationCount, "erasing must not reach through time")
    }

    @Test
    fun `a tap on empty picture erases nothing`() {
        val e = PenEngine("c")
        drawLine(e, 1000)
        e.accept(PenMessage.Erase(x = 0.05, y = 0.95), 1000)
        assertEquals(1, e.annotationCount)
    }

    @Test
    fun `redo replays an undone stroke and stops when the stack is empty`() {
        val e = PenEngine("c")
        drawLine(e, 1000)
        drawLine(e, 1000, y = 0.7)

        e.accept(PenMessage.Undo, 1000)
        e.accept(PenMessage.Undo, 1000)
        assertEquals(0, e.annotationCount)
        assertFalse(e.canUndo)

        e.accept(PenMessage.Redo, 1000)
        e.accept(PenMessage.Redo, 1000)
        assertEquals(2, e.annotationCount)
        assertFalse(e.canRedo)

        e.accept(PenMessage.Redo, 1000)
        assertEquals(2, e.annotationCount, "an extra redo must not duplicate anything")
    }

    @Test
    fun `clear is undone in one step and redone in one step`() {
        val e = PenEngine("c")
        drawLine(e, 1000)
        drawLine(e, 1000, y = 0.7)

        e.accept(PenMessage.Clear, 1000)
        assertEquals(0, e.annotationCount)

        e.accept(PenMessage.Undo, 1000)
        assertEquals(2, e.annotationCount)

        e.accept(PenMessage.Redo, 1000)
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `a name tag carries its label and outlives a stroke by default`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Tag(x = 0.4, y = 0.6, label = "  #10 Novak  "), 5000)

        val tag = e.doc.annotations.single() as Annotation.NameTag
        assertEquals("#10 Novak", tag.label, "labels are trimmed before they reach the screen")
        assertEquals(listOf(0.4, 0.6), tag.anchor)
        assertTrue(tag.toMs - tag.fromMs >= Hold.Extended.ms)
    }

    @Test
    fun `an empty tag label is rejected rather than drawn as an empty box`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Tag(x = 0.4, y = 0.6, label = "   "), 5000)
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `hold windows control how long ink survives`() {
        val e = PenEngine("c")
        drawLine(e, 1000, y = 0.3, hold = "brief")
        drawLine(e, 1000, y = 0.7, hold = "sticky")

        val timeline = AnnotationTimeline(e.doc)
        assertEquals(2, timeline.visibleAt(2000).size)
        assertEquals(1, timeline.visibleAt(5000).size, "the short one should have expired")
        assertEquals(1, timeline.visibleAt(600_000).size, "the sticky one should not expire")
    }

    @Test
    fun `an unknown hold name falls back to the default instead of throwing`() {
        assertEquals(Hold.Default, Hold.parse("nonsense"))
        assertEquals(Hold.Default, Hold.parse(null))
        assertEquals(Hold.Sticky, Hold.parse("STICKY"))
    }

    @Test
    fun `sticky annotations cannot overflow the timeline`() {
        val e = PenEngine("c")
        drawLine(e, Long.MAX_VALUE / 8, hold = "sticky")
        val a = e.doc.annotations.single()
        assertTrue(a.toMs > a.fromMs, "fromMs + hold must not wrap around")
    }

    @Test
    fun `a committed stroke is decimated but keeps its endpoints`() {
        val e = PenEngine("c")
        e.accept(pen("down", 0.2 to 0.5), 0)
        // Fifty samples from a finger that barely moved.
        repeat(50) { e.accept(pen("move", (0.2 + it * 1e-5) to 0.5), 0) }
        e.accept(pen("up", 0.8 to 0.5), 0)

        val stroke = e.doc.annotations.single() as Annotation.Stroke
        assertTrue(stroke.points.size < 10, "expected decimation, got ${stroke.points.size} points")
        assertEquals(0.2, stroke.points.first()[0], 1e-9)
        assertEquals(0.8, stroke.points.last()[0], 1e-9)
    }

    @Test
    fun `the live stroke keeps every sample so ink under the finger stays honest`() {
        val e = PenEngine("c")
        e.accept(pen("down", 0.2 to 0.5), 0)
        repeat(20) { e.accept(pen("move", (0.2 + it * 1e-5) to 0.5), 0) }

        val live = e.doc.annotations.single() as Annotation.Stroke
        assertEquals(21, live.points.size)
    }

    @Test
    fun `colour and width travel from the message to the annotation`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Pen(phase = "down", color = "#00E5FF", width = 0.012, pts = listOf(listOf(0.1, 0.1, 0.5))), 0)
        e.accept(PenMessage.Pen(phase = "up", color = "#00E5FF", width = 0.012, pts = listOf(listOf(0.4, 0.4, 0.5))), 0)
        e.accept(PenMessage.Shape("arrow", listOf(0.1, 0.1), listOf(0.5, 0.5), color = "#FF3B30"), 0)

        assertEquals("#00E5FF", e.doc.annotations[0].style.color)
        assertEquals(0.012, e.doc.annotations[0].style.width)
        assertEquals("#FF3B30", e.doc.annotations[1].style.color)
    }
}

class PenToolsProtocolTest {

    @Test
    fun `every tool the phone can send decodes into a typed message`() {
        val wire = listOf(
            """{"type":"tag","x":0.4,"y":0.6,"label":"#10"}""",
            """{"type":"erase","x":0.4,"y":0.6}""",
            """{"type":"redo"}""",
            """{"type":"pen","phase":"down","hold":"sticky","pts":[[0.1,0.1,0.5,0]]}""",
            """{"type":"transport","cmd":"step","value":1}""",
        )
        val decoded = wire.map { decodePenMessage(it) }
        assertTrue(decoded[0] is PenMessage.Tag)
        assertTrue(decoded[1] is PenMessage.Erase)
        assertTrue(decoded[2] is PenMessage.Redo)
        assertEquals("sticky", (decoded[3] as PenMessage.Pen).hold)
        assertEquals(1.0, (decoded[4] as PenMessage.Transport).value)
    }

    @Test
    fun `state omits an absent thumbnail rather than sending the string null`() {
        val json = (TvMessage.State(t = 1, paused = true, rate = 1.0, annotationCount = 0) as TvMessage).encode()
        assertFalse(json.contains("thumbnail"), "an absent thumbnail should not cost bytes: $json")

        val withThumb = (TvMessage.State(
            t = 1, paused = true, rate = 1.0, annotationCount = 0, thumbnail = "data:image/jpeg;base64,AAA",
        ) as TvMessage).encode()
        assertTrue(withThumb.contains("data:image/jpeg"))
    }

    @Test
    fun `a rejected pairing carries a reason the phone can show`() {
        val json = (TvMessage.Welcome("s1", 1.7778, accepted = false, reason = "wrong PIN") as TvMessage).encode()
        assertTrue(json.contains("\"accepted\":false"))
        assertTrue(json.contains("wrong PIN"))
    }
}
