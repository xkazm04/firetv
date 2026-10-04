package dev.deathride.core

import kotlin.math.*

class QualityHeat {
    val sections = TrackQuality["sections"].toInt()
    val lanes = TrackQuality["lanes"].toInt()
    val exposure = DoubleArray(sections)
    val speedSum = DoubleArray(sections)
    val contacts = IntArray(sections)
    val wrecks = IntArray(sections)
    val spins = IntArray(sections)
    val stuck = IntArray(sections)
    val passes = IntArray(sections)
    val traps = IntArray(sections)
    val damage = DoubleArray(sections)
    val lines = Array(sections) { IntArray(lanes) }
    fun add(other: QualityHeat) {
        for (i in 0 until sections) {
            exposure[i] += other.exposure[i]; speedSum[i] += other.speedSum[i]
            contacts[i] += other.contacts[i]; wrecks[i] += other.wrecks[i]; spins[i] += other.spins[i]
            stuck[i] += other.stuck[i]; passes[i] += other.passes[i]; traps[i] += other.traps[i]; damage[i] += other.damage[i]
            for (j in 0 until lanes) lines[i][j] += other.lines[i][j]
        }
    }
    fun data(): Map<String, Any?> = mapOf("exposureCarSeconds" to exposure,
        "meanSpeedMps" to exposure.indices.map { if (exposure[it] == 0.0) null else speedSum[it] / exposure[it] },
        "contacts" to contacts, "wrecks" to wrecks, "spins" to spins, "stuck" to stuck, "passes" to passes, "trapOpportunities" to traps, "damageHp" to damage,
        "contactsPerCarMinute" to exposure.indices.map { if (exposure[it] == 0.0) null else contacts[it] * 60 / exposure[it] },
        "wrecksPerCarMinute" to exposure.indices.map { if (exposure[it] == 0.0) null else wrecks[it] * 60 / exposure[it] },
        "lineOccupancy" to lines, "lineEntropy" to lines.map { if (it.sum() == 0) null else TrackQuality.entropy(it.map { n -> n.toDouble() }) })
}

data class QualityTrial(val seed: Int, val rotation: Int, val seconds: Double, val stoppingReason: String, val hash: String,
    val trajectoryHash: String, val carLaps: Double, val distanceM: Double, val positionChanges: Int, val overtakes: Int,
    val contactCount: Int, val wreckCount: Int, val spinCount: Int, val stuckCount: Int, val trapCount: Int,
    val firstWreckSeconds: Double?, val leadEarlyWreck: Boolean, val leadFirstLapSeconds: Double?, val finished: Int,
    val assignments: List<Map<String, Any?>>, val results: List<Map<String, Any?>>, val pickupCollections: IntArray,
    val heat: QualityHeat, val pressure: List<List<Number>>, val replay: List<List<Any>>,
    val maxHp: Double, val damageByKind: Map<String, Double>, val deathsByKind: Map<String, Int>, val shotsByWeapon: Map<String, Int>, val solidSolverContacts: Long,
    val hunter: Map<String,Number> = emptyMap(),val configuration: Map<String,Any?> = emptyMap()) {
    fun data(includeHeat: Boolean = false): Map<String, Any?> = linkedMapOf<String, Any?>("seed" to seed, "rotation" to rotation,
        "seconds" to seconds, "stoppingReason" to stoppingReason, "stateHash" to hash, "trajectoryHash" to trajectoryHash,
        "carLaps" to carLaps, "distanceM" to distanceM, "positionChanges" to positionChanges, "overtakes" to overtakes,
        "contacts" to contactCount, "wrecks" to wreckCount, "spins" to spinCount, "stuck" to stuckCount, "trapOpportunities" to trapCount,
        "firstWreckSeconds" to firstWreckSeconds, "leadEarlyWreck" to leadEarlyWreck, "leadFirstLapSeconds" to leadFirstLapSeconds,
        "finished" to finished, "assignments" to assignments, "results" to results, "pickupCollections" to pickupCollections,
        "pressure" to pressure, "replay" to replay, "maxHp" to maxHp, "damageByKind" to damageByKind, "deathsByKind" to deathsByKind,
        "shotsByWeapon" to shotsByWeapon, "solidSolverContacts" to solidSolverContacts,"hunter" to hunter,"configuration" to configuration).also { if (includeHeat) it["heat"] = heat.data() }
}

/** Debounced pair order; rejects launch jitter and order changes caused solely by death or finishing. */
class QualityPassCounter(private val margin: Double, private val hold: Double) {
    private val order = IntArray(36)
    private val candidate = IntArray(36)
    private val held = DoubleArray(36)
    fun observe(a: Int, b: Int, difference: Double, active: Boolean, dt: Double): Boolean {
        val n = a * 6 + b
        if (!active) { order[n] = 0; candidate[n] = 0; held[n] = 0.0; return false }
        val side = if (difference > margin) 1 else if (difference < -margin) -1 else 0
        if (side == 0 || side == order[n]) { candidate[n] = 0; held[n] = 0.0; return false }
        if (order[n] == 0) { order[n] = side; return false }
        if (candidate[n] != side) { candidate[n] = side; held[n] = 0.0 }
        held[n] += dt
        if (held[n] + 1e-9 < hold) return false
        order[n] = side; held[n] = 0.0; candidate[n] = 0
        return true
    }
}

fun qualityWorld(c: Course, seed: Int, rotation: Int, arena: Boolean = false,tier: Int? = null,laps: Int? = null,combatEnabled: Boolean = true): World {
    val w = World(seed, track = Track(course = c), combatEnabled = combatEnabled)
    val eligible = if(tier==null)c.pool.eligible() else CarCatalog.all.indices.filter { CarCatalog.all[it].tierRank==tier }
    for (car in w.cars) {
        val identity = (car.id + rotation) % Tuning.CAR_COUNT
        CarCatalog.apply(car, eligible[(identity + seed.mod(eligible.size)) % eligible.size])
        car.aiSkill = AiSkills.all.single { it.id == "Pro" }
        car.aiStyle = Career.rivals[identity % Career.rivals.size]
        car.human = false
    }
    w.raceLaps = laps?:TrackQuality["raceLaps"].toInt()
    if (arena) w.eventType = EventType.ELIMINATION
    // World.reset applies the actual elimination rig. That fact is included in assignments below.
    w.reset(); w.presentationEvents.enabled = true
    check(w.cars.size == 6 && w.cars.all { it.entered && !it.human })
    return w
}

fun qualityTrial(c: Course, seed: Int, rotation: Int, arena: Boolean = false, captureReplay: Boolean = false,
                 limitSeconds: Double = TrackQuality[if (arena) "arenaLimitSeconds" else "raceLimitSeconds"],tier: Int?=null,laps: Int?=null,combatEnabled: Boolean=true): QualityTrial {
    val w = qualityWorld(c, seed, rotation, arena,tier,laps,combatEnabled); val input = Array(6) { InputFrame() }; val heat = QualityHeat()
    val effectiveLimit=min(limitSeconds,w.raceLimitSeconds)
    val q = Projection(); val active = BooleanArray(6); val lastSpin = IntArray(6); val lowSeconds = DoubleArray(6)
    val stuckNow = BooleanArray(6); val positions = IntArray(6) { it + 1 }; val lastHp = DoubleArray(6) { w.combat.health(it) }
    val lastContact = HashMap<String, Double>(); val passCounter = QualityPassCounter(TrackQuality["passMarginL"] * TrackQuality.longest, TrackQuality["passHoldSeconds"])
    val progressStart = DoubleArray(6) { w.cars[it].lap.progressM }; val carLaps = DoubleArray(6)
    val pickupCollections = IntArray(w.combat.pickups.size); val pressure = mutableListOf<List<Number>>(); val replay = mutableListOf<List<Any>>()
    val firstLaps = arrayOfNulls<Double>(6); val lastAttacked = DoubleArray(6) { -100.0 }
    var distance = 0.0; var changes = 0; var overtakes = 0; var contacts = 0; var spins = 0; var stuck = 0; var traps = 0
    var leadEarly = false; var trapSeconds = 0.0; var trapOn = false; var trajectory = 17L
    val dt = Tuning.STEP_SECONDS; val sampleSteps = TrackQuality["sampleSteps"].toInt(); val sampleDt = sampleSteps * dt
    fun section(x: Double, y: Double): Int { c.project(x, y, q); return (q.s / c.lengthM * heat.sections).toInt().coerceIn(0, heat.sections - 1) }
    val assignments = w.cars.map { mapOf("slot" to it.id, "identity" to (it.id + rotation) % 6, "car" to it.carClass!!.id,
        "tier" to it.carClass!!.tierRank, "style" to it.aiStyle!!.id, "skill" to it.aiSkill!!.id, "human" to it.human) }
    while (w.resolved < w.entrantCount && w.seconds + 1e-9 < effectiveLimit) {
        for (car in w.cars) active[car.id] = !w.combat.wrecked(car.id) && car.finishSeconds < 0
        w.step(input)
        for (car in w.cars) {
            val i = car.id
            if (active[i]) {
                distance += hypot(car.x - car.previousX, car.y - car.previousY)
                carLaps[i] = max(carLaps[i], (car.lap.progressM - progressStart[i]) / c.lengthM)
                changes += abs(car.position - positions[i])
                if (car.lap.laps >= 1 && firstLaps[i] == null) firstLaps[i] = w.seconds
                val section = section(car.x, car.y)
                val newSpins = car.spinEvents - lastSpin[i]; if (newSpins > 0) { spins += newSpins; heat.spins[section] += newSpins }
                lastSpin[i] = car.spinEvents
                lowSeconds[i] = if (w.seconds > TrackQuality["launchGraceSeconds"] && car.speedMps < TrackQuality["stuckSpeedMps"] && !w.combat.wrecked(i)) lowSeconds[i] + dt else 0.0
                if (lowSeconds[i] >= TrackQuality["stuckSeconds"] && !stuckNow[i]) { stuck++; heat.stuck[section]++; stuckNow[i] = true }
                if (lowSeconds[i] == 0.0) stuckNow[i] = false
                val loss = max(0.0, lastHp[i] - w.combat.health(i)); heat.damage[section] += loss
                if (loss > 0) lastAttacked[i] = w.seconds
            }
            positions[i] = car.position; lastHp[i] = w.combat.health(i)
        }
        while (true) {
            val event = w.presentationEvents.poll() ?: break
            val bin = section(event.x, event.y)
            when (event.kind) {
                PresentationKind.CAR_CONTACT, PresentationKind.WALL_CONTACT, PresentationKind.BARRIER_CONTACT -> {
                    val key = "${event.kind}:${event.actor}:${event.target}"
                    // Cooldown is measured from the most recent contact, so a sustained scrape is one episode.
                    val previous = lastContact.put(key, w.seconds) ?: -100.0
                    if ((active[event.actor] || event.target >= 0 && active[event.target]) && w.seconds - previous >= TrackQuality["contactCooldownSeconds"]) { contacts++; heat.contacts[bin]++ }
                    lastAttacked[event.actor] = w.seconds; if (event.target >= 0) lastAttacked[event.target] = w.seconds
                }
                PresentationKind.WRECK -> { heat.wrecks[bin]++; if (event.actor == 0 && firstLaps[0] == null) leadEarly = true }
                PresentationKind.PICKUP -> {
                    val nearest = w.combat.pickups.indices.minByOrNull { val p = w.combat.pickups[it]; hypot(p.x - event.x, p.y - event.y) }
                    if (nearest != null) pickupCollections[nearest]++
                }
                else -> Unit
            }
        }
        check(w.presentationEvents.dropped == 0L) { "Track probe lost events" }
        for (a in 0..4) for (b in a + 1..5) {
            val ca = w.cars[a]; val cb = w.cars[b]
            val bothLive = active[a] && active[b] && !w.combat.wrecked(a) && !w.combat.wrecked(b) && ca.finishSeconds < 0 && cb.finishSeconds < 0
            if (passCounter.observe(a, b, ca.lap.progressM - cb.lap.progressM, bothLive, dt)) {
                overtakes++; val ahead = if (ca.lap.progressM > cb.lap.progressM) ca else cb; heat.passes[section(ahead.x, ahead.y)]++
            }
        }
        if (w.steps % sampleSteps == 0) {
            for (car in w.cars) if (!w.combat.wrecked(car.id) && car.finishSeconds < 0) {
                val b = section(car.x, car.y); val lateral = q.distance
                heat.exposure[b] += sampleDt; heat.speedSum[b] += car.speedMps * sampleDt
                val lane = floor((lateral / c.widthAt(q.s) + 1) * .5 * heat.lanes).toInt().coerceIn(0, heat.lanes - 1); heat.lines[b][lane]++
                trajectory = 31 * trajectory + (q.s * 10).roundToLong(); trajectory = 31 * trajectory + (lateral * 10).roundToLong()
            }
            val leader = w.cars.filter { !w.combat.wrecked(it.id) && it.finishSeconds < 0 }.maxByOrNull { it.lap.progressM }
            var opportunity = false
            if (leader != null && leader.speedMps < leader.spec.maxSpeedMps * TrackQuality["trapSpeedFraction"] && w.seconds - lastAttacked[leader.id] <= 1.0) {
                c.project(leader.x, leader.y, q); val leaderS = q.s; val leaderLane = q.distance
                var ahead = false; var behind = false
                for (other in w.cars) if (other !== leader && !w.combat.wrecked(other.id) && other.finishSeconds < 0) {
                    c.project(other.x, other.y, q); var gap = c.phase(q.s - leaderS); if (gap > c.lengthM / 2) gap -= c.lengthM
                    if (abs(q.distance - leaderLane) < TrackQuality.widest * 2 && abs(gap) < TrackQuality["trapRangeL"] * TrackQuality.longest) {
                        if (gap > 0) ahead = true else behind = true
                    }
                }
                opportunity = ahead && behind
            }
            trapSeconds = if (opportunity) trapSeconds + sampleDt else 0.0
            if (trapSeconds >= TrackQuality["trapHoldSeconds"] && !trapOn && leader != null) { traps++; heat.traps[section(leader.x, leader.y)]++; trapOn = true }
            if (!opportunity) trapOn = false
        }
        if (w.steps % 120 == 0) pressure += listOf(w.seconds, w.combat.health(0) / w.cars[0].maxHp, w.combat.damageTaken[0], contacts, w.combat.wreckCount)
        if (captureReplay && w.steps % 12 == 0) replay += listOf(w.seconds, w.cars.map { listOf(it.x, it.y, it.heading, w.combat.wrecked(it.id), it.position, it.speedMps) })
    }
    val reason = if (w.resolved < w.entrantCount) "right-censored-timeout" else if (w.cars.any { it.finishKind == FinishKind.ELIMINATION }) "elimination" else "all-resolved"
    return QualityTrial(seed, rotation, w.seconds, reason, w.stateHash().toString(), trajectory.toString(), carLaps.sum(), distance, changes, overtakes,
        contacts, w.combat.wreckCount, spins, stuck, traps, w.combat.wreckSeconds.filter { it >= 0 }.minOrNull(), leadEarly, firstLaps[0], w.finished,
        assignments, w.cars.map { mapOf("slot" to it.id, "laps" to it.lap.laps, "finishSeconds" to it.finishSeconds.takeIf { s -> s >= 0 },
            "finishKind" to it.finishKind.name, "wreckSeconds" to w.combat.wreckSeconds[it.id].takeIf { s -> s >= 0 }, "health" to w.combat.health(it.id), "position" to it.position) },
        pickupCollections, heat, pressure, replay, w.cars[0].maxHp, DamageKind.entries.associate { it.name to w.combat.damageByKind[it.ordinal] },
        DamageKind.entries.associate { it.name to w.combat.deaths[it.ordinal] }, Weapons.all.indices.associate { Weapons.all[it].id to w.combat.shots[it] }, w.obstacles.solidContacts,
        mapOf("huntDecisions" to w.ai.huntDecisions,"huntIntentDamage" to w.ai.huntIntentDamage,"hunterRoleDamage" to w.ai.hunterRoleDamage,"leaderDamage" to w.ai.leaderDamage,"maximumAttackers" to w.ai.maximumAttackers),
        mapOf("tier" to tier,"laps" to w.raceLaps,"combat" to combatEnabled,"arena" to arena,"limitSeconds" to effectiveLimit))
}

/** Reference is an actual stock car driven by Pro AI with five non-entered cars and combat off. */
fun qualityReference(c: Course, tier: Int, seed: Int = TrackQuality["seedBase"].toInt(),limitSeconds: Double = TrackQuality["referenceLimitSeconds"]): Map<String, Any?> {
    val index = CarCatalog.all.indices.first { CarCatalog.all[it].tierRank == tier }
    val w = World(seed, track = Track(course = c), combatEnabled = false)
    for (car in w.cars) { car.entered = car.id == 0; car.human = false; CarCatalog.apply(car, index); car.aiSkill = AiSkills.all.single { it.id == "Pro" } }
    w.raceLaps = 2; w.reset(); val input = Array(6) { InputFrame() }; var first: Double? = null
    while (w.cars[0].finishSeconds < 0 && w.seconds < limitSeconds) {
        w.step(input); if (first == null && w.cars[0].lap.laps >= 1) first = w.seconds
    }
    return mapOf("tier" to tier, "car" to CarCatalog.all[index].id, "eligible" to c.pool.allows(CarCatalog.all[index]), "skill" to "Pro", "seed" to seed,
        "standingLapSeconds" to first, "flyingLapSeconds" to if (first != null && w.cars[0].finishSeconds >= 0) w.cars[0].finishSeconds - first else null,
        "timeout" to (w.cars[0].finishSeconds < 0), "stateHash" to w.stateHash().toString())
}

fun qualityWilson(successes: Int, n: Int): List<Double>? {
    if (n == 0) return null
    val z = 1.96; val p = successes.toDouble() / n; val d = 1 + z * z / n
    val center = (p + z * z / (2 * n)) / d; val margin = z * sqrt(p * (1 - p) / n + z * z / (4.0 * n * n)) / d
    return listOf(max(0.0, center - margin), min(1.0, center + margin))
}

fun qualityAggregate(trials: List<QualityTrial>): Map<String, Any?> {
    require(trials.isNotEmpty()); val heat = QualityHeat(); trials.forEach { heat.add(it.heat) }
    val carLaps = trials.sumOf { it.carLaps }; val km = trials.sumOf { it.distanceM } / 1000
    val count = trials.size; val early = trials.count { it.leadEarlyWreck }
    val entropySamples = heat.lines.filter { it.sum() > 0 }.map { TrackQuality.entropy(it.map { n -> n.toDouble() }) }
    val values = mapOf("overtakesPerFieldLap" to trials.sumOf { it.overtakes } / (carLaps / 6).coerceAtLeast(1e-9),
        "positionChangesPerFieldLap" to trials.sumOf { it.positionChanges } / (carLaps / 6).coerceAtLeast(1e-9),
        "contactsPerCarKm" to trials.sumOf { it.contactCount } / km.coerceAtLeast(1e-9), "earlyLeadWreckRate" to early.toDouble() / count,
        "wreckRate" to trials.sumOf { it.wreckCount }.toDouble() / (count * 6), "spinsPerCarLap" to trials.sumOf { it.spinCount } / carLaps.coerceAtLeast(1e-9),
        "stuckPerCarLap" to trials.sumOf { it.stuckCount } / carLaps.coerceAtLeast(1e-9), "lineEntropy" to entropySamples.average(),
        "seedCount" to trials.map { it.seed }.distinct().size.toDouble(), "rotationCount" to trials.map { it.rotation }.distinct().size.toDouble(),
        "distinctTrajectoryFraction" to trials.map { it.trajectoryHash }.distinct().size.toDouble() / count)
    fun distribution(xs: List<Double>): Map<String, Any?> {
        val sorted = xs.sorted()
        fun q(p: Double) = if (sorted.isEmpty()) null else sorted[((sorted.size - 1) * p).roundToInt()]
        return mapOf("n" to xs.size, "p10" to q(.1), "p50" to q(.5), "p90" to q(.9), "min" to sorted.firstOrNull(), "max" to sorted.lastOrNull())
    }
    val seeds = trials.map { it.seed }.distinct().sorted(); val half = seeds.take(seeds.size / 2).toSet()
    val first = trials.filter { it.seed in half }; val second = trials.filter { it.seed !in half }
    fun rate(xs: List<QualityTrial>) = if (xs.isEmpty()) null else xs.count { it.leadEarlyWreck }.toDouble() / xs.size
    val a = rate(first); val b = rate(second)
    val rotationRates = trials.groupBy { it.rotation }.toSortedMap().map { (r, xs) -> mapOf("rotation" to r, "n" to xs.size, "earlyRate" to rate(xs)) }
    val rates = rotationRates.map { it["earlyRate"] as Double }; val spread = rates.max() - rates.min()
    return mapOf("trialCount" to count, "metrics" to values, "heat" to heat.data(), "carLaps" to carLaps, "distanceCarKm" to km,
        "contactEpisodes" to trials.sumOf { it.contactCount }, "overtakes" to trials.sumOf { it.overtakes }, "positionChanges" to trials.sumOf { it.positionChanges },
        "wrecks" to trials.sumOf { it.wreckCount }, "spins" to trials.sumOf { it.spinCount }, "stuck" to trials.sumOf { it.stuckCount }, "trapOpportunities" to trials.sumOf { it.trapCount },
        "earlyLeadWreck" to mapOf("n" to count, "count" to early, "rate" to early.toDouble() / count, "wilson95" to qualityWilson(early, count),
            "basis" to "AI in slot 0; identities rotated; not human feel or human fairness. Trials sharing a seed are correlated; interval is descriptive."),
        "firstWreckSeconds" to distribution(trials.mapNotNull { it.firstWreckSeconds }), "noWreckCensored" to trials.count { it.firstWreckSeconds == null },
        "finishedRaceSeconds" to distribution(trials.filter { it.stoppingReason != "right-censored-timeout" }.map { it.seconds }),
        "carFinishSeconds" to distribution(trials.flatMap { it.results }.mapNotNull { it["finishSeconds"] as Double? }),
        "timeouts" to trials.count { it.stoppingReason == "right-censored-timeout" }, "rotationRates" to rotationRates,
        "rotationCrossCheck" to mapOf("spread" to spread, "tolerance" to TrackQuality["rotationSpreadTolerance"], "status" to if (spread <= TrackQuality["rotationSpreadTolerance"]) "stable-within-authored-tolerance" else "investigate"),
        "seedSplit" to mapOf("firstN" to first.size, "secondN" to second.size, "firstEarlyRate" to a, "secondEarlyRate" to b,
            "difference" to if (a == null || b == null) null else abs(a - b), "tolerance" to TrackQuality["seedSplitTolerance"],
            "status" to if (a == null || b == null) "unmeasured" else if (abs(a - b) <= TrackQuality["seedSplitTolerance"]) "stable-within-authored-tolerance" else "investigate"),
        "damageByKind" to DamageKind.entries.associate { kind -> kind.name to trials.sumOf { it.damageByKind.getValue(kind.name) } },
        "deathsByKind" to DamageKind.entries.associate { kind -> kind.name to trials.sumOf { it.deathsByKind.getValue(kind.name) } },
        "shotsByWeapon" to Weapons.all.associate { weapon -> weapon.id to trials.sumOf { it.shotsByWeapon.getValue(weapon.id) } },
        "solidSolverContacts" to trials.sumOf { it.solidSolverContacts },
        "pickupCollections" to trials.first().pickupCollections.indices.map { i -> trials.sumOf { it.pickupCollections[i] } },
        "gates" to TrackQuality.gates(values, setOf("simulation", "evidence")))
}
