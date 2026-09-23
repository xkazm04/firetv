package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PenConversationTest {

    private val aspect = 16.0 / 9.0
    private fun desk() = PairingDesk(pin = "4821", videoAspect = aspect)
    private fun hello(pin: String, clientId: String = "pen-a") =
        """{"type":"hello","pin":"$pin","clientId":"$clientId"}"""

    @Test
    fun `case 1 - a pen that never says hello is rejected once the timeout falls due, not before`() {
        val pen = desk().open(openedAtMs = 0)

        assertEquals(emptyList<PenEffect>(), pen.onText("""{"type":"undo"}"""))
        assertFalse(pen.isPaired)
        assertEquals(emptyList<PenEffect>(), pen.onTick(4_999))
        assertEquals(
            listOf(
                PenEffect.Send(TvMessage.Welcome(sessionId = "", videoAspect = aspect, accepted = false, reason = "no pairing message")),
                PenEffect.Close("no pairing message"),
            ),
            pen.onTick(5_000),
        )
    }

    @Test
    fun `case 2 - a wrong PIN is refused and the timeout never refuses the same pen again`() {
        val pen = desk().open(openedAtMs = 0)

        assertEquals(
            listOf(
                PenEffect.Send(TvMessage.Welcome(sessionId = "", videoAspect = aspect, accepted = false, reason = "wrong PIN")),
                PenEffect.Close("wrong PIN"),
            ),
            pen.onText(hello("0000")),
        )
        assertEquals(emptyList<PenEffect>(), pen.onTick(10_000))
    }

    @Test
    fun `case 3 - the right PIN pairs, later input is delivered, and a paired pen is never timed out`() {
        val pen = desk().open(openedAtMs = 0)

        assertEquals(
            listOf(
                PenEffect.Send(TvMessage.Welcome(sessionId = "s-1", videoAspect = aspect, accepted = true)),
                PenEffect.Paired("pen-a", 1),
            ),
            pen.onText(hello("4821", "pen-a")),
        )
        assertEquals(listOf(PenEffect.Deliver(PenMessage.Undo)), pen.onText("""{"type":"undo"}"""))
        assertEquals(emptyList<PenEffect>(), pen.onTick(60_000))
    }

    @Test
    fun `case 4 - the newest pen wins and the older one stands down silently`() {
        val desk = desk()
        val a = desk.open(openedAtMs = 0)
        val b = desk.open(openedAtMs = 0)

        assertEquals(PenEffect.Paired("pen-a", 1), a.onText(hello("4821", "pen-a")).last())
        assertEquals(PenEffect.Paired("pen-b", 2), b.onText(hello("4821", "pen-b")).last())

        assertEquals(emptyList<PenEffect>(), a.onText("""{"type":"clear"}"""))
        assertFalse(a.isCurrent)
        assertEquals(listOf(PenEffect.Deliver(PenMessage.Clear)), b.onText("""{"type":"clear"}"""))
        assertTrue(b.isCurrent)
    }

    @Test
    fun `case 5 - ping is answered on the receive path and never reaches the session`() {
        val pen = desk().open(openedAtMs = 0)
        pen.onText(hello("4821"))

        val effects = pen.onText("""{"type":"ping","id":7}""")
        assertEquals(listOf(PenEffect.Send(TvMessage.Pong(7))), effects)
        assertTrue(effects.none { it is PenEffect.Deliver })
    }

    @Test
    fun `case 6 - a frame that is not JSON is dropped without an exception`() {
        val pen = desk().open(openedAtMs = 0)
        pen.onText(hello("4821"))

        assertEquals(emptyList<PenEffect>(), pen.onText("{not json"))
    }
}

class HeartbeatTest {

    private val d1 = AnnotationDoc(clipId = "clip")

    private fun input(t: Long, paused: Boolean, doc: AnnotationDoc = d1, revision: Long = 3) = HeartbeatInput(
        t = t,
        paused = paused,
        rate = 1.0,
        annotationCount = 2,
        canUndo = true,
        canRedo = false,
        durationMs = 20_000,
        doc = doc,
        revision = revision,
    )

    @Test
    fun `case 7 - the mirror ships once per paused doc and the thumbnail once per 200 ms bucket`() {
        val hb = Heartbeat()

        val first = hb.beat(input(5_000, paused = true))
        assertEquals(TvMessage.Doc(3, d1), first.doc)
        assertEquals(5_000L, first.thumbnailAtMs)

        val again = hb.beat(input(5_000, paused = true))
        assertNull(again.doc)
        assertNull(again.thumbnailAtMs)

        assertNull(hb.beat(input(5_150, paused = true)).thumbnailAtMs)
        assertEquals(5_250L, hb.beat(input(5_250, paused = true)).thumbnailAtMs)

        val playing = hb.beat(input(6_000, paused = false))
        assertNull(playing.doc)
        assertNull(playing.thumbnailAtMs)

        assertEquals(TvMessage.Doc(3, d1), hb.beat(input(6_000, paused = true)).doc)
    }

    @Test
    fun `case 8 GUARD - the state message copies the input unchanged and encodes without nulls`() {
        val state = Heartbeat().beat(input(5_000, paused = true)).state

        assertEquals(
            TvMessage.State(
                t = 5_000,
                paused = true,
                rate = 1.0,
                annotationCount = 2,
                canUndo = true,
                canRedo = false,
                durationMs = 20_000,
                thumbnail = null,
            ),
            state,
        )
        val json = (state as TvMessage).encode()
        assertTrue(json.contains("\"type\":\"state\""))
        assertFalse(json.contains("null"))
    }
}
