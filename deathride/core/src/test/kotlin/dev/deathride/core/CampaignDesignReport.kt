package dev.deathride.core

import java.io.File
import java.util.stream.IntStream
import java.util.concurrent.atomic.AtomicInteger

object CampaignDesignInstrument {
    /** Synthetic long straights use the roster probe horizon, not the shorter playable-course watchdog. */
    fun rosterHorizonValid(seconds: Double)=Content.table("roster-courses").all { row->
        val track=Track(row.number("straightM"),row.number("radiusM"),row.number("halfWidthM"),Surfaces.all.single{it.id==row.getValue("surface")})
        CarCatalog.all.all{seconds>track.lengthM*Tuning.RACE_LAPS/it.spec().maxSpeedMps}
    }
}

/** Diagnostic API deliberately also runs with the frozen pre-v2 main classes/resources. */
fun main(args: Array<String>) {
    val mode=args.getOrElse(0){"catalog"};val samples=args.getOrElse(1){"32"}.toInt()
    val directory=File(args.getOrElse(2){"build/reports/campaign/design-v2-probes"}).apply{mkdirs()}
    val namespace=System.getProperty("designSeedNamespace", "103070003").toInt()
    // Exploratory physics-only ceiling surrogate; never used by an acceptance library.
    // A surviving candidate must be authored as real shared rules and rerun through legal shops.
    val capStudy=System.getProperty("capStudy", "none")
    val lineLaunch=System.getProperty("lineLaunch", "0").toInt()
    require((capStudy=="none" && lineLaunch==0) || directory.name.contains("cap-")){"Exploratory overrides cannot write acceptance evidence"}
    fun exploratoryCaps(profile: Profile,car: Car) {
        if(capStudy=="none" && lineLaunch==0)return
        val type=CarCatalog.all[profile.selectedCar];val bonus=profile.bonuses()
        for(i in bonus.indices) {
            val stat=CarCatalog.statNames[i]
            val growth=when(capStudy){"relative1"->1;"relative2"->if(stat=="speed")1 else 2;else->10}
            bonus[i]=minOf(bonus[i],growth)
        }
        if(capStudy=="selective") {
            val rule=when(type.id){"Line"->"speed" to 8;"Bastion"->"grip" to 9;"Quill","Kestrel"->"speed" to 9;else->null}
            if(rule!=null){val index=CarCatalog.statNames.indexOf(rule.first);bonus[index]=minOf(bonus[index],(rule.second-type.stats.getValue(rule.first)).toInt())}
        }
        if(type.id=="Line")bonus[CarCatalog.statNames.indexOf("acceleration")]+=lineLaunch
        CarCatalog.apply(car,profile.selectedCar,bonus)
        if(capStudy=="fractional") {
            val speed=when(type.id){"Line"->System.getProperty("lineSpeed", "8.75").toDouble();"Quill","Kestrel"->9.5;else->10.0}
            fun ceiling(parameter: String,value: Double): Double {val mapping=CarCatalog.mapping.single{it.parameter==parameter};return mapping.base+mapping.perPoint*value}
            car.spec=car.spec.copy(maxSpeedMps=minOf(car.spec.maxSpeedMps,ceiling("maxSpeedMps",speed)))
            if(type.id=="Bastion")car.spec=car.spec.copy(lateralGripPerSecond=minOf(car.spec.lateralGripPerSecond,ceiling("lateralGripPerSecond",9.0)),maxLateralAccelerationMps2=minOf(car.spec.maxLateralAccelerationMps2,ceiling("maxLateralAccelerationMps2",9.0)))
        }
    }
    val frames=Array(6){InputFrame()}
    fun run(w: World,limit: Double=w.raceLimitSeconds) {
        while(w.resolved<w.entrantCount && w.seconds<limit)w.step(frames)
    }
    fun owned(car: Int,round: Int,developed: Boolean)=Profile("diagnostic-$car",false).also{p->
        p.credits=8000;p.careerCleared=round;p.selectedCar=car;p.owned.fill(false);p.owned[car]=true
        if(developed)CareerSpending.upgrade(p,17)
    }
    fun write(file: String,header: String,rows: Array<String?>) {
        val target=File(directory,file);check(!target.exists()){"Refuse to overwrite diagnostic evidence"}
        target.writeText(header+"\n"+rows.joinToString("\n",postfix="\n"){it!!})
    }
    when(mode) {
        "catalog" -> {
            val rows=CarCatalog.all.mapIndexed{i,c->val p=owned(i,34,true)
                listOf(c.id,c.tier,c.priceCredits,PowerRating.of(c),PowerRating.of(c,p.bonuses()),8000-p.credits,p.tiers.sum(),Parts.all.indices.count{Garage.offer(p,it).available}).joinToString(",")}
            File(directory,"catalog.csv").writeText("car,tier,price,stockPR,developedPR,partSpend,parts,remainingUsefulOffers\n"+rows.joinToString("\n",postfix="\n"))
        }
        "difficulty" -> {
            // Lead slot is independently crossed with driver settings, peer and boss event.
            val cells=(0..3).flatMap{act->(0..2).flatMap{lead->(0..2).flatMap{difficulty->(0..1).flatMap{peer->(0..1).flatMap{rotation->(0 until samples).map{sample->intArrayOf(act,lead,difficulty,peer,rotation,sample)}}}}}}
            val rows=arrayOfNulls<String>(cells.size)
            IntStream.range(0,cells.size).parallel().forEach{i->
                val cell=cells[i];val act=cell[0];val leadSkill=cell[1];val difficulty=cell[2];val peer=cell[3];val rotation=cell[4];val sample=cell[5]
                val round=(act+1)*7-1;val car=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==act+1}[peer]
                val profile=Profile("difficulty-$act").also{p->p.careerRound=round;p.careerCleared=round;p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)}
                val lead=owned(car,round,true);val boss=Career.rivals.indexOfFirst{it.id==listOf("rook","ox","vex","mica")[act]}
                val seed=namespace+act*100003+sample*7919 // paired across difficulty, peer and slot
                val slot=if(rotation==0)0 else 5
                fun make()=World(seed,track=Track(course=Courses.all[Career.events[round].courseIndex]),combatEnabled=true).also{w->
                    RivalEconomy.apply(profile.copy(),w,difficulty,round)
                    if(slot!=0) {
                        val displaced=w.cars[slot].rivalIndex
                        Garage.apply(profile.rivalProfiles[displaced],w.cars[0]);w.cars[0].rivalIndex=displaced;w.cars[0].aiStyle=RivalEconomy.style(profile,displaced);w.cars[0].aiSkill=Career.difficulties[difficulty].skill
                    }
                    Garage.apply(lead,w.cars[slot]);w.cars[slot].rivalIndex=-1;w.cars[slot].aiStyle=null;w.cars[slot].aiSkill=Career.difficulties[leadSkill].skill;w.reset()
                }
                val w=make();run(w)
                if(sample==0){val replay=make();run(replay);check(w.stateHash()==replay.stateHash())}
                val c=w.cars[slot];val rival=w.cars.single{it.rivalIndex==boss};val alive=c.finishSeconds>=0 && !w.combat.wrecked(slot)
                rows[i]=listOf(round+1,leadSkill,difficulty,CarCatalog.all[car].id,rotation,sample,seed,alive && c.position<rival.position,alive && c.position==1,c.position,rival.position,w.seconds,w.combat.wrecked(slot)&&c.lap.laps==0,w.stateHash(),w.entrantCount-w.resolved,PowerRating.of(CarCatalog.all[car],lead.bonuses()),RivalEconomy.fieldRating(profile)).joinToString(",")
            }
            write("difficulty.csv","event,lead,difficulty,car,rotation,sample,seed,beatBoss,first,position,bossPosition,seconds,early,hash,unresolved,playerPR,fieldPR",rows)
        }
        "roster", "rotation" -> {
            val horizon=RosterRules["probeMaxSeconds"]
            check(CampaignDesignInstrument.rosterHorizonValid(horizon)){"Roster horizon is shorter than a stock car's distance / top-speed lower bound"}
            val courses=Content.table("roster-courses")
            val homogeneous=mode=="rotation"
            // Each seed is crossed with all six grid shifts, never aliased to a course.
            val cells=(0..4).filter{System.getProperty("studyTier")?.toInt()?.let{wanted->it==wanted}?:true}.flatMap{tier->courses.indices.flatMap{course->(0..1).flatMap{build->(0 until samples).flatMap{sample->(if(homogeneous)0..0 else 0..5).map{rotation->intArrayOf(tier,course,build,sample,rotation)}}}}}
            val rows=arrayOfNulls<String>(cells.size)
            val completed=AtomicInteger()
            IntStream.range(0,cells.size).parallel().forEach{i->
                val (tier,courseIndex,build,sample,rotation)=cells[i];val course=courses[courseIndex]
                val pair=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==tier};val profiles=pair.map{owned(it,34,build==1)}
                val track=Track(course.number("straightM"),course.number("radiusM"),course.number("halfWidthM"),Surfaces.all.single{it.id==course.getValue("surface")})
                val seed=namespace+tier*100003+courseIndex*30011+sample*7919
                fun make()=World(seed,track=track,combatEnabled=true).also{w->
                    for(c in w.cars){val index=if(homogeneous)build else ((c.id+rotation)%6)/3;val entry=if(homogeneous)owned(pair[index],34,false) else profiles[index];Garage.apply(entry,c);exploratoryCaps(entry,c);c.aiSkill=Career.difficulties[0].skill}
                    Encounters.apply(w,Career.cups[tier].id);w.reset()
                }
                val w=make();run(w,horizon)
                if(sample==0 && rotation==0){val replay=make();run(replay,horizon);check(w.stateHash()==replay.stateHash())}
                val winner=w.cars.single{it.position==1}
                rows[i]=listOf(tier,course.getValue("id"),if(homogeneous)CarCatalog.all[pair[build]].id else if(build==0)"stock" else "developed",rotation,sample,seed,if(winner.finishSeconds>=0)winner.carClass!!.id else "unresolved",winner.id,w.seconds,w.stateHash(),w.entrantCount-w.resolved,w.combat.oneShotKills,w.cars.count{w.combat.wrecked(it.id)&&it.lap.laps==0},w.cars.joinToString(";"){"${it.carClass!!.id}:${it.finishSeconds}"}).joinToString(",")
                val done=completed.incrementAndGet();if(done%2000==0)println("$mode completed $done/${cells.size}")
            }
            write("$mode.csv","tier,course,build,rotation,sample,seed,winner,winnerSlot,seconds,hash,unresolved,oneShots,early,cars",rows)
        }
        else->error("Unknown diagnostic mode $mode")
    }
    println("$mode finished; capStudy=$capStudy; lineLaunch=$lineLaunch")
}
