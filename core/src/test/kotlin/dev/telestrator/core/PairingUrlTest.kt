package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

class PairingUrlTest {
    @Test
    fun `the PIN rides in the fragment, never the query`() {
        val url = PairingUrl.of("http://192.168.1.20:8765/", "4821")
        assertEquals("http://192.168.1.20:8765/#pin=4821", url)
        assertFalse('?' in url, { "the QR URL has a query: $url" })
    }

    @Test
    fun `a relay base keeps its own query and loses an old fragment`() {
        assertEquals("http://relay:9787/?session=a#pin=7", PairingUrl.of("http://relay:9787/?session=a#old", "7"))
    }

    @Test
    fun `the card prints the address without the PIN`() {
        assertEquals("192.168.1.20:8765/", PairingUrl.display("http://192.168.1.20:8765/#pin=4821"))
        assertEquals("192.168.1.20:8765/", PairingUrl.display("http://192.168.1.20:8765/?pin=4821"))
    }
}
