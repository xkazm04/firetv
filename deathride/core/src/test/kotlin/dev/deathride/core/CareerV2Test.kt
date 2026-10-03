package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import java.util.zip.CRC32

class CareerV2Test {
    @Test fun allFiveActsUseEveryCourseAndOriginalStoryCardsWithoutPowerDifficulty() {
        assertEquals(35,Career.events.size);assertEquals(5,Career.cups.size);assertEquals(6,Career.rivals.size)
        assertEquals(Courses.all.indices.toSet(),Career.events.map{it.courseIndex}.toSet())
        assertEquals(Career.events.map{it.id},CareerCurve.all.map{it.event})
        assertTrue(Career.cups.indices.all{act->Career.events.count{it.cupIndex==act}==7})
        assertEquals(1,Career.events.count{it.duel});assertTrue(Career.events.last().duel)
        assertEquals(5,Career.events.count{it.boss});assertTrue(AshStory.cards.values.all{it.lines.size==3 && it.lines.all{s->s.isNotBlank()}})
        assertEquals(Career.rivals.map{it.id}.toSet(),AshStory.rivals.keys)
        assertEquals(Career.rivals.map{it.id},RivalEconomy.plans.map{it.id})
        assertTrue(Career.difficulties.all{it.rewardScale==1.0})
        assertTrue(Career.events.all{if(it.elimination)it.laps==0 else it.laps in 3..30})
        assertTrue(CareerCurve.all.all{it.fieldTier in it.act..minOf(4,it.act+1)})
        for((index,e) in Career.events.withIndex()){assertEquals(e.cupIndex,CareerCurve.all[index].act);assertTrue(Courses.all[e.courseIndex].pool.minTier<=e.cupIndex && Courses.all[e.courseIndex].pool.maxTier>=e.cupIndex)}
    }
    @Test fun nominalLedgerUsesRealShopsAndFixedFieldSchedule() {
        val p=Profile("nominal-ledger");val out=StringBuilder("event,playerCar,playerPR,fieldPR,ratio,cash,debt,npcParts,npcDebt\n")
        for(round in Career.events.indices) {
            CareerSpending.spend(p);RivalEconomy.prepare(p)
            val player=PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses());val field=RivalEconomy.fieldRating(p)
            out.append("${round+1},${CarCatalog.all[p.selectedCar].id},$player,$field,${player/field},${p.credits},${p.debt},${p.rivalProfiles.sumOf{it.tiers.sum()}},${p.rivalProfiles.sumOf{it.debt}}\n")
            val serial=p.rivalPreparedSerial;val serialized=p.rivalProfiles.map{ProfileCodec.encode(it)};RivalEconomy.prepare(p)
            assertEquals(serial,p.rivalPreparedSerial);assertEquals(serialized,p.rivalProfiles.map{ProfileCodec.encode(it)},"No duplicate sponsor grant or shopping")
            for(index in RivalEconomy.cast(round)){val npc=p.rivalProfiles[index];Economy.settle(npc,Economy.start(npc),3,0,80.0,rewardScale=CareerCurve.all[round].rewardScale)}
            Career.settle(p,Economy.start(p),round,1,if(Career.events[round].boss)1 else 3,0,80.0,true)
            assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
        }
        File("build/reports/content/c4-nominal-ledger.csv").apply{parentFile.mkdirs();writeText(out.toString())}
        assertEquals(1,p.careerSeasons);assertTrue(p.rivalProfiles.sumOf{it.tiers.sum()}>10)
        val poor=Profile("poor");val rich=Profile("rich");rich.credits=8000;rich.selectedCar=9;rich.tiers.fill(2)
        RivalEconomy.prepare(poor);RivalEconomy.prepare(rich)
        assertEquals(poor.rivalProfiles.map{ProfileCodec.encode(it)},rich.rivalProfiles.map{ProfileCodec.encode(it)},"Field must not read player power or money")
    }
    @Test fun resultsFundRivalsAndGrudgesOnlyAlterDecisions() {
        val winner=Profile("npc-winner",false);val wreck=Profile("npc-wreck",false)
        winner.credits=0;wreck.credits=0;winner.careerCleared=4;wreck.careerCleared=4
        repeat(3){Economy.settle(winner,Economy.start(winner),1,0,100.0);Economy.settle(wreck,Economy.start(wreck),6,0,0.0)}
        val point=CareerCurve.all[0].copy(fieldTarget=440.0)
        RivalEconomy.shop(winner,RivalEconomy.plans[1],point,Courses.all[0]);RivalEconomy.shop(wreck,RivalEconomy.plans[1],point,Courses.all[0])
        assertTrue(PowerRating.of(CarCatalog.all[winner.selectedCar],winner.bonuses())>PowerRating.of(CarCatalog.all[wreck.selectedCar],wreck.bonuses()))
        val p=Profile("grudge");RivalEconomy.prepare(p);val w=World(combatEnabled=true);RivalEconomy.apply(p,w,1);w.reset();val baseline=w.cars[1].spec;val hp=w.combat.maxHealth(1)
        val first=w.cars[1].rivalIndex;p.grudges[first]=1;RivalEconomy.apply(p,w,1);w.reset()
        assertEquals(baseline,w.cars[1].spec);assertEquals(hp,w.combat.maxHealth(1));assertTrue(w.cars[1].aiStyle!!.passDistanceScale<Career.rivals[first].passDistanceScale)
        val courier=Profile("courier");Market.transact(courier,"contract","delivery",courier.marketRevision)
        Economy.settle(courier,Economy.start(courier),3,0,90.0,course="foundry",finished=true)
        assertEquals(-1,courier.grudges[Career.rivals.indexOfFirst{it.id=="relay"}])
        assertTrue(RivalEconomy.json(courier).contains("\"relationship\":\"ally\""))
    }
    @Test fun actualVersionThreeSaveMigratesWithoutLosingPropertyOrAddingDebt() {
        val text=javaClass.getResourceAsStream("/legacy/c3-device-profile.sav")!!.bufferedReader().readText()
        val fields=text.lines().filter{it.contains('=')}.associate{it.substringBefore('=') to it.substringAfter('=')}
        val p=ProfileCodec.decode(text,fields.getValue("id"));val old=fields.getValue("career").split(',').map{it.toInt()}
        assertEquals(old[0]*35/12,p.careerRound);assertEquals(old[1]*35/12,p.careerCleared)
        assertEquals(fields.getValue("credits").toInt(),p.credits);assertEquals(fields.getValue("market").split(',')[2].toInt(),p.debt)
        assertEquals(fields.getValue("tiers"),p.tiers.joinToString(","));assertEquals(fields.getValue("condition"),p.condition.joinToString(","))
        assertEquals(6,p.rivalProfiles.size);assertTrue(p.rivalProfiles.all{it.rivalProfiles.isEmpty()})
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
        val body=ProfileCodec.encode(p).substringBefore("checksum=").replace("grudges=0,0,0,0,0,0","grudges=9,0,0,0,0,0")
        val bad=body+"checksum="+CRC32().apply{update(body.toByteArray())}.value.toString(16)+"\n"
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(bad,p.id)}
    }
    @Test fun versionTwoRetainsCarsEarnedUnderTheOldUnlockSchedule() {
        val p=Profile("legacy-unlocks");p.careerRound=2;p.careerCleared=2;p.careerPoints=12
        val body=ProfileCodec.encode(p).substringBefore("checksum=").lines().filter{line->
            !listOf("owned=","condition=","market=","ash=","grudges=","rivals=","campaign=").any{line.startsWith(it)} && line.isNotEmpty()
        }.joinToString("\n",postfix="\n").replace("DEATHRIDE_PROFILE 5","DEATHRIDE_PROFILE 2").replace("trophies=0,0,0,0,0","trophies=0,0,0,0")
        val text=body+"checksum="+CRC32().apply{update(body.toByteArray())}.value.toString(16)+"\n"
        val migrated=ProfileCodec.decode(text,p.id)
        assertEquals(5,migrated.careerCleared);assertTrue(migrated.owned[CarCatalog.all.indexOfFirst{it.id=="Trail"}])
        assertFalse(migrated.owned[CarCatalog.all.indexOfFirst{it.id=="Bastion"}]);assertEquals(0,migrated.debt)
        assertEquals(12,migrated.careerPoints);assertEquals(12,migrated.legacyCarryPoints)
    }
    @Test fun everyLegacyDivisionCanFundEligibleRivalsAndRepeatSeasonsKeepAnEntryCar() {
        for(round in 0..11) {
            val p=Profile("legacy-division-$round");p.careerRound=round;p.careerCleared=round
            p.selectedCar=9;p.owned.fill(false);p.owned[9]=true
            if(round==0){p.careerSeasons=1;p.careerCleared=12}
            val body=ProfileCodec.encode(p).substringBefore("checksum=").lines().filter{line->
                !listOf("ash=","grudges=","rivals=","campaign=").any{line.startsWith(it)} && line.isNotEmpty()
            }.joinToString("\n",postfix="\n").replace("DEATHRIDE_PROFILE 5","DEATHRIDE_PROFILE 3").replace("trophies=0,0,0,0,0","trophies=0,0,0,0")
            val text=body+"checksum="+CRC32().apply{update(body.toByteArray())}.value.toString(16)+"\n"
            val migrated=ProfileCodec.decode(text,p.id);RivalEconomy.prepare(migrated)
            val course=Courses.all[Career.events[migrated.careerRound].courseIndex]
            assertTrue(RivalEconomy.cast(migrated.careerRound).all{course.pool.allows(CarCatalog.all[migrated.rivalProfiles[it].selectedCar])})
            assertTrue(migrated.owned[9]);if(round==0)assertTrue(migrated.owned[1])
            assertEquals(ProfileCodec.encode(migrated),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(migrated),p.id)))
        }
    }
    @Test fun finalDuelHasTwoPhysicalEntrantsAndRequiresVictory() {
        val p=Profile("duel");p.careerRound=34;p.careerCleared=34;p.credits=8000
        // Standalone final fixture: declared sponsor history is funded explicitly through ordinary cash.
        for(npc in p.rivalProfiles)npc.credits=8000
        val w=World(17,track=Track(course=Courses.all.single{it.id=="crown"}),combatEnabled=true)
        RivalEconomy.apply(p,w,1);CarCatalog.apply(w.cars[0],9);w.cars[0].aiSkill=Career.difficulties[1].skill;w.reset()
        assertEquals(2,w.entrantCount);assertEquals("marrow",w.cars[1].aiStyle!!.id)
        val leadAmmo=w.combat.ammo(0,Weapons.RIVET);w.cars[2].utilityMask=1 shl Consumables.SABOTAGE;w.reset()
        assertEquals(leadAmmo,w.combat.ammo(0,Weapons.RIVET),"Inactive slots cannot use a sabotage reserve")
        for(i in 2..5){assertFalse(w.combat.canAct(i));assertFalse(w.combat.fire(i,0))}
        val x=w.cars[0].x;w.cars[2].x=x;w.cars[2].y=w.cars[0].y;w.collide(w.cars[0],w.cars[2]);assertEquals(x,w.cars[0].x)
        val inputs=Array(6){InputFrame()};while(w.resolved<2 && w.seconds<w.raceLimitSeconds)w.step(inputs)
        assertTrue(w.resolved==2 || w.duelDraw);assertTrue(w.cars.filter{it.entered}.map{it.position}.toSet()==setOf(1,2));assertTrue(w.cars.drop(2).all{it.position==0})
        p.selectedCar=9;p.owned.fill(false);p.owned[9]=true
        assertFalse(Career.settle(p,Economy.start(p),34,1,2,0,0.0,true)!!.advanced);assertEquals(34,p.careerRound)
        assertTrue(Career.settle(p,Economy.start(p),34,1,1,0,50.0,true)!!.advanced);assertEquals(1,p.careerSeasons)
        assertTrue(p.owned[9]);assertTrue(p.owned[EconomyRules["startingCarIndex"].toInt()],"Repeat season retains the Champion garage and supplies a legal starter")
    }
    @Test fun rivalSettlementIsIdempotentAndDuelSteppingAllocatesNothing() {
        val p=Profile("duel-allocation");p.careerRound=34;p.careerCleared=34
        p.rivalProfiles.forEach{it.credits=8000}
        val w=World(22,track=Track(course=Courses.all[Career.events[34].courseIndex]),combatEnabled=true)
        RivalEconomy.apply(p,w,1);CarCatalog.apply(w.cars[0],9);w.reset()
        val frames=Array(6){InputFrame()};repeat(10000){w.step(frames)}
        val ticket=Economy.start(p);RivalEconomy.settle(p,ticket,w,34)
        val saved=ProfileCodec.encode(p);RivalEconomy.settle(p,ticket,w,34);assertEquals(saved,ProfileCodec.encode(p))
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true;val thread=Thread.currentThread().id
        repeat(20){w.reset();repeat(500){w.step(frames)}}
        var bytes=0L
        repeat(20){w.reset();val before=bean.getThreadAllocatedBytes(thread);repeat(500){w.step(frames)};bytes+=bean.getThreadAllocatedBytes(thread)-before}
        assertEquals(0L,bytes);assertEquals(2,w.entrantCount)
    }
    @Test fun fixedCupAndContractCreditsAreNotMultipliedAgainByDivisionPrizes() {
        val base=Profile("base-prize");val award=Profile("fixed-awards")
        Market.transact(award,"contract","delivery",award.marketRevision)
        val ordinary=Economy.settle(base,Economy.start(base),3,0,100.0,rewardScale=3.3,course="foundry",clean=false,finished=true)!!
        val rewarded=Economy.settle(award,Economy.start(award),3,0,100.0,rewardScale=3.3,bonus=300,course="foundry",clean=false,finished=true)!!
        assertEquals(300+Contracts.all.single{it.id=="delivery"}.reward,rewarded.gross-ordinary.gross)
    }
    @Test fun guestReplacesARegularRivalAndPreservesTheNamedBoss() {
        val p=Profile("guest-boss");val w=World(combatEnabled=true)
        RivalEconomy.apply(p,w,1,guest=true);w.reset()
        assertEquals(6,w.entrantCount);assertEquals(-1,w.cars[1].rivalIndex)
        assertEquals("rook",w.cars[2].aiStyle!!.id);assertEquals(4,w.cars.count{it.rivalIndex>=0})
        val a=World(91,combatEnabled=true);val b=World(91,combatEnabled=true)
        RivalEconomy.apply(p,a,1)
        // Original one-player grid, reconstructed directly to guard the new guest branch.
        for((slot,index) in RivalEconomy.cast(0).withIndex()) {
            val c=b.cars[slot+1];Garage.apply(p.rivalProfiles[index],c);c.aiSkill=Career.difficulties[1].skill;c.aiStyle=RivalEconomy.style(p,index);c.rivalIndex=index
        }
        b.raceLaps=Career.events[0].laps;Encounters.apply(b,"scrap");a.reset();b.reset();val inputs=Array(6){InputFrame()}
        repeat(1200){a.step(inputs);b.step(inputs)};assertEquals(a.stateHash(),b.stateHash())
    }
}
