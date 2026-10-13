package dev.telestrator.tv

import android.graphics.Bitmap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicInteger
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 * Thumbnailer is called from every paired pen's heartbeat on IO threads, and released from the
 * main thread in onDestroy. A MediaMetadataRetriever is not thread-safe and must not be released
 * mid-decode, so the contract is: one decode at a time, none after release.
 */
class ThumbnailerThreadingTest {

    private class CountingSource : FrameSource {
        val inside = AtomicInteger()
        val maxInside = AtomicInteger()
        val decodes = AtomicInteger()
        val releasedWhileDecoding = AtomicInteger()
        val decodesAfterRelease = AtomicInteger()
        @Volatile var released = false

        override fun frameAt(tUs: Long, widthPx: Int, heightPx: Int): Bitmap? {
            if (released) decodesAfterRelease.incrementAndGet()
            decodes.incrementAndGet()
            val now = inside.incrementAndGet()
            maxInside.accumulateAndGet(now, ::maxOf)
            Thread.sleep(25)
            inside.decrementAndGet()
            return null
        }

        override fun release() {
            if (inside.get() > 0) releasedWhileDecoding.incrementAndGet()
            released = true
        }
    }

    @Test
    fun `heartbeats asking for different frames decode one at a time`() {
        val src = CountingSource()
        val thumbs = Thumbnailer(src)
        val start = CountDownLatch(1)
        val threads = (1..4).map { i ->
            Thread { start.await(); thumbs.dataUrlAt(i * 10_000L) }.also { it.start() }
        }
        start.countDown()
        threads.forEach { it.join() }
        assertEquals(4, src.decodes.get())
        assertEquals(1, src.maxInside.get(), "concurrent decodes")
    }

    @Test
    fun `release waits for a running decode and nothing decodes after it`() {
        val src = CountingSource()
        val thumbs = Thumbnailer(src)
        val decoding = Thread { thumbs.dataUrlAt(5_000L) }.also { it.start() }
        while (src.inside.get() == 0) Thread.sleep(1)
        thumbs.release()
        decoding.join()
        assertEquals(0, src.releasedWhileDecoding.get(), "release during a decode")
        thumbs.dataUrlAt(900_000L)
        assertEquals(0, src.decodesAfterRelease.get(), "decodes after release")
    }
}
