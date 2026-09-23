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

    /**
     * The drawn moments of review mode: the frames the viewer drew on, ascending.
     *
     * A stroke followed by an arrow on the same pause is one moment to go back to, not two, so
     * anchors less than [MOMENT_SPAN_MS] after a moment's first anchor join it. Only what is in the
     * document counts: erased or undone ink leaves no moment behind.
     */
    fun moments(): List<Long> {
        val out = mutableListOf<Long>()
        for (t in doc.annotations.map { it.fromMs }.sorted()) {
            if (out.isEmpty() || t - out.last() >= MOMENT_SPAN_MS) out += t
        }
        return out
    }

    /** The first moment after the one the playhead sits on at [tMs], or null at the last one. */
    fun momentAfter(tMs: Long): Long? = moments().firstOrNull { it > tMs + ON_MOMENT_LEAD_MS }

    /** The last moment before the one the playhead sits on at [tMs], or null at the first one. */
    fun momentBefore(tMs: Long): Long? = moments().lastOrNull { it + MOMENT_SPAN_MS <= tMs }

    companion object {
        /** Anchors this close after a moment's first one belong to it; also how long the playhead "sits on" it. */
        const val MOMENT_SPAN_MS = 500L

        /** A playhead this far short of a moment is already on it (a seek can land a frame early). */
        const val ON_MOMENT_LEAD_MS = 40L
    }
}
