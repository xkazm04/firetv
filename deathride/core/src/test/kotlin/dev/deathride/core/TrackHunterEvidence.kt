package dev.deathride.core

import java.io.File
import kotlin.math.*

/** Observes actual hunter decisions and attributed damage; never changes the driving world. */
fun main(args:Array<String>) {
    val activeOnly="--active" in args
    val ids=args.filter{it!="--active"}.ifEmpty{listOf("scrap-1-a","foundry-2-a","salt-1-a","switchback-2-a")}
    val records=mutableListOf<Map<String,Any?>>()
    for(id in ids) {
        val slot=CandidateAuthor.slots.single{it.id==id.substringBeforeLast('-')}
        val c=CandidateAuthor.compose(slot,File(CandidateAuthor.folder,"recipes/$id.csv").readText(),id).course
        var courseEpisodes=0;var trials=0
        for(seedIndex in 0 until 12)for(rotation in 0..5) {
            if(courseEpisodes>=3)continue
            trials++;val seed=7319+seedIndex*104729;val w=qualityWorld(c,seed,rotation,tier=slot.tier,laps=slot.laps)
            val inputs=Array(6){InputFrame()};val intent=DoubleArray(36){-100.0};val hit=DoubleArray(36){-100.0};val damage=DoubleArray(36);val held=DoubleArray(36);val emitted=BooleanArray(36);val tactic=Array(36){"NONE"}
            val frames=ArrayDeque<List<Any>>();val q=Projection()
            while(w.resolved<w.entrantCount && w.seconds<w.raceLimitSeconds) {
                for(hunter in w.cars) {
                    val state=w.ai.states[hunter.id];val target=state.target
                    if(target>=0 && state.hunting && state.corner && state.targetDistance<3*TrackQuality.longest && w.cars[target].position==1 && !w.combat.wrecked(target)) {
                        val key=hunter.id*6+target;intent[key]=w.seconds;tactic[key]=if(w.ai.speedFraction(hunter)<1)"ACTIVE_CORNER_BLOCK" else "HUNTING_CORNER_PURSUIT"
                    }
                }
                w.step(inputs)
                while(true) {
                    val event=w.presentationEvents.poll()?:break
                    if(event.kind==PresentationKind.HIT && event.actor>=0 && event.target>=0 && event.actor!=event.target) {
                        val key=event.actor*6+event.target
                        if(w.seconds-intent[key]<=1.0){hit[key]=w.seconds;damage[key]+=event.strength}
                    }
                }
                check(w.presentationEvents.dropped==0L)
                if(w.steps%6!=0)continue
                frames.addLast(listOf(w.seconds,w.cars.map{listOf(it.id,it.x,it.y,it.heading,it.position,it.speedMps,w.combat.health(it.id))}))
                if(frames.size>25)frames.removeFirst()
                for(hunter in w.cars)for(leader in w.cars)if(hunter!==leader) {
                    val key=hunter.id*6+leader.id;val near=hypot(hunter.x-leader.x,hunter.y-leader.y)<3*TrackQuality.longest
                    val trapped=leader.position==1 && !w.combat.wrecked(leader.id) && leader.finishSeconds<0 && !w.combat.wrecked(hunter.id) && near && leader.speedMps<.55*leader.spec.maxSpeedMps && w.seconds-intent[key]<=1.0 && w.seconds-hit[key]<=1.0
                    held[key]=if(trapped)held[key]+.1 else 0.0
                    if(!trapped)emitted[key]=false
                    if(held[key]>=.5 && !emitted[key] && (!activeOnly || tactic[key]=="ACTIVE_CORNER_BLOCK")) {
                        emitted[key]=true;courseEpisodes++;c.project(leader.x,leader.y,q)
                        records+=mapOf("candidate" to id,"seed" to seed,"rotation" to rotation,"seconds" to w.seconds,"hunter" to hunter.id,"leader" to leader.id,"tactic" to tactic[key],"holdSeconds" to held[key],"leaderSpeedMps" to leader.speedMps,"speedFraction" to leader.speedMps/leader.spec.maxSpeedMps,"attributedDamageHp" to damage[key],"lastHitSeconds" to hit[key],"lastHunterIntentSeconds" to intent[key],"fraction" to q.s/c.lengthM,"frames" to frames.toList(),"digest" to candidateProofDigest(c,slot.tier,slot.laps))
                    }
                }
            }
        }
        println("HUNTER $id $courseEpisodes episodes in $trials six-car trials")
    }
    val result=mapOf("definition" to "A live current leader stays below 55% maximum speed and within 3 car lengths of a hunter for >=0.5 s. Within the preceding second that same hunter had actual hunting=true and target=leader in a perceived corner at close range, and dealt attributed HIT damage. ACTIVE_CORNER_BLOCK additionally records the runtime AI speedFraction below one; other episodes are HUNTING_CORNER_PURSUIT. This is observed intent plus damage and sustained compression, not a counterfactual claim that the hunter alone caused the slowdown. Boss-only tactic enums are not used as a proxy for ordinary hunter behaviour.","episodes" to records,"courses" to records.map{it["candidate"]}.distinct())
    File(CandidateAuthor.folder,if(activeOnly)"hunter-active-evidence.json" else "hunter-evidence.json").writeText(TrackQuality.json(result))
    if(!activeOnly)check(records.map{it["candidate"]}.distinct().size>=2){"Need actual hunter compression on multiple courses"}
}
