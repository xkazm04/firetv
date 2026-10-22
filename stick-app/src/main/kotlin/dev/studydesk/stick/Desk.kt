package dev.studydesk.stick

import java.net.URLDecoder
import java.net.URLEncoder

/**
 * Where the stick finds its desk, and what it does when the desk does not answer. Everything here is plain JVM, so
 * the rules run in KeyBridgeTest's neighbour DeskTest; StickActivity does the network and the drawing.
 *
 * The desk is told apart from anything else on the LAN by its own guest-reachable door, GET /api/session
 * (desk/src/proxy.ts OPEN): a desk answers a JSON session with `viewer` and `phoneUrl`, and `viewer` is "tv" only
 * when the request carries the desk-tv cookie the WebView got from /tv?key=. So one probe says both "this is a desk"
 * and "this stick is its TV". No desk change is needed.
 */
data class Desk(val host: String, val port: Int) {
    private val hostPart get() = if (host.contains(':')) "[$host]" else host
    val origin get() = "http://$hostPart:$port"
    val label get() = "$hostPart:$port"
    val probeUrl get() = "$origin/api/session"
    /** The TV page; with the key once, so the desk sets its cookie (proxy.ts) and sends the WebView on to /tv. */
    fun tv(key: String? = null) = "$origin/tv" + if (key == null) "" else "?key=" + URLEncoder.encode(key, "UTF-8")
}

/** An address as the operator gave it: the desk, and the TV key when the address carried one. */
data class Pointed(val desk: Desk, val key: String?)

object Address {
    const val DEFAULT_PORT = 3000
    /** The operator's desk: this house's computer on the one port its firewall opens. */
    val DEFAULT = Desk("10.0.0.141", DEFAULT_PORT)

    private val IPV4 = Regex("""^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$""")
    private val NAME = Regex("""^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$""")

    /**
     * True for an address that means "this device": localhost, 127/8, ::1, 0.0.0.0. On the stick that is only ever an
     * adb-reverse tunnel to a desk that is gone once the walk ends, so such an address is used for the run and never kept.
     */
    fun isLoopback(host: String): Boolean {
        val h = host.trim().removePrefix("[").removeSuffix("]").lowercase().trimEnd('.')
        if (h == "localhost" || h.endsWith(".localhost")) return true
        if (h == "::1" || h == "0:0:0:0:0:0:0:1" || h == "::" || h == "0.0.0.0") return true
        val v4 = h.removePrefix("::ffff:")
        return IPV4.matches(v4) && v4.substringBefore('.') == "127"
    }

    fun keepable(desk: Desk) = !isLoopback(desk.host)

    /**
     * "10.0.0.141", "10.0.0.141:3000", "desk.lan:3107" or a whole TV link "http://10.0.0.141:3000/tv?key=..." (as
     * desk/src/instrumentation.ts prints it). Null for anything else: another scheme, a user part, a bad host or port.
     */
    fun parse(input: String?): Pointed? {
        var s = input?.trim().orEmpty()
        if (s.isEmpty()) return null
        val scheme = s.indexOf("://")
        if (scheme >= 0) {
            if (!s.substring(0, scheme).equals("http", ignoreCase = true)) return null
            s = s.substring(scheme + 3)
        }
        val cut = s.indexOfFirst { it == '/' || it == '?' || it == '#' }
        val authority = if (cut < 0) s else s.substring(0, cut)
        val rest = if (cut < 0) "" else s.substring(cut)
        if (authority.isEmpty() || authority.contains('@')) return null

        val host: String
        val portText: String?
        if (authority.startsWith("[")) {
            val end = authority.indexOf(']')
            if (end < 0) return null
            host = authority.substring(1, end).lowercase()
            val after = authority.substring(end + 1)
            portText = if (after.isEmpty()) null else if (after.startsWith(":")) after.substring(1) else return null
            if (host.isEmpty() || !host.all { it.isDigit() || it in 'a'..'f' || it == ':' || it == '.' }) return null
        } else {
            if (authority.count { it == ':' } > 1) return null
            host = authority.substringBefore(':').lowercase()
            portText = if (authority.contains(':')) authority.substringAfter(':') else null
            if (!hostOk(host)) return null
        }
        val port = if (portText == null) DEFAULT_PORT else portText.toIntOrNull()?.takeIf { portText.all(Char::isDigit) } ?: return null
        if (port !in 1..65535) return null
        return Pointed(Desk(host, port), keyOf(rest))
    }

    private fun hostOk(h: String): Boolean {
        val m = IPV4.matchEntire(h)
        if (m != null) return m.groupValues.drop(1).all { it.toInt() in 0..255 }
        // all digits and dots but not four octets is a mistyped address, not a name
        if (h.all { it.isDigit() || it == '.' }) return false
        return h.length <= 253 && NAME.matches(h)
    }

    /** The `key` of a /tv link's query, or null. */
    private fun keyOf(rest: String): String? {
        val path = rest.substringBefore('?').substringBefore('#')
        if (path.isNotEmpty() && path.trimEnd('/') != "/tv") return null
        val query = rest.substringAfter('?', "").substringBefore('#')
        for (pair in query.split('&')) {
            val k = pair.substringBefore('=')
            if (k == "key" && pair.contains('=')) {
                val v = runCatching { URLDecoder.decode(pair.substringAfter('='), "UTF-8") }.getOrNull()
                return v?.takeIf { it.isNotBlank() }
            }
        }
        return null
    }

    /** The other hosts of a /24 to search, nearest the default first: x.y.z.1..254 without the stick itself. */
    fun subnet(localIp: String, skip: Set<String> = emptySet()): List<String> {
        val m = IPV4.matchEntire(localIp) ?: return emptyList()
        val (a, b, c, _) = m.destructured
        return (1..254).map { "$a.$b.$c.$it" }.filter { it != localIp && it !in skip }
    }
}

/** What one GET /api/session said. */
sealed interface Probe {
    /** A Study Desk; `viewer` is what it took this stick for: "tv", "phone" or "guest". */
    data class Answered(val viewer: String) : Probe
    data class Failed(val why: String) : Probe

    companion object {
        private val VIEWER = Regex(""""viewer"\s*:\s*"(tv|phone|guest)"""")
        private val PHONE_URL = Regex(""""phoneUrl"\s*:\s*"""")

        /** A desk answers 200 with its session (lib/session/pairing.ts view()): a JSON object with viewer and phoneUrl. */
        fun read(status: Int, body: String): Probe {
            if (status != 200) return Failed("it answered HTTP $status, not a Study Desk")
            val t = body.trim()
            val viewer = VIEWER.find(t)?.groupValues?.get(1)
            if (!t.startsWith("{") || viewer == null || !PHONE_URL.containsMatchIn(t)) return Failed("something answered, but not a Study Desk")
            return Answered(viewer)
        }
    }
}

/** Where the address being tried came from: it decides whether a failure searches the LAN or keeps retrying. */
enum class Source { GIVEN, SAVED, DEFAULT, PICKED, FOUND }

sealed interface Step {
    /** Show the desk's TV page, with the key once when one is in hand. */
    data class Open(val desk: Desk, val key: String?) : Step
    /** A desk answered, but this stick is not its TV yet: the key must be provisioned. */
    data class Unpaired(val desk: Desk) : Step
    /** Search the LAN for a desk. */
    data object Scan : Step
    /** The desk does not answer: the error screen, retried by itself. */
    data class Down(val desk: Desk, val why: String) : Step
    /** Nothing answered anywhere and no desk was ever kept: enter host:port with the remote. */
    data class Setup(val why: String) : Step
}

object Plan {
    /**
     * After probing [desk]. A desk that answers as the TV opens; one that answers as a guest opens with the key in hand,
     * else asks for the key. A failure on the default or the kept address searches the LAN once; an address the
     * operator gave or picked is retried where it is (its key belongs to that desk); the default that failed after a
     * search goes to setup, any other address to the error screen.
     */
    fun afterProbe(desk: Desk, probe: Probe, source: Source, key: String?, scanned: Boolean): Step = when (probe) {
        is Probe.Answered -> when {
            probe.viewer == "tv" -> Step.Open(desk, null)
            key != null -> Step.Open(desk, key)
            else -> Step.Unpaired(desk)
        }
        is Probe.Failed -> when {
            !scanned && (source == Source.DEFAULT || source == Source.SAVED) -> Step.Scan
            source == Source.DEFAULT -> Step.Setup("No desk answered at ${desk.label} or anywhere on this network.")
            else -> Step.Down(desk, probe.why)
        }
    }

    /**
     * After the LAN search for [tried]. The desk that already takes this stick for its TV wins, then the same host on
     * another port, then the first that answered. Nothing found: the error screen for a kept address, setup for the default.
     */
    fun afterScan(tried: Desk, found: List<Pair<Desk, Probe.Answered>>, source: Source, why: String): Step {
        val pick = found.firstOrNull { it.second.viewer == "tv" }
            ?: found.firstOrNull { it.first.host == tried.host }
            ?: found.firstOrNull()
        if (pick != null) return if (pick.second.viewer == "tv") Step.Open(pick.first, null) else Step.Unpaired(pick.first)
        return if (source == Source.DEFAULT) Step.Setup("No desk answered at ${tried.label} or anywhere on this network.")
        else Step.Down(tried, why)
    }

    /**
     * The source of the address being tried once a desk has answered at it. The default that answered is kept (it is
     * the kept desk after a restart), so it is SAVED from then on: setup is for a stick that never found a desk, and a
     * search from the waiting screen (which skips the desk it probes) must not send a found desk there.
     */
    fun answered(source: Source): Source = if (source == Source.DEFAULT) Source.SAVED else source
}

/** The words of the error screen, from what the last probe said. */
object Words {
    const val ASK = "Is the desk running on the computer, and is the stick on the same Wi-Fi?"

    /**
     * The reason as a sentence, then the question. A reason that already ends in its own question (no route, no
     * network) is the question: the screen does not ask about the Wi-Fi twice, nor close a question with a full stop.
     */
    fun downBody(why: String): String {
        val said = why.trim().replaceFirstChar { it.uppercase() }
        if (said.endsWith('?')) return said
        return (if (said.endsWith('.')) said else "$said.") + "\n\n" + ASK
    }
}

/**
 * While the error or pairing screen waits: probe the address every tick, and every [scanEvery]th tick search the LAN
 * (a desk whose computer got a new address is found again).
 */
class Recovery(private val scanEvery: Int = 12) {
    private var ticks = 0
    fun reset() { ticks = 0 }
    /** True when this tick should search the LAN rather than probe the one address. */
    fun tick(): Boolean = ++ticks % scanEvery == 0
}

/**
 * While the TV page is shown: a probe every beat. [dropAfter] failures in a row (a dev desk compiling can miss one)
 * take the stick to the error screen; any answer resets the count.
 */
class Heartbeat(private val dropAfter: Int = 3) {
    private var fails = 0
    fun reset() { fails = 0 }
    fun beat(p: Probe): Boolean {
        fails = if (p is Probe.Answered) 0 else fails + 1
        return fails >= dropAfter
    }
}

/**
 * The setup screen's address, entered with the D-pad alone (the remote has no digits): four octets and a port.
 * Left/Right move between them, Up/Down change the lit one (an octet by one, wrapping; the port through [PORTS]).
 */
class AddressPicker(octets: List<Int>, port: Int) {
    val octets = octets.toMutableList()
    var port = port
        private set
    /** 0..3 an octet, 4 the port. Starts on the last octet, the one that differs between hosts of a home network. */
    var field = 3
        private set

    fun left() { if (field > 0) field-- }
    fun right() { if (field < 4) field++ }
    fun up() = step(1)
    fun down() = step(-1)

    private fun step(by: Int) {
        if (field < 4) { octets[field] = (octets[field] + by + 256) % 256; return }
        val i = PORTS.indexOf(port)
        port = if (i < 0) PORTS[0] else PORTS[(i + by + PORTS.size) % PORTS.size]
    }

    fun desk() = Desk(octets.joinToString("."), port)

    companion object {
        val PORTS = listOf(3000, 3001, 3107, 8080, 80)

        /** Seeded from the desk last tried when it is an IPv4 address, else the stick's own /24, else the default. */
        fun from(desk: Desk?, localIp: String?): AddressPicker {
            fun octetsOf(ip: String?) = ip?.split('.')?.mapNotNull { it.toIntOrNull() }?.takeIf { it.size == 4 && it.all { o -> o in 0..255 } }
            val port = desk?.takeIf { Address.keepable(it) }?.port?.takeIf { it in PORTS } ?: Address.DEFAULT_PORT
            octetsOf(desk?.host)?.takeIf { !Address.isLoopback(desk!!.host) }?.let { return AddressPicker(it, port) }
            octetsOf(localIp)?.let { return AddressPicker(it.take(3) + Address.DEFAULT.host.substringAfterLast('.').toInt(), port) }
            return AddressPicker(octetsOf(Address.DEFAULT.host)!!, port)
        }
    }
}

/** The two stops of the error and pairing screens, moved between with the D-pad. */
class Choice(val stops: List<String>) {
    var at = 0
        private set
    fun next() { at = (at + 1) % stops.size }
    fun prev() { at = (at - 1 + stops.size) % stops.size }
    fun reset() { at = 0 }
    val current get() = stops[at]
}
