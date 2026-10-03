package dev.deathride.core

import java.io.File
import java.util.stream.IntStream

/** Replays are verification, never additional independent samples. */
fun main(args: Array<String>) {
    for(tag in args) {
        val dir=File("build/reports/obstacles/$tag");val rows=File(dir,"races.csv").readLines().drop(1).filter{it.isNotBlank()}.map{it.split(',')}
        val mismatches=java.util.concurrent.ConcurrentLinkedQueue<String>()
        val contacts=java.util.concurrent.atomic.AtomicLong();val drag=java.util.concurrent.atomic.AtomicLong();val avoidance=java.util.concurrent.atomic.AtomicLong()
        IntStream.range(0,rows.size).parallel().forEach { i ->
            val row=rows[i];val tier=row[2].toInt();val rotation=row[3].toInt()
            val course=Courses.all.single{it.id==row[1]};val pair=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==tier}
            val upgraded="upgraded" in tag
            val bonuses=if(upgraded)pair.map{index->Profile("obstacle-upgrade-$index",false).also{p->p.selectedCar=index;p.owned[index]=true;p.careerCleared=34;p.credits=8000;CareerSpending.upgrade(p,17)}.bonuses()} else emptyList()
            val w=World(row[5].toInt(),track=Track(course=course),combatEnabled=true)
            w.obstacles.enabled=row[0]=="1"
            if("campaign" in tag)Encounters.apply(w,Career.cups[tier].id)
            for(c in w.cars){val slot=((c.id+rotation)%6)/3;CarCatalog.apply(c,pair[slot],if(upgraded)bonuses[slot] else null);c.aiSkill=Career.difficulties[1].skill};w.reset()
            val inputs=Array(6){InputFrame()};while(w.resolved<6 && w.seconds<w.raceLimitSeconds)w.step(inputs)
            if(w.stateHash()!=row[15].toLong())mismatches.add("$i ${row.take(6)} expected ${row[15]} actual ${w.stateHash()}")
            contacts.addAndGet(w.obstacles.solidContacts);drag.addAndGet(w.obstacles.dragTicks);avoidance.addAndGet(w.obstacles.avoidanceDecisions)
            if(w.resolved<6)println("Watchdog $tag ${course.id} ${w.seed}: "+w.cars.filter{it.finishSeconds<0 && !w.combat.wrecked(it.id)}.joinToString{ "${it.carClass!!.id} ${it.speedMps} m/s, ${it.lap.laps} laps, mode ${it.aiMode}, blocked steps ${it.aiBlockedSteps}" })
        }
        File(dir,"final-core-replay.txt").writeText("${rows.size} existing races replayed; ${mismatches.size} mismatched hashes. Replays are not new samples.\n"+mismatches.joinToString("\n"))
        File(dir,"final-core-interactions.json").writeText("""{"solidSolverContacts":${contacts.get()},"dragCarTicks":${drag.get()},"avoidanceDecisions":${avoidance.get()},"scope":"Totals across paired replays; disabled mode contributes zero. Repeated solver contacts are not distinct crashes."}""")
        check(mismatches.isEmpty()){mismatches.take(10).joinToString("\n")}
        println("$tag: ${rows.size} final-core hashes reproduced exactly")
    }
}
