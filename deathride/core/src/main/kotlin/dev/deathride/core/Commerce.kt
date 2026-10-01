package dev.deathride.core

import kotlin.math.*

object MarketRules {
    private val values=Content.table("market").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=values.getValue(key)
}
class Consumable(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name");val price=row.number("price").toInt()
    val duration=row.number("durationSeconds");val magnitude=row.number("magnitude");val description=row.getValue("description")
    init { require(price>0 && duration>=0 && magnitude>0) }
}
object Consumables {
    const val SPIKES=0;const val TURBO=1;const val FUEL=2;const val SABOTAGE=3
    val all=Content.table("consumables").map{Consumable(it)}
    private val rules=Content.table("utility-rules").associate{it.getValue("key") to it.number("value")}
    val triggerThrottle=rules.getValue("triggerThrottle");val turboMinimumSpeedMps=rules.getValue("turboMinimumSpeedMps")
    init { require(all.map{it.id}==listOf("spikes","turbo","fuel","sabotage")) }
}
data class CarLoadout(val hullScale: Double,val utilitySlots: Int)
object CarLoadouts {
    val all=Content.table("car-loadouts").associate{it.getValue("id") to CarLoadout(it.number("hullScale"),it.number("utilitySlots").toInt())}
    init { require(all.values.all{it.hullScale in .5..1.0 && it.utilitySlots in 1..3}) }
    fun forCar(car: CarClass)=all.getValue(car.id)
}
object Encounters {
    val damage=Content.table("encounters").associate{it.getValue("id") to it.number("damageScale")}
    fun apply(world: World,id: String) { world.damageScale=damage.getValue(id) }
}
data class Contract(val id: String,val name: String,val kind: String,val course: String,val reward: Int,val description: String)
object Contracts {
    val all=Content.table("contracts").map{Contract(it.getValue("id"),it.getValue("name"),it.getValue("kind"),it.getValue("course"),it.number("reward").toInt(),it.getValue("description"))}
    init { require(all.all{it.kind in setOf("deliver","target","clean") && it.reward>0}) }
}
/** Menu transactions. Call on a profile copy, persist it, then publish. Never from World.step. */
object Market {
    fun tradeValue(p: Profile,car: Int=p.selectedCar): Int {
        if(!p.owned[car])return 0
        val parts=Parts.all.indices.sumOf{i->(1..p.tier(car,i)).sumOf{Parts.all[i].price(it)}}
        return floor(CarCatalog.all[car].priceCredits*MarketRules["tradeCarShare"]+parts*MarketRules["tradePartShare"]).toInt()
    }
    fun transact(p: Profile,action: String,id: String,expectedRevision: Long): String {
        if(expectedRevision!=p.marketRevision)return "Offer changed - refresh the garage"
        val result=when(action) {
            "buy","trade" -> {
                val car=CarCatalog.all.indexOfFirst{it.id==id}
                if(car<0)return "Unknown car"
                if(p.owned[car])return "Car already owned"
                if(!Career.unlocked(p,"car",id))return "Clear more career events"
                if(action=="trade" && !p.owned[p.selectedCar])return "Select an owned car to trade"
                val resale=if(action=="trade")tradeValue(p) else 0
                val price=CarCatalog.all[car].priceCredits
                if(p.credits+resale<price)return "Earn more credits"
                if(action=="trade"){p.owned[p.selectedCar]=false;for(part in Parts.all.indices)p.tiers[p.selectedCar*Parts.all.size+part]=0;p.condition[p.selectedCar]=100}
                p.credits=(p.credits+resale-price).coerceAtMost(EconomyRules["creditCap"].toInt());p.owned[car]=true;p.selectedCar=car
                "Purchased ${CarCatalog.all[car].id}"
            }
            "item" -> {
                val item=Consumables.all.indexOfFirst{it.id==id};if(item<0)return "Unknown item"
                val bit=1 shl item;if(p.inventory and bit!=0)return "Item already packed"
                if(Integer.bitCount(p.inventory)>=CarLoadouts.forCar(CarCatalog.all[p.selectedCar]).utilitySlots)return "Utility slots full"
                if(p.credits<Consumables.all[item].price)return "Earn more credits"
                p.credits-=Consumables.all[item].price;p.inventory=p.inventory or bit;"Packed ${Consumables.all[item].name}"
            }
            "loan" -> {
                val principal=MarketRules["loanPrincipal"].toInt();val owed=principal+ceil(principal*MarketRules["loanFeeShare"]).toInt()
                if(p.debt+owed>MarketRules["debtCap"] || p.credits+principal>EconomyRules["creditCap"])return "Loan limit reached"
                p.debt+=owed;p.credits+=principal;"Loan received - fixed fee and bounded repayment"
            }
            "repay" -> {
                val paid=min(p.debt,p.credits);if(paid==0)return "Nothing to repay"
                p.credits-=paid;p.debt-=paid;"Debt repaid by $paid CR"
            }
            "repair" -> {
                val points=min(MarketRules["repairStepPercent"].toInt(),100-p.condition[p.selectedCar]);if(points<=0)return "Hull already repaired"
                val price=ceil(points*MarketRules["repairPricePerPercent"]).toInt();if(p.credits<price)return "Earn more credits"
                p.credits-=price;p.condition[p.selectedCar]+=points;"Repaired $points percent"
            }
            "service" -> { if(id !in setOf("auto","manual"))return "Unknown service mode";p.manualService=id=="manual";"Pit service: $id" }
            "contract" -> {
                val contract=Contracts.all.indexOfFirst{it.id==id};if(contract<0)return "Unknown contract"
                if(p.contract>=0)return "A contract is already active"
                p.contract=contract;"Accepted ${Contracts.all[contract].name}"
            }
            else -> return "Unknown market action"
        }
        p.marketRevision++;return result
    }
    fun resultBonus(p: Profile,position: Int,kills: Int,clean: Boolean,finished: Boolean,course: String,targetWrecked: Boolean): Int {
        p.winStreak=if(position==1)p.winStreak+1 else 0
        var bonus=(if(clean && finished)MarketRules["cleanBonus"].toInt() else 0)+min(p.winStreak,MarketRules["streakCap"].toInt())*MarketRules["streakBonus"].toInt()
        if(kills==Tuning.CAR_COUNT-1)bonus+=MarketRules["destructionBonus"].toInt()
        if(p.contract>=0) {
            val c=Contracts.all[p.contract]
            val success=(c.course=="any" || c.course==course) && when(c.kind){"deliver"->finished;"target"->targetWrecked;else->clean && finished && position==1}
            if(success){bonus+=c.reward;p.contractWins++;p.contract=-1;if(p.withRivals)p.grudges[Career.rivals.indexOfFirst{it.id==if(c.kind=="target")"rook" else "relay"}]=if(c.kind=="target")1 else -1}
        }
        p.lastBonus=bonus;return bonus
    }
    fun json(p: Profile): String {
        val cars=CarCatalog.all.mapIndexed{i,c->"{\"id\":\"${c.id}\",\"owned\":${p.owned[i]},\"price\":${c.priceCredits},\"unlocked\":${Career.unlocked(p,"car",c.id)},\"powerRating\":${PowerRating.of(c,p.bonuses(i))}}"}.joinToString(",","[","]")
        val items=Consumables.all.mapIndexed{i,c->"{\"id\":\"${c.id}\",\"name\":\"${c.name}\",\"price\":${c.price},\"packed\":${p.inventory and (1 shl i)!=0},\"description\":\"${c.description}\"}"}.joinToString(",","[","]")
        val contracts=Contracts.all.mapIndexed{i,c->"{\"id\":\"${c.id}\",\"name\":\"${c.name}\",\"description\":\"${c.description}\",\"reward\":${c.reward},\"active\":${p.contract==i}}"}.joinToString(",","[","]")
        return "{\"revision\":${p.marketRevision},\"loanPrincipal\":${MarketRules["loanPrincipal"].toInt()},\"loanTotal\":${MarketRules["loanPrincipal"].toInt()+ceil(MarketRules["loanPrincipal"]*MarketRules["loanFeeShare"]).toInt()},\"repairStep\":${MarketRules["repairStepPercent"].toInt()},\"debt\":${p.debt},\"debtPaid\":${p.lastDebtPayment},\"bonus\":${p.lastBonus},\"tradeValue\":${tradeValue(p)},\"condition\":${p.condition[p.selectedCar]},\"manualService\":${p.manualService},\"utilitySlots\":${CarLoadouts.forCar(CarCatalog.all[p.selectedCar]).utilitySlots},\"cars\":$cars,\"items\":$items,\"contracts\":$contracts}"
    }
}
