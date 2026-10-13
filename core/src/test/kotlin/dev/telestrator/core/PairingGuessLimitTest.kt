package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * A dedicated (LAN) connection is hung up on after one wrong PIN, but a new connection costs a
 * guesser nothing, so the hang-up alone limits no one: 9000 four-digit PINs are 9000 connections.
 * The guess limit is the desk's, shared by every connection to one TV, dedicated or shared.
 */
class PairingGuessLimitTest {

    private val aspect = 16.0 / 9.0
    private fun hello(pin: String, clientId: String = "pen-x") =
        """{"type":"hello","pin":"$pin","clientId":"$clientId"}"""
    private fun refused(reason: String, retryAfterMs: Long? = null) =
        PenEffect.Send(TvMessage.Welcome(sessionId = "", videoAspect = aspect, accepted = false, reason = reason, retryAfterMs = retryAfterMs))

    @Test
    fun `case 1 - wrong PINs on fresh LAN connections lock pairing for the cooldown`() {
        val desk = PairingDesk(pin = "4821", videoAspect = aspect)

        repeat(PenConversation.MAX_WRONG_PINS) {
            assertEquals(
                listOf(refused("wrong PIN"), PenEffect.Close("wrong PIN")),
                desk.open(openedAtMs = 1_000).onText(hello("0000")),
            )
        }

        // The sixth connection, right PIN and all, is refused while the cooldown runs.
        assertEquals(
            listOf(refused("too many wrong PINs", retryAfterMs = 1), PenEffect.Close("too many wrong PINs")),
            desk.open(openedAtMs = 1_000 + PenConversation.COOLDOWN_MS - 1).onText(hello("4821", "pen-a")),
        )

        // A connection opened after the cooldown pairs.
        val pen = desk.open(openedAtMs = 1_000 + PenConversation.COOLDOWN_MS)
        assertEquals(PenEffect.Paired("pen-a", 1), pen.onText(hello("4821", "pen-a")).last())
    }

    @Test
    fun `case 2 GUARD - a right PIN between wrong ones restarts the count`() {
        val desk = PairingDesk(pin = "4821", videoAspect = aspect)

        repeat(PenConversation.MAX_WRONG_PINS - 1) { desk.open(openedAtMs = 0).onText(hello("0000")) }
        assertEquals(PenEffect.Paired("pen-a", 1), desk.open(openedAtMs = 0).onText(hello("4821", "pen-a")).last())
        repeat(PenConversation.MAX_WRONG_PINS - 1) { desk.open(openedAtMs = 0).onText(hello("0000")) }

        assertEquals(PenEffect.Paired("pen-b", 2), desk.open(openedAtMs = 0).onText(hello("4821", "pen-b")).last())
    }

    @Test
    fun `case 3 - a brute force over every four-digit PIN is cut off after the limit`() {
        val desk = PairingDesk(pin = "9999", videoAspect = aspect)
        var paired = 0
        var refusedWrong = 0
        for (guess in 1000..9999) {
            val effects = desk.open(openedAtMs = 0).onText(hello(guess.toString()))
            if (effects.any { it is PenEffect.Paired }) paired++
            if (refused("wrong PIN") in effects) refusedWrong++
        }
        assertEquals(0, paired, "the guesser paired within one cooldown window")
        assertEquals(PenConversation.MAX_WRONG_PINS, refusedWrong)
    }

    @Test
    fun `case 4 - a locked refusal tells the phone how long until a retry can succeed`() {
        val desk = PairingDesk(pin = "4821", videoAspect = aspect)
        repeat(PenConversation.MAX_WRONG_PINS) { desk.open(openedAtMs = 1_000).onText(hello("0000")) }

        // The lock started at 1_000 and runs COOLDOWN_MS; 10 s in, 20 s are left.
        val locked = desk.open(openedAtMs = 11_000).onText(hello("4821", "pen-a"))
        val welcome = (locked.first() as PenEffect.Send).message as TvMessage
        val wire = welcome.encode()
        assertTrue(wire.contains("\"retryAfterMs\":${PenConversation.COOLDOWN_MS - 10_000}"), "the locked refusal on the wire: $wire")

        // An ordinary wrong PIN has no cooldown to report, and old phones still decode the rest.
        val wrong = desk.open(openedAtMs = 1_000 + PenConversation.COOLDOWN_MS).onText(hello("0000"))
        assertTrue(!((wrong.first() as PenEffect.Send).message as TvMessage).encode().contains("retryAfterMs"))
    }
}
