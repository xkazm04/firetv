package dev.telestrator.core

/**
 * Resolves which annotations are on screen at a given media timestamp. Kept deliberately free of
 * any Android type so the whole seek/hold behaviour is testable on the JVM in milliseconds.
 */
class AnnotationTimeline(private val doc: AnnotationDoc) {

    fun visibleAt(tMs: Long): List<Annotation> =
        doc.annotations.filter { tMs >= it.fromMs && tMs <= it.toMs }

    /** Fraction of an annotation's life elapsed at [tMs]; used for fade-out on the TV. */
    fun progressAt(a: Annotation, tMs: Long): Double {
        val span = (a.toMs - a.fromMs).coerceAtLeast(1)
        return ((tMs - a.fromMs).toDouble() / span).coerceIn(0.0, 1.0)
    }
}
