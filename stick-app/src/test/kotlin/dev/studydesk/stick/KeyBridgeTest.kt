package dev.studydesk.stick

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class KeyBridgeTest {
    /**
     * The desk's own keymap, read from desk/src/tv/keys.ts (`KEYBOARD`): page key name -> the remote button it means.
     * Read from the file, not copied here, so a name keys.ts renames or drops turns this suite red.
     */
    private val deskKeymap: Map<String, String> by lazy {
        val file = generateSequence(File(System.getProperty("user.dir")).absoluteFile) { it.parentFile }
            .map { File(it, "desk/src/tv/keys.ts") }.firstOrNull { it.isFile }
            ?: error("desk/src/tv/keys.ts not found above ${System.getProperty("user.dir")}")
        val src = file.readText()
        val start = src.indexOf("const KEYBOARD = new Map")
        assertTrue(start >= 0, "keys.ts has no KEYBOARD map")
        val block = src.substring(start, src.indexOf("]);", start))
            .lines().joinToString("\n") { it.substringBefore("//") }
        Regex("""\[\s*"((?:[^"\\]|\\.)*)"\s*,\s*"(\w+)"\s*]""").findAll(block)
            .associate { it.groupValues[1] to it.groupValues[2] }
            .also { assertTrue(it.size >= 8, "read only ${it.size} entries from keys.ts KEYBOARD") }
    }

    /** What each remote button means on the TV (keys.ts `Key`). Every Android code the bridge maps is listed here. */
    private val meaning = mapOf(
        KeyBridge.DPAD_UP to "up",
        KeyBridge.DPAD_DOWN to "down",
        KeyBridge.DPAD_LEFT to "left",
        KeyBridge.DPAD_RIGHT to "right",
        KeyBridge.DPAD_CENTER to "select",
        KeyBridge.ENTER to "select",
        KeyBridge.NUMPAD_ENTER to "select",
        KeyBridge.BACK to "back",
        KeyBridge.MENU to "menu",
        KeyBridge.MEDIA_PLAY_PAUSE to "play",
        KeyBridge.MEDIA_PLAY to "play",
        KeyBridge.MEDIA_PAUSE to "play",
    )

    @Test
    fun `each remote button reaches the page as a name keys ts maps to that button`() {
        meaning.forEach { (code, button) ->
            val name = KeyBridge.pageKeyOf(code)?.key
            assertEquals(button, deskKeymap[name], "android key $code goes to the page as '$name'")
        }
    }

    @Test
    fun `every key the bridge sends is one the table above names`() {
        val mapped = (0..1023).filter { KeyBridge.pageKeyOf(it) != null }.toSet()
        assertEquals(meaning.keys, mapped)
    }

    @Test
    fun `volume and home stay with the system`() {
        assertNull(KeyBridge.pageKeyOf(24)) // VOLUME_UP
        assertNull(KeyBridge.pageKeyOf(3)) // HOME
    }

    @Test
    fun `the script reports whether the page prevented the keydown`() {
        val js = KeyBridge.script(KeyBridge.pageKeyOf(KeyBridge.BACK)!!)
        assertTrue(js.contains("key:'Backspace'"))
        assertTrue(js.contains("cancelable:true"))
        assertTrue(js.contains("return taken"))
    }
}
