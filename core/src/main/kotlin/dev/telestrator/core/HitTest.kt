package dev.telestrator.core

import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

/**
 * "What did the viewer just point at?"
 *
 * Backs the eraser, and later the name-tag snap. Distances are in normalized units, so a
 * tolerance is a fraction of the picture width and behaves the same on any screen.
 */
object HitTest {

    /** Default grab radius: about 2.5% of the picture, roughly a fingertip at TV viewing size. */
    const val DEFAULT_TOLERANCE: Double = 0.025

    /**
     * Topmost annotation within [tolerance] of ([x], [y]), or null. Later annotations win, which
     * matches what the viewer sees: the eraser takes the thing drawn on top.
     */
    fun pick(
        annotations: List<Annotation>,
        x: Double,
        y: Double,
        tolerance: Double = DEFAULT_TOLERANCE,
    ): Annotation? = annotations.lastOrNull { distanceTo(it, x, y) <= tolerance }

    /** Distance from a point to an annotation's drawn geometry, in normalized units. */
    fun distanceTo(a: Annotation, x: Double, y: Double): Double = when (a) {
        is Annotation.Stroke -> a.points
            .zipWithNext { p, q -> pointToSegment(x, y, p[0], p[1], q[0], q[1]) }
            .minOrNull()
            ?: a.points.firstOrNull()?.let { hypot(x - it[0], y - it[1]) }
            ?: Double.MAX_VALUE

        is Annotation.Arrow -> pointToSegment(x, y, a.from[0], a.from[1], a.to[0], a.to[1])

        // Rings are hit on the line, not in the middle: a circle drawn around a player must not
        // swallow taps meant for the player.
        is Annotation.Circle -> abs(hypot(x - a.center[0], y - a.center[1]) - a.radius)

        // A spotlight is a filled region, so anywhere inside it counts.
        is Annotation.Spotlight ->
            (hypot(x - a.center[0], y - a.center[1]) - a.radius).coerceAtLeast(0.0)

        // Tags are small; treat the anchor as the target.
        is Annotation.NameTag -> hypot(x - a.anchor[0], y - a.anchor[1])
    }

    /** Shortest distance from a point to a line segment (not the infinite line). */
    fun pointToSegment(
        px: Double, py: Double,
        ax: Double, ay: Double,
        bx: Double, by: Double,
    ): Double {
        val dx = bx - ax
        val dy = by - ay
        val lenSq = dx * dx + dy * dy
        if (lenSq == 0.0) return hypot(px - ax, py - ay)
        // Project onto the segment and clamp, so the ends do not attract from behind.
        val t = min(1.0, max(0.0, ((px - ax) * dx + (py - ay) * dy) / lenSq))
        return hypot(px - (ax + t * dx), py - (ay + t * dy))
    }
}
