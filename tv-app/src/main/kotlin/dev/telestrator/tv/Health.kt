package dev.telestrator.tv

/**
 * The diagnostics payload the test harness reads.
 *
 * It exists for the harness, not for the product: the phone learns everything it needs from the
 * `state` message over whichever transport is active. Hand-rolled rather than serialized because
 * it is a debugging surface that should never drift into being part of the protocol.
 */
fun healthJson(session: Session, transport: String): String {
    val r = RenderStats.snapshot()
    return """{"ok":true,"transport":"$transport","pin":"${session.pin}",""" +
        """"annotations":${session.annotationCount()},"revision":${session.revision},""" +
        """"t":${session.mediaTimeMs},"durationMs":${session.durationMs},""" +
        """"paused":${session.paused},"rate":${session.rate},"pens":${session.connectedPens},""" +
        """"canUndo":${session.canUndo()},"canRedo":${session.canRedo()},""" +
        """"renderP50Ms":${"%.3f".format(r.p50Ms)},"renderP95Ms":${"%.3f".format(r.p95Ms)},""" +
        """"renderMaxMs":${"%.3f".format(r.maxMs)},"renderFrames":${r.frames}}"""
}
