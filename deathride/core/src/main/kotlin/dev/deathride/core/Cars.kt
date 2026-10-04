package dev.deathride.core

object Physics { val base=Content.table("physics").associate { it.getValue("key") to it.number("value") } }
data class StatMapping(val parameter: String,val stat: String,val base: Double,val perPoint: Double)
class CarClass(val values: Map<String,String>) {
    val id=values.getValue("id")
    val ability=AbilityCatalog.byCar.getValue(id)
    val role=values.getValue("role")
    val tier=values.getValue("tier")
    val ammoScale=values.getValue("ammoScale").toDouble()
    val tierRank=RosterRules.tiers.getValue(tier).first
    val priceCredits get()=kotlin.math.ceil(RosterRules.tiers.getValue(tier).second+stats.entries.sumOf { it.value*RosterRules.value.getValue(it.key) }).toInt()
    val stats=CarCatalog.statNames.associateWith { values.getValue(it).toDouble() }
    val upgradeLimits=CarCatalog.upgradeLimits.getValue(id)
    private val upgradeLimitsJson=upgradeLimits.entries.joinToString(",","{","}"){"\"${it.key}\":${it.value}"}
    fun derive(name: String,bonuses: IntArray?=null): Double {
        val m=CarCatalog.mapping.first { it.parameter==name }
        return m.base+m.perPoint*stat(m.stat,bonuses)
    }
    fun stat(name: String,bonuses: IntArray?=null): Double = (stats.getValue(name).toDouble()+(bonuses?.get(CarCatalog.statNames.indexOf(name))?:0)).coerceIn(CarCatalog.statMin.toDouble(),upgradeLimits.getValue(name))
    fun spec(bonuses: IntArray?=null): CarSpec {
        fun physical(name: String): Double {
            return derive(name,bonuses)
        }
        val shape=CarShapes.forId(id)
        return CarSpec(circleRadiusM=shape.widthM*.5,circleOffsetM=(shape.lengthM-shape.widthM)*.5,maxSpeedMps=physical("maxSpeedMps"),accelerationMps2=physical("accelerationMps2"),
            lateralGripPerSecond=physical("lateralGripPerSecond"),maxLateralAccelerationMps2=physical("maxLateralAccelerationMps2"),
            massKg=physical("massKg"),steeringRateRadPerSecond=physical("steeringRateRadPerSecond"),yawResponseSeconds=physical("yawResponseSeconds"),brakeMps2=physical("brakeMps2"),driftGeometry=DriftGeometry.forClass(id))
    }
    val armorReduction=derive("armorReduction")
    val weaponSlots=derive("weaponSlots").toInt()
    val json get()="{\"id\":\"$id\",\"role\":\"$role\",\"ability\":${ability.json},\"tier\":\"$tier\",\"priceCredits\":$priceCredits,\"ammoScale\":$ammoScale,\"powerRating\":${PowerRating.of(this)},\"weakStats\":${PowerRating.weakStatsJson(this)},\"upgradeLimits\":$upgradeLimitsJson,\"stats\":"+stats.entries.joinToString(",","{","}") { "\"${it.key}\":${it.value}" }+"}"
    fun json(bonuses: IntArray)="{\"id\":\"$id\",\"role\":\"$role\",\"ability\":${ability.json},\"tier\":\"$tier\",\"priceCredits\":$priceCredits,\"ammoScale\":$ammoScale,\"powerRating\":${PowerRating.of(this,bonuses)},\"weakStats\":${PowerRating.weakStatsJson(this,bonuses)},\"upgradeLimits\":$upgradeLimitsJson,\"stats\":"+CarCatalog.statNames.joinToString(",","{","}") { "\"$it\":${stat(it,bonuses)}" }+"}"
    init { require(ammoScale.isFinite() && ammoScale in 0.5..2.0); require(stats.values.all { it.isFinite() && it>=CarCatalog.statMin && it<=CarCatalog.statMax }); require(weaponSlots in 1..CarCatalog.slotsMax)
        require(upgradeLimits.all{(stat,cap)->cap.isFinite() && cap>=stats.getValue(stat) && cap<=if(stat=="slots")CarCatalog.slotsMax else CarCatalog.statMax})
    }
}
object CarCatalog {
    val statNames=listOf("speed","acceleration","grip","armor","mass","handling","slots","braking")
    private val rules=Content.table("car-rules").associate { it.getValue("key") to it.number("value") }
    val statMin=rules.getValue("statMin").toInt(); val statMax=rules.getValue("statMax").toInt(); val slotsMax=rules.getValue("slotsMax").toInt()
    val aiCruiseFraction=rules.getValue("aiCruiseFraction"); val aiGripFraction=rules.getValue("aiGripFraction")
    val mapping=Content.table("stat-mapping").map { StatMapping(it.getValue("parameter"),it.getValue("stat"),it.number("base"),it.number("perPoint")) }
    val upgradeLimits=Content.table("class-upgrade-caps").associate { row->row.getValue("id") to statNames.associateWith{row.number(it)} }
    val all=Content.table("cars").map { CarClass(Content.table("cars/"+it.getValue("id")).single()+it) }
    init { require(upgradeLimits.keys==all.map{it.id}.toSet()) }
    val json=all.joinToString(",","[","]") { it.json }
    fun apply(car: Car,index: Int,bonuses: IntArray?=null)=apply(car,all[index],bonuses)
    fun apply(car: Car,type: CarClass,bonuses: IntArray?=null) { car.aiBossHealthScale=1.0;for(i in statNames.indices)car.effectiveStats[i]=type.stat(statNames[i],bonuses);car.carClass=type; car.ability.definition=type.ability;car.spec=type.spec(bonuses);car.maxHp=CombatRules["maxHp"]*CarLoadouts.forCar(type).hullScale;car.startingCondition=1.0;car.utilityMask=0;car.armorReduction=type.derive("armorReduction",bonuses);car.weaponSlots=type.derive("weaponSlots",bonuses).toInt() }
}

/** Load-time audit data; deliberately never consulted by the fixed simulation step. */
object RosterRules {
    val tiers=Content.table("roster-tiers").associate { it.getValue("id") to (it.number("rank").toInt() to it.number("baseCredits").toInt()) }
    val value=Content.table("roster-value").associate { it.getValue("stat") to it.number("creditsPerPoint").toInt() }
    private val rules=Content.table("roster-rules").associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String)=rules.getValue(key)
    fun peerFindings(car: CarClass,catalog: List<CarClass> = CarCatalog.all): List<String> {
        val peers=catalog.filter { it.id!=car.id && it.tier==car.tier }
        if(peers.size<get("minimumPeers"))return listOf("${car.id}: not enough peers to judge")
        return CarCatalog.statNames.mapNotNull { stat ->
            val mean=peers.map { it.stats.getValue(stat) }.average()
            val ratio=car.stats.getValue(stat)/mean
            if(ratio<=get("peerLowRatio") || ratio>=get("peerHighRatio"))"${car.id}: verify $stat ratio $ratio against ${peers.size} ${car.tier} peers" else null
        }
    }
}
