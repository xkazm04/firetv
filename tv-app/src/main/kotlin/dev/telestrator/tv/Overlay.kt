package dev.telestrator.tv

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke as StrokeStyle
import androidx.compose.ui.graphics.nativeCanvas
import dev.telestrator.core.Annotation
import dev.telestrator.core.AnnotationDoc
import dev.telestrator.core.AnnotationTimeline
import dev.telestrator.core.ContentRect
import dev.telestrator.core.Smoothing
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * Renders the annotation document for the current media time on top of the video.
 *
 * The Canvas draws straight from the document; there is no per-point recomposition, the whole
 * overlay redraws when [tMs] or [doc] changes (design doc 3.2). Every draw is timed into
 * [RenderStats] so the 4 ms budget is a measured number rather than an aspiration.
 *
 * Strokes are drawn from [StrokeCache], which keeps the smoothed geometry between frames. On a
 * real Fire TV Stick, rebuilding it per frame is what breaks this app - see the class comment.
 */
@Composable
fun TelestrationOverlay(doc: AnnotationDoc, tMs: Long, modifier: Modifier = Modifier) {
    val strokes = remember { StrokeCache() }
    Canvas(modifier = modifier) {
        val started = System.nanoTime()
        val rect = ContentRect.fit(size.width, size.height, doc.videoAspect)
        val visible = AnnotationTimeline(doc).visibleAt(tMs)

        // Spotlights dim everything else, so they have to land under the ink.
        visible.filterIsInstance<Annotation.Spotlight>().forEach { drawSpotlight(it, rect) }

        strokes.beginFrame(rect)
        visible.forEach { a ->
            when (a) {
                is Annotation.Stroke -> drawStroke(a, rect, strokes)
                is Annotation.Arrow -> drawArrow(a, rect)
                is Annotation.Circle -> drawRing(a, rect)
                is Annotation.NameTag -> drawNameTag(a, rect)
                is Annotation.Spotlight -> Unit
            }
        }
        strokes.endFrame()
        RenderStats.record(System.nanoTime() - started)
    }
}

private fun parseColor(hex: String): Color =
    runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Color.Yellow)

private fun widthPx(rect: ContentRect, w: Double) = rect.w(w).coerceAtLeast(2f)

/**
 * Draws a stroke as smoothed cubic segments, each at a width taken from the pen pressure at that
 * point. Drawing the raw polyline instead is visibly faceted once a phone-sized gesture is blown
 * up to a 1080p picture.
 *
 * The geometry comes from [StrokeCache] rather than being refitted here, and the segments are
 * batched into one path per pressure bucket, so a long stroke costs a handful of draw calls
 * instead of one per segment.
 */
private fun DrawScope.drawStroke(a: Annotation.Stroke, rect: ContentRect, cache: StrokeCache) {
    val entry = cache.extend(a, rect)
    val color = parseColor(a.style.color)

    for (bucket in 0 until PRESSURE_BUCKETS) {
        if (!entry.used[bucket]) continue
        drawPath(
            path = entry.paths[bucket],
            color = color,
            style = StrokeStyle(
                width = widthPx(rect, Smoothing.widthFor(a.style.width, bucketPressure(bucket))),
                cap = StrokeCap.Round,
            ),
        )
    }

    // The newest span or two cannot be fitted yet: a Catmull-Rom segment needs the point after
    // next, which the finger has not drawn. Carrying them as straight lines keeps the ink under
    // the finger honest and costs nothing, and they turn into curve the moment they are settled.
    entry.drawPendingTail(this, a, rect, color)
}

private fun DrawScope.drawArrow(a: Annotation.Arrow, rect: ContentRect) {
    val color = parseColor(a.style.color)
    val w = widthPx(rect, a.style.width)
    val from = Offset(rect.x(a.from[0]), rect.y(a.from[1]))
    val to = Offset(rect.x(a.to[0]), rect.y(a.to[1]))
    drawLine(color, from, to, strokeWidth = w, cap = StrokeCap.Round)

    val angle = atan2((to.y - from.y).toDouble(), (to.x - from.x).toDouble())
    val head = w * 5f
    val spread = 0.45
    listOf(angle + Math.PI - spread, angle + Math.PI + spread).forEach { th ->
        drawLine(
            color,
            to,
            Offset(to.x + (head * cos(th)).toFloat(), to.y + (head * sin(th)).toFloat()),
            strokeWidth = w,
            cap = StrokeCap.Round,
        )
    }
}

private fun DrawScope.drawRing(a: Annotation.Circle, rect: ContentRect) {
    drawCircle(
        color = parseColor(a.style.color),
        radius = rect.w(a.radius),
        center = Offset(rect.x(a.center[0]), rect.y(a.center[1])),
        style = StrokeStyle(width = widthPx(rect, a.style.width)),
    )
}

private fun DrawScope.drawSpotlight(a: Annotation.Spotlight, rect: ContentRect) {
    val center = Offset(rect.x(a.center[0]), rect.y(a.center[1]))
    val radius = rect.w(a.radius)
    // Dim the picture, then punch the highlight back out of the dim layer.
    drawRect(
        color = Color.Black.copy(alpha = 0.6f),
        topLeft = Offset(rect.left, rect.top),
        size = Size(rect.width, rect.height),
    )
    drawCircle(color = Color.Transparent, radius = radius, center = center, blendMode = BlendMode.Clear)
    drawCircle(
        color = parseColor(a.style.color),
        radius = radius,
        center = center,
        style = StrokeStyle(width = widthPx(rect, 0.004)),
    )
}

/**
 * Broadcast-style name tag: a leader line down to the anchor, then a filled label above it, so the
 * text never sits on top of the player it is naming.
 */
private fun DrawScope.drawNameTag(a: Annotation.NameTag, rect: ContentRect) {
    val anchorX = rect.x(a.anchor[0])
    val anchorY = rect.y(a.anchor[1])
    val textSize = rect.height * 0.042f
    val lift = textSize * 1.8f
    val accent = parseColor(a.style.color)

    val paint = android.graphics.Paint().apply {
        isAntiAlias = true
        this.textSize = textSize
        typeface = android.graphics.Typeface.DEFAULT_BOLD
    }
    val textWidth = paint.measureText(a.label)
    val padX = textSize * 0.45f
    val padY = textSize * 0.3f

    val boxLeft = anchorX - textWidth / 2f - padX
    val boxTop = anchorY - lift - textSize - padY
    val boxW = textWidth + padX * 2
    val boxH = textSize + padY * 2

    drawLine(accent, Offset(anchorX, anchorY), Offset(anchorX, boxTop + boxH), strokeWidth = widthPx(rect, 0.0025))
    drawCircle(accent, radius = widthPx(rect, 0.004), center = Offset(anchorX, anchorY))
    drawRect(color = accent, topLeft = Offset(boxLeft, boxTop), size = Size(boxW, boxH))

    paint.color = android.graphics.Color.BLACK
    drawContext.canvas.nativeCanvas.drawText(a.label, boxLeft + padX, boxTop + padY + textSize * 0.82f, paint)
}

/**
 * How many distinct widths a stroke is drawn with. Pen pressure is continuous, but every distinct
 * width costs a separate draw call, and six steps is already finer than the eye resolves on a
 * stroke a few pixels wide.
 */
private const val PRESSURE_BUCKETS = 6

/** Matches [Smoothing.decimate]'s default: points closer than this are the finger holding still. */
private const val MIN_POINT_DISTANCE = 0.004

/** Catmull-Rom at the tension the renderer has always used; kept here so spans can be fitted one at a time. */
private const val SPLINE_K = 1.0 / 6.0

private fun bucketPressure(bucket: Int): Double = bucket / (PRESSURE_BUCKETS - 1.0)

/**
 * Keeps stroke geometry between frames.
 *
 * The overlay used to refit every stroke on every frame: decimate the whole point list, fit a
 * spline through all of it, then issue one `drawPath` per segment. For a short stroke that is
 * nothing, which is why an x86 emulator never complained. On a Fire TV Stick, a finger drawing
 * continuously turns it into quadratic work plus thousands of draw calls per frame - measured at
 * 150% CPU, an overlay draw of 12 ms against a 4 ms budget, and a pen round-trip whose p95 grew
 * without bound because the receive loop was competing with all of it for the same cores.
 *
 * So geometry is built once, incrementally: each point is decimated as it arrives, each span is
 * fitted exactly once when it becomes determined, and the result is appended to one retained
 * [Path] per pressure bucket. A frame costs one draw call per bucket and nothing else. This is
 * the design doc's "retained Path, no recomposition per point", which POC-FINDINGS.md already
 * called load-bearing rather than polish.
 */
private class StrokeCache {
    private val entries = HashMap<String, StrokeRender>()
    private val seen = HashSet<String>()

    fun beginFrame(rect: ContentRect) {
        seen.clear()
        // A resize invalidates every retained path, because they hold pixel coordinates.
        if (entries.isNotEmpty() && entries.values.first().rect != rect) entries.clear()
    }

    fun extend(a: Annotation.Stroke, rect: ContentRect): StrokeRender {
        seen += a.id
        return entries.getOrPut(a.id) { StrokeRender() }.apply { ingest(a, rect) }
    }

    /** Forget strokes that were undone, erased, or have simply left their hold window. */
    fun endFrame() {
        if (entries.size != seen.size) entries.keys.retainAll(seen)
    }
}

private class StrokeRender {
    var rect: ContentRect? = null
        private set

    val paths = Array(PRESSURE_BUCKETS) { Path() }
    val used = BooleanArray(PRESSURE_BUCKETS)

    /** Decimated points, normalized, as [x, y, pressure]. */
    private val kept = ArrayList<DoubleArray>()
    private var consumedRaw = 0
    private var fittedSpans = 0
    private var lastRawX = 0.0
    private var lastRawY = 0.0
    private var lastRawP = 0.5

    fun ingest(a: Annotation.Stroke, rect: ContentRect) {
        // Points only ever arrive; a shorter list means this is a different stroke wearing the
        // same id - a live stroke replaced by its decimated committed form - so start over.
        if (this.rect != rect || a.points.size < consumedRaw) reset(rect)

        val pts = a.points
        while (consumedRaw < pts.size) {
            val p = pts[consumedRaw++]
            lastRawX = p[0]
            lastRawY = p.getOrElse(1) { 0.0 }
            lastRawP = p.getOrElse(2) { 0.5 }
            val last = kept.lastOrNull()
            if (last == null) {
                kept += doubleArrayOf(lastRawX, lastRawY, lastRawP)
                continue
            }
            val dx = lastRawX - last[0]
            val dy = lastRawY - last[1]
            if (dx * dx + dy * dy >= MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) {
                kept += doubleArrayOf(lastRawX, lastRawY, lastRawP)
            }
        }

        // Span i runs from kept[i] to kept[i+1] and needs kept[i+2] to be fitted, so it settles
        // only once two more points exist. Everything settled is fitted once and never revisited.
        while (fittedSpans + 3 <= kept.size) {
            fitSpan(fittedSpans, rect)
            fittedSpans++
        }
    }

    private fun fitSpan(i: Int, rect: ContentRect) {
        val p0 = kept[if (i == 0) 0 else i - 1]
        val p1 = kept[i]
        val p2 = kept[i + 1]
        val p3 = kept[i + 2]

        val pressure = (p1[2] + p2[2]) / 2.0
        val bucket = (pressure.coerceIn(0.0, 1.0) * (PRESSURE_BUCKETS - 1)).let { Math.round(it).toInt() }
        val path = paths[bucket]
        used[bucket] = true

        path.moveTo(rect.x(p1[0]), rect.y(p1[1]))
        path.cubicTo(
            rect.x(p1[0] + (p2[0] - p0[0]) * SPLINE_K), rect.y(p1[1] + (p2[1] - p0[1]) * SPLINE_K),
            rect.x(p2[0] - (p3[0] - p1[0]) * SPLINE_K), rect.y(p2[1] - (p3[1] - p1[1]) * SPLINE_K),
            rect.x(p2[0]), rect.y(p2[1]),
        )
    }

    fun drawPendingTail(scope: DrawScope, a: Annotation.Stroke, rect: ContentRect, color: Color) {
        if (kept.isEmpty()) return
        val width = widthPx(rect, Smoothing.widthFor(a.style.width, lastRawP))

        var from = kept[fittedSpans.coerceAtMost(kept.size - 1)]
        for (i in fittedSpans until kept.size - 1) {
            val to = kept[i + 1]
            scope.drawLine(
                color,
                Offset(rect.x(from[0]), rect.y(from[1])),
                Offset(rect.x(to[0]), rect.y(to[1])),
                strokeWidth = width,
                cap = StrokeCap.Round,
            )
            from = to
        }

        // And on to wherever the finger actually is, which decimation has not accepted yet.
        val tip = kept.last()
        if (tip[0] != lastRawX || tip[1] != lastRawY) {
            scope.drawLine(
                color,
                Offset(rect.x(tip[0]), rect.y(tip[1])),
                Offset(rect.x(lastRawX), rect.y(lastRawY)),
                strokeWidth = width,
                cap = StrokeCap.Round,
            )
        }
    }

    private fun reset(rect: ContentRect) {
        this.rect = rect
        kept.clear()
        consumedRaw = 0
        fittedSpans = 0
        for (i in paths.indices) {
            paths[i].reset()
            used[i] = false
        }
    }
}
