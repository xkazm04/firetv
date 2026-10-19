package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class LazyCoursesTest {
    @Test fun catalogueJsonIsByteIdenticalToTheBakedCourses() {
        assertEquals(Courses.playable.joinToString(",","[","]"){it.json},Courses.json)
    }
    @Test fun lazySlotsKeepIndexIdentityAndSingleInstance() {
        assertEquals(66,Courses.all.size)
        for(i in Courses.all.indices.step(7)) {
            assertEquals(Courses.id(i),Courses.all[i].id);assertEquals(i,Courses.indexOf(Courses.id(i)))
            assertSame(Courses.all[i],Courses.all[i])
        }
        for((k,i) in Courses.playableIndices.withIndex())assertSame(Courses.all[i],Courses.playable[k])
    }
}
