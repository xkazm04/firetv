package dev.deathride.core

import java.io.File
import java.util.stream.IntStream

/** Format experiment: actual races, funded legal garages, no multiplied race-time estimates. */
fun main(args: Array<String>) {
    val samples=args.firstOrNull()?.toInt()?:2
    val rows=mutableListOf<String>()
    for(laps in listOf(3,12,18,24)) {
        val cases=listOf(0,6,7,13,14,20,21,27,28,34).flatMap{round->(0..2).flatMap{d->(0 until samples).map{s->intArrayOf(round,d,s)}}}
        val results=arrayOfNulls<String>(cases.size)
        IntStream.range(0,cases.size).parallel().forEach { index ->
            val (round,d,sample)=cases[index];val event=Career.events[round]
            val p=Profile("format-$round-$d-$sample");p.careerRound=round;p.careerCleared=round;p.credits=8000
            for(npc in p.rivalProfiles)npc.credits=8000
            val car=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==event.cupIndex}.maxBy{PowerRating.of(CarCatalog.all[it])}
            p.selectedCar=car;p.owned[car]=true;CareerSpending.upgrade(p,8);RivalEconomy.prepare(p)
            val seed=round*7919+d*701+sample*97+23
            fun make()=World(seed,track=Track(course=Courses.all[event.courseIndex]),combatEnabled=true).also{w->
                RivalEconomy.apply(p,w,d,round);Garage.apply(p,w.cars[0]);w.cars[0].aiSkill=Career.difficulties[1].skill;w.raceLaps=laps;w.reset()
            }
            val w=make();val input=Array(6){InputFrame()}
            while(w.cars[0].finishSeconds<0 && !w.combat.wrecked(0) && w.seconds<w.raceLimitSeconds)w.step(input)
            if(sample==0){val replay=make();repeat(w.steps){replay.step(input)};check(replay.stateHash()==w.stateHash())}
            val c=w.cars[0]
            results[index]=listOf(laps,round+1,d,seed,CarCatalog.all[car].id,w.seconds,c.lap.laps,c.finishSeconds>=0,w.combat.wrecked(0),w.combat.wrecked(0)&&c.lap.laps==0,c.position,w.combat.health(0),PowerRating.of(CarCatalog.all[car],p.bonuses()),RivalEconomy.fieldRating(p),w.stateHash()).joinToString(",")
        }
        rows+=results.map{it!!};println("Endurance format $laps: ${results.size} actual races")
        File("build/reports/endurance-pilot.csv").apply{parentFile.mkdirs();writeText("laps,event,difficulty,seed,car,seconds,completedLaps,finished,wrecked,early,position,hp,playerPR,fieldPR,hash\n"+rows.joinToString("\n",postfix="\n"))}
    }
}
