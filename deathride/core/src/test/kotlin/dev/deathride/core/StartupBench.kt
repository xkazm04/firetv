package dev.deathride.core

/** Cold-JVM startup phase timer. Run: java -cp <report-classpath> dev.deathride.core.StartupBenchKt. Order matters: each phase pays only what earlier phases did not already initialise. */
fun main() {
    fun phase(name: String,block: () -> Unit) { val t=System.nanoTime();block();println("%-34s %8.1f ms".format(name,(System.nanoTime()-t)/1e6)) }
    val t0=System.nanoTime()
    phase("Content.table(tracks) parse only") { Content.table("tracks") }
    phase("Surfaces+TrackRules+Rules") { Surfaces.all;TrackRules["samplesPerSpan"];TrackContent.pools }
    phase("ObstacleContent") { ObstacleContent.placements }
    phase("CarCatalog") { CarCatalog.all }
    phase("Courses.all (66)") { Courses.all }
    phase("Courses.playable (38)") { Courses.playable }
    phase("Courses.json") { Courses.json }
    phase("Career") { Career.events }
    phase("Campaign") { Campaign.toString() }
    phase("Script") { Script.toString() }
    phase("AiCatalog+Weapons+Abilities") { AiCatalog.toString();Weapons.toString();AbilityCatalog.toString() }
    phase("Garage+Market") { Garage.toString();Market.toString() }
    phase("World(playable[0])") { World(track=Track(course=Courses.playable[0]),combatEnabled=true) }
    phase("World again") { World(track=Track(course=Courses.playable[1]),combatEnabled=true) }
    println("TOTAL %.1f ms".format((System.nanoTime()-t0)/1e6))
}
