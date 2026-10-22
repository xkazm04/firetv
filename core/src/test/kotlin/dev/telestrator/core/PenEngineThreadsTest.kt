package dev.telestrator.core

import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 * The TV shell calls one [PenEngine] from more than one thread: the pen's receive loop applies
 * messages (Session.edit, on the socket's thread) while the frame loop reads [PenEngine.doc] and
 * the heartbeat reads the counts and [PenEngine.undoAt]. A read must never see a half-made edit:
 * a null annotation, a null point, or an exception out of a list that was being written.
 */
class PenEngineThreadsTest {

    private fun pen(phase: String, x: Double) =
        PenMessage.Pen(phase = phase, pts = listOf(listOf(x, 0.5, 0.5), listOf(x + 0.01, 0.52, 0.5)))

    @Test
    fun `a reader on another thread never sees a half-applied edit`() {
        val engine = PenEngine("c")
        val stop = AtomicBoolean(false)
        val torn = AtomicInteger(0)
        val reads = AtomicInteger(0)
        val firstError = AtomicReference<Throwable?>(null)
        val started = CountDownLatch(2)

        val writer = Thread {
            started.countDown()
            var i = 0
            while (!stop.get()) {
                val x = (i % 50) / 100.0
                engine.accept(pen("down", x), 1_000)
                repeat(8) { engine.accept(pen("move", x), 1_000) }
                engine.accept(pen("up", x), 1_000)
                engine.accept(PenMessage.Shape("arrow", listOf(0.1, 0.1), listOf(0.5, 0.5)), 1_000)
                engine.accept(PenMessage.Undo, 1_000)
                if (i % 20 == 19) engine.accept(PenMessage.Clear, 1_000)
                i++
            }
        }
        val reader = Thread {
            started.countDown()
            while (!stop.get()) {
                try {
                    val annotations = engine.doc.annotations
                    for (a in annotations) {
                        if ((a as Any?) == null) {
                            torn.incrementAndGet()
                        } else if (a is Annotation.Stroke && a.points.any { (it as Any?) == null }) {
                            torn.incrementAndGet()
                        }
                    }
                    engine.annotationCount
                    engine.undoAt(0)
                    engine.redoAt(0)
                } catch (t: Throwable) {
                    torn.incrementAndGet()
                    firstError.compareAndSet(null, t)
                }
                reads.incrementAndGet()
            }
        }
        writer.start()
        reader.start()
        started.await()
        Thread.sleep(2_000)
        stop.set(true)
        writer.join()
        reader.join()

        assertEquals(0, torn.get(), "torn reads in ${reads.get()} reads; first error: ${firstError.get()}")
    }

    @Test
    fun `nothing public writes the engine from outside its lock`() {
        // Every public member holds the instance's lock (the class's own promise). A public setter
        // is a write the lock never sees; the hold window is fixed at construction instead.
        val setters = PenEngine::class.java.methods.filter { it.name.startsWith("set") }.map { it.name }
        assertEquals(emptyList<String>(), setters)
    }
}
