package dev.deathride.core

import java.io.File
import java.security.MessageDigest
import java.util.stream.IntStream

/** Raw fixed-step outcomes. Audit and verdicts live in the separate Python consumer. */
fun main(args: Array<String>) {
    val samples=args.getOrNull(0)?.toInt()?:RosterRules["racesPerScenario"].toInt()
    val baseline=args.getOrNull(1)?.toInt()?:minOf(samples,200)
    val part=args.getOrNull(2)?:"all";val tag=args.getOrNull(3)?:"$samples";val tierFilter=args.getOrNull(4)?:"all"
    val seedNamespace=args.getOrNull(5)?:"abilities"
    require(samples>0 && baseline>=0 && part in setOf("all","roster","early","rotation"))
    val projectRoot=if(File("src/main/resources/data").isDirectory)File(".") else File("core")
    val directory=File(projectRoot,"build/reports/abilities/$tag").apply{mkdirs()}
    val referenceSkill=Career.difficulties[Content.table("combat-depth-rules").single{it.getValue("key")=="referenceSkillIndex"}.number("value").toInt()].skill
    val earlyHorizon=Content.table("combat-depth-rules").single{it.getValue("key")=="maxSeconds"}.number("value")
    val input=Array(Tuning.CAR_COUNT){InputFrame()}
    val courseRows=Content.table("roster-courses")
    val maps=courseRows.associate{it.getValue("id") to Track(it.number("straightM"),it.number("radiusM"),it.number("halfWidthM"),Surfaces.all.single{s->s.id==it.getValue("surface")})}
    val hash=MessageDigest.getInstance("SHA-256")
    // Fingerprint the executing class directory/jar as well as packaged data, not just source filenames.
    val location=File(World::class.java.protectionDomain.codeSource.location.toURI())
    if(location.isFile)hash.update(location.readBytes()) else location.walkTopDown().filter{it.isFile}.sortedBy{it.relativeTo(location).path}.forEach{hash.update(it.readBytes())}
    val dataRoot=File(projectRoot,"src/main/resources/data");check(dataRoot.isDirectory){"Content fingerprint scope is empty"}
    dataRoot.walkTopDown().filter{it.isFile}.sortedBy{it.path}.forEach{hash.update(it.readBytes())}
    val fingerprint=hash.digest().joinToString(""){"%02x".format(it)}
    File(directory,"run-$part-$tierFilter.json").writeText("{\"samples\":$samples,\"baselineSamples\":$baseline,\"part\":\"$part\",\"tier\":\"$tierFilter\",\"seedNamespace\":\"$seedNamespace\",\"coreFingerprint\":\"$fingerprint\",\"stepSeconds\":${Tuning.STEP_SECONDS},\"proxy\":\"AI decisions; not human driving\"}\n")
    fun runCell(key: String,count: Int,limitSeconds: (World)->Double,earlyObservation: Boolean=false,make: (Int)->World) {
        if(count==0)return
        val rows=arrayOfNulls<String>(count);val began=System.nanoTime()
        IntStream.range(0,count).parallel().forEach{index->
            val w=make(index);val limit=limitSeconds(w)
            var observed=false
            while(w.resolved<w.entrantCount && w.seconds<limit) {
                w.step(input)
                // Both requested early-race facts are now final. Later laps cannot change either.
                if(earlyObservation && (w.cars[0].lap.laps>0 || w.combat.wrecked(0) || w.cars[0].finishSeconds>=0) && w.combat.wreckSeconds.any{it>=0}) {
                    observed=true;break
                }
            }
            if(index==0){val replay=make(index);repeat(w.steps){replay.step(input)};check(w.stateHash()==replay.stateHash()){"Replay failed: $key"}}
            val entrants=w.cars.filter{it.entered};val winner=entrants.minBy{it.position}
            val first=w.combat.wreckSeconds.filter{it>=0}.minOrNull()
            fun slots(value: (Car)->Any)=entrants.joinToString("|"){value(it).toString()}
            rows[index]=listOf(w.seed,index%2,w.stateHash(),w.steps,w.seconds,w.raceLaps,if(earlyObservation)"" else winner.carClass!!.id,w.entrantCount-w.resolved,w.combat.oneShotKills,first?:"",w.combat.wrecked(0)&&w.cars[0].lap.laps==0,
                slots{it.carClass!!.id},slots{it.position},slots{it.finishSeconds},slots{w.combat.wreckSeconds[it.id]},slots{it.lap.laps},slots{w.combat.health(it.id)},slots{it.ability.activation},slots{w.combat.abilityDamage[it.id]},slots{w.combat.damageTaken[it.id]},slots{minOf(if(it.finishSeconds>=0)it.finishSeconds else w.seconds,if(w.combat.wrecked(it.id))w.combat.wreckSeconds[it.id] else w.seconds)},slots{it.aiSkill!!.id},if(observed)"early-facts-final" else if(w.resolved<w.entrantCount)"horizon-censored" else "race-ended").joinToString(",")
        }
        File(directory,"$key.csv").bufferedWriter().use{out->
            out.appendLine("seed,gridRotation,hash,steps,seconds,raceLaps,winner,unresolved,oneShots,firstWreckSeconds,leadEarlyWreck,classes,positions,finishSeconds,wreckSeconds,laps,hp,uses,abilityDamage,damageTaken,activeSeconds,skills,observation")
            for(row in rows)out.appendLine(row!!)
        }
        println("$key: $count races in ${(System.nanoTime()-began)/1e9}s")
    }
    if(part=="all" || part=="roster")for((tier,pair) in CarCatalog.all.groupBy{it.tier}) {
        if(tierFilter!="all" && tierFilter!=tier)continue
        val fast=pair.maxBy{it.spec().maxSpeedMps};val agile=pair.single{it!==fast}
        val encounter=Career.cups[fast.tierRank].id
        for(scenario in listOf("equal","skill"))for((course,track) in maps) {
            if(scenario=="skill" && course!="technical")continue
            for(on in listOf(false,true))runCell("roster-$tier-$scenario-$course-${if(on)"on" else "off"}",if(on)samples else baseline,{RosterRules["probeMaxSeconds"]}){index->
                val seed=("$seedNamespace/$tier/$scenario/$course".hashCode()*31+index*7919)
                World(seed,track=track,combatEnabled=true,abilitiesEnabled=on).also{w->
                    for(c in w.cars){val type=pair[(c.id+index)%2];CarCatalog.apply(c,CarCatalog.all.indexOf(type));c.aiSkill=AiSkills.all.single{it.id==if(scenario=="skill"&&type===agile)"Champion" else "Rookie"}}
                    Encounters.apply(w,encounter);w.reset()
                }
            }
        }
    }
    if(part=="all" || part=="early")for(row in Content.table("combat-scenarios")) {
        val id=row.getValue("id");val encounter=row.getValue("encounter");val course=Courses.all.single{it.id==row.getValue("course")}
        val classes=listOf(row.getValue("player"),row.getValue("fieldA"),row.getValue("fieldB")).map{c->CarCatalog.all.indexOfFirst{it.id==c}}
        for(on in listOf(false,true))runCell("early-$id-${if(on)"on" else "off"}",if(on)samples else baseline,{minOf(it.raceLimitSeconds,earlyHorizon)},true){index->
            World("$seedNamespace/early/$id".hashCode()*31+index*7919,track=Track(course=course),combatEnabled=true,abilitiesEnabled=on).also{w->
                for(c in w.cars){CarCatalog.apply(c,if(c.id==0)classes[0] else classes[1+c.id%2]);c.aiSkill=if(c.id==0)referenceSkill else AiSkills.all.single{it.id==row.getValue("skill")}}
                w.raceLaps=Career.events.first{Career.cups[it.cupIndex].id==encounter}.laps
                Encounters.apply(w,encounter);w.reset()
            }
        }
    }
    if(part=="all" || part=="rotation")for(type in CarCatalog.all)for((course,track) in maps) {
        runCell("rotation-${type.id}-$course-on",samples,{RosterRules["probeMaxSeconds"]}){index->
            World("$seedNamespace/rotation/$course".hashCode()*31+index*7919,track=track,combatEnabled=true).also{w->
                for(c in w.cars){CarCatalog.apply(c,CarCatalog.all.indexOf(type));c.aiSkill=AiSkills.all.single{it.id=="Rookie"}}
                Encounters.apply(w,Career.cups[type.tierRank].id);w.reset()
            }
        }
    }
}
