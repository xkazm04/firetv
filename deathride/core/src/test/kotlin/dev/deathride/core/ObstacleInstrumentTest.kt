package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class ObstacleInstrumentTest {
    @Test fun rotationCrossIsCompleteAndEveryAlarmCanFire() {
        val cells=(0 until 25*5*6*4).map{ObstacleInstrument.cell(it)}
        assertEquals(25*5*6,cells.groupBy{Triple(it.course,it.tier,it.rotation)}.size)
        assertTrue(cells.groupBy{Triple(it.course,it.tier,it.rotation)}.values.all{it.size==4 && it.map{c->c.sample}.toSet().size==4})
        assertTrue(ObstacleInstrument.dominance(100,100));assertFalse(ObstacleInstrument.dominance(50,100))
        assertFalse(ObstacleInstrument.dominance(0,0))
        assertTrue(ObstacleInstrument.repeated(List(100){1L}));assertFalse(ObstacleInstrument.repeated((0L..99L).toList()))
        assertTrue(ObstacleInstrument.early(5,100));assertFalse(ObstacleInstrument.early(0,100))
        assertTrue(ObstacleInstrument.stuck(1));assertFalse(ObstacleInstrument.stuck(0))
        // A single-modulo schedule is deliberately confounded and cannot pass this cross.
        assertNotEquals(25*5*6,(0 until 3000).map{Triple(it%25,it%5,it%6)}.toSet().size)
    }
}
