package dev.telestrator.tv

import dev.telestrator.core.PenMessage
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 * Transport commands (the remote's keys, the phone's undo and redo) reach the player through the
 * session. Messages arrive in bursts after a Wi-Fi stall, faster than one per frame, so the
 * session must hand over every command in order, not only the newest.
 */
class SessionCommandTest {

    @Test
    fun `commands accepted back to back are all delivered, in order`() = runBlocking {
        val s = Session(clipId = "test", videoAspect = 16.0 / 9.0)
        // A burst before the player's loop looks: two undos, then a seek.
        s.accept(PenMessage.Undo)
        s.accept(PenMessage.Undo)
        s.accept(PenMessage.Transport("seek+"))

        val seen = withTimeout(2_000) { s.commands.take(3).toList() }
        assertEquals(listOf("undo", "undo", "seek+"), seen.map { it.cmd })
    }

    @Test
    fun `edits do not go through the command queue`() = runBlocking {
        val s = Session(clipId = "test", videoAspect = 16.0 / 9.0)
        s.accept(PenMessage.Pen(phase = "down", pts = listOf(listOf(0.1, 0.1, 0.5))))
        s.accept(PenMessage.Transport("toggle"))
        val seen = withTimeout(2_000) { s.commands.take(1).toList() }
        assertEquals(listOf("toggle"), seen.map { it.cmd })
        assertEquals(1, s.annotationCount())
    }
}
