package dev.telestrator.tv

import dev.telestrator.core.HealthReading
import dev.telestrator.core.healthBody

/**
 * The diagnostics payload the test harness reads: gathers one [HealthReading] off the live session
 * and the render stats, and leaves what the body says to [healthBody] in core.
 */
fun healthJson(session: Session, transport: String): String {
    val r = RenderStats.snapshot()
    return healthBody(
        HealthReading(
            transport = transport,
            annotations = session.annotationCount(),
            revision = session.revision,
            t = session.mediaTimeMs,
            durationMs = session.durationMs,
            paused = session.paused,
            rate = session.rate,
            pens = session.connectedPens,
            canUndo = session.canUndo(),
            canRedo = session.canRedo(),
            renderP50Ms = r.p50Ms,
            renderP95Ms = r.p95Ms,
            renderMaxMs = r.maxMs,
            renderFrames = r.frames,
        ),
    )
}
