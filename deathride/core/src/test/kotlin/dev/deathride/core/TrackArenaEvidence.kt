package dev.deathride.core

import java.io.File

/** Actual campaign duel fixture, separate from the deliberately artificial six-car stress field. */
fun main(args:Array<String>) {
    val ids=args.toList().ifEmpty{listOf("crown-7-a","crown-7-b","crown-7-c")}
    for(id in ids) {
        val slot=CandidateAuthor.slots.single{it.id=="crown-7"}
        val c=CandidateAuthor.compose(slot,File(CandidateAuthor.folder,"recipes/$id.csv").readText(),id).course
        val rows=(0 until 12).map { index->
            val seed=7319+index*104729
            val profile=Profile("r3-duel-fixture").also { p->
                p.careerRound=34;p.careerCleared=34;p.credits=8000
                p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
            }
            val w=World(seed,track=Track(course=c),combatEnabled=true)
            RivalEconomy.apply(profile,w,Career.difficulties.indexOfFirst{it.skill.id=="Pro"})
            w.cars.forEach{it.human=false};w.cars[0].aiSkill=AiSkills.all.single{it.id=="Pro"}
            w.reset();check(w.entrantCount==2 && w.cars[1].aiStyle===DeathDuel.boss && w.damageScale==Encounters.damage.getValue("death-duel"))
            val frames=Array(6){InputFrame()}
            while(w.resolved<w.entrantCount && w.seconds<w.raceLimitSeconds)w.step(frames)
            mapOf("seed" to seed,"seconds" to w.seconds,"finished" to w.finished,"resolved" to w.resolved,"entrants" to w.entrantCount,"timeout" to (w.resolved<w.entrantCount),"damageScale" to w.damageScale,
                "cars" to w.cars.filter{it.entered}.map{mapOf("id" to it.id,"car" to it.carClass!!.id,"human" to it.human,"style" to it.aiStyle?.id,"finishKind" to it.finishKind.name,"finishSeconds" to it.finishSeconds,"health" to w.combat.health(it.id))})
        }
        val timeouts=rows.count{it["timeout"]==true};val wins=rows.count{it["finished"]==1}
        File(CandidateAuthor.folder,"$id-duel.json").writeText(TrackQuality.json(mapOf("candidate" to id,"digest" to candidateProofDigest(c,slot.tier,slot.laps),"fixture" to "Actual two-car campaign finale; existing 8000-credit canonical duel test setup; supplied rig versus named boss; both Pro AI; no role rotation because equipment is asymmetric.","trials" to rows,"timeouts" to timeouts,"wins" to wins)))
        println("DUEL $id wins=$wins/12 timeouts=$timeouts seconds=${rows.map{it["seconds"]}}")
    }
}
