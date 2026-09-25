package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * Edits you can see: the eraser already refuses to reach through time, and so do clear, undo and
 * redo. Clear cleans the frame on screen; an undo or redo whose ink is on another frame first
 * takes the TV there, paused, and the next press acts.
 */
class VisibleEditsTest {

    private fun stroke(x: Double) = PenMessage.Pen(
        phase = "down",
        pts = listOf(listOf(x, 0.2, 0.5), listOf(x + 0.1, 0.3, 0.5)),
    )

    private fun PenEngine.drawStroke(x: Double, tMs: Long) {
        accept(stroke(x), tMs)
        accept(PenMessage.Pen(phase = "up", pts = listOf(listOf(x + 0.2, 0.4, 0.5))), tMs)
    }

    /** A stroke at 5.0 s, an arrow at 5.2 s and a stroke at 12.0 s, each with the default 6 s hold. */
    private fun threeOnTwoFrames(): PenEngine = PenEngine("clip").apply {
        drawStroke(0.1, 5_000)
        accept(PenMessage.Shape("arrow", from = listOf(0.3, 0.3), to = listOf(0.5, 0.5)), 5_200)
        drawStroke(0.6, 12_000)
    }

    @Test
    fun `case 1 - Clear on a frame removes what is on screen there and nothing else`() {
        val e = threeOnTwoFrames()
        e.accept(PenMessage.ClearFrame, 5_300)

        assertEquals(listOf(12_000L), e.doc.annotations.map { it.fromMs })
        assertEquals(listOf(12_000L), AnnotationTimeline(e.doc).moments())
    }

    @Test
    fun `case 2 - one undo brings the cleared frame back, each annotation at its old index`() {
        val e = threeOnTwoFrames()
        e.accept(PenMessage.ClearFrame, 5_300)
        e.accept(PenMessage.Undo, 5_300)

        assertEquals(listOf("a1", "a2", "a3"), e.doc.annotations.map { it.id })
        // The redo takes the same frame away again, and nothing else.
        e.accept(PenMessage.Redo, 5_300)
        assertEquals(listOf("a3"), e.doc.annotations.map { it.id })
    }

    @Test
    fun `case 3 GUARD - clear still clears the whole clip and one undo restores it`() {
        val e = threeOnTwoFrames()
        e.accept(decodePenMessage("""{"type":"clear"}"""), 5_300)
        assertEquals(0, e.annotationCount)

        e.accept(PenMessage.Undo, 5_300)
        assertEquals(listOf("a1", "a2", "a3"), e.doc.annotations.map { it.id })
    }

    @Test
    fun `case 4 - an undo whose ink is off screen takes the TV there first`() {
        val e = PenEngine("clip")
        e.drawStroke(0.6, 12_000)
        e.drawStroke(0.1, 5_000)

        assertEquals(5_000L, e.undoAt(15_000))
        assertEquals(
            listOf(PlayerAction.Pause, PlayerAction.SeekTo(5_000)),
            TransportPlan.plan("undo", positionMs = 15_000, undoAtMs = 5_000),
        )
        // Planning the trip is not the edit: nothing is removed yet.
        assertEquals(2, e.annotationCount)

        assertNull(e.undoAt(5_000))
        assertEquals(listOf(PlayerAction.Edit(PenMessage.Undo)), TransportPlan.plan("undo", positionMs = 5_000))
    }

    @Test
    fun `case 5 - a redo whose ink is off screen takes the TV there first`() {
        val e = PenEngine("clip")
        e.drawStroke(0.6, 12_000)
        e.drawStroke(0.1, 5_000)
        e.accept(PenMessage.Undo, 5_000)
        assertEquals(1, e.annotationCount)

        assertEquals(5_000L, e.redoAt(15_000))
        assertEquals(
            listOf(PlayerAction.Pause, PlayerAction.SeekTo(5_000)),
            TransportPlan.plan("redo", positionMs = 15_000, redoAtMs = 5_000),
        )
        assertNull(e.redoAt(5_000))
    }

    @Test
    fun `case 6 GUARD - an undo on screen is one press, and a whole-clip clear has no frame`() {
        assertEquals(listOf(PlayerAction.Edit(PenMessage.Undo)), TransportPlan.plan("undo"))

        val e = PenEngine("clip")
        e.drawStroke(0.1, 5_000)
        assertNull(e.undoAt(5_000))
        assertNull(e.undoAt(9_000))

        e.accept(PenMessage.Clear, 5_000)
        assertNull(e.undoAt(15_000))
    }

    @Test
    fun `case 7 - the phone's undo and redo take the planner's road`() {
        assertEquals(PenMessage.Transport("undo"), PenMessage.Undo.asTransport())
        assertEquals(PenMessage.Transport("redo"), PenMessage.Redo.asTransport())
        assertNull(PenMessage.ClearFrame.asTransport())
        assertNull(PenMessage.Clear.asTransport())
        assertNull(PenMessage.Pen(phase = "down").asTransport())
    }

    @Test
    fun `case 8 - the state tells the phone where its undo will go, and says nothing when it stays`() {
        fun input(undoAtMs: Long?) = HeartbeatInput(
            t = 15_000,
            paused = true,
            rate = 1.0,
            annotationCount = 2,
            canUndo = true,
            canRedo = false,
            durationMs = 20_000,
            doc = AnnotationDoc(clipId = "clip"),
            revision = 1,
            undoAtMs = undoAtMs,
        )

        val away = (Heartbeat().beat(input(5_000)).state as TvMessage).encode()
        assertTrue(away.contains("\"undoAtMs\":5000"), away)

        val here = (Heartbeat().beat(input(null)).state as TvMessage).encode()
        assertFalse(here.contains("undoAtMs"), here)
        assertFalse(here.contains("null"), here)
    }
}
