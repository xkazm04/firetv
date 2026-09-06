package dev.telestrator.tv

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke as StrokeStyle
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import dev.telestrator.core.Annotation
import dev.telestrator.core.AnnotationDoc
import dev.telestrator.core.AnnotationTimeline
import dev.telestrator.core.ContentRect
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * Renders the annotation document for the current media time on top of the video.
 *
 * The Canvas draws straight from the document; there is no per-point recomposition, the whole
 * overlay redraws when [tMs] or [doc] changes (design doc 3.2).
 */
@Composable
fun TelestrationOverlay(doc: AnnotationDoc, tMs: Long, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val rect = ContentRect.fit(size.width, size.height, doc.videoAspect)
        val visible = AnnotationTimeline(doc).visibleAt(tMs)
        // Spotlights dim everything else, so they have to land under the ink.
        visible.filterIsInstance<Annotation.Spotlight>().forEach { drawSpotlight(it, rect) }
        visible.forEach { a ->
            when (a) {
                is Annotation.Stroke -> drawStroke(a, rect)
                is Annotation.Arrow -> drawArrow(a, rect)
                is Annotation.Circle -> drawCircle(a, rect)
                is Annotation.NameTag -> drawNameTag(a, rect)
                is Annotation.Spotlight -> Unit
            }
        }
    }
}

private fun parseColor(hex: String): Color =
    runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Color.Yellow)

private fun DrawScope.strokeWidthPx(rect: ContentRect, w: Double) =
    rect.w(w).coerceAtLeast(2f)

private fun DrawScope.drawStroke(a: Annotation.Stroke, rect: ContentRect) {
    if (a.points.size < 2) return
    val path = Path()
    a.points.forEachIndexed { i, p ->
        val x = rect.x(p[0])
        val y = rect.y(p[1])
        if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
    }
    drawPath(
        path = path,
        color = parseColor(a.style.color),
        style = StrokeStyle(width = strokeWidthPx(rect, a.style.width), cap = androidx.compose.ui.graphics.StrokeCap.Round),
    )
}

private fun DrawScope.drawArrow(a: Annotation.Arrow, rect: ContentRect) {
    val color = parseColor(a.style.color)
    val w = strokeWidthPx(rect, a.style.width)
    val from = Offset(rect.x(a.from[0]), rect.y(a.from[1]))
    val to = Offset(rect.x(a.to[0]), rect.y(a.to[1]))
    drawLine(color, from, to, strokeWidth = w, cap = androidx.compose.ui.graphics.StrokeCap.Round)

    val angle = atan2((to.y - from.y).toDouble(), (to.x - from.x).toDouble())
    val head = w * 5f
    val spread = 0.45
    listOf(angle + Math.PI - spread, angle + Math.PI + spread).forEach { th ->
        drawLine(
            color,
            to,
            Offset(to.x + (head * cos(th)).toFloat(), to.y + (head * sin(th)).toFloat()),
            strokeWidth = w,
            cap = androidx.compose.ui.graphics.StrokeCap.Round,
        )
    }
}

private fun DrawScope.drawCircle(a: Annotation.Circle, rect: ContentRect) {
    drawCircle(
        color = parseColor(a.style.color),
        radius = rect.w(a.radius),
        center = Offset(rect.x(a.center[0]), rect.y(a.center[1])),
        style = StrokeStyle(width = strokeWidthPx(rect, a.style.width)),
    )
}

private fun DrawScope.drawSpotlight(a: Annotation.Spotlight, rect: ContentRect) {
    val center = Offset(rect.x(a.center[0]), rect.y(a.center[1]))
    val radius = rect.w(a.radius)
    // Dim the picture, then punch the highlight back out of the dim layer.
    drawRect(color = Color.Black.copy(alpha = 0.6f), topLeft = Offset(rect.left, rect.top), size = Size(rect.width, rect.height))
    drawCircle(color = Color.Transparent, radius = radius, center = center, blendMode = androidx.compose.ui.graphics.BlendMode.Clear)
    drawCircle(color = parseColor(a.style.color), radius = radius, center = center, style = StrokeStyle(width = strokeWidthPx(rect, 0.004)))
}

private fun DrawScope.drawNameTag(a: Annotation.NameTag, rect: ContentRect) {
    val x = rect.x(a.anchor[0])
    val y = rect.y(a.anchor[1])
    val textSize = rect.height * 0.045f
    val paint = android.graphics.Paint().apply {
        isAntiAlias = true
        this.textSize = textSize
        color = android.graphics.Color.WHITE
        typeface = android.graphics.Typeface.DEFAULT_BOLD
    }
    val textWidth = paint.measureText(a.label)
    val padX = textSize * 0.5f
    val padY = textSize * 0.35f
    drawRect(
        color = parseColor(a.style.color).copy(alpha = 0.85f),
        topLeft = Offset(x - padX, y - textSize - padY),
        size = Size(textWidth + padX * 2, textSize + padY * 2),
    )
    drawContext.canvas.nativeCanvas.drawText(a.label, x, y, paint.apply { color = android.graphics.Color.BLACK })
}
