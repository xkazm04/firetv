package dev.deathride.game

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/** Unit-circle vertices for the ring painters, computed once with the same expression the painters used inline (values are bit-identical). */
class UnitRing(val segments: Int) {
    val cos=DoubleArray(segments+1){cos(it*2*PI/segments)}
    val sin=DoubleArray(segments+1){sin(it*2*PI/segments)}
    companion object {
        val SEGMENTS_20=UnitRing(20)
        val SEGMENTS_24=UnitRing(24)
    }
}
