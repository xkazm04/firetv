package dev.deathride.core

/**
 * Sim step cost and golden hash. Run: java -cp <report-classpath> dev.deathride.core.SimBenchKt [rounds] [steps]
 * Six AI cars with real classes/skills/styles, combat on, on a spread of playable courses (branches, junctions, long/short).
 * The printed golden line must be identical before and after any numerically-touching change.
 */
fun main(args: Array<String>) {
    val rounds=args.getOrNull(0)?.toInt()?:5;val steps=args.getOrNull(1)?.toInt()?:6000
    val picks=listOf(0,5,12,19,26,33,37).map { Courses.playable[it] }
    fun make(course: Course,seed: Int): World {
        val w=World(seed,track=Track(course=course),combatEnabled=true)
        for(i in 0 until 6) { val c=w.cars[i];CarCatalog.apply(c,Career.rivals[i%Career.rivals.size].carIndex);c.aiSkill=AiSkills.all.single{it.id=="Pro"};c.aiStyle=Career.rivals[i%Career.rivals.size];c.human=false }
        w.reset();return w
    }
    val inputs=Array(6){InputFrame()}
    var golden=7L
    val best=LongArray(picks.size){Long.MAX_VALUE}
    for(round in 0 until rounds) {
        for((k,course) in picks.withIndex()) {
            val w=make(course,100+k)
            val t=System.nanoTime()
            for(n in 0 until steps) { w.step(inputs);if(w.finished>=5 || w.combat.wreckCount>=5)w.reset() }
            val ns=System.nanoTime()-t
            if(ns<best[k])best[k]=ns
            if(round==0)golden=golden*31+w.stateHash()
        }
    }
    for((k,course) in picks.withIndex())println("%-22s %7.2f us/step (best of $rounds)".format(course.id,best[k]/1000.0/steps))
    println("MEAN %.2f us/step".format(best.sum()/1000.0/steps/picks.size))
    println("GOLDEN $golden")
}
