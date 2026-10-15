package dev.telestrator.tv

import dev.telestrator.core.PenMessage
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread

/**
 * Session is entered from three threads in the app: pen input on the server's IO threads, the
 * transport plan's edits and the frame loop's publish on the main thread, and the heartbeat and
 * /health reads on others. These tests drive the same calls from the same number of threads.
 */
class SessionThreadingTest {

    private fun session() = Session(clipId = "test", videoAspect = 16.0 / 9.0)

    private fun stroke(i: Int): List<PenMessage> {
        val x = (i % 50) / 100.0
        return listOf(
            PenMessage.Pen(phase = "down", pts = listOf(listOf(x, 0.1, 0.5))),
            PenMessage.Pen(phase = "move", pts = listOf(listOf(x + 0.05, 0.2, 0.5), listOf(x + 0.1, 0.3, 0.5))),
            PenMessage.Pen(phase = "up", pts = listOf(listOf(x + 0.2, 0.4, 0.5))),
        )
    }

    /** Runs [work] on each thread until [rounds] are done, and returns every throwable they raised. */
    private fun race(rounds: Int, vararg work: (Int) -> Unit): List<Throwable> {
        val errors = Collections.synchronizedList(mutableListOf<Throwable>())
        val go = CountDownLatch(1)
        val threads = work.map { w ->
            thread {
                go.await()
                try {
                    for (i in 0 until rounds) w(i)
                } catch (t: Throwable) {
                    errors += t
                }
            }
        }
        go.countDown()
        threads.forEach { it.join(TimeUnit.SECONDS.toMillis(60)) }
        return errors
    }

    @Test
    fun `pen input, plan edits, publish and heartbeat on separate threads do not corrupt the document`() {
        val s = session()
        val errors = race(
            40_000,
            // The server's receive loop: strokes arriving from the phone.
            { i -> stroke(i).forEach { s.accept(it) } },
            // The main thread: the plan's undo and redo, and the frame loop's publish.
            { i ->
                s.edit(if (i % 3 == 0) PenMessage.Redo else PenMessage.Undo)
                s.publishIfDirty()
            },
            // The heartbeat and /health.
            { _ ->
                s.heartbeatInput()
                s.annotationCount()
            },
        )
        assertTrue(errors.isEmpty(), "threads raised: ${errors.take(3)}")
        s.publishIfDirty()
        assertEquals(s.annotationCount(), s.doc.value.annotations.size)
    }
}
