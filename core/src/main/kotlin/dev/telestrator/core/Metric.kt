package dev.telestrator.core

import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

/**
 * The one way to measure a distance in normalized annotation space.
 *
 * Normalized coordinates are per axis: x is a fraction of the picture width, y a fraction of its
 * height (the phone's pad divides by its own width and height, and the pad carries the video's
 * aspect). So on a 16:9 picture one unit of y is only 0.5625 of one unit of x on screen, and a
 * plain hypot over normalized coordinates is squashed vertically.
 *
 * A [Metric] measures in content-width units: y is divided by [aspect] before the Euclidean
 * distance is taken. That is the unit the TV draws lengths in (ContentRect.w, radii and stroke
 * widths are fractions of the content width), so a radius or tolerance computed here is round on
 * screen in every direction.
 *
 * @property aspect the video's width over its height, as in [AnnotationDoc.videoAspect].
 */
data class Metric(val aspect: Double) {

    init {
        require(aspect.isFinite() && aspect > 0.0) { "aspect must be a positive number, was $aspect" }
    }

    /** Distance between ([ax], [ay]) and ([bx], [by]), in content-width units. */
    fun distance(ax: Double, ay: Double, bx: Double, by: Double): Double =
        hypot(bx - ax, (by - ay) / aspect)

    /** Distance between two normalized points given as [x, y, ...] lists. */
    fun distance(a: List<Double>, b: List<Double>): Double = distance(a[0], a[1], b[0], b[1])

    /**
     * Shortest distance from a point to a line segment (not the infinite line), in content-width
     * units. The projection happens in the same scaled space, so the foot of the perpendicular is
     * the one the viewer would pick on screen.
     */
    fun pointToSegment(
        px: Double, py: Double,
        ax: Double, ay: Double,
        bx: Double, by: Double,
    ): Double {
        val sa = 1.0 / aspect
        val dx = bx - ax
        val dy = (by - ay) * sa
        val qx = px - ax
        val qy = (py - ay) * sa
        val lenSq = dx * dx + dy * dy
        if (lenSq == 0.0) return hypot(qx, qy)
        // Project onto the segment and clamp, so the ends do not attract from behind.
        val t = min(1.0, max(0.0, (qx * dx + qy * dy) / lenSq))
        return hypot(qx - t * dx, qy - t * dy)
    }

    /** True when [a] and [b] are at least [minDistance] apart; the decimation test. */
    fun apart(a: List<Double>, b: List<Double>, minDistance: Double): Boolean {
        val dx = b[0] - a[0]
        val dy = (b[1] - a[1]) / aspect
        return dx * dx + dy * dy >= minDistance * minDistance
    }
}
