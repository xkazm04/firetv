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
    fun json(after: Long = 0): String {
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
        return buildString {
            append("{\"first\":").append(first).append(",\"end\":").append(end)
            append(",\"columns\":[")
            for (i in columns.indices) { if (i > 0) append(','); append('"').append(columns[i]).append('"') }
            append("],\"rows\":[")
            for (n in first until end) {
                if (n > first) append(',')
                append('[')
                for (i in columns.indices) {
                    if (i > 0) append(',')
                    val value = copy[(n - first).toInt() * columns.size + i]
                    if (value.isFinite()) append(value) else append("null")
                }
                append(']')
            }
            append("]}")
        }
    }
}
