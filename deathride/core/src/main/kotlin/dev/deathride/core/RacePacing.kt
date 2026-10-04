package dev.deathride.core

import kotlin.math.roundToInt

data class CoursePacing(val course: String,val tier: Int,val lapSeconds: Double,val lengthM: Double,
                        val nodes: Int,val turnChanges: Int,val surfaceChanges: Int)
/** Authored lap counts are verified derivations of a measured reference, never a second tuning knob. */
object RacePacing {
    private val rules=Content.table("pacing-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rules.getValue(key)
    val courses=Content.table("course-pacing").map{r->CoursePacing(r.getValue("course"),r.number("tier").toInt(),r.number("referenceLapSeconds"),
        r.number("lengthM"),r.number("nodes").toInt(),r.number("turnChanges").toInt(),r.number("surfaceChanges").toInt())}
    val targets=Content.table("event-pacing").associate{it.getValue("event") to it.number("targetSeconds")}
    fun reference(course: String,tier: Int)=courses.single{it.course==course && it.tier==tier}
    fun practiceLaps(course: String,tier: Int): Int {
        val reference=courses.firstOrNull{it.course==course && it.tier==tier}?:return Tuning.RACE_LAPS
        return (get("practiceTargetSeconds")/reference.lapSeconds).roundToInt().coerceIn(get("minimumLaps").toInt(),get("practiceMaximumLaps").toInt())
    }
    fun laps(event: String,course: String,tier: Int): Int {
        val target=targets.getValue(event)
        return if(target==0.0)0 else (target/reference(course,tier).lapSeconds).roundToInt().coerceIn(get("minimumLaps").toInt(),get("maximumLaps").toInt())
    }
    init {
        require(courses.all{it.lapSeconds>0 && it.lengthM>0 && it.tier in 0..4})
        require(courses.map{it.course to it.tier}.distinct().size==courses.size)
        require(targets.values.all{it>=0})
    }
}
