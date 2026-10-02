package dev.deathride.core

import kotlin.math.*

object EconomyRules {
    private val values=Content.table("economy").associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String)=values.getValue(key)
    val prizes=Content.table("prizes").sortedBy { it.getValue("position").toInt() }.map { it.number("credits").toInt() }.toIntArray()
    init { require(prizes.size==Tuning.CAR_COUNT && prizes.all { it>=0 });require(values.getValue("maxRepairPrizeShare") in 0.0..<1.0) }
}
class Part(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name");val description=row.getValue("description")
    val maxTier=row.number("maxTier").toInt();val basePrice=row.number("basePrice").toInt();val priceGrowth=row.number("priceGrowth")
    val bonuses=IntArray(CarCatalog.statNames.size){row.number(CarCatalog.statNames[it]).toInt()}
    init { require(maxTier>0 && basePrice>0 && priceGrowth>1);require(bonuses.any { it>0 }) }
    fun price(nextTier: Int,scale: Double=1.0)=ceil(basePrice*priceGrowth.pow(nextTier-1)*scale).toInt()
}
object Parts {
    val all=Content.table("parts").map { Part(it) }
    init { require(all.map{it.id}.distinct().size==all.size) }
}
data class Receipt(val race: Long,val position: Int,val kills: Int,val gross: Int,val repair: Int,val insurance: Int,val net: Int,val banked: Int,val balance: Int) {
    fun encode()="$race,$position,$kills,$gross,$repair,$insurance,$net,$banked,$balance"
    val json get()="{\"position\":$position,\"kills\":$kills,\"gross\":$gross,\"repair\":$repair,\"insurance\":$insurance,\"net\":$net,\"banked\":$banked,\"balance\":$balance}"
}
class Profile(val id: String,val withRivals: Boolean=true) {
    var credits=EconomyRules["startingCredits"].toInt();internal set
    var selectedCar=EconomyRules["startingCarIndex"].toInt()
    var startedRaces=0L;internal set
    var settledRace=0L;internal set
    var races=0;internal set
    var wins=0;internal set
    var careerRound=0;internal set
    var careerCleared=0;internal set
    var careerPoints=0;internal set
    var careerSeasons=0;internal set
    var careerDifficulty=0
    val careerTrophies=IntArray(Career.cups.size)
    val tiers=IntArray(CarCatalog.all.size*Parts.all.size)
    val owned=BooleanArray(CarCatalog.all.size){it==selectedCar}
    val condition=IntArray(CarCatalog.all.size){100}
    var inventory=0;internal set
    var raceItems=0;internal set
    var debt=0;internal set // Optional shop loans; league debt has its own auditable ledger.
    val campaign=CampaignState(withRivals)
    var winStreak=0;internal set
    var contract=-1;internal set
    var contractWins=0;internal set
    var lastBonus=0;internal set
    var lastDebtPayment=0;internal set
    var manualService=false;internal set
    var marketRevision=0L;internal set
    var legacyCarryPoints=0;internal set
    var rivalPreparedSerial=-1;internal set
    var rivalSettledTicket=0L;internal set
    val rivalProfiles=if(withRivals)RivalEconomy.initialProfiles() else emptyArray()
    val grudges=IntArray(rivalProfiles.size)
    var lastReceipt: Receipt?=null;internal set
    init { require(validProfileId(id)) }
    fun tier(car: Int,part: Int)=tiers[car*Parts.all.size+part]
    fun bonuses(car: Int=selectedCar): IntArray {
        val result=IntArray(CarCatalog.statNames.size)
        for(p in Parts.all.indices)for(s in result.indices)result[s]+=Parts.all[p].bonuses[s]*tier(car,p)
        return result
    }
    fun copy(): Profile = Profile(id,withRivals).also { p ->
        p.campaign.decode(campaign.encode())
        p.credits=credits;p.selectedCar=selectedCar;p.startedRaces=startedRaces;p.settledRace=settledRace;p.races=races;p.wins=wins
        tiers.copyInto(p.tiers);p.lastReceipt=lastReceipt
        owned.copyInto(p.owned);condition.copyInto(p.condition);p.inventory=inventory;p.raceItems=raceItems;p.debt=debt;p.winStreak=winStreak;p.contract=contract;p.contractWins=contractWins
        p.lastBonus=lastBonus;p.lastDebtPayment=lastDebtPayment;p.manualService=manualService;p.marketRevision=marketRevision
        p.legacyCarryPoints=legacyCarryPoints;p.rivalPreparedSerial=rivalPreparedSerial;p.rivalSettledTicket=rivalSettledTicket;grudges.copyInto(p.grudges)
        for(i in rivalProfiles.indices)p.rivalProfiles[i]=rivalProfiles[i].copy()
        p.careerRound=careerRound;p.careerCleared=careerCleared;p.careerPoints=careerPoints;p.careerSeasons=careerSeasons;p.careerDifficulty=careerDifficulty;careerTrophies.copyInto(p.careerTrophies)
    }
}
fun validProfileId(id: String)=id.matches(Regex("[A-Za-z0-9_-]{1,64}"))
data class Offer(val partIndex: Int,val tier: Int,val nextTier: Int,val price: Int,val available: Boolean,val reason: String,val before: IntArray,val after: IntArray) {
    val json get(): String {
        val p=Parts.all[partIndex]
        return "{\"id\":\"${p.id}\",\"name\":\"${p.name}\",\"description\":\"${p.description}\",\"tier\":$tier,\"nextTier\":$nextTier,\"maxTier\":${p.maxTier},\"price\":$price,\"available\":$available,\"reason\":\"$reason\",\"before\":[${before.joinToString(",")}],\"after\":[${after.joinToString(",")}]}"
    }
}
object Garage {
    fun offer(profile: Profile,partIndex: Int,priceScale: Double=1.0): Offer {
        require(partIndex in Parts.all.indices)
        val car=CarCatalog.all[profile.selectedCar];val part=Parts.all[partIndex];val tier=profile.tier(profile.selectedCar,partIndex)
        val old=profile.bonuses();val updated=old.copyOf()
        if(tier<part.maxTier)for(i in updated.indices)updated[i]+=part.bonuses[i]
        val before=IntArray(old.size){car.stat(CarCatalog.statNames[it],old)};val after=IntArray(old.size){car.stat(CarCatalog.statNames[it],updated)}
        val price=part.price(tier+1,priceScale)
        val useful=before.indices.any { part.bonuses[it]>0 && after[it]>before[it] }
        val lock=Career.partLock(profile,partIndex,tier+1)
        val reason=when { tier>=part.maxTier->"Maximum tier";!useful->"At class limit";lock.isNotEmpty()->lock;profile.credits<price->"Earn more credits";else->"Ready to install" }
        return Offer(partIndex,tier,min(tier+1,part.maxTier),price,tier<part.maxTier && useful && lock.isEmpty() && profile.credits>=price,reason,before,after)
    }
    fun buy(profile: Profile,partIndex: Int,expectedTier: Int,priceScale: Double=1.0,expectedCar: Int=profile.selectedCar): String {
        if(profile.selectedCar!=expectedCar)return "Car changed - check the selected car"
        val offer=offer(profile,partIndex,priceScale)
        if(offer.tier!=expectedTier)return "Offer changed - check the installed tier"
        if(!offer.available)return offer.reason
        profile.marketRevision++;profile.credits-=offer.price;profile.tiers[profile.selectedCar*Parts.all.size+partIndex]++
        return "Installed ${Parts.all[partIndex].name} ${offer.nextTier}"
    }
    fun apply(profile: Profile,car: Car,carIndex: Int=profile.selectedCar) {
        CarCatalog.apply(car,carIndex,profile.bonuses(carIndex))
        car.startingCondition=profile.condition[carIndex]/100.0
        car.utilityMask=if(profile.startedRaces>profile.settledRace)profile.raceItems else 0
    }
    fun json(profile: Profile,message: String,saveStatus: String): String {
        val offers=Parts.all.indices.joinToString(",","[","]"){offer(profile,it).json}
        val stats=CarCatalog.all[profile.selectedCar].json(profile.bonuses())
        // Messages are owned fixed strings; profile IDs are restricted at the boundary.
        return "{\"campaign\":${Campaign.json(profile)},\"profile\":\"${profile.id}\",\"credits\":${profile.credits},\"car\":$stats,\"races\":${profile.races},\"wins\":${profile.wins},\"offers\":$offers,\"market\":${Market.json(profile)},\"message\":\"$message\",\"saveStatus\":\"$saveStatus\",\"receipt\":${profile.lastReceipt?.json?:"null"}}"
    }
}
object Economy {
    fun start(profile: Profile): Long {
        check(profile.startedRaces<EconomyRules["profileRaceLimit"].toLong())
        profile.raceItems=0
        var slots=CarLoadouts.forCar(CarCatalog.all[profile.selectedCar]).utilitySlots
        for(i in Consumables.all.indices)if(slots>0 && profile.inventory and (1 shl i)!=0){profile.raceItems=profile.raceItems or (1 shl i);profile.inventory=profile.inventory and (1 shl i).inv();slots--}
        profile.marketRevision++
        return ++profile.startedRaces
    }
    fun settle(profile: Profile,ticket: Long,position: Int,kills: Int,hp: Double,rewardScale: Double=1.0,repairScale: Double=1.0,bonus: Int=0,cash: Int=0,course: String="",targetWrecked: Boolean=false,clean: Boolean=hp>=CombatRules["maxHp"],finished: Boolean=hp>0,league: Boolean=false): Receipt? {
        require(position in 1..Tuning.CAR_COUNT && kills in 0 until Tuning.CAR_COUNT && hp.isFinite() && hp in 0.0..CombatRules["maxHp"])
        require(rewardScale.isFinite() && repairScale.isFinite() && rewardScale>0 && repairScale>=0 && bonus>=0 && cash in 0..MarketRules["raceCashCap"].toInt())
        if(ticket<=profile.settledRace || ticket>profile.startedRaces)return null
        val extra=Market.resultBonus(profile,position,kills,clean,finished,course,targetWrecked)
        val gross=floor((EconomyRules["participationCredits"]+EconomyRules.prizes[position-1]+min(kills,EconomyRules["paidWreckCap"].toInt())*EconomyRules["wreckBountyCredits"])*rewardScale).toInt()+bonus+extra+cash
        val maximum=CombatRules["maxHp"]*CarLoadouts.forCar(CarCatalog.all[profile.selectedCar]).hullScale
        val service=if(profile.manualService)0 else ceil(max(0.0,maximum-hp)*EconomyRules["repairCreditsPerHp"]*repairScale).toInt()
        val paid=min(service,floor(gross*EconomyRules["maxRepairPrizeShare"]).toInt())
        val net=gross-paid
        val debtPaid=min(profile.debt,min(floor(net*MarketRules["repaymentShare"]).toInt(),max(0,net-MarketRules["minimumTakeHome"].toInt())))
        val leaguePaid=if(league)Campaign.payment(profile,net,debtPaid) else 0
        val banked=min(net-debtPaid-leaguePaid,EconomyRules["creditCap"].toInt()-profile.credits)
        profile.debt-=debtPaid;profile.lastDebtPayment=debtPaid;profile.marketRevision++;profile.raceItems=0
        profile.condition[profile.selectedCar]=if(profile.manualService)max(MarketRules["roadworthyPercent"].toInt(),floor(hp/maximum*100).toInt().coerceIn(0,100)) else 100
        profile.credits+=banked;profile.settledRace=ticket;profile.races++;if(position==1)profile.wins++
        return Receipt(ticket,position,kills,gross,paid,service-paid,net,banked,profile.credits).also { profile.lastReceipt=it }
    }
}
