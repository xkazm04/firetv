package dev.telestrator.tv

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

/**
 * MainActivity is exported (it is the launcher entry), so any app on the TV can start it with
 * extras. The relay extras choose where the TV dials and which page the pairing QR sends the phone
 * to, PIN included: a development switch for the harness (tools/relay-test.mjs), which drives a
 * debug build. A release build must not let another app repoint its pairing.
 */
class LaunchTransportTest {

    private val relayExtras = mapOf(
        "transport" to "relay",
        "relay_url" to "ws://attacker.example/tv",
        "phone_url" to "http://attacker.example/",
    )

    @Test
    fun `a debug build honours the harness's relay extras`() {
        assertEquals(
            RelayRequest("ws://attacker.example/tv", "http://attacker.example/"),
            relayRequest(relayExtras::get, debuggable = true),
        )
    }

    @Test
    fun `a release build ignores another app's relay extras and listens on the LAN`() {
        assertNull(relayRequest(relayExtras::get, debuggable = false))
    }

    @Test
    fun `no extras is the LAN transport`() {
        assertNull(relayRequest({ null }, debuggable = true))
    }
}
