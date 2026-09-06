package dev.telestrator.tv

/**
 * Rolling overlay draw timings, so the design doc's "overlay draw under 4 ms" is a number the test
 * harness can assert on rather than a note in a table.
 *
 * Written from the Compose draw thread and read from the web server thread, hence the lock. The
 * window is small and fixed, so recording a frame allocates nothing.
 */
object RenderStats {

    private const val WINDOW = 120

    private val samplesNs = LongArray(WINDOW)
    private var count = 0
    private var next = 0
    private val lock = Any()

    fun record(durationNs: Long) = synchronized(lock) {
        samplesNs[next] = durationNs
        next = (next + 1) % WINDOW
        if (count < WINDOW) count++
    }

    fun reset() = synchronized(lock) {
        count = 0
        next = 0
    }

    /** Milliseconds; [0.0, 0.0, 0.0] before the first frame is drawn. */
    fun snapshot(): Snapshot = synchronized(lock) {
        if (count == 0) return Snapshot(0.0, 0.0, 0.0, 0)
        val window = samplesNs.copyOf(count).also { it.sort() }
        Snapshot(
            p50Ms = window[count / 2] / 1e6,
            p95Ms = window[(count * 95 / 100).coerceAtMost(count - 1)] / 1e6,
            maxMs = window[count - 1] / 1e6,
            frames = count,
        )
    }

    data class Snapshot(val p50Ms: Double, val p95Ms: Double, val maxMs: Double, val frames: Int)
}
