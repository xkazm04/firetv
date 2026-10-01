package dev.deathride.core

import kotlin.math.*

object AshRules {
    private val rules=Content.table("ash-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rules.getValue(key)
}
data class StoryCard(val id: String,val title: String,val backdrop: String,val lines: List<String>) {
    val json get()="{\"id\":\"$id\",\"title\":\"$title\",\"backdrop\":\"$backdrop\",\"lines\":[${lines.joinToString(","){"\"$it\""}}]}"
}
object AshStory {
    val cards=Content.table("story-cards").associate{it.getValue("id") to StoryCard(it.getValue("id"),it.getValue("title"),it.getValue("backdropKey"),(1..3).map{i->it.getValue("line$i")})}
    val rivals=Content.table("rival-stories").associateBy{it.getValue("id")}
}
data class CurvePoint(val event: String,val number: Int,val act: Int,val fieldTarget: Double,val ratioTarget: Double,val rewardScale: Double,val rivalGrant: Int)
object CareerCurve {
    val all=Content.table("career-curve").map{CurvePoint(it.getValue("event"),it.number("number").toInt(),it.number("act").toInt(),it.number("fieldTarget"),it.number("ratioTarget"),it.number("rewardScale"),it.number("rivalGrant").toInt())}
}
class RivalPlan(row: Map<String,String>) {
    val id=row.getValue("id");val cars=listOf("rookie","club","pro","elite","champion").map{tier->CarCatalog.all.indexOfFirst{it.id==row.getValue(tier)}}
    val every=row.number("shopEvery").toInt();val offset=row.number("shopOffset").toInt();val startingCredits=row.number("startingCredits").toInt()
    val championPrLimit=row.number("championPrLimit")
    init{require(cars.all{it>=0} && every>0 && offset in 0 until every && startingCredits>=0)}
}
data class RivalResult(val index: Int,val position: Int,val kills: Int,val hp: Double,val cash: Int,val clean: Boolean,val finished: Boolean,val playerWrecked: Boolean)
object RivalEconomy {
    val plans=Content.table("rival-garages").map{RivalPlan(it)}
    fun initialProfiles(): Array<Profile> = plans.map{plan->Profile("rival-${plan.id}",false).also{p->
        p.credits=plan.startingCredits;p.selectedCar=plan.cars[0];p.owned.fill(false);p.owned[p.selectedCar]=true
    }}.toTypedArray()
    fun cast(round: Int): IntArray {
        val e=Career.events[round]
        if(e.duel)return intArrayOf(Career.rivals.indexOfFirst{it.id=="marrow"})
        val boss=listOf("rook","ox","vex","mica","marrow")[e.cupIndex]
        val available=Career.rivals.indices.filter{if(e.cupIndex<4)Career.rivals[it].id!="marrow" else Career.rivals[it].id!="relay"}
        return available.sortedBy{if(Career.rivals[it].id==boss)0 else it+1}.toIntArray()
    }
    /** Actual shared shop transactions; no car stat writes or player-power input. */
    fun shop(p: Profile,plan: RivalPlan,point: CurvePoint,course: Course) {
        val wanted=plan.cars[point.act]
        if(p.selectedCar!=wanted) {
            var attempts=0
            while(p.credits+Market.tradeValue(p)<CarCatalog.all[wanted].priceCredits && attempts++<4) {
                if(!Market.transact(p,"loan","",p.marketRevision).startsWith("Loan received"))break
            }
            if(p.credits+Market.tradeValue(p)>=CarCatalog.all[wanted].priceCredits)Market.transact(p,"trade",CarCatalog.all[wanted].id,p.marketRevision)
        }
        require(course.pool.allows(CarCatalog.all[p.selectedCar])){"${plan.id}: cannot afford an eligible ${course.id} car"}
        repeat(24) {
            val base=PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses())
            var chosen: Offer?=null;var best=0.0
            for(i in Parts.all.indices) {
                val offer=Garage.offer(p,i);if(!offer.available)continue
                val bonus=p.bonuses();for(s in bonus.indices)bonus[s]+=Parts.all[i].bonuses[s]
                val rating=PowerRating.of(CarCatalog.all[p.selectedCar],bonus)
                val value=(rating-base)/offer.price
                val ceiling=if(point.act==4)min(point.fieldTarget,plan.championPrLimit) else point.fieldTarget
                if(rating<=ceiling*AshRules["rivalPrCeilingScale"] && value>best){chosen=offer;best=value}
            }
            val offer=chosen?:return
            check(Garage.buy(p,offer.partIndex,offer.tier).startsWith("Installed"))
        }
    }
    fun prepare(p: Profile,round: Int=p.careerRound) {
        require(p.withRivals)
        val point=CareerCurve.all[round];val course=Courses.all[Career.events[round].courseIndex]
        val serial=p.careerSeasons*Career.events.size+round
        if(p.rivalPreparedSerial==serial)return
        val active=cast(round).toSet()
        for(i in plans.indices) {
            val npc=p.rivalProfiles[i];val plan=plans[i]
            npc.careerRound=round;npc.careerCleared=max(npc.careerCleared,round)
            npc.credits=min(EconomyRules["creditCap"].toInt(),npc.credits+point.rivalGrant)
            if(i !in active)continue
            // New divisions and bosses always have a shopping window; other windows are driver data.
            if(npc.selectedCar!=plan.cars[point.act] || round%7==0 || Career.events[round].boss || (round+plan.offset)%plan.every==0)shop(npc,plan,point,course)
        }
        p.rivalPreparedSerial=serial
    }
    fun style(p: Profile,index: Int): Rival {
        val base=Career.rivals[index]
        if(p.grudges[index]<=0)return base
        return Rival(base.values+mapOf("passDistanceScale" to (base.passDistanceScale*AshRules["grudgePassScale"]).toString(),"fireRangeScale" to min(1.0,base.fireRangeScale+AshRules["grudgeFireRangeBonus"]).toString()))
    }
    fun apply(p: Profile,world: World,difficulty: Int,round: Int=p.careerRound,guest: Boolean=false) {
        prepare(p,round);val cast=cast(round)
        for(c in world.cars){c.entered=c.id<=cast.size;c.rivalIndex=-1}
        val guestRacing=guest && !Career.events[round].duel
        for(slot in 0 until cast.size-(if(guestRacing)1 else 0)) {
            val index=cast[slot]
            val c=world.cars[slot+if(guestRacing)2 else 1];Garage.apply(p.rivalProfiles[index],c);c.aiSkill=Career.difficulties[difficulty].skill;c.aiStyle=style(p,index);c.rivalIndex=index;c.human=false
        }
        Encounters.apply(world,Career.cups[Career.events[round].cupIndex].id)
    }
    fun settle(p: Profile,ticket: Long,world: World,round: Int) {
        val results=world.cars.filter{it.entered && it.rivalIndex>=0}.map{c->RivalResult(c.rivalIndex,c.position,world.combat.kills[c.id],world.combat.health(c.id),world.combat.cashCollected[c.id],world.combat.damageTaken[c.id]==0.0,c.finishSeconds>=0,world.combat.wreckSource[c.id]==0)}
        settleResults(p,ticket,round,results)
    }
    fun settleResults(p: Profile,ticket: Long,round: Int,results: List<RivalResult>) {
        if(ticket<=p.rivalSettledTicket || ticket>p.startedRaces)return
        require(results.map{it.index}.distinct().size==results.size && results.all{it.index in p.rivalProfiles.indices && it.position in 1..6 && it.hp.isFinite() && it.hp in 0.0..100.0 && it.cash in 0..MarketRules["raceCashCap"].toInt()})
        val scale=CareerCurve.all[round].rewardScale
        for(r in results) {
            val npc=p.rivalProfiles[r.index]
            Economy.settle(npc,Economy.start(npc),r.position,r.kills,r.hp,rewardScale=scale,
                cash=r.cash,course=Courses.all[Career.events[round].courseIndex].id,clean=r.clean,finished=r.finished)
            if(r.playerWrecked)p.grudges[r.index]=1
        }
        p.rivalSettledTicket=ticket
    }
    fun fieldRating(p: Profile,round: Int=p.careerRound)=cast(round).map{index->val r=p.rivalProfiles[index];PowerRating.of(CarCatalog.all[r.selectedCar],r.bonuses())}.average()
    fun json(p: Profile): String = cast(p.careerRound).joinToString(",","[","]"){index->
        val r=p.rivalProfiles[index];val driver=Career.rivals[index];val story=AshStory.rivals.getValue(driver.id)
        "{\"id\":\"${driver.id}\",\"name\":\"${driver.name}\",\"car\":\"${CarCatalog.all[r.selectedCar].id}\",\"powerRating\":${PowerRating.of(CarCatalog.all[r.selectedCar],r.bonuses())},\"credits\":${r.credits},\"debt\":${r.debt},\"parts\":${r.tiers.sum()},\"grudge\":${p.grudges[index]>0},\"relationship\":\"${if(p.grudges[index]>0)"grudge" else if(p.grudges[index]<0)"ally" else "neutral"}\",\"portrait\":\"${story.getValue("portraitKey")}\",\"biography\":\"${story.getValue("biography")}\",\"taunt\":\"${story.getValue(if(p.grudges[index]>0)"grudgeTaunt" else "taunt")}\"}"
    }
}

/** Explicit policy family for reports, not a claim of globally optimal human play. */
object CareerSpending {
    fun spend(p: Profile,partLimit: Int=2): Int {
        val act=min(4,p.careerCleared/7);var purchases=0
        val current=CarCatalog.all[p.selectedCar]
        if(current.tierRank<act) {
            val nextTier=min(act,current.tierRank+1)
            val options=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==nextTier && Career.unlocked(p,"car",CarCatalog.all[it].id) && p.credits+Market.tradeValue(p)>=CarCatalog.all[it].priceCredits}
            val choice=options.maxByOrNull{PowerRating.of(CarCatalog.all[it])}
            if(choice!=null && Market.transact(p,"trade",CarCatalog.all[choice].id,p.marketRevision).startsWith("Purchased"))purchases++
            else return purchases // Save for the next legal tier instead of filling the old chassis.
        }
        return purchases+upgrade(p,partLimit)
    }
    fun upgrade(p: Profile,partLimit: Int): Int {
        var purchases=0
        while(Parts.all.indices.sumOf{p.tier(p.selectedCar,it)}<partLimit) {
            val before=PowerRating.of(CarCatalog.all[p.selectedCar],p.bonuses())
            val offers=Parts.all.indices.map{Garage.offer(p,it)}.filter{it.available || it.reason=="Earn more credits"}
            val best=offers.maxByOrNull{o->val b=p.bonuses();for(s in b.indices)b[s]+=Parts.all[o.partIndex].bonuses[s];(PowerRating.of(CarCatalog.all[p.selectedCar],b)-before)/o.price}?:break
            val improved=p.bonuses();for(s in improved.indices)improved[s]+=Parts.all[best.partIndex].bonuses[s]
            if(PowerRating.of(CarCatalog.all[p.selectedCar],improved)<=before)break
            if(!best.available)break // Waiting for the best useful offer beats buying a nearly inert cheap part.
            if(!Garage.buy(p,best.partIndex,best.tier).startsWith("Installed"))break
            purchases++
        }
        return purchases
    }
}
