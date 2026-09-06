package dev.telestrator.core

import java.util.concurrent.atomic.AtomicLong

/**
 * How long a committed annotation stays on screen, counted from the frame it was drawn on.
 *
 * The default is a hold window rather than "forever" because a telestrator is used on a paused
 * frame and then play resumes: ink that never expires ends up floating over the wrong moment.
 * [Sticky] is the deliberate opt-out for a drawing the viewer wants to keep across a whole
 * sequence. Its value is large but finite so `fromMs + ms` cannot overflow.
 */
enum class Hold(val ms: Long) {
    Brief(3_000),
    Default(6_000),
    Extended(15_000),

    /** Large but finite, so `fromMs + ms` can never wrap. */
    Sticky(Long.MAX_VALUE / 4);

    companion object {
        fun parse(name: String?): Hold =
            entries.firstOrNull { it.name.equals(name, ignoreCase = true) } ?: Default
    }
}

/**
 * Turns a stream of pen messages into a live annotation document. Owns the "currently being drawn"
 * stroke so the TV renderer can show ink before the finger lifts, and the undo history.
 *
 * Pure JVM by design (decision D7): the entire pen-to-document behaviour is unit-testable without
 * an emulator, and the Android layer only feeds it messages and reads [doc].
 */
class PenEngine(
    private val clipId: String,
    private val videoAspect: Double = 16.0 / 9.0,
    /** Hold window used when a message does not ask for a specific one. */
    var defaultHold: Hold = Hold.Default,
) {
    /** Kept for tests and callers that want a plain millisecond window. */
    constructor(clipId: String, videoAspect: Double = 16.0 / 9.0, holdMs: Long) :
        this(clipId, videoAspect, Hold.Default) {
        overrideHoldMs = holdMs
    }

    private var overrideHoldMs: Long? = null

    private val ids = AtomicLong(0)
    private val committed = mutableListOf<Annotation>()
    private val history = History()

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
    val canUndo: Boolean get() = history.canUndo
    val canRedo: Boolean get() = history.canRedo

    private fun nextId(): String = "a${ids.incrementAndGet()}"

    private fun holdMs(requested: String?): Long =
        overrideHoldMs ?: (if (requested == null) defaultHold else Hold.parse(requested)).ms

    /** @param mediaTimeMs the player position the drawing is anchored to. */
    fun accept(msg: PenMessage, mediaTimeMs: Long) {
        when (msg) {
            is PenMessage.Pen -> handlePen(msg, mediaTimeMs)
            is PenMessage.Shape -> handleShape(msg, mediaTimeMs)
            is PenMessage.Tag -> handleTag(msg, mediaTimeMs)
            is PenMessage.Erase -> handleErase(msg, mediaTimeMs)
            is PenMessage.Clear -> {
                if (committed.isNotEmpty()) history.record(Op.ClearAll(committed.toList()))
                committed.clear()
                clearLive()
            }
            is PenMessage.Undo -> {
                clearLive()
                history.undo(committed)
            }
            is PenMessage.Redo -> {
                clearLive()
                history.redo(committed)
            }
            is PenMessage.Hello, is PenMessage.Transport, is PenMessage.Ping -> Unit
        }
    }

    private fun commit(a: Annotation) {
        committed += a
        history.record(Op.Add(a))
    }

    private fun handlePen(msg: PenMessage.Pen, tMs: Long) {
        val xyp = msg.pts.map { listOf(it[0], it[1], it.getOrElse(2) { 0.5 }) }
        when (msg.phase) {
            "down" -> {
                clearLive()
                liveMeta = Annotation.Stroke(
                    id = nextId(),
                    fromMs = tMs,
                    toMs = tMs + holdMs(msg.hold),
                    style = Style(color = msg.color, width = msg.width),
                )
                livePoints += xyp
            }
            "move" -> if (liveMeta != null) livePoints += xyp
            "up" -> {
                val meta = liveMeta
                if (meta != null) {
                    livePoints += xyp
                    // Decimate once, on commit: the live stroke keeps every sample so the ink
                    // under the finger stays honest, but what gets stored is what gets drawn.
                    val finished = meta.copy(points = Smoothing.decimate(livePoints.toList()))
                    clearLive()
                    // A tap with under two points is not a stroke; drop it rather than draw a dot.
                    if (finished.points.size >= 2) commit(finished)
                }
            }
        }
    }

    private fun handleShape(msg: PenMessage.Shape, tMs: Long) {
        val hold = holdMs(msg.hold)
        val style = Style(color = msg.color, width = msg.width)
        val a = when (msg.tool) {
            "arrow" -> Annotation.Arrow(nextId(), tMs, tMs + hold, style, msg.from, msg.to)
            "circle" -> Annotation.Circle(
                nextId(), tMs, tMs + hold, style,
                center = msg.from, radius = distance(msg.from, msg.to),
            )
            "spotlight" -> Annotation.Spotlight(
                nextId(), tMs, tMs + hold, style,
                center = msg.from, radius = distance(msg.from, msg.to).coerceAtLeast(0.03),
            )
            else -> null
        }
        if (a != null) commit(a)
    }

    private fun handleTag(msg: PenMessage.Tag, tMs: Long) {
        val label = msg.label.trim()
        if (label.isEmpty()) return
        commit(
            Annotation.NameTag(
                id = nextId(),
                fromMs = tMs,
                // Tags read as identification rather than emphasis, so they outlive a stroke.
                toMs = tMs + holdMs(msg.hold ?: Hold.Extended.name),
                style = Style(color = msg.color, variant = "broadcast"),
                anchor = listOf(msg.x, msg.y),
                label = label,
            )
        )
    }

    private fun handleErase(msg: PenMessage.Erase, tMs: Long) {
        // Only things the viewer can currently see are erasable; reaching through a hidden
        // annotation from another part of the clip would be baffling.
        val visible = AnnotationTimeline(doc).visibleAt(tMs)
        val target = HitTest.pick(visible, msg.x, msg.y, msg.tolerance) ?: return
        val index = committed.indexOfFirst { it.id == target.id }
        if (index < 0) return
        committed.removeAt(index)
        history.record(Op.Remove(index, target))
    }

    private fun clearLive() {
        liveMeta = null
        livePoints.clear()
    }

    private fun distance(a: List<Double>, b: List<Double>): Double {
        val dx = b[0] - a[0]
        val dy = b[1] - a[1]
        return kotlin.math.sqrt(dx * dx + dy * dy)
    }
}
