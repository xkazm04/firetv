package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import java.util.Random
import java.util.zip.CRC32
import kotlin.math.*

class CareerTest {
    private val neutral=Array(Tuning.CAR_COUNT){InputFrame()}
    @Test fun orderedContentUnlocksCupTargetsAndDuplicateSettlement() {
        val p=Profile("career")
        assertFalse(Career.unlocked(p,"car","Comet"));assertTrue(Career.unlocked(p,"car","Line"))
        p.credits=1000;Garage.buy(p,0,0);assertFalse(Garage.offer(p,0).available);assertTrue(Garage.offer(p,0).reason.contains("Clear round"))
        val idle=Career.settle(p,Economy.start(p),0,0,3,0,100.0,false)!!
        assertFalse(idle.advanced);assertEquals(0,p.careerRound);assertTrue(p.credits>0)
        for(round in Career.events.indices) {
            val event=Career.events[round];assertTrue(Career.unlocked(p,"track",Courses.all[event.courseIndex].id))
            val ticket=Economy.start(p);val result=Career.settle(p,ticket,round,0,1,1,40.0,true)!!
            assertTrue(result.advanced);val cash=p.credits;val next=p.careerRound
            assertNull(Career.settle(p,ticket,round,0,1,1,40.0,true));assertEquals(cash,p.credits);assertEquals(next,p.careerRound)
            if(round==2){assertEquals(3,result.cupGrade);assertEquals(Career.cups[0].bonuses[3],result.bonus);assertEquals(0,p.careerPoints)}
        }
        assertEquals(1,p.careerSeasons);assertEquals(0,p.careerRound);assertEquals(Career.events.size,p.careerCleared)
        assertTrue(p.careerTrophies.all{it==3});assertTrue(Career.unlocks.all{Career.unlocked(p,it.kind,it.id)})
        assertTrue(Career.partUnlocks.all{Career.maximumPartTier(p,it.part)>=it.tier})
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(ProfileCodec.decode(ProfileCodec.encode(p),p.id)))
    }
    @Test fun versionOneMigratesAndImpossibleCareerStateIsRejected() {
        val p=Profile("migration");p.credits=1234;Garage.buy(p,2,0)
        fun sign(body: String)=body+"checksum="+CRC32().apply{update(body.toByteArray(Charsets.UTF_8))}.value.toString(16)+"\n"
        val body=ProfileCodec.encode(p).substringBefore("checksum=")
        val old=sign(body.replace("DEATHRIDE_PROFILE 2","DEATHRIDE_PROFILE 1").lines().filterNot{it.startsWith("career=") || it.startsWith("trophies=")}.joinToString("\n"))
        val migrated=ProfileCodec.decode(old,p.id);assertEquals(p.credits,migrated.credits);assertArrayEquals(p.tiers,migrated.tiers);assertEquals(0,migrated.careerRound)
        assertThrows(IllegalArgumentException::class.java){ProfileCodec.decode(sign(body.replace("career=0,0,0,0,0","career=1,0,50,0,9")),p.id)}
    }
    @Test fun tiersChangeDecisionsWithoutChangingPower() {
        val world=World(track=Track(course=Courses.all[0]),combatEnabled=true)
        for(c in world.cars){CarCatalog.apply(c,1);c.human=true}
        world.reset();repeat(300){world.step(neutral)}
        val c=world.cars[1];c.x=0.0;c.y=0.0;c.heading=0.0
        for(i in world.cars.indices)if(i!=1){world.cars[i].x=1000.0+i*20;world.cars[i].y=1000.0}
        world.cars[0].x=-10.0;world.cars[0].y=0.0
        val spec=c.spec;val hp=world.combat.health(1);val ammo=world.combat.ammo(1,Weapons.MINE)
        c.aiSkill=Career.difficulties[0].skill;world.combat.think(c);assertEquals(0.0,c.aiInput.mine)
        c.aiSkill=Career.difficulties[1].skill;world.combat.think(c);assertEquals(1.0,c.aiInput.mine);assertEquals(2,c.aiCombatReason)
        c.aiStyle=Career.rivals[0];world.combat.think(c);assertEquals(0.0,c.aiInput.mine,"Rook's profile never drops mines")
        c.aiStyle=null;val pickup=world.combat.pickups.first{it.type.id=="repair"};pickup.cooldownSeconds=0.0
        c.x=pickup.x-15;c.y=pickup.y;c.heading=0.0;world.combat.damage(c.id,80.0,-1,DamageKind.WALL)
        c.aiSkill=Career.difficulties[1].skill;world.combat.seekRepair(c,0.0);assertEquals(-1,c.aiPickupTarget)
        c.aiSkill=Career.difficulties[2].skill;world.combat.seekRepair(c,0.0);assertTrue(c.aiPickupTarget>=0)
        pickup.cooldownSeconds=1.0;world.combat.seekRepair(c,0.0);assertEquals(-1,c.aiPickupTarget)
        assertEquals(spec,c.spec);assertEquals(ammo,world.combat.ammo(1,Weapons.MINE));assertTrue(hp<=CombatRules["maxHp"])
        for(tier in Career.difficulties.indices){val w=World(combatEnabled=true);Career.prepareRivals(w,tier);w.reset();for(i in 1..5){assertEquals(CarCatalog.all[Career.rivals[i-1].carIndex].spec(),w.cars[i].spec);assertEquals(CombatRules["maxHp"],w.combat.health(i))}}
    }
    @Test fun campaignCombatReplaysAndAllocatesNothing() {
        fun make()=World(71,track=Track(course=Courses.all[3]),combatEnabled=true).also {w->CarCatalog.apply(w.cars[0],1);Career.prepareRivals(w,2);w.reset()}
        val a=make();val b=make();repeat(6000){a.step(neutral);b.step(neutral)};assertEquals(a.stateHash(),b.stateHash())
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean;bean.isThreadAllocatedMemoryEnabled=true
        repeat(60000){if(it%600==0)a.reset();a.step(neutral)}
        val id=Thread.currentThread().id;var allocated=0L;var shots=0
        repeat(20){a.reset();val before=bean.getThreadAllocatedBytes(id);repeat(500){a.step(neutral)};allocated+=bean.getThreadAllocatedBytes(id)-before;shots+=a.combat.shots.sum()}
        assertTrue(shots>100);assertEquals(0L,allocated)
    }
    @Test fun twoThousandSeededCareersPerTierReportPacingAndWinRate() {
        data class Outcome(val position: Int,val kills: Int,val hp: Double,val qualified: Boolean)
        val bands=Content.table("career-upgrade-bands");val seeds=Career["pacingSeedsPerCell"].toInt()
        val library=Array(Career.difficulties.size){Array(5){Array(bands.size){arrayOfNulls<Outcome>(seeds)}}}
        val physical=StringBuilder("tier,track,band,seed,seconds,position,hp,kills,qualified,wrecks,shots,hash\n")
        val hashes=Array(Career.difficulties.size){Array(5){Array(bands.size){HashSet<Long>()}}}
        for(tier in Career.difficulties.indices)for(course in 0 until 5)for(band in bands.indices)repeat(seeds){seed->
            val p=Profile("reference");p.careerCleared=Career.events.size
            for(part in Parts.all.indices)p.tiers[p.selectedCar*Parts.all.size+part]=bands[band].getValue(Parts.all[part].id).toInt()
            val w=World(seed,track=Track(course=Courses.all[course]),combatEnabled=true);Career.prepareRivals(w,tier);Garage.apply(p,w.cars[0])
            w.cars[0].aiSkill=Career.difficulties[Career["pacingReferenceSkill"].toInt()].skill;w.reset()
            while(w.resolved<6 && w.seconds<TrackRules["maxRaceSeconds"])w.step(neutral)
            val c=w.cars[0];val o=Outcome(c.position,w.combat.kills[0],w.combat.health(0),Career.qualifies(c,w));library[tier][course][band][seed]=o
            assertTrue(w.cars.all{it.x.isFinite() && it.y.isFinite()});assertEquals(0,w.combat.oneShotKills)
            assertTrue(hashes[tier][course][band].add(w.stateHash()),"Seed cell must contain distinct physical outcomes")
            physical.append("${Career.difficulties[tier].id},${Courses.all[course].id},${bands[band].getValue("id")},$seed,${w.seconds},${o.position},${o.hp},${o.kills},${o.qualified},${w.combat.wreckCount},${w.combat.shots.sum()},${w.stateHash()}\n")
        }
        val report=StringBuilder("tier,careers,meanRacesToSeason,firstEarnedUpgradeRace,bankrupt,censored,wins,races,winRate\n")
        val milestones=StringBuilder("tier,unlock,requiredRounds,meanRace,observations\n")
        val count=Career["pacingCareersPerTier"].toInt();val limit=Career["pacingMaxRaces"].toInt()
        for(tier in Career.difficulties.indices) {
            var firstSum=0;var raceSum=0;var wins=0;var races=0;var bankrupt=0;var censored=0
            val gates=(Career.unlocks.map{it.name to it.afterRounds}+Career.partUnlocks.map{Parts.all[it.part].name+" tier "+it.tier to it.afterRounds})
            val gateSums=LongArray(gates.size);val gateCounts=IntArray(gates.size)
            repeat(count){seed->
                val p=Profile("career-model");p.careerDifficulty=tier;p.credits=0 // first earned part excludes starter grant
                val random=Random(seed.toLong());var first=0;var raced=0;val observed=BooleanArray(gates.size)
                for(i in gates.indices)if(gates[i].second==0){observed[i]=true;gateCounts[i]++}
                while(p.careerSeasons==0 && raced<limit) {
                    val installed=p.tiers.sum();val band=if(installed>=bands[2].values.drop(1).sumOf{it.toInt()})2 else if(installed>=bands[1].values.drop(1).sumOf{it.toInt()})1 else 0
                    val event=Career.events[p.careerRound];val o=library[tier][event.courseIndex][band][random.nextInt(seeds)]!!
                    Career.settle(p,Economy.start(p),p.careerRound,tier,o.position,o.kills,o.hp,o.qualified);raced++;races++;if(o.position==1)wins++
                    if(p.credits<0)bankrupt++
                    val offer=Parts.all.indices.map{Garage.offer(p,it)}.filter{it.available}.minByOrNull{it.price}
                    if(offer!=null){Garage.buy(p,offer.partIndex,offer.tier);if(first==0)first=raced}
                    for(i in gates.indices)if(!observed[i] && p.careerCleared>=gates[i].second){gateSums[i]+=raced.toLong();gateCounts[i]++;observed[i]=true}
                }
                if(p.careerSeasons==0)censored++;firstSum+=if(first==0)limit+1 else first;raceSum+=raced
                assertTrue(p.credits in 0..EconomyRules["creditCap"].toInt())
            }
            report.append("${Career.difficulties[tier].id},$count,${raceSum.toDouble()/count},${firstSum.toDouble()/count},$bankrupt,$censored,$wins,$races,${wins.toDouble()/races}\n")
            for(i in gates.indices)milestones.append("${Career.difficulties[tier].id},${gates[i].first},${gates[i].second},${if(gateCounts[i]>0)gateSums[i].toDouble()/gateCounts[i] else -1.0},${gateCounts[i]}\n")
            assertEquals(0,bankrupt);assertEquals(0,censored,"Reference-driver career cannot dead-end in this sampled library")
        }
        File("build/reports/balance/w7-physical.csv").apply{parentFile.mkdirs();writeText(physical.toString())}
        File("build/reports/balance/w7-pacing.csv").writeText(report.toString());File("build/reports/balance/w7-unlocks.csv").writeText(milestones.toString())
    }
}
