package dev.telestrator.core

import kotlin.math.abs

/**
 * "What did the viewer just point at?"
 *
 * Backs the eraser, and later the name-tag snap. Distances are measured by a [Metric], in
 * content-width units, so a tolerance is a fraction of the picture width in every direction and
 * behaves the same on any screen.
 */
object HitTest {

    /** Default grab radius: about 2.5% of the picture width, roughly a fingertip at TV viewing size. */
    const val DEFAULT_TOLERANCE: Double = 0.025

    /**
     * Topmost annotation within [tolerance] of ([x], [y]), or null. Later annotations win, which
     * matches what the viewer sees: the eraser takes the thing drawn on top.
     *
     * @param metric the picture's metric; there is no default, because a square one is wrong for
     *   every real video.
     */
    fun pick(
        annotations: List<Annotation>,
        x: Double,
        y: Double,
        metric: Metric,
        tolerance: Double = DEFAULT_TOLERANCE,
    ): Annotation? = annotations.lastOrNull { distanceTo(it, x, y, metric) <= tolerance }

    /** Distance from a point to an annotation's drawn geometry, in content-width units. */
    fun distanceTo(a: Annotation, x: Double, y: Double, metric: Metric): Double = when (a) {
        is Annotation.Stroke -> a.points
            .zipWithNext { p, q -> metric.pointToSegment(x, y, p[0], p[1], q[0], q[1]) }
            .minOrNull()
            ?: a.points.firstOrNull()?.let { metric.distance(x, y, it[0], it[1]) }
            ?: Double.MAX_VALUE

        is Annotation.Arrow -> metric.pointToSegment(x, y, a.from[0], a.from[1], a.to[0], a.to[1])

        // Rings are hit on the line, not in the middle: a circle drawn around a player must not
        // swallow taps meant for the player.
        is Annotation.Circle -> abs(metric.distance(x, y, a.center[0], a.center[1]) - a.radius)

        // A spotlight is a filled region, so anywhere inside it counts.
        is Annotation.Spotlight ->
            (metric.distance(x, y, a.center[0], a.center[1]) - a.radius).coerceAtLeast(0.0)

        // Tags are small; treat the anchor as the target.
        is Annotation.NameTag -> metric.distance(x, y, a.anchor[0], a.anchor[1])
    }
}
