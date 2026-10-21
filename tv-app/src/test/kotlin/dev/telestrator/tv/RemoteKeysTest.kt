package dev.telestrator.tv

import android.view.KeyEvent
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 * A remote key held down arrives as one press and then a stream of repeats (repeatCount 1, 2, ...)
 * every ~50 ms. A scrub key should follow the hold; a key that acts once must not act again per
 * repeat, or a long press on OK flips play and pause and a held Up undoes the whole review.
 */
class RemoteKeysTest {

    /** The commands one hold produces: the press plus [repeats] repeats. */
    private fun hold(keyCode: Int, repeats: Int): List<String> =
        (0..repeats).mapNotNull { remoteCommand(keyCode, it) }

    @Test
    fun `a press maps each remote key to its command`() {
        assertEquals("toggle", remoteCommand(KeyEvent.KEYCODE_DPAD_CENTER, 0))
        assertEquals("toggle", remoteCommand(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 0))
        assertEquals("seek+", remoteCommand(KeyEvent.KEYCODE_DPAD_RIGHT, 0))
        assertEquals("seek-", remoteCommand(KeyEvent.KEYCODE_MEDIA_REWIND, 0))
        assertEquals("undo", remoteCommand(KeyEvent.KEYCODE_DPAD_UP, 0))
        assertEquals("clear", remoteCommand(KeyEvent.KEYCODE_DPAD_DOWN, 0))
        assertEquals(null, remoteCommand(KeyEvent.KEYCODE_BACK, 0))
    }

    @Test
    fun `a one-second hold on a key that acts once acts once`() {
        // ~400 ms before the first repeat, then one every ~50 ms: about 12 repeats in a second.
        assertEquals(listOf("undo"), hold(KeyEvent.KEYCODE_DPAD_UP, 12))
        assertEquals(listOf("toggle"), hold(KeyEvent.KEYCODE_DPAD_CENTER, 12))
        assertEquals(listOf("toggle"), hold(KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, 12))
        assertEquals(listOf("clear"), hold(KeyEvent.KEYCODE_DPAD_DOWN, 12))
    }

    /**
     * A TV's own remote reaches the stick over HDMI-CEC, and its separate Play and Pause buttons
     * arrive as their own key codes. Core plans "play" and "pause" (TransportPlan); a remote that
     * says which one it wants must not be a dead key, nor a toggle that pauses on Play.
     */
    @Test
    fun `separate Play and Pause keys say which one they mean`() {
        assertEquals("play", remoteCommand(KeyEvent.KEYCODE_MEDIA_PLAY, 0))
        assertEquals("pause", remoteCommand(KeyEvent.KEYCODE_MEDIA_PAUSE, 0))
        assertEquals(listOf("pause"), hold(KeyEvent.KEYCODE_MEDIA_PAUSE, 12))
    }

    @Test
    fun `a held scrub key keeps scrubbing`() {
        assertEquals(13, hold(KeyEvent.KEYCODE_DPAD_RIGHT, 12).count { it == "seek+" })
        assertEquals(13, hold(KeyEvent.KEYCODE_MEDIA_REWIND, 12).count { it == "seek-" })
    }
}
