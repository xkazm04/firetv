package dev.deathride.core

import kotlin.math.abs

/** Shared by catalogs, garage offers and rival purchasing; never calculated in the step. */
object PowerRating {
    private data class Weight(val parameter: String, val origin: Double, val unit: Double, val weight: Double)
    private val weights = Content.table("pr-weights").map {
        Weight(it.getValue("parameter"), it.number("origin"), it.number("unitPerPoint"), it.number("weight"))
    }
    val budgets = Content.table("roster-tiers").associate { it.getValue("id") to it.number("prBudget") }
    init {
        require(weights.isNotEmpty() && weights.map { it.parameter }.distinct().size == weights.size)
        require(weights.all { it.unit != 0.0 && it.weight > 0 && it.weight.isFinite() })
    }
    fun of(car: CarClass, bonuses: IntArray? = null): Double = car.ability.prAdjustment + weights.sumOf {
        (car.derive(it.parameter, bonuses) - it.origin) / it.unit * it.weight
    }
    fun identity(car: CarClass, catalog: List<CarClass> = CarCatalog.all, bonuses: IntArray? = null): Pair<List<String>, List<String>> {
        val band = catalog.filter { it.tier == car.tier }
        val threshold = RosterRules["identityBandPoints"] * RosterRules["identityBands"]
        val deltas = CarCatalog.statNames.associateWith { stat -> car.stat(stat, bonuses) - band.map { it.stat(stat) }.average() }
        return deltas.filterValues { it >= threshold }.keys.toList() to deltas.filterValues { it <= -threshold }.keys.toList()
    }
    fun weakStatsJson(car: CarClass, bonuses: IntArray? = null) = identity(car, bonuses=bonuses).second.joinToString(",", "[", "]") { "\"$it\"" }
    fun errors(catalog: List<CarClass> = CarCatalog.all): List<String> = buildList {
        for (car in catalog) {
            if (abs(of(car) / budgets.getValue(car.tier) - 1) > RosterRules["prTolerance"]) add("${car.id}: PR outside tier budget")
            val (high, low) = identity(car, catalog)
            if (high.isEmpty() || low.isEmpty()) add("${car.id}: missing strength/weakness identity pair")
        }
    }
}
