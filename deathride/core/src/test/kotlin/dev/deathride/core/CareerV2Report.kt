package dev.deathride.core

import java.io.File
import java.util.Random
import java.util.stream.IntStream
import kotlin.math.*

private data class AshOutcome(val round:Int,val difficulty:Int,val car:Int,val band:Int,val seed:Int,val playerPR:Double,val fieldPR:Double,
    val position:Int,val kills:Int,val hp:Double,val cash:Int,val clean:Boolean,val finished:Boolean,val qualified:Boolean,val early:Boolean,
    val seconds:Double,val hash:Long,val rivals:List<RivalResult>) {
    fun row()=listOf(round,difficulty,car,band,seed,playerPR,fieldPR,position,kills,hp,cash,clean,finished,qualified,early,seconds,hash,
        rivals.joinToString(";"){listOf(it.index,it.position,it.kills,it.hp,it.cash,it.clean,it.finished,it.playerWrecked).joinToString(":")}).joinToString(",")
    companion object {
        fun parse(s:String):AshOutcome {val x=s.split(',');return AshOutcome(x[0].toInt(),x[1].toInt(),x[2].toInt(),x[3].toInt(),x[4].toInt(),x[5].toDouble(),x[6].toDouble(),x[7].toInt(),x[8].toInt(),x[9].toDouble(),x[10].toInt(),x[11].toBoolean(),x[12].toBoolean(),x[13].toBoolean(),x[14].toBoolean(),x[15].toDouble(),x[16].toLong(),x[17].split(';').map{v->val a=v.split(':');RivalResult(a[0].toInt(),a[1].toInt(),a[2].toInt(),a[3].toDouble(),a[4].toInt(),a[5].toBoolean(),a[6].toBoolean(),a[7].toBoolean())})}
    }
}

/** Physical library, then seeded legal-shop careers; no synthetic finishing-position dice. */
fun main(args:Array<String>) {
    val seeds=args.getOrNull(0)?.toInt()?:8;val careers=args.getOrNull(1)?.toInt()?:2000
    val directory=File(System.getProperty("ashReportRoot","build/reports/ash-circuit"),seeds.toString()).apply{mkdirs()};val libraryFile=File(directory,"physical.csv")
    val bands=listOf(0,1,2,4,8,Parts.all.sumOf{it.maxTier});val policies=listOf(1,2,3,4,6,8,Parts.all.sumOf{it.maxTier});val library=mutableListOf<AshOutcome>()
    if(args.getOrNull(2)=="reuse") libraryFile.readLines().drop(1).filter{it.isNotBlank()}.forEach{library+=AshOutcome.parse(it)}
    else {
        val canonical=Profile("physical-reference")
        val garages=File(directory,"field-garages.csv");garages.writeText("event,rival,car,pr,credits,debt,parts\n")
        libraryFile.writeText("round,difficulty,car,band,seed,playerPR,fieldPR,position,kills,hp,cash,clean,finished,qualified,early,seconds,hash,rivals\n")
        for(round in Career.events.indices) {
            canonical.careerRound=round;canonical.careerCleared=round;CareerSpending.spend(canonical,4);RivalEconomy.prepare(canonical)
            val event=Career.events[round];val course=Courses.all[event.courseIndex];val fieldPR=RivalEconomy.fieldRating(canonical)
            for(index in RivalEconomy.cast(round)){val npc=canonical.rivalProfiles[index];garages.appendText(listOf(round+1,Career.rivals[index].id,CarCatalog.all[npc.selectedCar].id,PowerRating.of(CarCatalog.all[npc.selectedCar],npc.bonuses()),npc.credits,npc.debt,npc.tiers.joinToString(":" )).joinToString(",")+"\n")}
            val cells=(0..2).flatMap{difficulty->CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank<=event.playerTier}.flatMap{car->bands.flatMap{band->(0 until seeds).map{sample->intArrayOf(difficulty,car,band,sample)}}}}
            val results=arrayOfNulls<AshOutcome>(cells.size)
            IntStream.range(0,cells.size).parallel().forEach{index->
                val cell=cells[index];val difficulty=cell[0];val car=cell[1];val band=cell[2];val sample=cell[3]
                val seed=round*1000003+difficulty*30011+car*7919+band*701+sample*97+23
                val lead=Profile("physical-lead",false).also{p->p.credits=8000;p.careerCleared=round;p.selectedCar=car;p.owned.fill(false);p.owned[car]=true;CareerSpending.upgrade(p,band)}
                fun make()=World(seed,track=Track(course=course),combatEnabled=true).also{w->RivalEconomy.apply(canonical,w,difficulty,round);Garage.apply(lead,w.cars[0]);w.cars[0].aiSkill=Career.difficulties[1].skill;w.reset()}
                val inputs=Array(6){InputFrame()};val w=make()
                while(w.cars[0].finishSeconds<0 && !w.combat.wrecked(0) && w.seconds<w.raceLimitSeconds)w.step(inputs)
                if(sample==0){val replay=make();repeat(w.steps){replay.step(inputs)};check(replay.stateHash()==w.stateHash())}
                val c=w.cars[0];check(c.finishSeconds>=0 || w.combat.wrecked(0)){"Unresolved lead: $round / $car / $band"}
                results[index]=AshOutcome(round,difficulty,car,band,seed,PowerRating.of(CarCatalog.all[car],lead.bonuses()),fieldPR,c.position,w.combat.kills[0],w.combat.health(0),w.combat.cashCollected[0],w.combat.damageTaken[0]==0.0,c.finishSeconds>=0,Career.qualifies(c,w),w.combat.wrecked(0)&&c.lap.laps==0,w.seconds,w.stateHash(),w.cars.filter{it.entered&&it.rivalIndex>=0}.map{r->RivalResult(r.rivalIndex,r.position,w.combat.kills[r.id],w.combat.health(r.id),w.combat.cashCollected[r.id],w.combat.damageTaken[r.id]==0.0,r.finishSeconds>=0,w.combat.wreckSource[r.id]==0)})
            }
            val rows=results.map{it!!};library+=rows;libraryFile.appendText(rows.joinToString("\n",postfix="\n"){it.row()})
            val ref=rows.filter{it.difficulty==1 && it.car==canonical.selectedCar}.minBy{abs(it.playerPR-PowerRating.of(CarCatalog.all[canonical.selectedCar],canonical.bonuses()))}
            val ticket=Economy.start(canonical);RivalEconomy.settleResults(canonical,ticket,round,ref.rivals)
            Career.settle(canonical,ticket,round,1,ref.position,ref.kills,ref.hp,ref.qualified,ref.cash,clean=ref.clean,finished=ref.finished)
            println("Physical event ${round+1}/35: ${rows.size} races, field PR $fieldPR, reference ${CarCatalog.all[ref.car].id} position ${ref.position}")
        }
    }
    val indexed=library.groupBy{Triple(it.round,it.difficulty,it.car)}
    data class Run(val difficulty:Int,val seed:Int,val policy:Int,val completed:Boolean,val races:Int,val hours:Double,val firstPart:Int,val club:Int,val pro:Int,val elite:Int,val champion:Int,val bankruptcy:Boolean,val early:Int,val meanPR:Double,val maxGap:Double)
    fun run(difficulty:Int,seed:Int,policy:Int,trace:Appendable?=null):Run {
        val rng=Random(seed.toLong());val p=Profile("career-$seed");val milestones=IntArray(5){-1};var first=-1;var hours=0.0;var early=0;var bankrupt=false;var power=0.0;var gapMax=0.0;var races=0
        while(p.careerSeasons==0 && races<AshRules["maximumCareerRaces"].toInt()) {
            val beforeParts=p.tiers.sum();CareerSpending.spend(p,policy+if(p.careerRound==34)max(0,p.races-p.careerRound) else 0)
            if(first<0 && p.tiers.sum()>beforeParts)first=races
            val tier=CarCatalog.all[p.selectedCar].tierRank;if(milestones[tier]<0)milestones[tier]=races
            RivalEconomy.prepare(p);val round=p.careerRound;val pr=PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses());val field=RivalEconomy.fieldRating(p);val ratio=pr/field
            check(p.owned[p.selectedCar] && CarCatalog.all[p.selectedCar].tierRank<=Career.events[round].playerTier)
            val cells=indexed.getValue(Triple(round,difficulty,p.selectedCar));val chosenBand=cells.minBy{abs(it.playerPR/it.fieldPR-ratio)}.band
            val choices=cells.filter{it.band==chosenBand};val result=choices[rng.nextInt(choices.size)];val gap=abs(result.playerPR/result.fieldPR-ratio);gapMax=max(gapMax,gap)
            val nextPart=Parts.all.indices.map{Garage.offer(p,it)}.filter{it.available||it.reason=="Earn more credits"}.filter{o->val b=p.bonuses();for(i in b.indices)b[i]+=Parts.all[o.partIndex].bonuses[i];PowerRating.of(CarCatalog.all[p.selectedCar],b)>pr}.maxByOrNull{o->val b=p.bonuses();for(i in b.indices)b[i]+=Parts.all[o.partIndex].bonuses[i];(PowerRating.of(CarCatalog.all[p.selectedCar],b)-pr)/o.price}?.price?:0
            val nextCar=if(tier==4)0 else CarCatalog.all.filter{it.tierRank==tier+1}.minOf{it.priceCredits}-Market.tradeValue(p)
            val cashBefore=p.credits;val ticket=Economy.start(p);RivalEconomy.settleResults(p,ticket,round,result.rivals)
            val settled=Career.settle(p,ticket,round,difficulty,result.position,result.kills,result.hp,result.qualified,result.cash,clean=result.clean,finished=result.finished)!!
            val income=p.credits-cashBefore;races++;hours+=result.seconds/3600;power+=pr;if(result.early)early++
            bankrupt=bankrupt || p.credits<0 || p.owned.none{it} || !p.owned[p.selectedCar] || p.condition[p.selectedCar]<MarketRules["roadworthyPercent"] || income<0
            trace?.append(listOf(difficulty,seed,policy,races,round+1,pr,field,ratio,income,nextPart,max(0,nextCar),if(nextPart<=cashBefore)0.0 else if(income>0)(nextPart-cashBefore).toDouble()/income else -1.0,if(nextCar<=cashBefore)0.0 else if(income>0)(nextCar-cashBefore).toDouble()/income else -1.0,p.credits,p.debt,result.position,result.early,result.seconds,result.seed,result.band,gap,settled.advanced,p.rivalProfiles.sumOf{it.credits},p.rivalProfiles.sumOf{it.tiers.sum()},p.lastReceipt!!.gross,p.lastReceipt!!.repair,p.lastDebtPayment,p.lastReceipt!!.net-p.lastDebtPayment,p.lastReceipt!!.net-p.lastDebtPayment-income).joinToString(",")+"\n")
        }
        return Run(difficulty,seed,policy,p.careerSeasons>0,races,hours,first,milestones[1],milestones[2],milestones[3],milestones[4],bankrupt,early,power/races,gapMax)
    }
    val pilots=policies.flatMap{policy->(0..2).flatMap{d->(0 until 64).map{n->run(d,900000+n*7919+d,policy)}}}
    File(directory,"policies.csv").writeText("policy,completed,meanRaces,meanPR\n"+policies.joinToString("\n",postfix="\n"){policy->val rows=pilots.filter{it.policy==policy};"$policy,${rows.count{it.completed}},${rows.map{it.races}.average()},${rows.map{it.meanPR}.average()}"})
    // Prefer completion, then PR among the declared affordable upgrade caps. Never infer a global optimum.
    val policy=policies.maxWith(compareBy<Int>{v->pilots.count{it.policy==v&&it.completed}}.thenBy{v->pilots.filter{it.policy==v}.map{it.meanPR}.average()})
    val runs=mutableListOf<Run>()
    File(directory,"timeline.csv").bufferedWriter().use{trace->
        trace.append("difficulty,seed,policy,race,event,playerPR,fieldPR,ratio,income,nextUpgrade,nextCar,upgradeRaces,carRaces,cash,debt,position,early,seconds,physicalSeed,band,ratioGap,advanced,npcCash,npcParts,gross,repair,debtPaid,netIncome,unbankedAtCap\n")
        for(d in 0..2)for(n in 0 until careers)runs+=run(d,n*7919+d*10000019+37,policy,trace)
    }
    File(directory,"careers.csv").writeText("difficulty,seed,policy,completed,races,hours,firstUpgrade,club,pro,elite,champion,bankruptcy,early,meanPR,maxRatioGap\n"+runs.joinToString("\n",postfix="\n"){listOf(it.difficulty,it.seed,it.policy,it.completed,it.races,it.hours,it.firstPart,it.club,it.pro,it.elite,it.champion,it.bankruptcy,it.early,it.meanPR,it.maxGap).joinToString(",")})
    File(directory,"summary.csv").writeText("difficulty,careers,completed,meanRaces,meanHours,firstUpgrade,club,pro,elite,champion,bankruptcies,earlyRate,maxRatioGap\n"+(0..2).joinToString("\n",postfix="\n"){d->val r=runs.filter{it.difficulty==d}
        fun mean(f:(Run)->Int)=r.filter{f(it)>=0}.map{f(it)}.average()
        listOf(Career.difficulties[d].id,r.size,r.count{it.completed},r.map{it.races}.average(),r.map{it.hours}.average(),mean{it.firstPart},mean{it.club},mean{it.pro},mean{it.elite},mean{it.champion},r.count{it.bankruptcy},r.sumOf{it.early}.toDouble()/r.sumOf{it.races},r.maxOf{it.maxGap}).joinToString(",")})
    val fixture=Profile("c4-duel-probe").also{p->p.careerRound=34;p.careerCleared=34;p.credits=8000;for(npc in p.rivalProfiles)npc.credits=8000;repeat(4){p.credits=8000;CareerSpending.spend(p,4)};RivalEconomy.prepare(p)}
    File(directory,"c4-duel-probe.sav").writeText(ProfileCodec.encode(fixture))
    File(directory,"funded-boss-fields.csv").writeText("event,target,fundedShopPR\n"+Career.events.indices.filter{Career.events[it].boss}.joinToString("\n",postfix="\n"){round->
        val p=Profile("funded-boss-$round");p.careerRound=round;p.careerCleared=round
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
        "${round+1},${CareerCurve.all[round].fieldTarget},${RivalEconomy.fieldRating(p)}"
    })
    check(runs.none{it.bankruptcy});check(library.size==35*6*3*bands.size*seeds)
    println("Ash Circuit: ${library.size} physical races; ${runs.size} seeded careers; policy $policy; completed ${runs.count{it.completed}}; see measured targets in summary.csv")
}
