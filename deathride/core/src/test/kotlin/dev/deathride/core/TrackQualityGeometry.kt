package dev.deathride.core

import java.io.File
import java.security.MessageDigest
import kotlin.math.*

/** Tool-only code: the game never reads the research thresholds or pays for these allocations. */
object TrackQuality {
    const val VERSION = "tracks-t1-v1"
    val root: File = generateSequence(File(System.getProperty("tracksRoot", ".")).absoluteFile) { it.parentFile }
        .map { if (File(it, "tracks/quality-rules.csv").isFile) it else File(it, "deathride") }
        .first { File(it, "tracks/quality-rules.csv").isFile }
    val rules = csv(File(root, "tracks/quality-rules.csv").readText()).associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String) = rules.getValue(key)
    val widest get() = CarShapes.all.maxOf { it.widthM }
    val longest get() = CarShapes.all.maxOf { it.lengthM }
    val thresholds = csv(File(root, "tracks/quality-thresholds.csv").readText())
    fun csv(text: String): List<Map<String, String>> {
        val lines = text.lineSequence().filter { it.isNotBlank() && !it.startsWith('#') }.toList()
        require(lines.isNotEmpty()) { "Missing CSV header" }
        val keys = lines.first().trim().split(','); require(keys.distinct().size == keys.size)
        return lines.drop(1).map { line ->
            val cells = line.trim().split(','); require(cells.size == keys.size) { "CSV column count: $line" }
            keys.zip(cells).toMap()
        }
    }
    fun digest(text: String) = MessageDigest.getInstance("SHA-256").digest(text.toByteArray()).joinToString("") { "%02x".format(it) }
    fun entropy(counts: Iterable<Double>): Double {
        val values = counts.toList(); val total = values.sum()
        return if (total <= 0) 0.0 else values.filter { it > 0 }.sumOf { val p = it / total; -p * log2(p) }
    }
    fun gates(values: Map<String, Double>, scopes: Set<String>): List<Map<String, Any?>> = thresholds.filter { it.getValue("scope") in scopes }.map { row ->
        val metric = row.getValue("metric"); val v = values[metric]
        // References keep existing physical rules in one authority; malformed bounds fail loudly.
        fun bound(raw: String): Double? = if (raw.isEmpty()) null else if (raw.startsWith("track:")) TrackRules[raw.removePrefix("track:")] else raw.toDouble().also { require(it.isFinite()) }
        val low = bound(row.getValue("min")); val high = bound(row.getValue("max"))
        mapOf("metric" to metric, "value" to v, "min" to low, "max" to high, "unit" to row["unit"], "hypothesis" to row["hypothesis"],
            "status" to if (v == null || !v.isFinite()) "unmeasured" else if ((low == null || v >= low) && (high == null || v <= high)) "pass" else "flag")
    }
    fun json(v: Any?): String = when (v) {
        null -> "null"
        is String -> buildString { append('"'); for (c in v) append(when (c) { '"' -> "\\\""; '\\' -> "\\\\"; '\n' -> "\\n"; '\r' -> "\\r"; '\t' -> "\\t"; '<' -> "\\u003c"; else -> if (c.code < 32) "\\u%04x".format(c.code) else c.toString() }); append('"') }
        is Double -> if (v.isFinite()) v.toString() else "null"
        is Float -> if (v.isFinite()) v.toString() else "null"
        is Number, is Boolean -> v.toString()
        is Map<*, *> -> v.entries.joinToString(",", "{", "}") { json(it.key.toString()) + ":" + json(it.value) }
        is Iterable<*> -> v.joinToString(",", "[", "]") { json(it) }
        is Array<*> -> json(v.toList())
        is DoubleArray -> json(v.toList())
        is IntArray -> json(v.toList())
        is LongArray -> json(v.toList())
        else -> error("Unsupported JSON type ${v.javaClass}")
    }
}

data class QualityRun(val indices: List<Int>, val startM: Double, val lengthM: Double)

/** A cyclic connected-component finder. A run crossing the origin is one run. */
fun qualityRuns(c: Course, label: (Int) -> Int): List<QualityRun> {
    val labels = IntArray(c.count) { label(it) }
    val start = labels.indices.firstOrNull { labels[it] != labels[(it + c.count - 1) % c.count] } ?: 0
    val result = mutableListOf<QualityRun>(); var current = mutableListOf<Int>()
    for (offset in 0 until c.count) {
        val i = (start + offset) % c.count
        if (current.isNotEmpty() && labels[i] != labels[current.last()]) {
            result += QualityRun(current, c.arc[current.first()], current.sumOf { c.arc[it + 1] - c.arc[it] }); current = mutableListOf()
        }
        current += i
    }
    if (current.isNotEmpty()) result += QualityRun(current, c.arc[current.first()], current.sumOf { c.arc[it + 1] - c.arc[it] })
    return result
}

data class QualityGeometry(val values: Map<String, Double>, val detail: Map<String, Any?>)

fun qualityGeometry(c: Course): QualityGeometry {
    val w = TrackQuality.widest; val l = TrackQuality.longest
    val signed = DoubleArray(c.count) { i ->
        val p = (i + c.count - 1) % c.count
        wrapAngle(atan2(c.y[i + 1] - c.y[i], c.x[i + 1] - c.x[i]) - atan2(c.y[p + 1] - c.y[p], c.x[p + 1] - c.x[p]))
    }
    val straight = BooleanArray(c.count) { c.curvature[it] < TrackRules["straightCurvature"] }
    val straightRuns = qualityRuns(c) { if (straight[it]) 1 else 0 }.filter { straight[it.indices.first()] }
    val cornerRuns = qualityRuns(c) { if (straight[it]) 0 else if (signed[it] >= 0) 1 else -1 }
        .filter { !straight[it.indices.first()] && abs(it.indices.sumOf { i -> signed[i] }) * 180 / PI >= TrackQuality["minimumCornerDegrees"] }
    val corners = cornerRuns.map { run ->
        val radius = 1 / run.indices.maxOf { c.curvature[it] } / l
        val angle = run.indices.sumOf { signed[it] } * 180 / PI
        val third = max(1, run.indices.size / 3)
        val entry = run.indices.take(third).map { c.curvature[it] }.average()
        val exit = run.indices.takeLast(third).map { c.curvature[it] }.average()
        val tags = mutableListOf(if (abs(angle) >= TrackQuality["hairpinDegrees"]) "hairpin" else if (abs(angle) < 30) "kink" else if (radius >= TrackQuality["sweeperRadiusL"]) "sweeper" else "corner")
        if (exit > entry * TrackQuality["radiusChangeRatio"]) tags += "decreasing-radius"
        if (entry > exit * TrackQuality["radiusChangeRatio"]) tags += "increasing-radius"
        val peaks = run.indices.indices.filter { n -> n > 0 && n < run.indices.lastIndex && c.curvature[run.indices[n]] > c.curvature[run.indices[n - 1]] && c.curvature[run.indices[n]] >= c.curvature[run.indices[n + 1]] }
        if (peaks.zipWithNext().any { (a, b) -> (a..b).minOf { c.curvature[run.indices[it]] } < min(c.curvature[run.indices[a]], c.curvature[run.indices[b]]) * .75 }) tags += "double-apex-candidate"
        mapOf("start" to run.startM / c.lengthM, "lengthM" to run.lengthM, "angleDegrees" to angle, "radiusL" to radius, "tags" to tags,
            "radiusClass" to if (radius < TrackQuality["tightRadiusL"]) "tight" else if (radius < TrackQuality["sweeperRadiusL"]) "medium" else "broad")
    }
    val histogram = listOf("straight", "broad", "medium", "tight").associateWith { band ->
        (0 until c.count).filter { i -> val radius = if (c.curvature[i] <= 0) Double.POSITIVE_INFINITY else 1 / c.curvature[i] / l
            (if (straight[i]) "straight" else if (radius >= TrackQuality["sweeperRadiusL"]) "broad" else if (radius >= TrackQuality["tightRadiusL"]) "medium" else "tight") == band
        }.sumOf { c.arc[it + 1] - c.arc[it] } / c.lengthM
    }
    val radiusCounts = corners.groupingBy { it["radiusClass"] as String }.eachCount()
    val sequence = corners.map { it["radiusClass"] as String }
    val transitions = if (sequence.isEmpty()) emptyMap() else sequence.indices.groupingBy { sequence[it] + ">" + sequence[(it + 1) % sequence.size] }.eachCount()
    val phrases = mutableListOf<Map<String, Any?>>()
    for (i in cornerRuns.indices) {
        if (cornerRuns.size < 2) break
        val a = cornerRuns[i]; val b = cornerRuns[(i + 1) % cornerRuns.size]
        val gap = c.phase(b.startM - a.startM - a.lengthM)
        val opposite = a.indices.sumOf { signed[it] } * b.indices.sumOf { signed[it] } < 0
        if (gap / l <= if (opposite) 8.0 else TrackQuality["compoundGapL"]) phrases += mapOf("start" to a.startM / c.lengthM,
            "tag" to if (!opposite) "compound-corner-candidate" else if (gap / l <= TrackQuality["chicaneGapL"]) "chicane" else "esses", "gapL" to gap / l)
    }
    val compression = qualityRuns(c) { if (2 * c.width[it] / w < TrackQuality["compressionWidthW"]) 1 else 0 }
        .filter { 2 * c.width[it.indices.first()] / w < TrackQuality["compressionWidthW"] }
    val refSpec = CarCatalog.all.first { it.tierRank == c.pool.minTier }.spec()
    fun targetSpeed(i: Int) = min(refSpec.maxSpeedMps, sqrt(refSpec.maxLateralAccelerationMps2 * c.surfaces[i].gripScale / max(c.curvature[i], 1e-8)))
    val passing = cornerRuns.mapNotNull { run ->
        val approach = c.index(run.startM - TrackQuality["brakingLookbackL"] * l)
        val apex = run.indices.minOf { targetSpeed(it) }; val approachSpeed = targetSpeed(approach)
        val wideLength = TrackQuality["overtakeLengthL"] * l
        val samples = (0..ceil(wideLength).toInt()).map { c.index(run.startM + it) }
        val widthW = samples.minOf { c.width[it] * 2 / w }
        val drop = 1 - apex / approachSpeed
        if (widthW < TrackQuality["overtakeWidthW"] || drop < TrackQuality["brakingDropFraction"]) null
        else mapOf("start" to run.startM / c.lengthM, "lengthM" to wideLength, "widthW" to widthW, "approachMps" to approachSpeed,
            "apexMps" to apex, "speedDropFraction" to drop, "quality" to (widthW / TrackQuality["overtakeWidthW"] * drop),
            "basis" to "Geometry candidate: braking speed budget then sustained width; usage requires simulation")
    }
    val p = TrackPoint(); val q = TrackPoint()
    val pickupDetails = c.spots.filter { it.kind in setOf("ammo", "repair", "cash") }.map { spot ->
        val s = (c.startFraction + spot.fraction) * c.lengthM; c.sample(s, spot.laneM, p)
        val clearance = c.widthAt(s) - Movement.vergeWidthM - abs(spot.laneM) - w / 2
        val blocked = c.obstacles.any { it.definition.effect == ObstacleEffect.SOLID && it.contains(p.x, p.y, w / 2) }
        mapOf("kind" to spot.kind, "fraction" to c.phase(s) / c.lengthM, "laneM" to spot.laneM, "x" to p.x, "y" to p.y,
            "clearanceW" to clearance / w, "reachable" to (clearance >= 0 && !blocked), "surface" to c.surfaceAt(s, spot.laneM).id,
            "gripRatio" to c.surfaceAt(s, spot.laneM).gripScale / Surfaces.asphalt.gripScale,
            "risk" to if (blocked || clearance < 0) "blocked" else if (c.surfaceAt(s, spot.laneM).gripScale < Surfaces.asphalt.gripScale || abs(spot.laneM) > w) "exposed-line" else "central")
    }
    val risks = c.features.filter { it.kind == "shortcut" }.map { f ->
        val start = f.start * c.lengthM; val end = f.end * c.lengthM; val n = max(2, ceil(end - start).toInt())
        var inside = 0.0; c.sample(start, f.laneM, p)
        for (i in 1..n) { c.sample(start + (end - start) * i / n, f.laneM, q); inside += hypot(q.x - p.x, q.y - p.y); p.x = q.x; p.y = q.y }
        mapOf("start" to f.start, "end" to f.end, "laneM" to f.laneM, "savedDistanceM" to (end - start - inside),
            "gripRatio" to f.surface.gripScale / Surfaces.asphalt.gripScale, "warningM" to f.warningM,
            "validTrade" to (inside < end - start && f.surface.gripScale < Surfaces.asphalt.gripScale), "basis" to "Geometric lane saving; no claim of a faster lap")
    }
    val rests = qualityRuns(c) { if (c.curvature[it] < TrackRules["straightCurvature"] && c.surfaces[it].id == "Asphalt" && c.width[it] * 2 / w >= TrackQuality["compressionWidthW"]) 1 else 0 }
        .filter { run -> val i = run.indices.first(); c.curvature[i] < TrackRules["straightCurvature"] && c.surfaces[i].id == "Asphalt" && c.width[i] * 2 / w >= TrackQuality["compressionWidthW"] && run.lengthM / refSpec.maxSpeedMps >= TrackQuality["restMinimumSeconds"] }
    val values = linkedMapOf("lengthM" to c.lengthM, "minWidthW" to c.width.min() * 2 / w, "maxWidthW" to c.width.max() * 2 / w,
        "minRadiusL" to 1 / c.curvature.max() / l, "straightFraction" to straightRuns.sumOf { it.lengthM } / c.lengthM,
        "longestStraightM" to (straightRuns.maxOfOrNull { it.lengthM } ?: 0.0), "cornerCount" to corners.size.toDouble(),
        "radiusEntropy" to TrackQuality.entropy(radiusCounts.values.map { it.toDouble() }), "transitionEntropy" to TrackQuality.entropy(transitions.values.map { it.toDouble() }),
        "overtakeZones" to passing.size.toDouble(), "compressionPoints" to compression.size.toDouble(), "compressionFraction" to compression.sumOf { it.lengthM } / c.lengthM,
        "unreachablePickups" to pickupDetails.count { it["reachable"] == false }.toDouble(), "badRiskLines" to risks.count { it["validTrade"] == false }.toDouble(),
        "restCandidates" to rests.size.toDouble())
    val sectionCount = TrackQuality["sections"].toInt()
    val profile = (0 until sectionCount).map { b -> val s = c.lengthM * (b + .5) / sectionCount; c.sample(s, 0.0, p); val i = c.index(s)
        mapOf("fraction" to s / c.lengthM, "x" to p.x, "y" to p.y, "heading" to p.heading, "widthM" to c.widthAt(s) * 2,
            "curvature" to c.curvature[i], "surface" to c.surfaces[i].id) }
    val tags = (corners.flatMap { it["tags"] as List<*> } + phrases.map { it["tag"] } +
        (if (passing.isNotEmpty()) listOf("wide-overtaking-zone") else emptyList()) + (if (compression.isNotEmpty()) listOf("narrow-gate") else emptyList()) +
        (if (risks.isNotEmpty()) listOf("risk-line") else emptyList()) + (if (c.surfaces.any { it.id != "Asphalt" }) listOf("surface-change") else emptyList())).distinct()
    return QualityGeometry(values, mapOf("metrics" to values, "corners" to corners, "radiusSequence" to sequence, "curvatureHistogram" to histogram,
        "phrases" to phrases, "tags" to tags, "overtakingZones" to passing,
        "compression" to compression.map { mapOf("start" to it.startM / c.lengthM, "lengthM" to it.lengthM, "minWidthW" to it.indices.minOf { i -> c.width[i] * 2 / w }) },
        "surfaceFractions" to c.surfaces.take(c.count).map { it.id }.distinct().associateWith { id -> (0 until c.count).filter { c.surfaces[it].id == id }.sumOf { c.arc[it + 1] - c.arc[it] } / c.lengthM },
        "hazardLoad" to mapOf("oilSpotCount" to c.spots.count { it.kind == "hazard" }, "oilFootprintM2" to c.spots.count { it.kind == "hazard" } * TrackRules["hazardLengthM"] * TrackRules["hazardWidthM"],
            "featureLaneAreaM2" to c.features.sumOf { (it.end - it.start) * c.lengthM * it.widthM }, "basis" to "Summed footprints; not union area or lane blockage"),
        "obstacleLoad" to ObstacleEffect.entries.associate { effect -> effect.name to mapOf("count" to c.obstacles.count { it.definition.effect == effect },
            "footprintM2" to c.obstacles.filter { it.definition.effect == effect }.sumOf { PI * it.definition.rx * it.definition.ry }) },
        "pickups" to pickupDetails, "riskLines" to risks, "restCandidates" to rests.map { mapOf("start" to it.startM / c.lengthM, "lengthM" to it.lengthM, "minimumSeconds" to it.lengthM / refSpec.maxSpeedMps) },
        "profile" to profile, "lint" to TrackLinter.errors(c)))
}

fun qualityCourseData(c: Course): Map<String, Any?> = mapOf("id" to c.id, "name" to c.name, "lesson" to c.lesson, "theme" to c.theme, "startFraction" to c.startFraction,
    "junctions" to c.junctions.map { listOf(it.first,it.second,it.warningM) },
    "branches" to c.branches.map { b -> mapOf("start" to b.start,"end" to b.end,"altStart" to b.altStart,"altEnd" to b.altEnd,"mainLengthM" to (b.end-b.start)*c.lengthM,"branchLengthM" to (b.altEnd-b.altStart)*b.alternative.lengthM,
        "ribbon" to (0..128).map { n -> val s=(b.altStart+(b.altEnd-b.altStart)*n/128)*b.alternative.lengthM;val p=TrackPoint();b.alternative.sample(s,0.0,p);listOf(p.x,p.y,b.alternative.widthAt(s),s) }) },
    "nodes" to c.nodes.map { listOf(it.x, it.y, it.width, it.surface.id, it.lane) }, "spots" to c.spots.map { listOf(it.kind, it.fraction, it.laneM) },
    "features" to c.features.map { listOf(it.kind, it.start, it.end, it.laneM, it.widthM, it.surface.id, it.landmark, it.warningM) },
    "obstacles" to c.obstaclePlacements.map { listOf(it.definition, it.fraction, it.lane, it.heading, it.seed) },
    "bakedObstacles" to c.obstacles.map { mapOf("id" to it.definition.id, "effect" to it.definition.effect.name, "x" to it.x, "y" to it.y, "heading" to it.heading, "rx" to it.definition.rx, "ry" to it.definition.ry) },
    "ribbon" to (0..c.count).map { listOf(c.x[it], c.y[it], c.width[it], c.arc[it]) })
