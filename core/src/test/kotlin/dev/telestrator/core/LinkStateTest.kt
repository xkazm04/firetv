package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class LinkStateTest {

    private val url = "http://192.168.1.20:8765/?pin=4821"
    private val pin = "4821"

    private fun ready(at: Long = 0) = LinkState().on(LinkEvent.Ready(url, pin), at)
    private fun paired(id: String = "pen-a", at: Long = 1_000) = ready().on(LinkEvent.PenPaired(id), at)

    @Test
    fun `case 1 GUARD - a fresh link is Connecting at launch`() {
        assertEquals(LinkView.Connecting, LinkState().view(0))
        assertEquals(LinkView.Connecting, LinkState().view(60_000))
    }

    @Test
    fun `case 2 - ready shows the invite with the PIN as its own value`() {
        assertEquals(LinkView.Invite(url, "4821"), ready().view(0))
        assertEquals(LinkView.Invite(url, "4821"), ready().view(3_600_000))
    }

    @Test
    fun `case 3 - a paired pen collapses the card to a chip`() {
        val s = paired()
        assertEquals(LinkView.Chip, s.view(1_000))
        assertEquals(LinkView.Chip, s.view(3_600_000))
    }

    @Test
    fun `case 4 - a pen gone for 3 s brings the QR back, a blink does not`() {
        val gone = paired().on(LinkEvent.PenGone("pen-a"), 60_000)
        assertEquals(LinkView.Chip, gone.view(60_000))
        assertEquals(LinkView.Chip, gone.view(62_999))
        assertEquals(LinkView.Lost(url, pin), gone.view(63_000))
        assertEquals(LinkView.Lost(url, pin), gone.view(120_000))

        val blink = gone.on(LinkEvent.PenPaired("pen-a"), 61_000)
        for (t in listOf(61_000L, 62_999L, 63_000L, 90_000L)) assertEquals(LinkView.Chip, blink.view(t))

        // Re-pairing after the card came back collapses it again.
        assertEquals(LinkView.Chip, gone.on(LinkEvent.PenPaired("pen-a"), 70_000).view(70_000))
    }

    @Test
    fun `case 5 - a superseded pen's close blanks and re-opens nothing`() {
        val s = paired("pen-a", 1_000).on(LinkEvent.PenPaired("pen-b"), 2_000).on(LinkEvent.PenGone("pen-a"), 3_000)
        for (t in listOf(3_000L, 6_000L, 600_000L)) assertEquals(LinkView.Chip, s.view(t))
        // The current pen leaving still counts.
        assertEquals(LinkView.Lost(url, pin), s.on(LinkEvent.PenGone("pen-b"), 10_000).view(13_000))
    }

    @Test
    fun `case 6 - a refusal shows for 5 s before a pen and is invisible during a pen`() {
        val s = ready().on(LinkEvent.PenRefused("wrong PIN"), 10_000)
        assertEquals(LinkView.Refused("wrong PIN", pin), s.view(10_000))
        assertEquals(LinkView.Refused("wrong PIN", pin), s.view(14_999))
        assertEquals(LinkView.Invite(url, pin), s.view(15_000))

        val drawing = paired().on(LinkEvent.PenRefused("wrong PIN"), 10_000)
        for (t in listOf(10_000L, 12_000L, 15_000L)) assertEquals(LinkView.Chip, drawing.view(t))
    }

    @Test
    fun `case 7 - a failed transport says why whatever the pen state, and a later ready clears it`() {
        val message = "port 8765 is in use by something else"
        val failed = ready().on(LinkEvent.Failed(message), 5_000)
        assertEquals(LinkView.Failed(message), failed.view(5_000))
        assertEquals(LinkView.Failed(message), LinkState().on(LinkEvent.Failed(message), 0).view(0))
        assertEquals(LinkView.Failed(message), paired().on(LinkEvent.Failed(message), 5_000).view(5_000))
        assertEquals(LinkView.Invite(url, pin), failed.on(LinkEvent.Ready(url, pin), 6_000).view(6_000))
    }

    @Test
    fun `case 8 - Menu brings the invite back for 8 s so a second phone can pair`() {
        val s = paired().on(LinkEvent.Peek, 100_000)
        assertEquals(LinkView.Chip, s.view(99_999))
        assertEquals(LinkView.Invite(url, pin), s.view(100_000))
        assertEquals(LinkView.Invite(url, pin), s.view(107_999))
        assertEquals(LinkView.Chip, s.view(108_000))
    }

    @Test
    fun `a new ready replaces the address so the QR follows the network`() {
        val moved = "http://10.0.0.7:8765/?pin=4821"
        assertEquals(LinkView.Invite(moved, pin), ready().on(LinkEvent.Ready(moved, pin), 9_000).view(9_000))
    }
}
