package dev.studydesk.stick

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class KeyBridgeTest {
    /** Every name here is one desk/src/tv/keys.ts KEYBOARD maps; a name it does not know would reach the page as nothing. */
    @Test
    fun `each remote button reaches the page as a name keys ts maps`() {
        val seen = mapOf(
            KeyBridge.DPAD_UP to "ArrowUp",
            KeyBridge.DPAD_DOWN to "ArrowDown",
            KeyBridge.DPAD_LEFT to "ArrowLeft",
            KeyBridge.DPAD_RIGHT to "ArrowRight",
            KeyBridge.DPAD_CENTER to "Enter",
            KeyBridge.ENTER to "Enter",
            KeyBridge.BACK to "Backspace",
            KeyBridge.MENU to "ContextMenu",
            KeyBridge.MEDIA_PLAY_PAUSE to "MediaPlayPause",
        )
        seen.forEach { (code, name) -> assertEquals(name, KeyBridge.pageKeyOf(code)?.key, "android key $code") }
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
