package dev.deathride.core

import java.io.File
import java.util.stream.IntStream
import kotlin.math.*

/** Offline observer. No changes to the reference driver's physics or the race clock. */
fun main(args: Array<String>) {
    val output=File(args.getOrElse(0){"build/reports/ai/laps.csv"});output.parentFile.mkdirs()
    check(!output.exists()){ "Refuse to overwrite measurement evidence" }
    val filter=args.getOrElse(1){"all"}
    val skills=AiSkills.all.filter{it.id in listOf("Rookie","Club","Pro","Champion")}
    val cells=Courses.all.filter{filter=="all" || it.id in filter.split(';')}.flatMap{course->
        CarCatalog.all.indices.flatMap{car->skills.indices.flatMap{skill->(0..1).map{seed->intArrayOf(Courses.all.indexOf(course),car,skill,seed)}}}
    }
    val rows=arrayOfNulls<String>(cells.size)
    IntStream.range(0,cells.size).parallel().forEach{index->
        val (courseIndex,carIndex,skillIndex,sample)=cells[index]
        val course=Courses.all[courseIndex];val seed=104000003+sample*7919
        val w=World(seed,track=Track(course=course));w.raceLaps=4
        for(c in w.cars)c.entered=c.id==0
        CarCatalog.apply(w.cars[0],carIndex);w.cars[0].aiSkill=skills[skillIndex];w.reset()
        val frames=Array(6){InputFrame()};var first=-1.0
        // Survey horizon accommodates four laps on extended roads even for out-of-pool stock cars.
        // Race acceptance horizons are unchanged; this is a lap measurement, not a completion gate.
        while(w.cars[0].finishSeconds<0 && w.seconds<360) {
            w.step(frames)
            if(first<0 && w.cars[0].lap.laps>=1)first=w.seconds
        }
        val c=w.cars[0];val finished=c.finishSeconds>=0
        var changes=0;var previous=0
        for(i in 1 until course.count) {
            val a=atan2(course.y[i]-course.y[i-1],course.x[i]-course.x[i-1])
            val b=atan2(course.y[i+1]-course.y[i],course.x[i+1]-course.x[i])
            val turn=wrapAngle(b-a)
            val sign=if(turn>.002)1 else if(turn<-.002)-1 else 0
            if(sign!=0 && sign!=previous){changes++;previous=sign}
        }
        val surfaces=course.nodes.zipWithNext().count{it.first.surface!=it.second.surface}
        rows[index]=listOf(course.id,c.carClass!!.tierRank,c.carClass!!.id,skills[skillIndex].id,sample,seed,finished,first,
            if(finished)(w.seconds-first)/3 else -1.0,w.seconds,course.lengthM,course.nodes.size-1,changes,surfaces,
            course.features.size,course.obstacles.size,w.stateHash()).joinToString(",")
    }
    output.writeText("course,tier,car,skill,sample,seed,finished,launchLapSeconds,flyingLapSeconds,seconds,lengthM,nodes,turnChanges,surfaceChanges,features,obstacles,hash\n"+rows.joinToString("\n",postfix="\n"))
    val unresolved=rows.count{it!!.split(',')[6]=="false"}
    println("Measured ${rows.size} solo runs across ${cells.map{it[0]}.distinct().size} courses; unresolved=$unresolved")
}
