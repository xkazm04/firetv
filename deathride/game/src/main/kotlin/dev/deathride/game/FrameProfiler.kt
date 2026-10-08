package dev.deathride.game

import dev.deathride.link.PerfTrace

/** Optional platform counters; the normal build does not call them. */
interface ProfilePlatform {
    fun cpuNanos(): Long
    fun begin(name: String)
    fun end()
    fun runtimeJson(): String
    fun allocatedBytes(): Long = -1
    /** P17 (perf package only): this thread's scheduler totals since it started, from its own /proc schedstat: out[0] = ns on a
     *  CPU, out[1] = ns runnable but waiting for a CPU. False when not read (every build but the debuggable perf package). */
    fun schedNanos(out: LongArray): Boolean = false
}

/** P17: parses the first two fields of a /proc schedstat line ("<run ns> <runqueue wait ns> <slices>") without allocating. */
object SchedStat {
    fun parse(bytes: ByteArray, length: Int, out: LongArray): Boolean {
        var i = 0
        for (field in 0..1) {
            while (i < length && bytes[i] == ' '.code.toByte()) i++
            var value = 0L
            val first = i
            while (i < length && bytes[i] in '0'.code.toByte()..'9'.code.toByte()) { value = value * 10 + (bytes[i] - '0'.code.toByte()); i++ }
            if (i == first) return false
            out[field] = value
        }
        return true
    }
}

/** Preallocated phase sample. Nested world spans are disjoint; outer totals are derived. */
class FrameProfiler(val platform: ProfilePlatform) {
    val trace = PerfTrace(arrayOf("startNs", "intervalMs", "workMs", "cpuMs", "active", "liveCars",
        "requestsMs", "prepareMs", "simulationMs", "audioMs", "telemetryMs", "clearMs",
        "cameraMs", "effectsUpdateMs", "sceneryDrawMs", "carsEffectsMs", "hudMs", "captionMs",
        "drawCalls", "textureBinds", "textureUploads", "effectSlots",
        "requestsBytes", "prepareBytes", "simulationBytes", "audioBytes", "telemetryBytes", "clearBytes",
        "cameraBytes", "effectsUpdateBytes", "sceneryDrawBytes", "carsEffectsBytes", "hudBytes", "captionBytes", "drawIndices",
        "hudDraws", "hudFlushes", "hudBakeMs", "schedRunMs", "schedWaitMs"))
    private val row = DoubleArray(trace.columns.size)
    private var start = 0L
    private var cpu = 0L
    private var mark = 0L
    private var section = false
    private var allocated = -1L
    private val sched = LongArray(2)
    private var schedRun = -1L
    private var schedWait = -1L
    fun begin(nanos: Long, interval: Double) {
        row.fill(0.0); start = nanos; mark = nanos; cpu = platform.cpuNanos()
        row[0] = nanos.toDouble(); row[1] = interval * 1000
        // P17: the render thread's time on a CPU and waiting for one over this row's interval (begin to begin, as intervalMs);
        // the rest of the interval it slept. -1 when the platform does not read schedstat or this is the first row.
        if (platform.schedNanos(sched)) {
            row[38] = if (schedRun < 0) -1.0 else (sched[0] - schedRun) / 1e6
            row[39] = if (schedWait < 0) -1.0 else (sched[1] - schedWait) / 1e6
            schedRun = sched[0]; schedWait = sched[1]
        } else { row[38] = -1.0; row[39] = -1.0 }
        platform.begin("DR.requests"); section = true
        allocated = platform.allocatedBytes()
    }
    fun mark(column: Int, next: String) {
        val bytes = platform.allocatedBytes()
        row[column + 16] = if (allocated < 0) -1.0 else (bytes - allocated).toDouble()
        allocated = bytes
        val now = System.nanoTime(); row[column] += (now - mark) / 1e6; mark = now
        if (section) platform.end()
        platform.begin(next); section = true
    }
    /** P16: GL draw calls issued inside the HUD phase (ProfileGl delta across drawOverlay), the HUD SpriteBatch's own flushes
     *  (SpriteBatch.renderCalls between its begin and end in drawOverlay: one per texture change, blend change or full buffer,
     *  plus the final flush at end) and the time this frame spent baking a retained HUD layer (0 when none is baked). */
    fun hud(draws: Int, flushes: Int, bakeMs: Double) { row[35] = draws.toDouble(); row[36] = flushes.toDouble(); row[37] = bakeMs }
    fun finish(active: Boolean, live: Int, draws: Int, binds: Int, uploads: Int, effects: Int, indices: Int = 0) {
        if (section) platform.end()
        section = false
        row[2] = (System.nanoTime() - start) / 1e6
        row[3] = (platform.cpuNanos() - cpu) / 1e6
        row[4] = if (active) 1.0 else 0.0; row[5] = live.toDouble()
        row[18] = draws.toDouble(); row[19] = binds.toDouble()
        row[20] = uploads.toDouble(); row[21] = effects.toDouble(); row[34] = indices.toDouble()
        trace.append(row)
    }
}
