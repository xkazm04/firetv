package dev.telestrator.core

/** A cubic Bezier segment in normalized coordinates, ready to hand to any Path API. */
data class Cubic(
    val x0: Double, val y0: Double,
    val c1x: Double, val c1y: Double,
    val c2x: Double, val c2y: Double,
    val x1: Double, val y1: Double,
    /** Mean pressure across the segment; the renderer uses it to modulate stroke width. */
    val pressure: Double,
)

/**
 * Turns the raw point stream from a finger into something that looks drawn rather than sampled.
 *
 * Raw pointer events arrive as a polyline whose corners are visible at TV scale, and a phone
 * screen is roughly a fifth the width of the picture the stroke lands on, so every bit of jitter
 * is magnified. Two passes fix it: drop points the finger did not really move to, then fit a
 * Catmull-Rom spline through what is left and hand back Bezier segments (design doc 3.2).
 *
 * Pure maths, no Android: the whole thing is exercised in JVM tests.
 */
object Smoothing {

    /**
     * Removes points closer together than [minDistance] in normalized units. A finger held still
     * emits dozens of points per second at the same place; keeping them adds cost and, once
     * pressure varies, visible lumps.
     */
    fun decimate(points: List<List<Double>>, minDistance: Double = 0.004): List<List<Double>> {
        if (points.size < 3) return points
        val out = mutableListOf(points.first())
        for (p in points.subList(1, points.size - 1)) {
            val last = out.last()
            val dx = p[0] - last[0]
            val dy = p[1] - last[1]
            if (dx * dx + dy * dy >= minDistance * minDistance) out += p
        }
        out += points.last()
        return out
    }

    /**
     * Fits a centripetal-ish Catmull-Rom spline through [points] and converts each span to a cubic
     * Bezier. The endpoints are duplicated so the curve starts and ends exactly on the finger's
     * first and last sample rather than overshooting.
     *
     * @param tension 0 gives straight lines between points, 1 gives the classic rounded spline.
     */
    fun toCubics(points: List<List<Double>>, tension: Double = 1.0): List<Cubic> {
        if (points.size < 2) return emptyList()
        val p = ArrayList<List<Double>>(points.size + 2).apply {
            add(points.first())
            addAll(points)
            add(points.last())
        }
        val k = tension / 6.0
        val out = ArrayList<Cubic>(points.size - 1)
        for (i in 1 until p.size - 2) {
            val p0 = p[i - 1]
            val p1 = p[i]
            val p2 = p[i + 1]
            val p3 = p[i + 2]
            out += Cubic(
                x0 = p1[0], y0 = p1[1],
                c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = p1[1] + (p2[1] - p0[1]) * k,
                c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = p2[1] - (p3[1] - p1[1]) * k,
                x1 = p2[0], y1 = p2[1],
                pressure = (p1.getOrElse(2) { 0.5 } + p2.getOrElse(2) { 0.5 }) / 2.0,
            )
        }
        return out
    }

    /** Convenience: decimate then fit, which is what the renderer always wants. */
    fun path(points: List<List<Double>>, tension: Double = 1.0): List<Cubic> =
        toCubics(decimate(points), tension)

    /**
     * Stroke width for a sample, given the style width and the pen pressure. A stylus or a
     * pressure-reporting touchscreen gets tapering; a device that reports nothing sits at 0.5 and
     * draws a constant line.
     */
    fun widthFor(styleWidth: Double, pressure: Double): Double =
        styleWidth * (0.55 + 0.9 * pressure.coerceIn(0.0, 1.0))
}
