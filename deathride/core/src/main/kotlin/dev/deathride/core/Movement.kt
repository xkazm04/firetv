package dev.deathride.core

class Surface(val id: String,val gripScale: Double,val dragPerSecond: Double) {
    val json="{\"id\":\"$id\",\"gripScale\":$gripScale,\"dragPerSecond\":$dragPerSecond}"
}
object Surfaces {
    val all=Content.table("surfaces").map { Surface(it.getValue("id"),it.number("gripScale"),it.number("dragPerSecond")) }
    val asphalt=all.first { it.id=="Asphalt" }; val kerb=all.first { it.id=="Kerb" }; val offtrack=all.first { it.id=="Offtrack" }
    val practice=all.take(4)
    val json=practice.joinToString(",","[","]") { it.json }
}
object Movement {
    private val values=Content.table("movement").associate { it.getValue("key") to it.number("value") }
    val transferResponseSeconds=values.getValue("transferResponseSeconds")
    val brakeTransfer=values.getValue("brakeTransfer")
    val throttleTransfer=values.getValue("throttleTransfer")
    val transferGripGain=values.getValue("transferGripGain")
    val throttleUndersteer=values.getValue("throttleUndersteer")
    val handbrakeGripLoss=values.getValue("handbrakeGripLoss")
    val handbrakeYawGain=values.getValue("handbrakeYawGain")
    val handbrakeDragPerSecond=values.getValue("handbrakeDragPerSecond")
    val driftEnterRadians=values.getValue("driftEnterRadians")
    val driftExitRadians=values.getValue("driftExitRadians")
    val driftMinSpeedMps=values.getValue("driftMinSpeedMps")
    val kerbWidthM=values.getValue("kerbWidthM")
    val vergeWidthM=values.getValue("vergeWidthM")
    val wallTangentLoss=values.getValue("wallTangentLoss")
    val collisionSpinScale=values.getValue("collisionSpinScale")
    val maxCollisionYawRadPerSecond=values.getValue("maxCollisionYawRadPerSecond")
    val ramMinClosingMps=values.getValue("ramMinClosingMps")
    val aiSurfaceMargin=values.getValue("aiSurfaceMargin")
}
