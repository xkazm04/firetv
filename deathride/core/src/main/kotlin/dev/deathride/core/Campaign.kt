package dev.deathride.core

import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

object CampaignRules {
    private val values=Content.table("campaign-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=values.getValue(key)
    init {
        require(get("startingDebt")>0 && get("interestPerEvent")>=0)
        require(get("paymentShare") in 0.0..1.0 && get("divertedShare") in 0.0..1.0)
        require(get("choosePayout")==1.0 && get("returnSeizedCar")==1.0 && get("duelEntrants")==2.0 && get("mechanicLoyal")==1.0)
        require(get("allyRaceBenefit")==0.0) { "No unmeasured ally power is supported" }
    }
}

/** Career-only state. Never accessed by the fixed step. Amounts are integer credits. */
class CampaignState(fresh: Boolean) {
    var initial=if(fresh)CampaignRules["startingDebt"].toLong() else 0L
    var debt=initial
    var interest=0L;var paid=0L;var diverted=0L;var recovered=0L;var voided=0L
    var lastPayment=0L;var lastCredited=0L;var lastDiverted=0L;var lastInterest=0L
    var interestEvent=-1
    var exposed=false
    // 0 unearned, 1 pending, 2 cash, 3 car, 4 part, 5 migrated (no retroactive reward).
    val rewards=IntArray(4)
    var seizedCar=-1
    var finale=0 // 0 not seized, 1 loan rig active, 2 won and restored
    var lastGrant=0
    fun encode()=(listOf(initial,debt,interest,paid,diverted,recovered,voided,lastPayment,lastCredited,lastDiverted,lastInterest,interestEvent.toLong(),if(exposed)1L else 0L)+rewards.map{it.toLong()}+listOf(seizedCar.toLong(),finale.toLong(),lastGrant.toLong())).joinToString(",")
    fun decode(value: String) {
        val a=value.split(',').map{it.toLong()};require(a.size==20)
        require(a.take(11).all{it in 0..1_000_000_000_000L})
        initial=a[0];debt=a[1];interest=a[2];paid=a[3];diverted=a[4];recovered=a[5];voided=a[6]
        lastPayment=a[7];lastCredited=a[8];lastDiverted=a[9];lastInterest=a[10]
        require(a[11] in -1..34 && a[12] in 0..1);interestEvent=a[11].toInt();exposed=a[12]==1L
        for(i in rewards.indices){require(a[13+i] in 0..5);rewards[i]=a[13+i].toInt()}
        require(a[17] in -1 until CarCatalog.all.size.toLong() && a[18] in 0..2 && a[19] in 0..EconomyRules["creditCap"].toLong())
        seizedCar=a[17].toInt();finale=a[18].toInt();lastGrant=a[19].toInt()
        require(initial+interest-paid+diverted-recovered-voided==debt) { "Campaign ledger does not reconcile" }
        require(diverted<=paid && recovered<=diverted && lastPayment==lastCredited+lastDiverted)
        require((finale==0)==(seizedCar==-1))
        require(!exposed || rewards[1]>0)
    }
}

class CampaignAlly(row: Map<String,String>) {
    val id=row.getValue("id");val event=row.getValue("event");val money=row.number("money").toInt()
    val car=CarCatalog.all.indexOfFirst{it.id==row.getValue("car")}
    val part=Parts.all.indexOfFirst{it.id==row.getValue("part")}
    val joinedLine=row.getValue("joinedLine");val grudgeLine=row.getValue("grudgeLine")
    init { require(car>=0 && part>=0 && money>0) }
}

object Campaign {
    val allies=Content.table("campaign-allies").map{CampaignAlly(it)}
    val mechanic=Content.table("campaign-mechanic")
    val choices=listOf("money","car","part")
    fun prepare(p: Profile,round: Int=p.careerRound) {
        if(!p.withRivals)return
        val s=p.campaign
        if(p.careerSeasons>0 || round<=s.interestEvent)return
        s.interestEvent=round;s.lastInterest=0
        if(!s.exposed && s.debt>0 && round<CampaignRules["interestThroughEvent"].toInt()) {
            s.lastInterest=CampaignRules["interestPerEvent"].toLong();s.interest+=s.lastInterest;s.debt+=s.lastInterest
        }
    }
    fun payment(p: Profile,net: Int,loanPaid: Int): Int {
        val s=p.campaign;s.lastPayment=0;s.lastCredited=0;s.lastDiverted=0
        if(!p.withRivals || s.debt==0L)return 0
        val available=max(0,net-loanPaid-MarketRules["minimumTakeHome"].toInt())
        val amount=min(s.debt,min(available,floor((net-loanPaid)*CampaignRules["paymentShare"]).toInt()).toLong())
        val cut=if(s.exposed)0L else floor(amount*CampaignRules["divertedShare"]).toLong()
        s.lastPayment=amount;s.lastCredited=amount-cut;s.lastDiverted=cut
        s.paid+=amount;s.diverted+=cut;s.debt-=amount-cut
        return amount.toInt()
    }
    fun promoted(p: Profile,round: Int) {
        if(!p.withRivals)return
        val index=allies.indexOfFirst{it.event==Career.events[round].id};if(index<0)return
        val s=p.campaign
        if(s.rewards[index]==0)s.rewards[index]=1
        val rival=Career.rivals.indexOfFirst{it.id==allies[index].id};p.grudges[rival]=-1
        if(round+1==CampaignRules["exposeAfterEvent"].toInt() && !s.exposed) {
            s.exposed=true;val recovered=min(s.debt,s.diverted-s.recovered);s.debt-=recovered;s.recovered+=recovered
        }
    }
    fun migrate(p: Profile) {
        val s=p.campaign;s.initial=0;s.debt=0;s.interestEvent=p.careerRound-1
        for(i in allies.indices)if(p.careerCleared>=Career.events.indexOfFirst{it.id==allies[i].event}+1)s.rewards[i]=5
        s.exposed=s.rewards[1]>0
    }
    fun pending(p: Profile)=p.campaign.rewards.indexOfFirst{it==1}
    fun allyIndex(id: String)=allies.indexOfFirst{it.id==id}
    fun taunt(p: Profile,rival: String): String? {
        val index=allyIndex(rival);if(index<0 || p.campaign.rewards[index]==0)return null
        val r=Career.rivals.indexOfFirst{it.id==rival}
        return if(p.grudges[r]>0)allies[index].grudgeLine else allies[index].joinedLine
    }
    fun reason(p: Profile,index: Int,choice: String): String {
        if(index !in allies.indices || p.campaign.rewards[index]!=1)return "Reward already claimed or not earned"
        val a=allies[index]
        return when(choice) {
            "money"->if(p.credits>=EconomyRules["creditCap"])"Wallet full - choose another reward" else ""
            "car"->if(p.owned[a.car])"Car already owned" else if(!Career.unlocked(p,"car",CarCatalog.all[a.car].id))"Licence not earned" else ""
            "part"->{val offer=Garage.offer(p,a.part);if(offer.available || offer.reason=="Earn more credits")"" else offer.reason}
            else->"Unknown reward"
        }
    }
    fun label(p: Profile,index: Int,choice: String): String {
        val a=allies[index]
        return when(choice) {
            "money"->"${min(a.money,EconomyRules["creditCap"].toInt()-p.credits)} CR (up to ${a.money})"
            "car"->"Stock ${CarCatalog.all[a.car].id} / value ${CarCatalog.all[a.car].priceCredits} CR"
            else->"${Parts.all[a.part].name} ${Garage.offer(p,a.part).nextTier} on ${CarCatalog.all[p.selectedCar].id}"
        }
    }
    fun claim(p: Profile,id: String,revision: Long): String {
        if(revision!=p.marketRevision)return "Offer changed - refresh the garage"
        val pair=id.split(':');if(pair.size!=2)return "Unknown reward"
        val index=allyIndex(pair[0]);val choice=pair[1];val error=reason(p,index,choice);if(error.isNotEmpty())return error
        if(!p.owned[p.selectedCar])return "Select an owned car for promotion"
        val a=allies[index];val description=label(p,index,choice);var grant=0
        when(choice) {
            "money"->{grant=min(a.money,EconomyRules["creditCap"].toInt()-p.credits);p.credits+=grant}
            "car"->{p.owned[a.car]=true;p.condition[a.car]=100;grant=CarCatalog.all[a.car].priceCredits}
            "part"->{grant=Garage.offer(p,a.part).price;p.tiers[p.selectedCar*Parts.all.size+a.part]++}
        }
        p.campaign.rewards[index]=choices.indexOf(choice)+2;p.campaign.lastGrant=grant;p.marketRevision++
        return "${a.id.replaceFirstChar{it.uppercase()}} promotion: $description claimed"
    }
    fun mechanicLine(p: Profile)=mechanic[Career.events[p.careerRound].cupIndex].getValue("line")
    fun json(p: Profile): String {
        val s=p.campaign;val m=mechanic[Career.events[p.careerRound].cupIndex]
        val rewards=allies.mapIndexed{i,a->
            val offers=choices.joinToString(",","[","]"){choice->val error=reason(p,i,choice);"{\"id\":\"${a.id}:$choice\",\"label\":\"${label(p,i,choice)}\",\"available\":${error.isEmpty()},\"reason\":\"$error\"}"}
            "{\"id\":\"${a.id}\",\"state\":${s.rewards[i]},\"line\":\"${taunt(p,a.id)?:a.joinedLine}\",\"offers\":$offers}"
        }.joinToString(",","[","]")
        return "{\"profile\":\"${p.id}\",\"car\":\"${CarCatalog.all[p.selectedCar].id}\",\"revision\":${p.marketRevision},\"debt\":${s.debt},\"initial\":${s.initial},\"interest\":${s.interest},\"paid\":${s.paid},\"diverted\":${s.diverted},\"recovered\":${s.recovered},\"voided\":${s.voided},\"lastPayment\":${s.lastPayment},\"lastCredited\":${s.lastCredited},\"lastDiverted\":${s.lastDiverted},\"lastInterest\":${s.lastInterest},\"exposed\":${s.exposed},\"loanDebt\":${p.debt},\"allies\":$rewards,\"mechanic\":\"${m.getValue("line")}\",\"tutorial\":\"${m.getValue("tutorial")}\",\"hub\":\"${m.getValue("hub")}\",\"finale\":${s.finale},\"seizedCar\":\"${if(s.seizedCar>=0)CarCatalog.all[s.seizedCar].id else ""}\"}"
    }
}
