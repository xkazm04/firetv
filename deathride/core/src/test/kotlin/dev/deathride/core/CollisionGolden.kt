package dev.deathride.core

import java.util.Random

/**
 * Contact-heavy replay: six human-driven cars clustered on one stretch, seeded random inputs, walls, obstacles, weapons.
 * The rolling hash must not change under any bit-identical performance work (see CollisionGoldenTest).
 */
object CollisionGolden {
    fun run(course: Course?,seed: Int,steps: Int=3000): Pair<Long,Int> {
        val w=World(seed,track=if(course==null)Track() else Track(course=course),combatEnabled=true)
        for(i in 0 until 6) { val c=w.cars[i];CarCatalog.apply(c,i%CarCatalog.all.size);c.human=true;c.aiSkill=AiSkills.all.single{it.id=="Pro"};c.aiStyle=Career.rivals[i%Career.rivals.size] }
        w.reset()
        val p=TrackPoint();val random=Random(seed.toLong())
        // Cluster the field: every car within a few metres of the others, headings scrambled.
        for(c in w.cars) { w.track.sample(w.track.startM+random.nextDouble()*14,(random.nextDouble()*2-1)*3,p);c.x=p.x;c.y=p.y;c.heading=p.heading+(random.nextDouble()-.5)*1.2 }
        val inputs=Array(6){InputFrame()};var rolling=1L;var contacts=0
        for(n in 0 until steps) {
            if(n%20==0)for(f in inputs) { f.set(random.nextDouble()*2-1,if(random.nextDouble()<.8)1.0 else 0.0,if(random.nextDouble()<.1)1.0 else 0.0);f.fire=if(random.nextDouble()<.3)1.0 else 0.0;f.weapon=random.nextInt(2) }
            w.step(inputs)
            if(n%25==0)rolling=rolling*31+w.stateHash()
            contacts+=w.cars.count{it.impact>2.0}
        }
        return rolling to contacts
    }
    val scenarios: List<Pair<Course?,Int>> get()=listOf(null to 1,Courses.playable[0] to 2,Courses.playable[12] to 3,Courses.playable[26] to 4,Courses.playable[37] to 5)
}
class CollisionGoldenTest {
    /** Recorded before the heading-trig cache, collide early-out and projection replay; every later change must reproduce them. Hashes re-recorded 2026-10-06 for the Rivet burst/heat model (contact counts unchanged: the fixture fires at random, so Combat state now differs). */
    private val expected=listOf(6177387736479784724L to 682,6271446066024274139L to 949,6685665031148120156L to 781,1482306193252499400L to 623,2501690005341265422L to 731)
    @org.junit.jupiter.api.Test fun contactHeavyReplaysAreBitIdenticalToTheRecordedBaseline() {
        for((k,s) in CollisionGolden.scenarios.withIndex()) org.junit.jupiter.api.Assertions.assertEquals(expected[k],CollisionGolden.run(s.first,s.second),"scenario $k")
    }
}
fun main() {
    for((course,seed) in CollisionGolden.scenarios) { val (hash,contacts)=CollisionGolden.run(course,seed);println("GOLD ${course?.id?:"oval"} seed=$seed hash=$hash contacts=$contacts") }
}
