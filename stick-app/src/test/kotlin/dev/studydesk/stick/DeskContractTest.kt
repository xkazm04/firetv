package dev.studydesk.stick

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

/**
 * The probe's contract with the desk, read from the desk's own source (no desk runs here): the door a guest may GET
 * (desk/src/proxy.ts OPEN), the fields every view of the session carries (pairing.ts LOBBY) and the viewers a session is
 * drawn for (store.ts Session.viewer). A rename on the desk side turns this red instead of every stick's error screen.
 */
class DeskContractTest {
    private fun desk(path: String): String {
        val file = generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, path) }.firstOrNull { it.isFile }
            ?: error("$path not found above ${System.getProperty("user.dir")}")
        // comments say what the code does; only the code is the contract
        return file.readText().replace(Regex("""/\*[\s\S]*?\*/"""), "").lines().joinToString("\n") { it.substringBefore("// ") }
    }

    private val probe = Desk("10.0.0.141", 3000)

    @Test
    fun `the probe's door is one a guest may GET`() {
        val path = probe.probeUrl.removePrefix(probe.origin)
        val open = Regex("""const OPEN[^=]*=\s*\{([^}]*)}""").find(desk("desk/src/proxy.ts"))?.groupValues?.get(1)
            ?: error("proxy.ts has no OPEN map")
        val methods = Regex(""""${Regex.escape(path)}"\s*:\s*\[([^\]]*)]""").find(open)?.groupValues?.get(1)
        assertTrue(methods != null && methods.contains("\"GET\""), "proxy.ts OPEN does not let a guest GET $path: $open")
    }

    @Test
    fun `every viewer a session is drawn for is one the probe reads, and only those`() {
        val union = Regex("""viewer\?\s*:\s*([^;]+);""").find(desk("desk/src/lib/session/store.ts"))?.groupValues?.get(1)
            ?: error("store.ts Session has no viewer field")
        val viewers = Regex(""""(\w+)"""").findAll(union).map { it.groupValues[1] }.toList()
        assertTrue(viewers.isNotEmpty(), union)
        for (v in viewers) assertEquals(Probe.Answered(v), Probe.read(200, """{"phoneUrl":"x","viewer":"$v"}"""), v)
        assertTrue(Probe.read(200, """{"phoneUrl":"x","viewer":"admin"}""") is Probe.Failed)
    }

    @Test
    fun `the fields the probe needs are in every view, the guest's included`() {
        val lobby = Regex("""LOBBY\s*=\s*\[([^\]]*)]""").find(desk("desk/src/lib/session/pairing.ts"))?.groupValues?.get(1)
            ?: error("pairing.ts has no LOBBY")
        val fields = Regex(""""(\w+)"""").findAll(lobby).map { it.groupValues[1] }.toSet()
        for (f in listOf("viewer", "phoneUrl")) assertTrue(f in fields, "pairing.ts LOBBY lacks $f: $fields")
    }
}
