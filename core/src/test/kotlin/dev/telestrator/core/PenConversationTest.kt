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

/**
 * A relay socket is not a pen: the TV's one outbound socket exists before any phone and outlives each
 * one, so a SHARED conversation has no hello deadline and treats every hello as a (re)pairing.
 * The dedicated (LAN) conversation is pinned unchanged by [PenConversationTest] and the guard below.
 */
class SharedPenConversationTest {

    private val aspect = 16.0 / 9.0
    private fun desk() = PairingDesk(pin = "4821", videoAspect = aspect)
    private fun hello(pin: String, clientId: String = "pen-a") =
        """{"type":"hello","pin":"$pin","clientId":"$clientId"}"""
    private fun refused(reason: String) =
        PenEffect.Send(TvMessage.Welcome(sessionId = "", videoAspect = aspect, accepted = false, reason = reason))
    private fun accepted(session: String) =
        PenEffect.Send(TvMessage.Welcome(sessionId = session, videoAspect = aspect, accepted = true))

    @Test
    fun `case 1 - a shared conversation that never hears a hello is never refused and never closed`() {
        val pen = desk().open(openedAtMs = 0, shared = true)

        assertEquals(emptyList<PenEffect>(), pen.onTick(60_000))
        assertEquals(emptyList<PenEffect>(), pen.onTick(3_600_000))
        assertFalse(pen.isPaired)
    }

    @Test
    fun `case 2 - a phone that arrives late pairs on a shared conversation`() {
        val pen = desk().open(openedAtMs = 0, shared = true)
        pen.onTick(60_000)

        assertEquals(
            listOf(accepted("s-1"), PenEffect.Paired("pen-a", 1)),
            pen.onText(hello("4821", "pen-a")),
        )
        assertTrue(pen.isPaired)
    }

    @Test
    fun `case 3 - a second phone with the right PIN replaces the first and its input is delivered`() {
        val pen = desk().open(openedAtMs = 0, shared = true)
        pen.onText(hello("4821", "pen-a"))

        assertEquals(
            listOf(accepted("s-2"), PenEffect.Paired("pen-b", 2, replaced = true)),
            pen.onText(hello("4821", "pen-b")),
        )
        assertEquals(listOf(PenEffect.Deliver(PenMessage.Undo)), pen.onText("""{"type":"undo"}"""))
        assertEquals("pen-b", pen.clientId)
    }

    @Test
    fun `case 4 - the same phone saying hello again (reconnected through the relay) gets its welcome back`() {
        val pen = desk().open(openedAtMs = 0, shared = true)
        pen.onText(hello("4821", "pen-a"))
        pen.onText(hello("4821", "pen-b"))

        assertEquals(
            listOf(accepted("s-3"), PenEffect.Paired("pen-b", 3, replaced = true)),
            pen.onText(hello("4821", "pen-b")),
        )
    }

    @Test
    fun `case 5 - a wrong PIN unpairs without hanging up, drops input, and a right PIN pairs again`() {
        val pen = desk().open(openedAtMs = 0, shared = true)
        pen.onText(hello("4821", "pen-a"))

        assertEquals(
            listOf(refused("wrong PIN"), PenEffect.Unpaired("pen-a")),
            pen.onText(hello("0000", "pen-x")),
        )
        assertFalse(pen.isPaired)
        assertFalse(pen.isCurrent)
        assertEquals(emptyList<PenEffect>(), pen.onText("""{"type":"clear"}"""))
        assertEquals(emptyList<PenEffect>(), pen.onTick(10_000))

        assertEquals(
            listOf(accepted("s-3"), PenEffect.Paired("pen-a", 3)),
            pen.onText(hello("4821", "pen-a")),
        )
        assertTrue(pen.isCurrent)
    }

    @Test
    fun `case 5b - five wrong PINs in a row lock hellos, the right PIN included, until the cooldown tick`() {
        val pen = desk().open(openedAtMs = 0, shared = true)
        pen.onTick(1_000)

        repeat(PenConversation.MAX_WRONG_PINS) {
            assertEquals(listOf(refused("wrong PIN")), pen.onText(hello("0000", "pen-x")))
        }

        // Locked: the right PIN is refused, nothing is delivered, nobody is paired.
        assertEquals(listOf(refused("too many wrong PINs")), pen.onText(hello("4821", "pen-a")))
        assertFalse(pen.isPaired)
        assertEquals(emptyList<PenEffect>(), pen.onText("""{"type":"undo"}"""))
        assertEquals(emptyList<PenEffect>(), pen.onTick(1_000 + PenConversation.COOLDOWN_MS - 1))
        assertEquals(listOf(refused("too many wrong PINs")), pen.onText(hello("4821", "pen-a")))

        // The cooldown tick lifts it, and the count starts again.
        assertEquals(emptyList<PenEffect>(), pen.onTick(1_000 + PenConversation.COOLDOWN_MS))
        assertEquals(listOf(refused("wrong PIN")), pen.onText(hello("0000", "pen-x")))
        assertEquals(
            listOf(accepted("s-1"), PenEffect.Paired("pen-a", 1)),
            pen.onText(hello("4821", "pen-a")),
        )
    }

    @Test
    fun `case 5c - a right PIN between wrong ones restarts the count`() {
        val pen = desk().open(openedAtMs = 0, shared = true)

        repeat(PenConversation.MAX_WRONG_PINS - 1) { pen.onText(hello("0000", "pen-x")) }
        assertEquals(PenEffect.Paired("pen-a", 1), pen.onText(hello("4821", "pen-a")).last())
        repeat(PenConversation.MAX_WRONG_PINS - 1) { pen.onText(hello("0000", "pen-x")) }

        assertEquals(PenEffect.Paired("pen-a", 3), pen.onText(hello("4821", "pen-a")).last())
    }

    @Test
    fun `case 6 GUARD - a dedicated conversation behaves exactly as before`() {
        val late = desk().open(openedAtMs = 0, shared = false)
        assertEquals(
            listOf(refused("no pairing message"), PenEffect.Close("no pairing message")),
            late.onTick(5_000),
        )

        val wrong = desk().open(openedAtMs = 0, shared = false)
        assertEquals(
            listOf(refused("wrong PIN"), PenEffect.Close("wrong PIN")),
            wrong.onText(hello("0000")),
        )

        val pen = desk().open(openedAtMs = 0)
        pen.onText(hello("4821", "pen-a"))
        assertEquals(
            listOf(PenEffect.Deliver(PenMessage.Hello(pin = "4821", clientId = "pen-b"))),
            pen.onText(hello("4821", "pen-b")),
        )
        assertEquals("pen-a", pen.clientId)
        assertEquals(emptyList<PenEffect>(), pen.onTick(60_000))
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
