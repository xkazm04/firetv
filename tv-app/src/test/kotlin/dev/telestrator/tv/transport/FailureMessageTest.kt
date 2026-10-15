package dev.telestrator.tv.transport

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import java.io.IOException
import java.net.BindException

/**
 * [PenTransport.failure] is "something a viewer can act on", and it is printed large on the
 * pairing card. An exception's own message is for the log.
 */
class FailureMessageTest {

    private val restart = "The pen server could not start. Restart the app."

    @Test
    fun `a busy port says so, however deeply the bind failure is wrapped`() {
        val wrapped = IllegalStateException("engine failed", IOException("io", BindException("Address already in use")))
        assertEquals("port 8765 is in use by something else", failureMessage(wrapped, 8765))
        assertEquals("port 8765 is in use by something else", failureMessage(BindException("Address already in use"), 8765))
    }

    @Test
    fun `any other failure is one sentence a viewer can act on, not the exception's text`() {
        val raw = IOException("socket failed: EACCES (Permission denied)")
        assertEquals(restart, failureMessage(raw, 8765))
        assertFalse(failureMessage(raw, 8765).contains("EACCES"))
        assertEquals(restart, failureMessage(IllegalStateException(), 8765))
        assertEquals(restart, failureMessage(null, 8765))
    }
}
