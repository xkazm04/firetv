package dev.deathride.core

import java.io.File
import java.util.stream.IntStream
import kotlin.math.ceil

/**
 * Cooldown/heat balance instrument. Part 1: a held-FIRE duel against a stationary target 16 m away, per weapon (cumulative bullets, time to wreck, first lockout).
 * Part 2: the all-AI balance-scenarios.csv races (Career rivals, same World as the TV) of combat-scenarios.csv (first wreck, wrecks, who killed, ammo left, lockouts). Run before/after changing weapons.csv:
 * `./gradlew :core:weaponCooldownReport -PcooldownSamples=300` writes build/reports/weapon-cooldown/<label>.txt.
 */
fun main(args: Array<String>) {
    val samples=args.firstOrNull()?.toInt()?:300
    val label=args.getOrNull(1)?:"current"
    val out=StringBuilder("label $label samples $samples\n")
    val neutral=Array(Tuning.CAR_COUNT){InputFrame()}
    out.append("== held-FIRE duel at 16 m, target class 1 (cumulative shots at 5/10/20/30 s, wreck time, first lockout) ==\n")
    for(weapon in listOf(Weapons.RIVET,Weapons.HAMMER,Weapons.SCATTER)) {
        val w=World(track=Track(1000.0,200.0,100.0),combatEnabled=true)
        for(c in w.cars){CarCatalog.apply(c,2);c.human=true}
        w.reset();repeat(ceil(CombatRules.startProtectionSeconds/Tuning.STEP_SECONDS).toInt()+1){w.step(neutral)}
        w.combat.reset()
        for(c in w.cars){c.x=-350+c.id*100.0;c.y=200.0;c.heading=0.0}
        w.cars[1].x=w.cars[0].x+(if(weapon==Weapons.SCATTER)8.0 else 16.0)
        val input=Array(Tuning.CAR_COUNT){InputFrame()};input[0].fire=1.0;input[0].weapon=weapon
        val marks=doubleArrayOf(5.0,10.0,20.0,30.0);val shots=IntArray(4);var wreck=-1.0;var lock=-1.0;var t=0.0;var peakHeat=0.0
        val steps=(30.0/Tuning.STEP_SECONDS).toInt()
        for(s in 1..steps) {
            w.combat.step(input,Tuning.STEP_SECONDS);t=s*Tuning.STEP_SECONDS
            if(w.combat.overheated(0,weapon)&&lock<0)lock=t
            peakHeat=maxOf(peakHeat,w.combat.heatFraction(0,weapon))
            if(wreck<0&&w.combat.wrecked(1))wreck=t
            for(m in marks.indices)if(Math.abs(t-marks[m])<Tuning.STEP_SECONDS/2)shots[m]=w.combat.shots[weapon]
        }
        val wp=Weapons.all[weapon]
        out.append("${wp.id}: shots ${shots.joinToString("/")} dmg/s over first 10 s ${"%.2f".format(shots[1]*wp.damage/10)}; wreck ${if(wreck<0)"none" else "%.2f".format(wreck)} s; first lockout ${if(lock<0)"none" else "%.2f".format(lock)} s; peak heat ${"%.2f".format(peakHeat)}; sustained cycle ${"%.2f".format(wp.cooldownSeconds+(wp.burstRounds-1)*wp.burstIntervalSeconds)} s\n")
    }
    out.append("== all-AI balance-scenarios.csv races (Career rivals, same World as the TV) ==\n")
    val input=Array(6){InputFrame()}
    for(scenario in BalanceScenarios.all) {
        val id=scenario.id
        fun make(seed: Int)=scenario.world(seed)
        class R(val firstWreck: Double,val wrecks: Int,val seconds: Double,val rivetDeaths: Int,val deaths: Int,val rivetShots: Int,val scatterShots: Int,val hammerShots: Int,val rivetLeft: Double,val locked: Boolean,val dmg: Double,val oneShots: Int)
        val results=arrayOfNulls<R>(samples)
        IntStream.range(0,samples).parallel().forEach{ index ->
            val w=make(index);var locked=false
            while(w.resolved<6&&w.seconds<TrackRules["maxRaceSeconds"]){w.step(input);for(c in w.cars)if(c.entered)for(k in 0 until Weapons.all.size)if(w.combat.overheated(c.id,k))locked=true}
            var first=-1.0;for(c in w.cars){val ws=w.combat.wreckSeconds[c.id];if(ws>=0&&(first<0||ws<first))first=ws}
            var left=0.0;var n=0;for(c in w.cars)if(c.entered&&!c.human){left+=w.combat.ammo(c.id,0).toDouble()/w.combat.capacity(c.id,0);n++}
            results[index]=R(first,w.combat.wreckCount,w.seconds,w.combat.deaths[DamageKind.RIVET.ordinal],w.combat.deaths.sum(),w.combat.shots[Weapons.RIVET],w.combat.shots[Weapons.SCATTER],w.combat.shots[Weapons.HAMMER],left/n,locked,w.combat.damageByKind[DamageKind.RIVET.ordinal]+w.combat.damageByKind[DamageKind.SCATTER.ordinal],w.combat.oneShotKills)
        }
        val r=results.map{it!!};val fw=r.filter{it.firstWreck>=0}.map{it.firstWreck}
        out.append("$id: first wreck mean ${"%.1f".format(if(fw.isEmpty())-1.0 else fw.average())} s (min ${"%.1f".format(fw.minOrNull()?:-1.0)}); wrecks/race ${"%.2f".format(r.map{it.wrecks}.average())}; resolve ${"%.1f".format(r.map{it.seconds}.average())} s; rivet kill share ${"%.2f".format(r.sumOf{it.rivetDeaths}.toDouble()/r.sumOf{it.deaths}.coerceAtLeast(1))}; rivet shots ${"%.0f".format(r.map{it.rivetShots}.average())} scatter ${"%.1f".format(r.map{it.scatterShots}.average())} hammer ${"%.1f".format(r.map{it.hammerShots}.average())}; gun damage/race ${"%.0f".format(r.map{it.dmg}.average())}; AI rivet ammo left ${"%.2f".format(r.map{it.rivetLeft}.average())}; races with any lockout ${"%.0f".format(100.0*r.count{it.locked}/samples)}%; one-shots ${r.sumOf{it.oneShots}}\n")
    }
    val dir=File("build/reports/weapon-cooldown").apply{mkdirs()}
    File(dir,"$label.txt").writeText(out.toString());print(out)
}
