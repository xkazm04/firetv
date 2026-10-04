package dev.deathride.core

import java.io.File
import java.util.concurrent.Executors
import java.util.zip.GZIPOutputStream
import kotlin.math.*

fun qualityClone(c: Course, nodes: List<TrackNode> = c.nodes, spots: List<TrackSpot> = c.spots,
                 features: List<TrackFeature> = c.features, obstacles: List<ObstaclePlacement> = c.obstaclePlacements) =
    Course(c.id, c.name, c.lesson, c.startFraction, c.theme, nodes, spots, features, obstacles,c.junctions,c.branches)

fun qualityMutantEvidence(): List<Map<String, Any?>> {
    val c = Courses.all.first()
    fun emptyClone(nodes: List<TrackNode> = c.nodes, spots: List<TrackSpot> = c.spots, obstacles: List<ObstaclePlacement> = emptyList()) = qualityClone(c, nodes, spots, emptyList(), obstacles)
    val circle = (0..16).map { i -> val a = (i % 16) * -2 * PI / 16; TrackNode(60 * cos(a), 60 * sin(a), 12.0, Surfaces.asphalt, 0.0) }
    val cross = listOf(-80.0 to 60.0, 80.0 to -60.0, -80.0 to -60.0, 80.0 to 60.0, -80.0 to 60.0).map { (x, y) -> TrackNode(x, y, 12.0, Surfaces.asphalt, 0.0) }
    val solid = ObstacleContent.definitions.values.first { it.effect == ObstacleEffect.SOLID }
    val cases = listOf(
        Triple("narrow road", emptyClone(c.nodes.map { it.copy(width = 2.0) }), "minWidthW"),
        Triple("continuous circle", emptyClone(circle), "straightFraction"),
        Triple("over-gentle scaled course", emptyClone(c.nodes.map { it.copy(x = it.x * 5, y = it.y * 5) }), "straightFraction"),
        Triple("unreachable pickup", emptyClone(spots = c.spots + TrackSpot("repair", .3, 100.0)), "unreachablePickups"),
        Triple("crossing ribbon", emptyClone(cross), "lint:overlap"),
        Triple("solid obstacle in racing line", emptyClone(obstacles = listOf(ObstaclePlacement(solid.id, .4, 0.0, 0.0, 17L))), "lint:obstacle blocks racing line"))
    val result = cases.map { (name, course, expected) ->
        val g = qualityGeometry(course); val gates = TrackQuality.gates(g.values, setOf("geometry", "lap"))
        val errors = TrackLinter.errors(course)
        val fired = if (expected.startsWith("lint:")) errors.any { it.contains(expected.removePrefix("lint:")) } else gates.any { it["metric"] == expected && it["status"] == "flag" }
        mapOf("name" to name, "kind" to "planted course", "expected" to expected, "fired" to fired, "metrics" to g.values, "lint" to errors, "gates" to gates)
    }.toMutableList()
    // Outcomes are deliberately fixtures, not a claim that a planted shape necessarily produces them.
    for (row in TrackQuality.thresholds) {
        val metric = row.getValue("metric"); val scope = row.getValue("scope")
        val evaluated = TrackQuality.gates(mapOf(metric to 0.0), setOf(scope)).single { it["metric"] == metric }
        for (bound in listOf("min", "max")) {
            val value = evaluated[bound] as Double? ?: continue
            val adverse = value + if (bound == "min") -max(1.0, abs(value) * .1) else max(1.0, abs(value) * .1)
            val at = TrackQuality.gates(mapOf(metric to value), setOf(scope)).single { it["metric"] == metric }
            val beyond = TrackQuality.gates(mapOf(metric to adverse), setOf(scope)).single { it["metric"] == metric }
            result += mapOf("name" to "$metric $bound boundary", "kind" to "metric boundary fixture", "expected" to metric,
                "boundary" to value, "adverse" to adverse, "fired" to (at["status"] == "pass" && beyond["status"] == "flag"))
        }
    }
    return result
}

fun qualityRotation(c: Course): Map<String, Any?> {
    val rotated = qualityClone(c, c.nodes.map { it.copy(x = -it.y, y = it.x) })
    val a = qualityGeometry(c).values; val b = qualityGeometry(rotated).values
    val deltas = listOf("lengthM", "minWidthW", "minRadiusL", "straightFraction", "cornerCount", "radiusEntropy").associateWith { abs(a.getValue(it) - b.getValue(it)) }
    val ra = qualityReference(c, c.pool.minTier); val rb = qualityReference(rotated, c.pool.minTier)
    val timeA = ra["flyingLapSeconds"] as Double?; val timeB = rb["flyingLapSeconds"] as Double?
    val delta = if (timeA == null || timeB == null) null else abs(timeA - timeB)
    return mapOf("degrees" to 90, "geometryDeltas" to deltas, "geometryPass" to deltas.values.all { it < 1e-6 },
        "referenceLapDeltaSeconds" to delta, "simulationToleranceSeconds" to TrackQuality["rotationToleranceSeconds"],
        "simulationStatus" to if (delta == null) "unmeasured-timeout" else if (delta <= TrackQuality["rotationToleranceSeconds"]) "within-tolerance" else "investigate",
        "basis" to "World-axis rotation of same shape; stochastic/contact simulation is not asserted bitwise invariant")
}

fun main(args: Array<String>) {
    val seedCount = args.firstOrNull()?.toInt() ?: TrackQuality["seeds"].toInt(); require(seedCount in 1..1000)
    val out = File(args.getOrNull(1) ?: File(TrackQuality.root, "tracks/atlas").path).apply { mkdirs() }
    require(!out.canonicalPath.startsWith(File(TrackQuality.root, "core/src/main/resources").canonicalPath))
    val pool = Executors.newFixedThreadPool(4)
    val report = mutableListOf<Map<String, Any?>>()
    val raw = GZIPOutputStream(File(out, "trials.ndjson.gz").outputStream()).bufferedWriter()
    val proof = qualityMutantEvidence(); check(proof.all { it["fired"] == true }) { "A track quality gate did not fire: ${proof.filter { it["fired"] != true }}" }
    try {
        val cases = Courses.all.map { it to false } + (Courses.all.single { it.id == "crown" } to true)
        for ((course, arena) in cases) {
            val id = if (arena) "crown-arena" else course.id; val geometry = qualityGeometry(course)
            val futures = (0 until seedCount).flatMap { n -> (0 until TrackQuality["rotations"].toInt()).map { rotation ->
                val seed = TrackQuality["seedBase"].toInt() + n * TrackQuality["seedStride"].toInt()
                pool.submit<QualityTrial> { qualityTrial(course, seed, rotation, arena) }
            } }
            val trials = futures.map { it.get() }
            val replay = qualityTrial(course, trials.first().seed, trials.first().rotation, arena)
            val deterministic = replay.hash == trials.first().hash && replay.trajectoryHash == trials.first().trajectoryHash
            check(deterministic) { "Repeated trial diverged for $id" }
            val aggregate = qualityAggregate(trials)
            val rotation = qualityRotation(course); check(rotation["geometryPass"] == true)
            val refs = (0..4).map { tier -> qualityReference(course, tier) }
            val row = mapOf("id" to id, "courseId" to course.id, "name" to if (arena) "Crown — finale arena view" else course.name, "arena" to arena,
                "course" to qualityCourseData(course), "contentDigest" to TrackQuality.digest(TrackQuality.json(qualityCourseData(course))),
                "geometry" to geometry.detail, "geometryGates" to TrackQuality.gates(geometry.values, if (arena) setOf("geometry") else setOf("geometry", "lap")),
                "referenceLaps" to refs, "simulation" to aggregate, "deterministicReplay" to deterministic, "worldRotation" to rotation,
                "events" to Career.events.filter { it.courseIndex == Courses.all.indexOf(course) }.map { event ->
                    mapOf("id" to event.id, "laps" to event.laps, "tier" to event.cupIndex, "phase" to event.phase, "type" to event.type.name,
                        "durationStatus" to "Campaign duration not measured by this three-lap instrument; rerun campaign pacing after AI merge") })
            report += row
            for (trial in trials) raw.appendLine(TrackQuality.json(mapOf("id" to id, "version" to TrackQuality.VERSION, "trial" to trial.data(true))))
            raw.flush()
            println("$id: ${trials.size} AI-only six-car trials; ${aggregate["wrecks"]} wrecks; replay $deterministic")
        }
    } finally { raw.close(); pool.shutdownNow() }
    val resourceRoot = File(TrackQuality.root, "core/src/main/resources/data")
    val contentHash = TrackQuality.digest(resourceRoot.walkTopDown().filter { it.isFile }.sortedBy { it.relativeTo(resourceRoot).invariantSeparatorsPath }
        .joinToString("\n") { it.relativeTo(resourceRoot).invariantSeparatorsPath + ":" + TrackQuality.digest(it.readText()) })
    val result = mapOf("version" to TrackQuality.VERSION, "generatedDate" to java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString(), "gameplayContentDigest" to contentHash,
        "rules" to TrackQuality.rules, "thresholds" to TrackQuality.thresholds, "seedCount" to seedCount, "rotations" to TrackQuality["rotations"],
        "truth" to "Measured geometry and AI-only simulation; thresholds authored; owner feel unmeasured; hunter intent unavailable in this branch",
        "basis" to mapOf("cars" to 6, "human" to false, "stock" to true, "skill" to "Pro", "laps" to TrackQuality["raceLaps"],
            "arena" to "Crown geometry; six-car elimination stress view with the core's elimination rig; not the campaign boss setup",
            "heat" to "48 equal arc sections; 9 lateral bins; active cars at 10 Hz; rates divide by observed exposure; empty bins are null",
            "pressureColumns" to listOf("seconds", "slot0HealthFraction", "slot0CumulativeDamageTaken", "contactEpisodes", "wreckCount")),
        "gateProof" to proof, "courses" to report)
    val json = TrackQuality.json(result)
    File(out, "data.json").writeText(json + "\n")
    File(out, "data.js").writeText("window.TRACK_ATLAS = $json;\n")
    File(out, "gate-proof.json").writeText(TrackQuality.json(proof) + "\n")
    println("Track atlas data: ${report.size} views; ${seedCount * 6 * report.size} trials; ${proof.size} gate witnesses. ${out.absolutePath}")
}
