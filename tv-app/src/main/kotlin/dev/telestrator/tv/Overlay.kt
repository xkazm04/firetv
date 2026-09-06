package dev.telestrator.tv

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
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
 */
@Composable
fun TelestrationOverlay(doc: AnnotationDoc, tMs: Long, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val started = System.nanoTime()
        val rect = ContentRect.fit(size.width, size.height, doc.videoAspect)
        val visible = AnnotationTimeline(doc).visibleAt(tMs)

        // Spotlights dim everything else, so they have to land under the ink.
        visible.filterIsInstance<Annotation.Spotlight>().forEach { drawSpotlight(it, rect) }

        // One Path, reset between segments. A fresh Path per segment would allocate hundreds of
        // objects per frame on a device with a 256 MB heap.
        val scratch = Path()
        visible.forEach { a ->
            when (a) {
                is Annotation.Stroke -> drawStroke(a, rect, scratch)
                is Annotation.Arrow -> drawArrow(a, rect)
                is Annotation.Circle -> drawRing(a, rect)
                is Annotation.NameTag -> drawNameTag(a, rect)
                is Annotation.Spotlight -> Unit
            }
        }
        RenderStats.record(System.nanoTime() - started)
    }
}

private fun parseColor(hex: String): Color =
    runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Color.Yellow)

private fun DrawScope.widthPx(rect: ContentRect, w: Double) = rect.w(w).coerceAtLeast(2f)

/**
 * Draws a stroke as smoothed cubic segments, each at a width taken from the pen pressure at that
 * point. Drawing the raw polyline instead is visibly faceted once a phone-sized gesture is blown
 * up to a 1080p picture.
 */
private fun DrawScope.drawStroke(a: Annotation.Stroke, rect: ContentRect, scratch: Path) {
    val cubics = Smoothing.path(a.points)
    if (cubics.isEmpty()) return
    val color = parseColor(a.style.color)
    for (c in cubics) {
        scratch.reset()
        scratch.moveTo(rect.x(c.x0), rect.y(c.y0))
        scratch.cubicTo(
            rect.x(c.c1x), rect.y(c.c1y),
            rect.x(c.c2x), rect.y(c.c2y),
            rect.x(c.x1), rect.y(c.y1),
        )
        drawPath(
            path = scratch,
            color = color,
            style = StrokeStyle(
                width = widthPx(rect, Smoothing.widthFor(a.style.width, c.pressure)),
                cap = StrokeCap.Round,
            ),
        )
    }
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
