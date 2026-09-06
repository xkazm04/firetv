package dev.telestrator.core

import kotlin.math.abs
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AnnotationCodecTest {

    @Test
    fun `document round-trips through JSON with the discriminator from the schema`() {
        val doc = AnnotationDoc(
            clipId = "clip_poc",
            annotations = listOf(
                Annotation.Stroke("a1", 1000, 4000, points = listOf(listOf(0.31, 0.55, 0.4))),
                Annotation.Arrow("a2", 1000, 4000, from = listOf(0.31, 0.55), to = listOf(0.52, 0.41)),
                Annotation.NameTag("a3", 1000, 6000, anchor = listOf(0.3, 0.4), label = "#10 Novak"),
            ),
        )
        val json = doc.encode()
        assertTrue(json.contains("\"type\":\"stroke\""), "expected schema discriminator, got: $json")
        assertEquals(doc, decodeDoc(json))
    }

    @Test
    fun `unknown fields from a newer schema version do not break decoding`() {
        val json = """
            {"schemaVersion":"1.1","clipId":"c","videoAspect":1.7778,"futureField":42,
             "annotations":[{"type":"arrow","id":"a1","fromMs":0,"toMs":10,
              "from":[0.1,0.1],"to":[0.2,0.2],"style":{"color":"#FFF","width":0.006},"curveHint":"x"}]}
        """.trimIndent()
        val doc = decodeDoc(json)
        assertEquals(1, doc.annotations.size)
    }
}

class TimelineTest {

    private val doc = AnnotationDoc(
        clipId = "c",
        annotations = listOf(
            Annotation.Stroke("s", 1000, 4000, points = listOf(listOf(0.1, 0.1, 0.5))),
            Annotation.NameTag("n", 3000, 9000, anchor = listOf(0.5, 0.5), label = "x"),
        ),
    )
    private val timeline = AnnotationTimeline(doc)

    @Test
    fun `only annotations whose window contains t are visible`() {
        assertEquals(emptyList<Annotation>(), timeline.visibleAt(500))
        assertEquals(listOf("s"), timeline.visibleAt(2000).map { it.id })
        assertEquals(listOf("s", "n"), timeline.visibleAt(3500).map { it.id })
        assertEquals(listOf("n"), timeline.visibleAt(5000).map { it.id })
        assertEquals(emptyList<Annotation>(), timeline.visibleAt(9500))
    }

    @Test
    fun `seeking back onto a drawn frame brings the drawing back`() {
        assertTrue(timeline.visibleAt(2000).isNotEmpty())
        assertTrue(timeline.visibleAt(20_000).isEmpty())
        assertTrue(timeline.visibleAt(2000).isNotEmpty(), "annotations must survive a round-trip seek")
    }
}

class ContentRectTest {

    @Test
    fun `a 16-9 video on a 16-9 surface fills it exactly`() {
        val r = ContentRect.fit(1920f, 1080f, 16.0 / 9.0)
        assertTrue(abs(r.left) < 0.5f && abs(r.top) < 0.5f)
        assertTrue(abs(r.width - 1920f) < 0.5f && abs(r.height - 1080f) < 0.5f)
    }

    @Test
    fun `a 16-9 video on a 21-9 surface is pillarboxed and drawings stay on the picture`() {
        val r = ContentRect.fit(2560f, 1080f, 16.0 / 9.0)
        assertEquals(1920f, r.width, 1f)
        assertEquals(320f, r.left, 1f)
        // The centre of the annotation space must be the centre of the picture, not of the screen.
        assertEquals(1280f, r.x(0.5), 1f)
    }

    @Test
    fun `a 16-9 video on a 4-3 surface is letterboxed`() {
        val r = ContentRect.fit(1440f, 1080f, 16.0 / 9.0)
        assertEquals(1440f, r.width, 1f)
        assertEquals(810f, r.height, 1f)
        assertEquals(135f, r.top, 1f)
    }
}

class PenEngineTest {

    private fun pen(phase: String, vararg pts: Pair<Double, Double>) =
        PenMessage.Pen(phase = phase, pts = pts.map { listOf(it.first, it.second, 0.5, 0.0) })

    @Test
    fun `a full down-move-up gesture produces one committed stroke`() {
        val e = PenEngine("c")
        e.accept(pen("down", 0.1 to 0.1), 5000)
        e.accept(pen("move", 0.2 to 0.2, 0.3 to 0.3), 5000)
        assertEquals(1, e.annotationCount, "the live stroke must be visible while drawing")
        e.accept(pen("up", 0.4 to 0.4), 5000)

        val annotations = e.doc.annotations
        assertEquals(1, annotations.size)
        val stroke = annotations.single() as Annotation.Stroke
        assertEquals(4, stroke.points.size)
        assertEquals(5000, stroke.fromMs, "the stroke anchors to the media time it was drawn at")
        assertTrue(stroke.toMs > stroke.fromMs)
    }

    @Test
    fun `a tap is dropped rather than committed as a dot`() {
        val e = PenEngine("c")
        e.accept(pen("down", 0.1 to 0.1), 0)
        e.accept(pen("up"), 0)
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `shapes commit immediately and undo removes the last one`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Shape("arrow", listOf(0.1, 0.1), listOf(0.5, 0.5)), 100)
        e.accept(PenMessage.Shape("circle", listOf(0.5, 0.5), listOf(0.6, 0.5)), 100)
        assertEquals(2, e.annotationCount)

        e.accept(PenMessage.Undo, 100)
        assertEquals(1, e.annotationCount)
        assertTrue(e.doc.annotations.single() is Annotation.Arrow)

        e.accept(PenMessage.Clear, 100)
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `drawings made at different media times do not appear on each other's frames`() {
        val e = PenEngine("c", holdMs = 2000)
        e.accept(pen("down", 0.1 to 0.1), 1000)
        e.accept(pen("up", 0.2 to 0.2), 1000)
        e.accept(pen("down", 0.8 to 0.8), 30_000)
        e.accept(pen("up", 0.9 to 0.9), 30_000)

        val timeline = AnnotationTimeline(e.doc)
        assertEquals(1, timeline.visibleAt(1500).size)
        assertEquals(1, timeline.visibleAt(30_500).size)
        assertTrue(timeline.visibleAt(15_000).isEmpty())
    }
}

class ProtocolTest {

    @Test
    fun `the wire format the PWA sends decodes into typed messages`() {
        val fromPhone = """{"type":"pen","tool":"freehand","phase":"move","color":"#FFD400","pts":[[0.5,0.5,0.7,1234]]}"""
        val msg = decodePenMessage(fromPhone) as PenMessage.Pen
        assertEquals("move", msg.phase)
        assertEquals(0.5, msg.pts[0][0])

        val transport = decodePenMessage("""{"type":"transport","cmd":"pause"}""") as PenMessage.Transport
        assertEquals("pause", transport.cmd)
    }

    @Test
    fun `TV state messages encode with a type tag the PWA can switch on`() {
        val json = (TvMessage.State(t = 1234, paused = true, rate = 1.0, annotationCount = 2) as TvMessage).encode()
        assertTrue(json.contains("\"type\":\"state\""))
        assertFalse(json.contains("null"))
    }
}
