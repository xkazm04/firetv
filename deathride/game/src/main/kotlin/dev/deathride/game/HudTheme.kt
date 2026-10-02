package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import dev.deathride.core.*
import kotlin.math.ceil

/** Presentation units: 1280x720 stage, 1.5x at 1080p. No gameplay numbers live here. */
object HudTheme {
    const val BODY=20
    const val TITLE=38
    const val ICON=32f
    val bone=Color.valueOf("DDD0A6")
    val soot=Color.valueOf("171513")
    val earth=Color.valueOf("39302A")
    val rust=Color.valueOf("B4512D")
    val ochre=Color.valueOf("B4A044")
    val muted=Color.valueOf("C3B898")
    fun fraction(value: Double,total: Double): Float = if(!value.isFinite() || !total.isFinite() || total<=0)0f else (value/total).coerceIn(0.0,1.0).toFloat()
    fun abilityState(state: AbilityState,protection: Double): String {
        val definition=state.definition?:return "NO SIGNATURE"
        return when {
            protection>0 -> "ARMING ${ceil(protection).toInt()}s"
            state.phase==AbilityPhase.WINDUP -> "WIND-UP"
            state.phase==AbilityPhase.ACTIVE -> "ACTIVE"
            state.phase==AbilityPhase.RECOVERY -> "RECOVERING"
            state.cooldownSeconds>0 -> "COOL ${ceil(state.cooldownSeconds).toInt()}s"
            state.energy<definition.energyCost -> "LOW ENERGY"
            else -> "READY"
        }
    }
}
