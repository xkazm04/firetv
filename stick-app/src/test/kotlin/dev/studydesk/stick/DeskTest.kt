package dev.studydesk.stick

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class DeskTest {
    private val real = Desk("10.0.0.141", 3000)

    // -- the address that is never kept

    @Test
    fun `every spelling of this device is loopback and is not kept`() {
        listOf("localhost", "LOCALHOST", "localhost.", "desk.localhost", "127.0.0.1", "127.8.9.10", "::1", "[::1]",
            "0:0:0:0:0:0:0:1", "0.0.0.0", "::ffff:127.0.0.1").forEach {
            assertTrue(Address.isLoopback(it), it)
            assertFalse(Address.keepable(Desk(it, 3107)), it)
        }
    }

    @Test
    fun `a LAN address or a name is kept`() {
        listOf("10.0.0.141", "192.168.1.20", "128.0.0.1", "desk.lan", "localhosted").forEach {
            assertFalse(Address.isLoopback(it), it)
            assertTrue(Address.keepable(Desk(it, 3000)), it)
        }
    }

    @Test
    fun `the walk's stale tunnel link parses but is loopback`() {
        val p = Address.parse("http://localhost:3107/tv?key=Ic3nxOOmrmWfqqjVEpDbPRNJfXxsC6Z7")!!
        assertEquals(Desk("localhost", 3107), p.desk)
        assertEquals("Ic3nxOOmrmWfqqjVEpDbPRNJfXxsC6Z7", p.key)
        assertFalse(Address.keepable(p.desk))
    }

    // -- host:port parsing

    @Test
    fun `host alone takes the desk's port`() {
        assertEquals(Pointed(real, null), Address.parse("10.0.0.141"))
        assertEquals(Pointed(real, null), Address.parse("  10.0.0.141:3000 "))
        assertEquals(Pointed(Desk("desk.lan", 3107), null), Address.parse("Desk.LAN:3107"))
    }

    @Test
    fun `a TV link as the desk prints it carries its key`() {
        val p = Address.parse("http://10.0.0.141:3000/tv?key=a-b_C%2Bd")!!
        assertEquals(real, p.desk)
        assertEquals("a-b_C+d", p.key)
        assertEquals("http://10.0.0.141:3000/tv?key=a-b_C%2Bd", p.desk.tv(p.key))
        assertEquals("http://10.0.0.141:3000/tv", p.desk.tv())
        assertEquals("http://10.0.0.141:3000/api/session", p.desk.probeUrl)
    }

    @Test
    fun `a key on another path or an empty key is no key`() {
        assertNull(Address.parse("http://10.0.0.141:3000/phone?key=abc")!!.key)
        assertNull(Address.parse("http://10.0.0.141:3000/tv?key=")!!.key)
        assertNull(Address.parse("http://10.0.0.141:3000/tv")!!.key)
        assertEquals("abc", Address.parse("10.0.0.141:3000/tv/?x=1&key=abc#top")!!.key)
    }

    @Test
    fun `ipv6 in brackets`() {
        val p = Address.parse("http://[fe80::1]:3000/tv")!!
        assertEquals(Desk("fe80::1", 3000), p.desk)
        assertEquals("http://[fe80::1]:3000", p.desk.origin)
    }

    @Test
    fun `what is not a desk address is refused`() {
        listOf(null, "", "   ", "https://10.0.0.141:3000", "ftp://x", "10.0.0.256", "10.0.0", "10.0.0.141:0",
            "10.0.0.141:65536", "10.0.0.141:30a0", "10.0.0.141:", "user@10.0.0.141", "a::b:3000", "-desk.lan",
            "desk_lan", "[fe80::1").forEach { assertNull(Address.parse(it), "$it") }
    }

    @Test
    fun `the subnet search skips the stick and what was tried`() {
        val hosts = Address.subnet("10.0.0.139", setOf("10.0.0.141"))
        assertEquals(252, hosts.size)
        assertFalse("10.0.0.139" in hosts)
        assertFalse("10.0.0.141" in hosts)
        assertEquals("10.0.0.1", hosts.first())
        assertEquals("10.0.0.254", hosts.last())
        assertTrue(Address.subnet("not an ip").isEmpty())
    }

    // -- the probe

    @Test
    fun `a desk's session is told from anything else`() {
        assertEquals(Probe.Answered("guest"), Probe.read(200, """{"profiles":[],"viewer":"guest","pin":"","phoneUrl":"http://10.0.0.141:3000/phone"}"""))
        assertEquals(Probe.Answered("tv"), Probe.read(200, """{"phoneUrl":"x","viewer" : "tv"}"""))
        assertTrue(Probe.read(200, "<html>viewer phoneUrl</html>") is Probe.Failed)
        assertTrue(Probe.read(200, """{"viewer":"tv"}""") is Probe.Failed)
        assertTrue(Probe.read(200, """{"viewer":"admin","phoneUrl":"x"}""") is Probe.Failed)
        assertTrue(Probe.read(401, """{"error":"Join the desk first"}""") is Probe.Failed)
    }

    // -- the probe/recovery decision

    private val down = Probe.Failed("connection refused")

    @Test
    fun `a desk that takes the stick for its TV opens without a key`() {
        assertEquals(Step.Open(real, null), Plan.afterProbe(real, Probe.Answered("tv"), Source.SAVED, "k", scanned = false))
    }

    @Test
    fun `a guest answer opens with the key in hand, else asks for the key`() {
        assertEquals(Step.Open(real, "k"), Plan.afterProbe(real, Probe.Answered("guest"), Source.GIVEN, "k", scanned = false))
        assertEquals(Step.Unpaired(real), Plan.afterProbe(real, Probe.Answered("guest"), Source.DEFAULT, null, scanned = false))
    }

    @Test
    fun `the default or kept address that fails searches the LAN once`() {
        assertEquals(Step.Scan, Plan.afterProbe(real, down, Source.DEFAULT, null, scanned = false))
        assertEquals(Step.Scan, Plan.afterProbe(real, down, Source.SAVED, null, scanned = false))
        assertTrue(Plan.afterProbe(real, down, Source.DEFAULT, null, scanned = true) is Step.Setup)
        assertEquals(Step.Down(real, "connection refused"), Plan.afterProbe(real, down, Source.SAVED, null, scanned = true))
    }

    @Test
    fun `an address the operator gave or picked is retried where it is`() {
        for (s in listOf(Source.GIVEN, Source.PICKED, Source.FOUND)) {
            assertEquals(Step.Down(real, "connection refused"), Plan.afterProbe(real, down, s, "k", scanned = false), "$s")
        }
    }

    @Test
    fun `the search prefers the desk that knows the stick, then the same host`() {
        val other = Desk("10.0.0.50", 3000)
        val samePort = Desk("10.0.0.141", 3001)
        assertEquals(Step.Open(other, null), Plan.afterScan(real, listOf(samePort to Probe.Answered("guest"), other to Probe.Answered("tv")), Source.SAVED, "x"))
        assertEquals(Step.Unpaired(samePort), Plan.afterScan(real, listOf(other to Probe.Answered("guest"), samePort to Probe.Answered("guest")), Source.SAVED, "x"))
        assertEquals(Step.Down(real, "x"), Plan.afterScan(real, emptyList(), Source.SAVED, "x"))
        assertTrue(Plan.afterScan(real, emptyList(), Source.DEFAULT, "x") is Step.Setup)
    }

    @Test
    fun `the waiting screen searches the LAN every twelfth tick`() {
        val r = Recovery()
        val scans = (1..24).filter { r.tick() }
        assertEquals(listOf(12, 24), scans)
    }

    @Test
    fun `the page drops to the error screen after three misses in a row`() {
        val h = Heartbeat()
        assertFalse(h.beat(down))
        assertFalse(h.beat(down))
        assertFalse(h.beat(Probe.Answered("tv")))
        assertFalse(h.beat(down))
        assertFalse(h.beat(down))
        assertTrue(h.beat(down))
    }

    // -- the setup screen

    @Test
    fun `the picker enters an address with the D-pad`() {
        val p = AddressPicker.from(null, "10.0.0.139")
        assertEquals(Desk("10.0.0.141", 3000), p.desk())
        p.up(); p.up()
        assertEquals("10.0.0.143", p.desk().host)
        p.left(); p.down()
        assertEquals("10.0.255.143", p.desk().host)
        repeat(9) { p.right() }
        p.up()
        assertEquals(3001, p.desk().port)
        p.down(); p.down()
        assertEquals(80, p.desk().port)
    }

    @Test
    fun `the picker starts from the desk tried, never from loopback`() {
        assertEquals(Desk("192.168.1.7", 3107), AddressPicker.from(Desk("192.168.1.7", 3107), "10.0.0.139").desk())
        assertEquals(Desk("10.0.0.141", 3000), AddressPicker.from(Desk("127.0.0.1", 3107), null).desk())
        assertEquals(Desk("10.0.0.141", 3000), AddressPicker.from(Desk("desk.lan", 9999), null).desk())
    }

    @Test
    fun `the stops wrap`() {
        val c = Choice(listOf("Retry", "Change address"))
        c.prev()
        assertEquals("Change address", c.current)
        c.next()
        assertEquals("Retry", c.current)
    }
}
