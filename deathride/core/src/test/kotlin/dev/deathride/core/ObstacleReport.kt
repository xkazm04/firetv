package dev.deathride.core

import java.io.File
import java.util.stream.IntStream
import kotlin.math.*

/** Independent mixed-radix factors; paired seeds change only the obstacle switch. */
object ObstacleInstrument {
    data class Cell(val course: Int,val tier: Int,val rotation: Int,val sample: Int)
    fun cell(i: Int)=Cell((i/30)%Courses.all.size,(i/6)%5,i%6,i/(30*Courses.all.size))
    fun repeated(hashes: List<Long>)=hashes.isEmpty() || hashes.distinct().size.toDouble()/hashes.size<ObstacleContent["distinctHashMinimum"]
    fun dominance(wins: Int,races: Int)=races>0 && wins.toDouble()/races>.85
    fun early(wrecks: Int,entries: Int)=entries>0 && wrecks.toDouble()/entries>=ObstacleContent["earlyWreckMaximum"]
    fun stuck(unresolved: Int)=unresolved>0
}

fun main(args: Array<String>) {
    val samples=args.getOrElse(0){"4"}.toInt();val tag=args.getOrElse(1){"acceptance"}
    val campaign=args.getOrElse(2){"practice"}=="campaign"
    val dir=File("build/reports/obstacles/$tag").apply{mkdirs()};val out=File(dir,"races.csv")
    check(!out.exists()){"Refuse to overwrite evidence"}
    val cells=Courses.all.size*5*6*samples;val rows=arrayOfNulls<String>(cells*2)
    IntStream.range(0,cells).parallel().forEach { i ->
        val cell=ObstacleInstrument.cell(i);val course=Courses.all[cell.course]
        val pair=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==cell.tier}
        // Stable avalanche across cells; variants deliberately share the seed.
        val seed=java.util.Random(0x47A11L+i*7919L+(if(tag=="initial")0L else tag.hashCode().toLong()*104729)).nextInt(Int.MAX_VALUE)
        for(mode in 0..1) {
            fun make()=World(seed,track=Track(course=course),combatEnabled=true).also{w->
                w.obstacles.enabled=mode==1
                if(campaign)Encounters.apply(w,Career.cups[cell.tier].id)
                for(c in w.cars){CarCatalog.apply(c,pair[((c.id+cell.rotation)%6)/3]);c.aiSkill=Career.difficulties[1].skill}
                w.reset()
            }
            val w=make();val inputs=Array(6){InputFrame()};val stale=DoubleArray(6);val progress=DoubleArray(6)
            var longestStall=0.0
            while(w.resolved<6 && w.seconds<w.raceLimitSeconds) {
                w.step(inputs)
                for(c in w.cars)if(c.finishSeconds<0 && !w.combat.wrecked(c.id)) {
                    if(c.lap.progressM>progress[c.id]+1){progress[c.id]=c.lap.progressM;stale[c.id]=w.seconds}
                    longestStall=max(longestStall,w.seconds-stale[c.id])
                }
            }
            if(cell.sample==0 && cell.tier==0 && cell.rotation==0){val replay=make();repeat(w.steps){replay.step(inputs)};check(w.stateHash()==replay.stateHash())}
            val winner=w.cars.single{it.position==1};val finished=w.cars.filter{it.finishSeconds>=0}
            val early=w.cars.count{w.combat.wrecked(it.id)&&it.lap.laps==0}
            rows[i*2+mode]=listOf(mode,course.id,cell.tier,cell.rotation,cell.sample,seed,
                if(winner.finishSeconds>=0)winner.carClass!!.id else "unresolved",winner.id,w.seconds,
                finished.map{it.finishSeconds}.average(),w.finished,w.combat.wreckCount,6-w.resolved,early,longestStall,w.stateHash(),
                w.cars.joinToString(";"){"${it.carClass!!.id}:${it.finishSeconds}:${w.combat.wrecked(it.id)}:${it.lap.laps}"}).joinToString(",")
        }
        if(i%100==0)println("Obstacle pairs $i/$cells")
    }
    out.writeText("obstacles,course,tier,rotation,sample,seed,winner,winnerSlot,seconds,meanFinishSeconds,finished,wrecks,unresolved,early,longestStallSeconds,hash,cars\n"+rows.joinToString("\n",postfix="\n"))
    println("Completed ${rows.size} physical races, $cells paired seeds, all 25 courses / 5 tier pairs / 6 rotations. Some tiers exceed a course's competitive entry pool: explicit geometry stress, not campaign entries.")
}
