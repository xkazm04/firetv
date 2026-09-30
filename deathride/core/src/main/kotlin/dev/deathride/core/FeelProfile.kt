package dev.deathride.core

import kotlin.math.*
import java.lang.StrictMath.exp
import java.lang.StrictMath.log

class FeelProfile(val values: Map<String,String>) {
    val id=values.getValue("id")
    val deadZone=values.number("deadZone")
    val exponent=values.number("exponent")
    val steerRisePerSecond=values.number("steerRisePerSecond")
    val steerReturnPerSecond=values.number("steerReturnPerSecond")
    val lowSpeedAuthority=values.number("lowSpeedAuthority")
    val highSpeedAuthority=values.number("highSpeedAuthority")
    val speedBlendMps=values.number("speedBlendMps")
    val yawResponseScale=values.number("yawResponseScale")
    val stabilityScale=values.number("stabilityScale")
    val throttleRisePerSecond=values.number("throttleRisePerSecond")
    val throttleExponent=values.number("throttleExponent")
    val brakeScale=values.number("brakeScale")
    val json=values.entries.joinToString(",","{","}") { (k,v) -> "\"$k\":"+if(k=="id") "\"$v\"" else v }
    init {
        require(id.matches(Regex("[A-Za-z]+")))
        require(deadZone in 0.0..0.2)
        for((k,v) in values) if(k!="id" && k!="deadZone") require(v.toDouble().isFinite() && v.toDouble()>0) { k }
    }
    fun shape(value: Double): Double = sign(value)*power(((abs(value)-deadZone)/(1-deadZone)).coerceIn(0.0,1.0),exponent)
    fun authority(speed: Double)=lowSpeedAuthority+(highSpeedAuthority-lowSpeedAuthority)*(speed/speedBlendMps).coerceIn(0.0,1.0)
}
object FeelProfiles {
    val all=Content.table("feel").map(::FeelProfile)
    val spike=all.first { it.id=="Spike" }
    val default=all.first { it.id=="Balanced" }
    val json=all.joinToString(",","[","]") { it.json }
}

/** exp/log avoids allocating FdLibm.pow implementations on Java 22. */
fun power(value: Double, exponent: Double): Double = if(value==0.0 || value==1.0 || exponent==1.0)value else exp(log(value)*exponent)
