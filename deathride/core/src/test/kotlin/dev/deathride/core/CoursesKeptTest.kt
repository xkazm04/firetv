package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P21 card 15: walking Courses.playable for the /routes reply keeps only the courses a selection built. */
class CoursesKeptTest {
    @Test fun walkingPlayableForAReplyKeepsOnlyTheSelectedCourses() {
        val before=Courses.kept().toSet()
        // A selection, as CoursePrewarm.submit(index) and the game's catalogue build it: kept.
        val selected=Courses.playableIndices.first { it !in before }
        val raced=Courses.course(selected)
        val kept=before+selected
        assertEquals(kept,Courses.kept().toSet())
        // The walk RoutesReply.write makes: every playable course, in order, every point read.
        val walked=ArrayList<String>();var points=0
        for(c in Courses.playable) { walked.add(c.id);for(i in 0..c.count)if(c.x[i].isFinite() && c.y[i].isFinite())points++ }
        assertEquals(Courses.playableIndices.map { Courses.id(it) },walked)
        assertTrue(points>0)
        assertEquals(kept,Courses.kept().toSet(),"after the walk only the selected courses are kept")
        assertTrue(Courses.playableIndices.any { it !in kept },"some playable course was built for the walk only")
        // The selected course is served from what is kept; any other is a build the walk does not keep.
        assertSame(raced,Courses.playable[Courses.playableIndices.indexOf(selected)])
        val other=Courses.playableIndices.indexOfFirst { it !in kept }
        assertNotSame(Courses.playable[other],Courses.playable[other])
        assertEquals(kept,Courses.kept().toSet())
        println("P21 card 15: playable=${Courses.playableIndices.size} keptBefore=${before.size} keptAfterWalk=${Courses.kept().size}")
    }
}
