package dev.deathride.core

object Physics { val base=Content.table("physics").associate { it.getValue("key") to it.number("value") } }
data class StatMapping(val parameter: String,val stat: String,val base: Double,val perPoint: Double)
class CarClass(val values: Map<String,String>) {
    val id=values.getValue("id")
    val role=values.getValue("role")
    val stats=CarCatalog.statNames.associateWith { values.getValue(it).toInt() }
    private fun derive(name: String): Double {
        val m=CarCatalog.mapping.first { it.parameter==name }
        return m.base+m.perPoint*stats.getValue(m.stat)
    }
    fun spec(bonuses: IntArray?=null): CarSpec {
        fun physical(name: String): Double {
            val m=CarCatalog.mapping.first { it.parameter==name }
            val index=CarCatalog.statNames.indexOf(m.stat)
            return m.base+m.perPoint*(stats.getValue(m.stat)+(bonuses?.get(index)?:0)).coerceIn(CarCatalog.statMin,CarCatalog.statMax)
        }
        val shape=CarShapes.forId(id)
        return CarSpec(circleRadiusM=shape.widthM*.5,circleOffsetM=(shape.lengthM-shape.widthM)*.5,maxSpeedMps=physical("maxSpeedMps"),accelerationMps2=physical("accelerationMps2"),
            lateralGripPerSecond=physical("lateralGripPerSecond"),maxLateralAccelerationMps2=physical("maxLateralAccelerationMps2"),
            massKg=physical("massKg"),steeringRateRadPerSecond=physical("steeringRateRadPerSecond"),yawResponseSeconds=physical("yawResponseSeconds"))
    }
    val armorReduction=derive("armorReduction")
    val weaponSlots=derive("weaponSlots").toInt()
    val json="{\"id\":\"$id\",\"role\":\"$role\",\"stats\":"+stats.entries.joinToString(",","{","}") { "\"${it.key}\":${it.value}" }+"}"
    init { require(stats.values.all { it in CarCatalog.statMin..CarCatalog.statMax }); require(weaponSlots in 1..CarCatalog.slotsMax) }
}
object CarCatalog {
    val statNames=listOf("speed","acceleration","grip","armor","mass","handling","slots")
    private val rules=Content.table("car-rules").associate { it.getValue("key") to it.number("value") }
    val statMin=rules.getValue("statMin").toInt(); val statMax=rules.getValue("statMax").toInt(); val slotsMax=rules.getValue("slotsMax").toInt()
    val aiCruiseFraction=rules.getValue("aiCruiseFraction"); val aiGripFraction=rules.getValue("aiGripFraction")
    val mapping=Content.table("stat-mapping").map { StatMapping(it.getValue("parameter"),it.getValue("stat"),it.number("base"),it.number("perPoint")) }
    val all=Content.table("cars").map { CarClass(Content.table("cars/"+it.getValue("id")).single()) }
    val json=all.joinToString(",","[","]") { it.json }
    fun apply(car: Car,index: Int) { val type=all[index]; car.carClass=type; car.spec=type.spec();car.armorReduction=type.armorReduction;car.weaponSlots=type.weaponSlots }
}
