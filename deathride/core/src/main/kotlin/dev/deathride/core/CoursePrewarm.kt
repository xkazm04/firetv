package dev.deathride.core

import java.util.concurrent.Executors
import java.util.concurrent.Future

/**
 * Builds the course about to be used and bakes its projection bins on one background thread, so no render thread pays
 * a course's first project() (P9 on the Stick: 1.1-2.3 s per first visit, 0.056 ms on a revisit).
 * Only that course is ever submitted, never the catalogue: the eager bake of every course stalled Android startup.
 * Tasks run one at a time, in submission order, below the render thread's priority.
 */
object CoursePrewarm {
    private val worker=Executors.newSingleThreadExecutor { r->Thread(r,"deathride-course-bake").apply{isDaemon=true;priority=Thread.NORM_PRIORITY-2} }
    /** Builds course [index] and bakes its bins, then runs [then] on the worker, even if the bake failed (the render thread would retry it). */
    fun submit(index: Int,then: ()->Unit={}): Future<*> = worker.submit { try { Courses.course(index).prewarmProjection() } finally { then() } }
    fun submit(course: Course): Future<*> = worker.submit { course.prewarmProjection() }
}
