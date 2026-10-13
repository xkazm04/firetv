package dev.telestrator.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test

/**
 * A tap is not a drawing. The freehand pen already drops a stroke of under two points; a tap with
 * the arrow or circle tool sends a shape whose two ends are the same place, and that drew a stray
 * arrowhead or a dot on the TV, took an undo slot and added a drawn moment to the scrub bar.
 * The spotlight keeps its floor radius on purpose: a tap there is a default-sized spotlight.
 */
class ShapeTapTest {

    @Test
    fun `case 1 - a tap with the arrow or the circle tool commits nothing`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Shape("arrow", listOf(0.4, 0.4), listOf(0.4, 0.4)), 5_000)
        e.accept(PenMessage.Shape("circle", listOf(0.4, 0.4), listOf(0.4, 0.4)), 5_000)
        // Closer than the finger-holding-still threshold is still a tap.
        e.accept(PenMessage.Shape("circle", listOf(0.4, 0.4), listOf(0.402, 0.4)), 5_000)

        assertEquals(0, e.annotationCount)
        assertFalse(e.canUndo)
        assertEquals(emptyList<Long>(), AnnotationTimeline(e.doc).moments())
    }

    @Test
    fun `case 2 GUARD - a real drag still draws, and a spotlight tap still draws its floor`() {
        val e = PenEngine("c")
        e.accept(PenMessage.Shape("arrow", listOf(0.4, 0.4), listOf(0.41, 0.4)), 0)
        e.accept(PenMessage.Shape("circle", listOf(0.4, 0.4), listOf(0.4, 0.41)), 0)
        e.accept(PenMessage.Shape("spotlight", listOf(0.4, 0.4), listOf(0.4, 0.4)), 0)

        assertEquals(listOf("arrow", "circle", "spotlight"), e.doc.annotations.map {
            when (it) {
                is Annotation.Arrow -> "arrow"
                is Annotation.Circle -> "circle"
                is Annotation.Spotlight -> "spotlight"
                else -> "other"
            }
        })
        assertEquals(0.03, (e.doc.annotations[2] as Annotation.Spotlight).radius, 1e-12)
    }
}
