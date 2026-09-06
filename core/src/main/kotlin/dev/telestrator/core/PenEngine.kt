package dev.telestrator.core

import java.util.concurrent.atomic.AtomicLong

/**
 * Turns a stream of pen messages into a live annotation document. Owns the "currently being drawn"
 * stroke so the TV renderer can show ink before the finger lifts.
 *
 * Pure JVM by design (decision D7): the entire pen-to-document behaviour is unit-testable without
 * an emulator, and the Android layer only feeds it messages and reads [doc].
 */
class PenEngine(
    private val clipId: String,
    private val videoAspect: Double = 16.0 / 9.0,
    /** Milliseconds an annotation stays on screen after it is committed. */
    private val holdMs: Long = 6_000,
) {
    private val ids = AtomicLong(0)
    private val committed = mutableListOf<Annotation>()

    // The in-progress stroke is accumulated in place. Rebuilding an immutable Stroke on every
    // incoming batch is O(points) per message, which at 60 Hz turns into quadratic work and
    // enough allocation churn to show up as GC pauses in the pen round-trip.
    private var liveMeta: Annotation.Stroke? = null
    private val livePoints = mutableListOf<List<Double>>()

    val doc: AnnotationDoc
        get() {
            val live = liveMeta?.copy(points = livePoints.toList())
            return AnnotationDoc(
                clipId = clipId,
                videoAspect = videoAspect,
                annotations = if (live == null) committed.toList() else committed + live,
            )
        }

    val annotationCount: Int get() = committed.size + (if (liveMeta != null) 1 else 0)

    private fun nextId(): String = "a${ids.incrementAndGet()}"

    /** @param mediaTimeMs the player position the drawing is anchored to. */
    fun accept(msg: PenMessage, mediaTimeMs: Long) {
        when (msg) {
            is PenMessage.Pen -> handlePen(msg, mediaTimeMs)
            is PenMessage.Shape -> handleShape(msg, mediaTimeMs)
            is PenMessage.Clear -> {
                committed.clear()
                clearLive()
            }
            is PenMessage.Undo -> {
                clearLive()
                if (committed.isNotEmpty()) committed.removeAt(committed.lastIndex)
            }
            is PenMessage.Hello, is PenMessage.Transport, is PenMessage.Ping -> Unit
        }
    }

    private fun handlePen(msg: PenMessage.Pen, tMs: Long) {
        val xyp = msg.pts.map { listOf(it[0], it[1], it.getOrElse(2) { 0.5 }) }
        when (msg.phase) {
            "down" -> {
                clearLive()
                liveMeta = Annotation.Stroke(
                    id = nextId(),
                    fromMs = tMs,
                    toMs = tMs + holdMs,
                    style = Style(color = msg.color),
                )
                livePoints += xyp
            }
            "move" -> if (liveMeta != null) livePoints += xyp
            "up" -> {
                val meta = liveMeta
                if (meta != null) {
                    livePoints += xyp
                    val finished = meta.copy(points = livePoints.toList())
                    clearLive()
                    // A tap with under two points is not a stroke; drop it rather than draw a dot.
                    if (finished.points.size >= 2) committed += finished
                }
            }
        }
    }

    private fun clearLive() {
        liveMeta = null
        livePoints.clear()
    }

    private fun handleShape(msg: PenMessage.Shape, tMs: Long) {
        val a = when (msg.tool) {
            "arrow" -> Annotation.Arrow(nextId(), tMs, tMs + holdMs, Style(color = msg.color), msg.from, msg.to)
            "circle" -> Annotation.Circle(
                nextId(), tMs, tMs + holdMs, Style(color = msg.color),
                center = msg.from, radius = distance(msg.from, msg.to),
            )
            "spotlight" -> Annotation.Spotlight(
                nextId(), tMs, tMs + holdMs, Style(color = msg.color),
                center = msg.from, radius = distance(msg.from, msg.to).coerceAtLeast(0.03),
            )
            else -> null
        }
        if (a != null) committed += a
    }

    private fun distance(a: List<Double>, b: List<Double>): Double {
        val dx = b[0] - a[0]
        val dy = b[1] - a[1]
        return kotlin.math.sqrt(dx * dx + dy * dy)
    }
}
