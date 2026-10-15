package dev.telestrator.tv

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread

/**
 * /health's `pens` is counted by every pen connection's own coroutine, on the server's IO threads,
 * so connects and disconnects of different phones interleave.
 */
class SessionPenCountTest {

    private fun session() = Session(clipId = "test", videoAspect = 16.0 / 9.0)

    @Test
    fun `the pen count survives connects and disconnects on many threads`() {
        val s = session()
        // Two pens stay connected throughout; the others come and go.
        s.penConnected()
        s.penConnected()
        val errors = Collections.synchronizedList(mutableListOf<Throwable>())
        val go = CountDownLatch(1)
        val threads = (1..4).map {
            thread {
                go.await()
                try {
                    repeat(200_000) { s.penConnected(); s.penDisconnected() }
                } catch (t: Throwable) {
                    errors += t
                }
            }
        }
        go.countDown()
        threads.forEach { it.join(TimeUnit.SECONDS.toMillis(60)) }
        assertTrue(errors.isEmpty(), "threads raised: ${errors.take(3)}")
        assertEquals(2, s.connectedPens)
    }

    @Test
    fun `a disconnect with no pen counted stays at zero`() {
        val s = session()
        assertEquals(0, s.penDisconnected())
        assertEquals(0, s.connectedPens)
        assertEquals(1, s.penConnected())
    }
}
