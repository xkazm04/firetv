package dev.deathride.core

import java.io.File
import java.util.stream.IntStream

fun main(args: Array<String>) {
    val samples=args.firstOrNull()?.toInt()?:2000
    val rules=Content.table("combat-depth-rules").associate{it.getValue("key") to it.number("value")}
    val directory=File("build/reports/combat-depth/$samples").apply{mkdirs()}
    val summary=StringBuilder("scenario,races,earlyWrecks,earlyRate,finished,unresolved,meanSeconds,shots,oneShots,distinctHashes\n")
    val findings=mutableListOf<String>()
    for(row in Content.table("combat-scenarios")) {
        val id=row.getValue("id");val course=Courses.all.single{it.id==row.getValue("course")}
        val classes=listOf(row.getValue("player"),row.getValue("fieldA"),row.getValue("fieldB")).map{c->CarCatalog.all.indexOfFirst{it.id==c}}
        val input=Array(6){InputFrame()}
        fun make(seed: Int)=World(seed,track=Track(course=course),combatEnabled=true).also{w->
            for(c in w.cars){CarCatalog.apply(c,if(c.id==0)classes[0] else classes[1+c.id%2]);c.aiSkill=if(c.id==0)Career.difficulties[rules.getValue("referenceSkillIndex").toInt()].skill else AiSkills.all.single{it.id==row.getValue("skill")}}
            Encounters.apply(w,row.getValue("encounter"));w.reset()
        }
        data class Result(val seed: Int,val early: Boolean,val finished: Boolean,val unresolved: Int,val seconds: Double,val shots: Int,val oneShots: Int,val hash: Long,val hp: Double,val position: Int,val kills: Int,val laps: Int)
        val results=arrayOfNulls<Result>(samples)
        IntStream.range(0,samples).parallel().forEach { index ->
            val seed=index*7919+id.hashCode();val w=make(seed)
            while(w.resolved<6 && w.seconds<rules.getValue("maxSeconds"))w.step(input)
            val c=w.cars[0]
            if(index==0){val replay=make(seed);repeat(w.steps){replay.step(input)};check(replay.stateHash()==w.stateHash())}
            results[index]=Result(seed,w.combat.wrecked(0) && c.lap.laps==0,c.finishSeconds>=0,6-w.resolved,w.seconds,w.combat.shots.sum(),w.combat.oneShotKills,w.stateHash(),w.combat.health(0),c.position,w.combat.kills[0],c.lap.laps)
        }
        val rows=results.map{it!!};val early=rows.count{it.early};val rate=early.toDouble()/samples;val hashes=rows.map{it.hash}.toSet().size
        File(directory,"$id.csv").writeText("seed,earlyWreck,finished,unresolved,seconds,shots,oneShots,hash,hp,position,kills,laps\n"+rows.joinToString("\n",postfix="\n"){"${it.seed},${it.early},${it.finished},${it.unresolved},${it.seconds},${it.shots},${it.oneShots},${it.hash},${it.hp},${it.position},${it.kills},${it.laps}"})
        summary.append("$id,$samples,$early,$rate,${rows.count{it.finished}},${rows.sumOf{it.unresolved}},${rows.map{it.seconds}.average()},${rows.sumOf{it.shots}},${rows.sumOf{it.oneShots}},$hashes\n")
        if(row.number("earlyGate")!=0.0 && rate>=rules.getValue("maximumEarlyWreckRate"))findings+="$id: early wreck rate $rate"
        if(rows.any{it.unresolved>0 || it.oneShots>0})findings+="$id: unresolved entries or one-shot kills"
        check(hashes==samples);println("$id: $samples races; early wrecks $early ($rate); player finishes ${rows.count{it.finished}}")
    }
    File(directory,"summary.csv").writeText(summary.toString());File(directory,"findings.txt").writeText(if(findings.isEmpty())"All measured gates passed\n" else findings.joinToString("\n",postfix="\n"))
    if(samples>=rules.getValue("samplesPerScenario"))check(findings.isEmpty()){findings.joinToString("; ")}
}
