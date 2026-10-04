package dev.deathride.core

import java.io.File
import java.util.stream.IntStream

/** Matched-skill first-boss diagnostic; identical cells to CampaignDesignReport difficulty. */
fun main(args:Array<String>) {
    val out=File(args.firstOrNull()?:"evidence/tracks/owner-part4/scrap-boss-choices.csv")
    check(!out.exists());out.parentFile.mkdirs()
    val slot=CandidateAuthor.slots.single{it.id=="scrap-7"}
    val ids=(args.getOrNull(1)?:Courses.all[Career.events.single{it.id=="scrap-7"}.courseIndex].id).split(',')
    val courses=ids.map { id->
        Courses.all.singleOrNull{it.id==id}?:CandidateAuthor.compose(slot,File(CandidateAuthor.folder,"recipes/$id.csv").readText(),id).course
    }
    val cells=ids.indices.flatMap{course->(0..2).flatMap{skill->(0..1).flatMap{peer->(0..1).flatMap{rotation->(0..7).map{sample->intArrayOf(course,skill,peer,rotation,sample)}}}}}
    val rows=arrayOfNulls<String>(cells.size)
    IntStream.range(0,cells.size).parallel().forEach{i->
        val cell=cells[i];val course=cell[0];val skill=cell[1];val peer=cell[2];val rotation=cell[3];val sample=cell[4]
        val car=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==1}[peer]
        val profile=Profile("difficulty-0").also{p->p.careerRound=6;p.careerCleared=6;p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)}
        val lead=Profile("diagnostic-$car",false).also{p->p.credits=8000;p.careerCleared=6;p.selectedCar=car;p.owned.fill(false);p.owned[car]=true;CareerSpending.upgrade(p,17)}
        val boss=Career.rivals.indexOfFirst{it.id=="rook"};val seed=104010003+sample*7919;val leadSlot=if(rotation==0)0 else 5
        fun make()=World(seed,track=Track(course=courses[course]),combatEnabled=true).also{w->
            RivalEconomy.apply(profile.copy(),w,skill,6)
            if(leadSlot!=0){val displaced=w.cars[leadSlot].rivalIndex;Garage.apply(profile.rivalProfiles[displaced],w.cars[0]);w.cars[0].rivalIndex=displaced;w.cars[0].aiStyle=RivalEconomy.style(profile,displaced);w.cars[0].aiSkill=Career.difficulties[skill].skill}
            Garage.apply(lead,w.cars[leadSlot]);w.cars[leadSlot].rivalIndex=-1;w.cars[leadSlot].aiStyle=null;w.cars[leadSlot].aiSkill=Career.difficulties[skill].skill;w.aiLeadSlot=leadSlot;w.reset()
        }
        fun run(w:World){val frames=Array(6){InputFrame()};while(w.resolved<w.entrantCount && w.seconds<w.raceLimitSeconds)w.step(frames)}
        val w=make();run(w);if(sample==0){val replay=make();run(replay);check(w.stateHash()==replay.stateHash())}
        val c=w.cars[leadSlot];val rival=w.cars.single{it.rivalIndex==boss};val alive=c.finishSeconds>=0 && !w.combat.wrecked(leadSlot)
        rows[i]=listOf(ids[course],skill,CarCatalog.all[car].id,rotation,sample,seed,alive&&c.position<rival.position,alive&&c.position==1,c.position,rival.position,w.seconds,w.combat.wrecked(leadSlot)&&c.lap.laps==0,w.stateHash(),w.entrantCount-w.resolved).joinToString(",")
    }
    out.writeText("candidate,skill,car,rotation,sample,seed,beatBoss,first,position,bossPosition,seconds,early,hash,unresolved\n"+rows.joinToString("\n",postfix="\n"))
    println("First-boss alternatives: ${rows.size} fresh matched-skill trials")
}
