package dev.deathride.core

import java.io.File

/** The real campaign encounter, not the six-car artificial elimination stress fixture. */
fun arenaDuelWorld(course:Course,seed:Int,skill:String="Pro"):World {
    val profile=Profile("owner-duel-fixture").also { p->
        p.careerRound=34;p.careerCleared=34;p.credits=8000
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
    }
    val w=World(seed,track=Track(course=course),combatEnabled=true)
    RivalEconomy.apply(profile,w,Career.difficulties.indexOfFirst{it.skill.id==skill})
    w.cars.forEach{it.human=false};w.cars[0].aiSkill=AiSkills.all.single{it.id==skill}
    w.reset();check(w.entrantCount==2 && w.cars[1].aiStyle===DeathDuel.boss && w.damageScale==Encounters.damage.getValue("death-duel"))
    val frames=Array(6){InputFrame()}
    while(w.resolved<w.entrantCount && w.seconds<w.raceLimitSeconds)w.step(frames)
    return w
}
fun main(args:Array<String>) {
    val ids=args.filter{!it.startsWith("--")}.ifEmpty{listOf("crown-7-a")}
    val samples=args.firstOrNull{it.startsWith("--samples=")}?.substringAfter('=')?.toInt()?:12
    val start=args.firstOrNull{it.startsWith("--start=")}?.substringAfter('=')?.toInt()?:0
    val skill=args.firstOrNull{it.startsWith("--skill=")}?.substringAfter('=')?:"Pro"
    val out=args.firstOrNull{it.startsWith("--out=")}?.substringAfter('=')?.let{File(it)}?:CandidateAuthor.folder
    out.mkdirs()
    for(id in ids) {
        val slot=CandidateAuthor.slots.single{it.id=="crown-7"}
        val c=Courses.all.single{it.id==id}
        val authored=CandidateAuthor.compose(slot,File(CandidateAuthor.folder,"recipes/$id.csv").readText(),id).course
        val normalized=TrackLabCodec.csv(c).mapValues{(key,value)->if(key in setOf("features","obstacles"))value.replace(Regex("(?m)^${Regex.escape(c.id)},"),"${authored.id},")else value}
        check(normalized==TrackLabCodec.csv(authored) && c.startFraction==authored.startFraction){"Installed encounter differs from approved bundle"}
        val rows=(start until start+samples).map { index->
            val seed=7319+index*104729;val w=arenaDuelWorld(c,seed,skill)
            mapOf("seed" to seed,"seconds" to w.seconds,"finished" to w.finished,"resolved" to w.resolved,"entrants" to w.entrantCount,"timeout" to (w.resolved<w.entrantCount),"damageScale" to w.damageScale,
                "rigWin" to (w.cars[0].finishKind==FinishKind.ELIMINATION),"bossWin" to (w.cars[1].finishKind==FinishKind.ELIMINATION),"oneShots" to w.combat.oneShotKills,"hash" to w.stateHash(),
                "cars" to w.cars.filter{it.entered}.map{mapOf("id" to it.id,"car" to it.carClass!!.id,"human" to it.human,"style" to it.aiStyle?.id,"finishKind" to it.finishKind.name,"finishSeconds" to it.finishSeconds,"health" to w.combat.health(it.id),"ammoPickups" to w.combat.ammoPickupsTaken[it.id])})
        }
        val timeouts=rows.count{it["timeout"]==true};val resolved=rows.count{it["finished"]==1};val rigWins=rows.count{it["rigWin"]==true}
        val replay=arenaDuelWorld(c,7319+start*104729,skill).stateHash()==rows.first()["hash"];check(replay)
        File(out,"$id-duel.json").writeText(TrackQuality.json(mapOf("candidate" to id,"runtimeDigest" to candidateProofDigest(c,slot.tier,slot.laps),"digest" to candidateProofDigest(authored,slot.tier,slot.laps),"fixture" to "Actual two-car campaign finale; 8000-credit canonical setup; supplied rig versus named boss; both $skill AI; unchanged approved geometry, grids, eight ammo sites, no repairs, 600-second watchdog.","trials" to rows,"timeouts" to timeouts,"wins" to resolved,"rigWins" to rigWins,"bossWins" to rows.count{it["bossWin"]==true},"repeatHashMatches" to replay)))
        println("DUEL $id resolved=$resolved/$samples rigWins=$rigWins timeouts=$timeouts seconds=${rows.map{it["seconds"]}}")
    }
}
