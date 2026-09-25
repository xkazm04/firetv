package dev.telestrator.core

import java.util.Locale

/**
 * One reading of the TV's diagnostics, as the platform shell gathers it off the live session and
 * the render stats. Plain values, so what `/health` says can be decided and tested on the JVM.
 */
data class HealthReading(
    val transport: String,
    val pin: String,
    val annotations: Int,
    val revision: Int,
    val t: Long,
    val durationMs: Long,
    val paused: Boolean,
    val rate: Double,
    val pens: Int,
    val canUndo: Boolean,
    val canRedo: Boolean,
    val renderP50Ms: Double,
    val renderP95Ms: Double,
    val renderMaxMs: Double,
    val renderFrames: Int,
)

/**
 * The diagnostics payload the test harness reads over `GET /health`.
 *
 * It exists for the harness, not for the product: the phone learns everything it needs from the
 * `state` message over whichever transport is active. Hand-rolled rather than serialized because
 * it is a debugging surface that should never drift into being part of the protocol. Decimals are
 * formatted with [Locale.ROOT]: a comma-decimal locale would otherwise make the body invalid JSON.
 */
fun healthBody(r: HealthReading): String {
    fun ms(v: Double) = "%.3f".format(Locale.ROOT, v)
    return """{"ok":true,"transport":"${r.transport}","pin":"${r.pin}",""" +
        """"annotations":${r.annotations},"revision":${r.revision},""" +
        """"t":${r.t},"durationMs":${r.durationMs},""" +
        """"paused":${r.paused},"rate":${r.rate},"pens":${r.pens},""" +
        """"canUndo":${r.canUndo},"canRedo":${r.canRedo},""" +
        """"renderP50Ms":${ms(r.renderP50Ms)},"renderP95Ms":${ms(r.renderP95Ms)},""" +
        """"renderMaxMs":${ms(r.renderMaxMs)},"renderFrames":${r.renderFrames}}"""
}
