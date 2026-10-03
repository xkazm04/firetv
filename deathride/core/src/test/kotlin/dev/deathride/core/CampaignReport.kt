package dev.deathride.core

import java.io.File
import java.util.Random
import java.util.stream.IntStream
import kotlin.math.*

private data class CampaignOutcome(val round:Int,val skill:Int,val car:Int,val band:Int,val seed:Int,val playerPR:Double,val fieldPR:Double,
    val position:Int,val kills:Int,val hp:Double,val cash:Int,val clean:Boolean,val finished:Boolean,val qualified:Boolean,val early:Boolean,
    val seconds:Double,val hash:Long,val rivals:List<RivalResult>) {
    fun row()=listOf(round,skill,car,band,seed,playerPR,fieldPR,position,kills,hp,cash,clean,finished,qualified,early,seconds,hash,
        rivals.joinToString(";"){listOf(it.index,it.position,it.kills,it.hp,it.cash,it.clean,it.finished,it.playerWrecked).joinToString(":")}).joinToString(",")
    companion object {
        fun parse(s:String):CampaignOutcome {val x=s.split(',');return CampaignOutcome(x[0].toInt(),x[1].toInt(),x[2].toInt(),x[3].toInt(),x[4].toInt(),x[5].toDouble(),x[6].toDouble(),x[7].toInt(),x[8].toInt(),x[9].toDouble(),x[10].toInt(),x[11].toBoolean(),x[12].toBoolean(),x[13].toBoolean(),x[14].toBoolean(),x[15].toDouble(),x[16].toLong(),x[17].split(';').map{v->val a=v.split(':');RivalResult(a[0].toInt(),a[1].toInt(),a[2].toInt(),a[3].toDouble(),a[4].toInt(),a[5].toBoolean(),a[6].toBoolean(),a[7].toBoolean())})}
    }
    fun bossPosition()=rivals.firstOrNull{it.index==Career.bossIndex(round)}?.position?:1
    fun promoted()=finished && hp>0 && qualified && position==1
}
private val campaignSkills=listOf("Rookie","Club","Pro").map{id->AiSkills.all.single{it.id==id}}
private fun rivalResults(w:World,lead:Int=0)=w.cars.filter{it.entered&&it.rivalIndex>=0}.map{r->RivalResult(r.rivalIndex,r.position,w.combat.kills[r.id],w.combat.health(r.id),w.combat.cashCollected[r.id],w.combat.damageTaken[r.id]==0.0,r.finishSeconds>=0,w.combat.wreckSource[r.id]==lead)}

/** Fresh physical library and explicitly conditional ledger resampling. No simulated position dice. */
fun main(args:Array<String>) {
    val mode=args.getOrElse(0){"duel"};val samples=args.getOrElse(1){"4"}.toInt();val tag=args.getOrElse(2){"pilot"}
    val dir=File("build/reports/campaign/q3/$tag").apply{mkdirs()}
    when(mode){"physical"->campaignPhysical(dir,samples);"boss"->campaignPhysical(dir,samples,true);"verify"->campaignVerify(dir);"duel"->campaignDuel(dir,samples,System.getProperty("campaignSeed")?.toInt()?:tag.hashCode());"careers"->campaignLedgers(dir,samples);"fixtures"->campaignDeviceFixtures(dir);else->error("Unknown mode")}
}

private fun campaignVerify(dir:File) {
    val library=File(dir,"physical.csv").readLines().drop(1).map{CampaignOutcome.parse(it)}
    val canonical=Profile("campaign-reference");var checked=0
    for(round in 0..33){
        canonical.careerRound=round;canonical.careerCleared=round;CareerSpending.spend(canonical,8);RivalEconomy.prepare(canonical)
        val rows=library.filter{it.round==round};val r=rows.first()
        val lead=Profile("physical-lead",false).also{p->p.credits=8000;p.careerCleared=round;p.selectedCar=r.car;p.owned.fill(false);p.owned[r.car]=true;CareerSpending.upgrade(p,r.band)}
        val w=World(r.seed,track=Track(course=Courses.all[Career.events[round].courseIndex]),combatEnabled=true)
        RivalEconomy.apply(canonical.copy(),w,1,round);Garage.apply(lead,w.cars[0]);w.cars[0].aiSkill=campaignSkills[r.skill];w.reset()
        val input=Array(6){InputFrame()};while(w.cars[0].finishSeconds<0 && !w.combat.wrecked(0) && w.seconds<w.raceLimitSeconds)w.step(input)
        check(w.stateHash()==r.hash){"Final-core replay differs at event ${round+1}"};checked++
        val ref=rows.filter{it.skill==1&&it.car==canonical.selectedCar}.minBy{abs(it.playerPR-PowerRating.of(CarCatalog.all[canonical.selectedCar],canonical.bonuses()))}
        val ticket=Economy.start(canonical);RivalEconomy.settleResults(canonical,ticket,round,ref.rivals)
        Career.settle(canonical,ticket,round,1,ref.position,ref.kills,ref.hp,ref.qualified,ref.cash,clean=ref.clean,finished=ref.finished,bossPosition=ref.bossPosition())
    }
    File(dir,"final-core-replay.txt").writeText("$checked event samples reproduced their exact physical-library hashes on the final core.\n")
    println("Final-core exact replays: $checked")
}

private fun campaignDeviceFixtures(dir:File) {
    val boss=Profile("campaign-stick-boss").also{p->
        p.careerRound=6;p.careerCleared=6;p.credits=8000;p.careerDifficulty=0
        check(Market.transact(p,"trade","Trail",p.marketRevision).startsWith("Purchased"));CareerSpending.upgrade(p,17)
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
    }
    val finale=Profile("campaign-stick-finale").also{p->
        p.careerRound=34;p.careerCleared=34;p.credits=8000;p.careerDifficulty=1
        check(Market.transact(p,"trade","Kestrel",p.marketRevision).startsWith("Purchased"));CareerSpending.upgrade(p,17)
        p.rivalProfiles.forEach{it.credits=8000};RivalEconomy.prepare(p)
    }
    val guest=Profile("campaign-stick-guest").also{it.inventory=3}
    for(p in listOf(boss,finale,guest))File(dir,"${p.id}.sav").writeText(ProfileCodec.encode(p))
    File(dir,"fixture-scope.txt").writeText("Funded diagnostic setup, not earned progression. Legal shared shop transactions and rival preparation. Boss and finale are separate profiles. Guest has packed items for spectator preservation.\n")
}

private fun campaignPhysical(dir:File,seeds:Int,supplement:Boolean=false) {
    val reuse=System.getProperty("campaignReuseFrom")?.let{File(it)}
    val reuseRounds=System.getProperty("campaignReuseRounds")?.toInt()?:0
    val narrowLineReuse=System.getProperty("campaignReuseUnchangedLineCeiling")=="true"
    if(reuse!=null) {
        val snapshot=File(System.getProperty("campaignReuseSnapshot")?:error("Reuse needs its frozen source snapshot"))
        if(narrowLineReuse) {
            check(reuseRounds==34);campaignValidateLineReuse(snapshot)
            File(dir,"reuse-scope.txt").writeText("Only Line speed ceiling changes 8.25 to 8.125. Main class bytes and every other resource are identical. All reference rivals and the canonical lead are checked unaffected. Recompute each changed lead build; unchanged rows are reused, with an exact first-row replay per event. Reference garage CSV equality is audited after the run. Reused rows are not new independent samples. Source: ${reuse.path}\n")
        } else {
            check(reuseRounds in 1..28);campaignValidateReuse(snapshot,reuseRounds)
            File(dir,"reuse-scope.txt").writeText("First $reuseRounds events reuse immutable source samples under the original prefix guard. Replays are not independent samples. Source: ${reuse.path}\n")
        }
    }
    val streaming=supplement && System.getProperty("campaignStream")=="true"
    val previous=if(supplement && !streaming)File(dir,"physical.csv").readLines().drop(1).map{CampaignOutcome.parse(it)} else emptyList()
    val out=File(dir,if(supplement)"boss-extra.csv" else "physical.csv");check(!out.exists()){ "Refuse to overwrite physical evidence" }
    out.writeText("round,skill,car,band,seed,playerPR,fieldPR,position,kills,hp,cash,clean,finished,qualified,early,seconds,hash,rivals\n")
    val garages=File(dir,if(supplement)"boss-extra-garages.csv" else "reference-garages.csv");garages.writeText("event,rival,car,pr,credits,debt,parts\n")
    val canonical=Profile("campaign-reference");val bands=listOf(0,4,Parts.all.sumOf{it.maxTier})
    for(round in 0..33) {
        // Optional concurrent supplement: consume only a complete base event, never a partial row.
        // Waiting is outside World.step and adds no randomness or simulated time.
        val prior=if(streaming)awaitCampaignEvent(dir,round) else previous.filter{it.round==round}
        // Reference event schedule; this is not presented as an earned campaign.
        canonical.careerRound=round;canonical.careerCleared=round;CareerSpending.spend(canonical,8);RivalEconomy.prepare(canonical)
        val event=Career.events[round];val course=Courses.all[event.courseIndex];check(TrackLinter.errors(course).isEmpty())
        if(narrowLineReuse) {
            val leadType=CarCatalog.all[canonical.selectedCar]
            check(leadType.id!="Line" || leadType.stats.getValue("speed")+canonical.bonuses()[CarCatalog.statNames.indexOf("speed")]<=8.125)
            for(rival in RivalEconomy.cast(round)) {
                val p=canonical.rivalProfiles[rival];val type=CarCatalog.all[p.selectedCar]
                check(type.id!="Line" || type.stats.getValue("speed")+p.bonuses()[CarCatalog.statNames.indexOf("speed")]<=8.125)
            }
        }
        val fieldPR=RivalEconomy.fieldRating(canonical)
        for(index in RivalEconomy.cast(round)){val p=canonical.rivalProfiles[index];garages.appendText(listOf(round+1,Career.rivals[index].id,CarCatalog.all[p.selectedCar].id,PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses()),p.credits,p.debt,p.tiers.joinToString(":" )).joinToString(",")+"\n")}
        val cells=if(supplement && !event.boss)emptyList() else (0..2).flatMap{skill->CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank<=event.playerTier}.flatMap{car->bands.flatMap{band->(if(supplement)4 until 4+seeds else 0 until seeds).map{sample->intArrayOf(skill,car,band,sample)}}}}
        val results=arrayOfNulls<CampaignOutcome>(cells.size)
        val reused=if(reuse!=null && round<reuseRounds && cells.isNotEmpty())awaitCampaignRows(File(reuse,if(supplement)"boss-extra.csv" else "physical.csv"),round,cells.size) else null
        IntStream.range(0,cells.size).parallel().forEach{index->
            val (skill,car,band,sample)=cells[index]
            val seed=round*1000003+skill*30011+car*7919+band*701+sample*97+(System.getProperty("campaignPhysicalSeedNamespace")?.toInt()?:8209)
            val lead=Profile("physical-lead",false).also{p->p.credits=8000;p.careerCleared=round;p.selectedCar=car;p.owned.fill(false);p.owned[car]=true;CareerSpending.upgrade(p,band)}
            fun make()=World(seed,track=Track(course=course),combatEnabled=true).also{w->RivalEconomy.apply(canonical.copy(),w,1,round);Garage.apply(lead,w.cars[0]);w.cars[0].aiSkill=campaignSkills[skill];w.reset()}
            var exactReuse=false
            if(reused!=null) {
                val r=reused[index]
                check(r.round==round && r.skill==skill && r.car==car && r.band==band && r.seed==seed)
                check(r.fieldPR.toBits()==fieldPR.toBits())
                exactReuse=r.playerPR.toBits()==PowerRating.of(CarCatalog.all[car],lead.bonuses()).toBits()
                check(exactReuse || narrowLineReuse && CarCatalog.all[car].id=="Line")
                if(exactReuse && index!=0){results[index]=r;return@forEach}
            }
            val frames=Array(6){InputFrame()};val w=make()
            while(w.cars[0].finishSeconds<0 && !w.combat.wrecked(0) && w.seconds<w.raceLimitSeconds)w.step(frames)
            if(index==0){val replay=make();repeat(w.steps){replay.step(frames)};check(replay.stateHash()==w.stateHash())}
            val c=w.cars[0]
            results[index]=CampaignOutcome(round,skill,car,band,seed,PowerRating.of(CarCatalog.all[car],lead.bonuses()),fieldPR,c.position,w.combat.kills[0],w.combat.health(0),w.combat.cashCollected[0],w.combat.damageTaken[0]==0.0,c.finishSeconds>=0,Career.qualifies(c,w),w.combat.wrecked(0)&&c.lap.laps==0,w.seconds,w.stateHash(),rivalResults(w))
            if(exactReuse)check(results[index]!!.row()==reused!![index].row()){"Reused event differs on final data: ${round+1}"}
        }
        val rows=results.map{it!!};if(rows.isNotEmpty())out.appendText(rows.joinToString("\n",postfix="\n"){it.row()})
        val reference=if(supplement)prior else rows
        val ref=reference.filter{it.skill==1 && it.car==canonical.selectedCar}.minBy{abs(it.playerPR-PowerRating.of(CarCatalog.all[canonical.selectedCar],canonical.bonuses()))}
        val ticket=Economy.start(canonical);RivalEconomy.settleResults(canonical,ticket,round,ref.rivals)
        Career.settle(canonical,ticket,round,1,ref.position,ref.kills,ref.hp,ref.qualified,ref.cash,clean=ref.clean,finished=ref.finished,bossPosition=ref.bossPosition())
        println("Physical ${round+1}/34: ${rows.size} races; firsts ${rows.count{it.position==1&&it.finished}}; early ${rows.count{it.early}}; field PR $fieldPR")
    }
}

private fun awaitCampaignEvent(dir: File,round: Int): List<CampaignOutcome> {
    val expected=3*CarCatalog.all.count{it.tierRank<=Career.events[round].playerTier}*3*4
    return awaitCampaignRows(File(dir,"physical.csv"),round,expected)
}

private fun awaitCampaignRows(file: File,round: Int,expected: Int): List<CampaignOutcome> {
    val deadline=System.nanoTime()+java.util.concurrent.TimeUnit.MINUTES.toNanos(30)
    while(System.nanoTime()<deadline) {
        if(file.exists()) {
            val lines=campaignCompleteEvent(file.readText(),round,expected)
            if(lines!=null)return lines.map{CampaignOutcome.parse(it)}
        }
        Thread.sleep(1000)
    }
    error("Timed out awaiting complete physical event ${round+1}; no outcomes invented")
}

internal fun campaignCompleteEvent(text: String,round: Int,expected: Int): List<String>? {
    if(!text.endsWith("\n"))return null
    val lines=text.lineSequence().drop(1).filter{it.startsWith("$round,")}.toList()
    check(lines.size<=expected){"Too many physical rows at event ${round+1}"}
    if(lines.size<expected)return null
    val fields=lines.map{it.split(',')};check(fields.all{it.size==18}){"Malformed complete physical row"}
    check(fields.map{it.take(5)}.distinct().size==expected){"Repeated physical seed/cell at event ${round+1}"}
    return lines
}

private fun campaignDuel(dir:File,samples:Int,namespace:Int) {
    val output=File(dir,"duels.csv");check(!output.exists()){"Refuse to overwrite duel evidence"}
    val p=Profile("duel-reference").also{it.careerRound=34;it.careerCleared=34;it.rivalProfiles.forEach{r->r.credits=8000};RivalEconomy.prepare(it)}
    val bossIndex=Career.rivals.indexOfFirst{it.id=="marrow"};val boss=p.rivalProfiles[bossIndex]
    val cells=(0..2).flatMap{skill->(0..1).flatMap{rotation->(0 until samples).map{sample->intArrayOf(skill,rotation,sample)}}}
    val rows=arrayOfNulls<String>(cells.size)
    IntStream.range(0,cells.size).parallel().forEach{index->
        val (skill,rotation,sample)=cells[index];val seed=namespace+sample*7919 // paired across skill and grid, independent namespaces for experiments
        fun make()=World(seed,track=Track(course=Courses.all[Career.events[34].courseIndex]),combatEnabled=true).also{w->
            w.eventType=EventType.ELIMINATION;w.raceLaps=0;w.duelRigSlot=rotation
            for(c in w.cars)c.entered=c.id<2
            Garage.apply(boss,w.cars[1-rotation]);w.cars[1-rotation].aiStyle=DeathDuel.boss;w.cars[1-rotation].aiSkill=Career.difficulties[1].skill;w.cars[1-rotation].rivalIndex=bossIndex
            w.cars[rotation].aiSkill=campaignSkills[skill];Encounters.apply(w,"death-duel");w.reset()
            if(System.getProperty("dispatcherControl")=="off"){w.cars[rotation].ability.definition=null;w.cars[rotation].ability.reset()}
        }
        val w=make();val frames=Array(6){InputFrame()};val lead=rotation
        while(w.resolved<w.entrantCount && w.seconds<w.raceLimitSeconds)w.step(frames)
        if(sample==0){val replay=make();repeat(w.steps){replay.step(frames)};check(replay.stateHash()==w.stateHash())}
        val c=w.cars[lead];val win=Career.qualifies(c,w);val early=w.combat.wrecked(lead)&&w.combat.wreckSeconds[lead]<CampaignRules["duelOpeningSeconds"]
        rows[index]=listOf(skill,rotation,sample,seed,win,w.duelDraw,early,w.seconds,w.combat.health(lead),w.combat.health(1-lead),c.ability.activation,w.combat.shots[Weapons.MINE],w.combat.hits[DamageKind.MINE.ordinal],w.combat.repairPickupsTaken[lead],w.combat.repairPickupsTaken[1-lead],w.combat.oneShotKills,w.stateHash(),c.lap.laps,w.cars[1-lead].lap.laps,DeathDuel.rigRating,PowerRating.of(CarCatalog.all[boss.selectedCar],boss.bonuses())).joinToString(",")
    }
    output.writeText("skill,rotation,sample,seed,win,draw,early,seconds,hp,bossHp,dispatches,mineShots,mineHits,repairs,bossRepairs,oneShots,hash,laps,bossLaps,rigPR,bossPR\n"+rows.joinToString("\n",postfix="\n"))
    println("Duels ${rows.size}: "+rows.map{it!!.split(',')}.groupBy{it[0]}.mapValues{(_,v)->"wins ${v.count{it[4]=="true"}}, draws ${v.count{it[5]=="true"}}, early ${v.count{it[6]=="true"}}, mean ${v.map{it[7].toDouble()}.average()}s"})
}

private fun campaignLedgers(dir:File,count:Int) {
    val library=listOf("physical.csv","boss-extra.csv").flatMap{File(dir,it).readLines().drop(1).filter{it.isNotBlank()}.map{CampaignOutcome.parse(it)}}
    check(library.map{it.round}.distinct().size==34)
    val indexed=library.groupBy{Triple(it.round,it.skill,it.car)}
    val buyer=System.getProperty("campaignBuyer","race")
    // Two training seeds choose one chassis per tier; the other two seeds supply ledger outcomes.
    // The PR-only control exposes why a combat-weighted number is not a lap-time oracle.
    val plans=(0..2).map{skill->(0..4).map{tier->
        val round=if(tier==0)5 else tier*7-1
        CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==tier}.maxWith(compareBy<Int>{car->
            indexed.getValue(Triple(round,skill,car)).filter{it.band==Parts.all.sumOf{p->p.maxTier}}.take(2).count{it.promoted()}
        }.thenBy{car->-indexed.getValue(Triple(round,skill,car)).filter{it.band==Parts.all.sumOf{p->p.maxTier}}.take(2).map{it.position}.average()})
    }}
    val duels=File(dir,"duels.csv").readLines().drop(1).filter{it.isNotBlank()}.map{it.split(',')}
    val output=File(dir,"careers-$buyer.csv").bufferedWriter();val trace=File(dir,"timeline-$buyer.csv").bufferedWriter()
    File(dir,"buyer-$buyer.txt").writeText("Buyer=$buyer. Training seeds 0/1 maximize surviving first-place wins then mean position; ledger samples 2/3 regular, 2..19 boss. Lead decision proxies against fixed Club opponents; not game difficulty. Plans="+plans.map{it.map{c->CarCatalog.all[c].id}}+"\n")
    output.append("seed,skill,reward,completed,races,rook,ox,vex,mica,finale,round,cash,loanDebt,leagueDebt,paid,diverted,recovered,voided,bankruptcy,early,maxRatioGap,hours,rewards,restitutionPaid,restitutionDue,firstUpgrade,firstClubCar\n")
    trace.append("seed,skill,reward,race,event,car,playerPR,fieldPR,ratio,income,cash,loanDebt,leagueDebt,paid,credited,diverted,position,qualified,advanced,early,physicalSeed,ratioGap,seconds,bossPosition,bossPR,restitutionPaid,restitutionDue,parts,nextUsefulPrice\n")
    repeat(count){n->
        val seed=37+n*7919;val rng=Random(seed.toLong());val skill=n%3;val reward=(n/3)%3;val p=Profile("ledger-$seed")
        var races=0;var bankrupt=false;var early=0;var gapMax=0.0;var hours=0.0;val milestones=IntArray(5){-1};var firstUpgrade=-1;var firstClub=-1
        while(p.careerSeasons==0 && races<AshRules["maximumCareerRaces"].toInt()) {
            val round=p.careerRound
            for(i in Campaign.allies.indices)if(p.campaign.rewards[i]==1){
                val preferred=Campaign.choices[reward];val choice=(listOf(preferred)+Campaign.choices).distinct().firstOrNull{Campaign.reason(p,i,it).isEmpty()}
                if(choice!=null)Campaign.claim(p,"${Campaign.allies[i].id}:$choice",p.marketRevision)
            }
            val eligible=p.owned.indices.filter{p.owned[it] && CarCatalog.all[it].tierRank<=Career.events[round].playerTier}
            if(round<34){
                if(buyer=="pr") {p.selectedCar=eligible.maxBy{PowerRating.of(CarCatalog.all[it],p.bonuses(it))};CareerSpending.spend(p,Parts.all.sumOf{it.maxTier})}
                else {
                    val wanted=plans[skill][Career.events[round].playerTier]
                    if(p.owned[wanted])p.selectedCar=wanted
                    else if(p.selectedCar!=wanted && Career.unlocked(p,"car",CarCatalog.all[wanted].id)) {
                        val collateral=eligible.maxBy{Market.tradeValue(p,it)}
                        if(p.credits+Market.tradeValue(p,collateral)>=CarCatalog.all[wanted].priceCredits) {
                            p.selectedCar=collateral;Market.transact(p,"trade",CarCatalog.all[wanted].id,p.marketRevision)
                        }
                    }
                    if(CarCatalog.all[p.selectedCar].tierRank==Career.events[round].playerTier)CareerSpending.upgrade(p,Parts.all.sumOf{it.maxTier})
                }
            }
            RivalEconomy.prepare(p)
            if(firstUpgrade<0 && p.tiers.any{it>0})firstUpgrade=races
            if(firstClub<0 && p.owned.indices.any{p.owned[it] && CarCatalog.all[it].tierRank==1})firstClub=races
            val pr=if(round==34)DeathDuel.rigRating else PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses())
            val bossProfile=p.rivalProfiles[Career.bossIndex(round)];val bossPR=PowerRating.of(CarCatalog.all[bossProfile.selectedCar],bossProfile.bonuses())
            val parts=p.tiers.sum();val nextPrice=Parts.all.indices.map{Garage.offer(p,it)}.filter{it.available || it.reason=="Earn more credits"}.minOfOrNull{it.price}?:0
            val field=RivalEconomy.fieldRating(p);val ratio=pr/field;var gap=0.0;val result:CampaignOutcome
            if(round==34){
                if(milestones[4]<0)milestones[4]=races;DeathDuel.seize(p)
                val choices=duels.filter{it[0].toInt()==skill};val d=choices[rng.nextInt(choices.size)];val win=d[4].toBoolean();val hp=d[8].toDouble()
                result=CampaignOutcome(round,skill,p.selectedCar,0,d[3].toInt(),pr,field,if(win)1 else 2,if(win)1 else 0,hp,0,false,win,win,d[6].toBoolean(),d[7].toDouble(),d[16].toLong(),emptyList())
            }else {
                val cells=indexed.getValue(Triple(round,skill,p.selectedCar));val band=cells.minBy{abs(it.playerPR/it.fieldPR-ratio)}.band
                val choices=cells.filter{it.band==band}.drop(2);result=choices[rng.nextInt(choices.size)];gap=abs(result.playerPR/result.fieldPR-ratio);gapMax=max(gapMax,gap)
            }
            val cash=p.credits;val ticket=Economy.start(p);RivalEconomy.settleResults(p,ticket,round,result.rivals)
            val settled=Career.settle(p,ticket,round,1,result.position,result.kills,result.hp,result.qualified,result.cash,clean=result.clean,finished=result.finished,bossPosition=result.bossPosition())!!
            races++;hours+=result.seconds/3600;if(result.early)early++
            for(i in 0..3)if(p.campaign.rewards[i]>0 && milestones[i]<0)milestones[i]=races
            bankrupt=bankrupt || p.credits<0 || p.owned.none{it} || !p.owned[p.selectedCar] || p.condition[p.selectedCar]<MarketRules["roadworthyPercent"] || p.credits<cash
            val s=p.campaign;check(s.initial+s.interest-s.paid+s.diverted-s.recovered-s.voided==s.debt)
            trace.append(listOf(seed,skill,reward,races,round+1,CarCatalog.all[p.selectedCar].id,pr,field,ratio,p.credits-cash,p.credits,p.debt,s.debt,s.lastPayment,s.lastCredited,s.lastDiverted,result.position,result.qualified,settled.advanced,result.early,result.seed,gap,result.seconds,result.bossPosition(),bossPR,s.restitutionPaid,s.restitutionDue,parts,nextPrice).joinToString(",")+"\n")
        }
        val s=p.campaign
        output.append(listOf(seed,skill,reward,p.careerSeasons>0,races,*milestones.toTypedArray(),p.careerRound+1,p.credits,p.debt,s.debt,s.paid,s.diverted,s.recovered,s.voided,bankrupt,early,gapMax,hours,s.rewards.joinToString(";"),s.restitutionPaid,s.restitutionDue,firstUpgrade,firstClub).joinToString(",")+"\n")
        if(n%200==199)println("Ledgers ${n+1}/$count")
    }
    output.close();trace.close();println("Seeded ledgers $count complete; censored runs remain censored")
}
