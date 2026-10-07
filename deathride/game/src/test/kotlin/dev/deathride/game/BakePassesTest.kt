package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P13e: the bake's pass plan, without GL. A fake clock advances by each step's cost. */
class BakePassesTest {
    private var clock=0L
    /** A bake of [costsMs.size] steps; each pass returns the step indices it ran. */
    private fun run(plan: BakePasses,costsMs: List<Double>,waitAt: Set<Int> = emptySet()): List<List<Int>> {
        var next=0;val passes=ArrayList<List<Int>>()
        var finished=false
        while(!finished) {
            val ran=ArrayList<Int>()
            finished=plan.pass({clock},{
                if(next==costsMs.size)false
                else { ran+=next;clock+=(costsMs[next]*1e6).toLong();next++;true }
            },{next-1 in waitAt})
            passes+=ran
            check(passes.size<10_000)
        }
        return passes
    }
    /** Today's loop before P13e, verbatim in shape: steps until the deadline, the end, or a bin wait. */
    private fun today(budgetMs: Double,costsMs: List<Double>,waitAt: Set<Int> = emptySet()): List<List<Int>> {
        var next=0;val passes=ArrayList<List<Int>>()
        var ready=false
        while(!ready) {
            val ran=ArrayList<Int>();val deadline=clock+(budgetMs*1e6).toLong();var waiting: Boolean
            do {
                if(next==costsMs.size){ready=true;break}
                ran+=next;clock+=(costsMs[next]*1e6).toLong();next++
                waiting=next-1 in waitAt
            } while(!waiting && clock<deadline)
            passes+=ran
        }
        return passes
    }
    /** Scrap-like bake: 1,400 steps, mostly 0.1-0.4 ms, a few slow kerb steps of 5-35 ms (P13d's cold scrap bake: 552 ms). */
    private val scrap=List(1400){i->when{i%97==0->35.0;i%13==0->5.0;else->.1+(i%4)*.1}}

    @Test fun aLimitedPlanNeverTakesMoreThanItsLimitAndRunsEveryStepOnceInOrder() {
        for(limit in listOf(1,3,6,9)) {
            val passes=run(BakePasses.of(limit,3.0),scrap)
            assertTrue(passes.size<=limit,"limit $limit took ${passes.size} passes")
            assertEquals((0 until scrap.size).toList(),passes.flatten(),"limit $limit")
        }
    }
    @Test fun aBinWaitEndsItsPassAndCostsAtMostOneMore() {
        // The bake waits for the course worker's bins at one point (before the kerbs). That pass ends there, and TrackScene
        // binds nothing on the frames the bake then waits, so the wait costs at most one pass more than the limit.
        for(limit in listOf(3,6,9))for(at in listOf(0,200,1399)) {
            val passes=run(BakePasses.of(limit,3.0),scrap,setOf(at))
            assertTrue(passes.size<=limit+1,"limit $limit wait at $at took ${passes.size}")
            assertEquals((0 until scrap.size).toList(),passes.flatten())
            assertTrue(passes.any{it.last()==at},"a pass ends at the wait")
        }
    }
    @Test fun noLimitIsTodaysSlicing() {
        val waits=setOf(300,301,900)
        clock=0;val planned=run(BakePasses.of(0,3.0),scrap,waits)
        clock=0;val reference=today(3.0,scrap,waits)
        assertEquals(reference,planned)
        assertTrue(planned.size>9)
    }
    @Test fun aLimitedPlanSpreadsItsBudgetOverItsPasses() {
        assertEquals(40.0,BakePasses.of(9,3.0).budgetMs,1e-9)
        assertEquals(3.0,BakePasses.of(0,3.0).budgetMs,1e-9)
        assertEquals(1.5,BakePasses.of(0,1.5).budgetMs,1e-9)
    }
}
