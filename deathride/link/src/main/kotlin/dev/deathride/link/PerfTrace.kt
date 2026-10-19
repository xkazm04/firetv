package dev.deathride.link

/** Diagnostic ring. No allocation on append; JSON is copied/formatted on the HTTP thread.
 * Times are monotonic process/device clocks, not phone-to-photon measurements. */
class PerfTrace(val columns: Array<String>, private val capacity: Int = 4096) {
    private val rows = DoubleArray(capacity * columns.size)
    private var sequence = 0L
    @Synchronized fun append(row: DoubleArray) {
        val offset = (sequence % capacity).toInt() * columns.size
        System.arraycopy(row, 0, rows, offset, columns.size)
        sequence++
    }
    fun json(after: Long = 0): String = StringBuilder().also { writeJson(after, it) {} }.toString()
    /** P18: [json]'s text, appended to [out] a piece at a time: [flush] is called whenever [out] holds [PIECE] chars or more,
     *  and it may consume and clear [out] (the /profile reply encodes each piece, so no reply-sized text is ever built). The
     *  rows are copied under the lock as before; the text is formatted outside it, so the render thread's [append] never waits
     *  on formatting. The last piece is left in [out]. */
    fun writeJson(after: Long, out: StringBuilder, flush: (StringBuilder) -> Unit) {
        val copy: DoubleArray
        val first: Long
        val end: Long
        synchronized(this) {
            end = sequence
            first = maxOf(after.coerceAtMost(end), end - capacity, 0)
            copy = DoubleArray((end - first).toInt() * columns.size)
            for (n in first until end) System.arraycopy(rows, (n % capacity).toInt() * columns.size,
                copy, (n - first).toInt() * columns.size, columns.size)
        }
        out.append("{\"first\":").append(first).append(",\"end\":").append(end)
        out.append(",\"columns\":[")
        for (i in columns.indices) { if (i > 0) out.append(','); out.append('"').append(columns[i]).append('"') }
        out.append("],\"rows\":[")
        for (n in first until end) {
            if (n > first) out.append(',')
            out.append('[')
            for (i in columns.indices) {
                if (i > 0) out.append(',')
                val value = copy[(n - first).toInt() * columns.size + i]
                if (value.isFinite()) out.append(value) else out.append("null")
            }
            out.append(']')
            if (out.length >= PIECE) flush(out)
        }
        out.append("]}")
    }
    companion object {
        /** Chars per piece handed to [writeJson]'s flush: about ten frame rows. */
        const val PIECE = 4096
    }
}
