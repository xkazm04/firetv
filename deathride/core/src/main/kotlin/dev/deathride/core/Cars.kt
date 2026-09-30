package dev.deathride.core

object Physics { val base=Content.table("physics").associate { it.getValue("key") to it.number("value") } }
data class StatMapping(val parameter: String,val stat: String,val base: Double,val perPoint: Double)
class CarClass(val values: Map<String,String>) {
    val id=values.getValue("id")
    val role=values.getValue("role")
    val stats=CarCatalog.statNames.associateWith { values.getValue(it).toInt() }
    fun derive(name: String,bonuses: IntArray?=null): Double {
        val m=CarCatalog.mapping.first { it.parameter==name }
        return m.base+m.perPoint*stat(m.stat,bonuses)
    }
    fun stat(name: String,bonuses: IntArray?=null): Int = (stats.getValue(name)+(bonuses?.get(CarCatalog.statNames.indexOf(name))?:0)).coerceIn(CarCatalog.statMin,if(name=="slots")CarCatalog.slotsMax else CarCatalog.statMax)
    fun spec(bonuses: IntArray?=null): CarSpec {
        fun physical(name: String): Double {
            return derive(name,bonuses)
        }
        val shape=CarShapes.forId(id)
        return CarSpec(circleRadiusM=shape.widthM*.5,circleOffsetM=(shape.lengthM-shape.widthM)*.5,maxSpeedMps=physical("maxSpeedMps"),accelerationMps2=physical("accelerationMps2"),
            lateralGripPerSecond=physical("lateralGripPerSecond"),maxLateralAccelerationMps2=physical("maxLateralAccelerationMps2"),
            massKg=physical("massKg"),steeringRateRadPerSecond=physical("steeringRateRadPerSecond"),yawResponseSeconds=physical("yawResponseSeconds"),brakeMps2=physical("brakeMps2"))
    }
    val armorReduction=derive("armorReduction")
    val weaponSlots=derive("weaponSlots").toInt()
    val json="{\"id\":\"$id\",\"role\":\"$role\",\"stats\":"+stats.entries.joinToString(",","{","}") { "\"${it.key}\":${it.value}" }+"}"
    fun json(bonuses: IntArray)="{\"id\":\"$id\",\"role\":\"$role\",\"stats\":"+CarCatalog.statNames.joinToString(",","{","}") { "\"$it\":${stat(it,bonuses)}" }+"}"
    init { require(stats.values.all { it in CarCatalog.statMin..CarCatalog.statMax }); require(weaponSlots in 1..CarCatalog.slotsMax) }
}
object CarCatalog {
    val statNames=listOf("speed","acceleration","grip","armor","mass","handling","slots","braking")
    private val rules=Content.table("car-rules").associate { it.getValue("key") to it.number("value") }
    val statMin=rules.getValue("statMin").toInt(); val statMax=rules.getValue("statMax").toInt(); val slotsMax=rules.getValue("slotsMax").toInt()
    val aiCruiseFraction=rules.getValue("aiCruiseFraction"); val aiGripFraction=rules.getValue("aiGripFraction")
    val mapping=Content.table("stat-mapping").map { StatMapping(it.getValue("parameter"),it.getValue("stat"),it.number("base"),it.number("perPoint")) }
    val all=Content.table("cars").map { CarClass(Content.table("cars/"+it.getValue("id")).single()) }
    val json=all.joinToString(",","[","]") { it.json }
    fun apply(car: Car,index: Int,bonuses: IntArray?=null) { val type=all[index]; car.carClass=type; car.spec=type.spec(bonuses);car.armorReduction=type.derive("armorReduction",bonuses);car.weaponSlots=type.derive("weaponSlots",bonuses).toInt() }
}
