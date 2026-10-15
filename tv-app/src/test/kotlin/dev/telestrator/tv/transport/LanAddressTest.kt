package dev.telestrator.tv.transport

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.net.InetAddress

/** The address in the QR code is one a phone on the same network can actually reach. */
class LanAddressTest {

    private fun ip(s: String) = InetAddress.getByName(s)

    @Test
    fun `the first LAN IPv4 address is the one shown`() {
        assertEquals("192.168.1.20", lanIpv4(listOf(ip("fe80::1"), ip("192.168.1.20"), ip("10.0.0.5"))))
    }

    @Test
    fun `loopback is never offered to a phone`() {
        assertEquals("10.0.0.5", lanIpv4(listOf(ip("127.0.0.1"), ip("10.0.0.5"))))
    }

    @Test
    fun `with no LAN address there is no pairing address, not a loopback one`() {
        // Wi-Fi down or not yet joined: 127.0.0.1 in the QR would send the phone to itself.
        assertNull(lanIpv4(emptyList()))
        assertNull(lanIpv4(listOf(ip("127.0.0.1"), ip("::1"))))
    }
}
