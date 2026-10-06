package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

class UnitRingTest {
    @Test fun tablesAreBitIdenticalToTheInlineExpressions() {
        for(n in intArrayOf(20,24)) {
            val u=if(n==20)UnitRing.SEGMENTS_20 else UnitRing.SEGMENTS_24
            for(i in 0..n) {
                val a=i*2*PI/n;val legacy=i*Math.PI*2/n
                assertEquals(cos(a).toRawBits(),u.cos[i].toRawBits());assertEquals(sin(a).toRawBits(),u.sin[i].toRawBits())
                assertEquals(cos(legacy).toFloat().toRawBits(),u.cos[i].toFloat().toRawBits())
            }
        }
    }
}
