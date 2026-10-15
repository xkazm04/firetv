package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow

/**
 * A message that decodes is not yet a message the engine can draw: a point or an end with fewer
 * than two coordinates decodes fine (they are plain lists) and then threw IndexOutOfBounds inside
 * the engine, on the pen's receive loop, which ends the connection (LAN) or the relay socket.
 * The engine drops what it cannot draw, as the conversation drops a frame that does not decode.
 */
class MalformedGeometryTest {

    private fun engine() = PenEngine("c")

    @Test
    fun `case 1 - a shape with a short end is dropped, not thrown`() {
        val e = engine()
        for (tool in listOf("arrow", "circle", "spotlight")) {
            assertDoesNotThrow { e.accept(decodePenMessage("""{"type":"shape","tool":"$tool","from":[0.5],"to":[0.6,0.5]}"""), 0) }
            assertDoesNotThrow { e.accept(decodePenMessage("""{"type":"shape","tool":"$tool","from":[0.5,0.5],"to":[]}"""), 0) }
        }
        assertEquals(0, e.annotationCount)
    }

    @Test
    fun `case 2 - a pen point with fewer than two coordinates is skipped, the rest of the stroke kept`() {
        val e = engine()
        assertDoesNotThrow {
            e.accept(decodePenMessage("""{"type":"pen","phase":"down","pts":[[0.1,0.1,0.5],[0.2]]}"""), 0)
            e.accept(decodePenMessage("""{"type":"pen","phase":"move","pts":[[],[0.3,0.3]]}"""), 0)
            e.accept(decodePenMessage("""{"type":"pen","phase":"up","pts":[[0.4,0.4,0.5]]}"""), 0)
        }
        val stroke = e.doc.annotations.single() as Annotation.Stroke
        assertEquals(listOf(0.1, 0.3, 0.4), stroke.points.map { it[0] })
    }

    @Test
    fun `case 3 GUARD - the pen conversation delivers the frame and the session survives it`() {
        val desk = PairingDesk(pin = "4821", videoAspect = 16.0 / 9.0)
        val pen = desk.open(openedAtMs = 0)
        pen.onText("""{"type":"hello","pin":"4821","clientId":"pen-a"}""")
        val e = engine()
        for (effect in pen.onText("""{"type":"shape","tool":"circle","from":[0.5],"to":[0.6,0.5]}""")) {
            if (effect is PenEffect.Deliver) assertDoesNotThrow { e.accept(effect.message, 0) }
        }
        e.accept(PenMessage.Shape("circle", listOf(0.5, 0.5), listOf(0.6, 0.5)), 0)
        assertEquals(1, e.annotationCount)
    }
}
