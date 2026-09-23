package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * Review mode: the TV publishes where the drawings are, and the phone jumps between them.
 * Also pins the transport arithmetic that used to live, untested, inside a Composable.
 */
class ReviewModeTest {

    /** Strokes at 5.0 s and 12.0 s, each with a second annotation a moment later. */
    private val doc = AnnotationDoc(
        clipId = "clip",
        annotations = listOf(
            Annotation.Stroke("a1", fromMs = 5_000, toMs = 11_000, points = listOf(listOf(0.1, 0.1, 0.5), listOf(0.2, 0.2, 0.5))),
            Annotation.Arrow("a2", fromMs = 5_200, toMs = 11_200, from = listOf(0.3, 0.3), to = listOf(0.5, 0.5)),
            Annotation.Stroke("a3", fromMs = 12_000, toMs = 18_000, points = listOf(listOf(0.6, 0.6, 0.5), listOf(0.7, 0.7, 0.5))),
            Annotation.NameTag("a4", fromMs = 12_040, toMs = 18_040, anchor = listOf(0.4, 0.8), label = "#10"),
        ),
    )

    private val timeline = AnnotationTimeline(doc)

    @Test
    fun `case 1 - anchors within 500 ms cluster into one moment at the earliest`() {
        assertEquals(listOf(5_000L, 12_000L), timeline.moments())
    }

    @Test
    fun `case 2 - the next moment skips the one the playhead sits on`() {
        assertEquals(5_000L, timeline.momentAfter(0))
        assertEquals(12_000L, timeline.momentAfter(5_000))
        assertNull(timeline.momentAfter(12_000))
    }

    @Test
    fun `case 3 - the previous moment skips the one the playhead sits on`() {
        assertEquals(5_000L, timeline.momentBefore(12_000))
        assertEquals(12_000L, timeline.momentBefore(20_000))
        assertNull(timeline.momentBefore(5_100))
    }

    @Test
    fun `case 4 - undone ink leaves no moment behind, redone ink brings it back`() {
        val engine = PenEngine(clipId = "clip")
        engine.accept(PenMessage.Pen(phase = "down", pts = listOf(listOf(0.1, 0.1, 0.5, 0.0))), 5_000)
        engine.accept(PenMessage.Pen(phase = "move", pts = listOf(listOf(0.3, 0.3, 0.5, 0.0))), 5_000)
        engine.accept(PenMessage.Pen(phase = "up", pts = listOf(listOf(0.5, 0.5, 0.5, 0.0))), 5_000)
        assertEquals(listOf(5_000L), AnnotationTimeline(engine.doc).moments(), "the stroke itself must count")

        engine.accept(PenMessage.Undo, 5_000)
        assertEquals(emptyList<Long>(), AnnotationTimeline(engine.doc).moments())

        engine.accept(PenMessage.Redo, 5_000)
        assertEquals(listOf(5_000L), AnnotationTimeline(engine.doc).moments())
    }

    @Test
    fun `case 5 - jump pauses on the next or previous drawn moment, and stays put at the ends`() {
        assertEquals(
            listOf(PlayerAction.Pause, PlayerAction.SeekTo(5_000)),
            TransportPlan.plan("jump", 1.0, positionMs = 0, durationMs = 20_000, playing = true, doc = doc),
        )
        assertEquals(
            emptyList<PlayerAction>(),
            TransportPlan.plan("jump", 1.0, positionMs = 12_000, durationMs = 20_000, playing = true, doc = doc),
        )
        assertEquals(
            listOf(PlayerAction.Pause, PlayerAction.SeekTo(5_000)),
            TransportPlan.plan("jump", -1.0, positionMs = 12_000, durationMs = 20_000, playing = true, doc = doc),
        )
    }

    @Test
    fun `case 6 GUARD - the transport arithmetic moves out of MainActivity unchanged`() {
        assertEquals(
            listOf(PlayerAction.Pause, PlayerAction.SeekTo(5_040)),
            TransportPlan.plan("step", 1.0, positionMs = 5_000),
        )
        assertEquals(listOf(PlayerAction.SeekTo(0)), TransportPlan.plan("seek-", 0.0, positionMs = 3_000))
        assertEquals(listOf(PlayerAction.SetRate(2.0)), TransportPlan.plan("rate", 3.0))
        assertEquals(listOf(PlayerAction.Pause), TransportPlan.plan("toggle", 0.0, playing = true))
        assertEquals(listOf(PlayerAction.Edit(PenMessage.Undo)), TransportPlan.plan("undo"))
    }

    @Test
    fun `case 7 - the state message carries the marks, and older senders still decode`() {
        val json = (TvMessage.State(t = 0, paused = true, rate = 1.0, annotationCount = 2, marks = listOf(5_000, 12_000)) as TvMessage).encode()
        assertTrue(json.contains("\"marks\":[5000,12000]"), json)

        val old = ProtocolJson.decodeFromString(
            TvMessage.serializer(),
            """{"type":"state","t":1,"paused":true,"rate":1.0,"annotationCount":0}""",
        ) as TvMessage.State
        assertEquals(emptyList<Long>(), old.marks)
    }
}
