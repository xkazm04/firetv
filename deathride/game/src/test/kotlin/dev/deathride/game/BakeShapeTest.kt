package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P13e: the shipped bake shape, its ground bands and its passes, without GL. A fake clock advances by each step's cost. */
class BakeShapeTest {
    private var clock=0L
    private class Step(val id: Int,val ms: Double,val endsPass: Boolean=false)
    /** Runs a bake of [steps] through [plan], ending a pass after a step that asks to (as TrackScene's ground bands do).
     * Returns the step ids of each pass. */
    private fun run(plan: BakePasses,steps: List<Step>): List<List<Int>> {
        var next=0;var endPass=false;val passes=ArrayList<List<Int>>();var finished=false
        while(!finished) {
            val ran=ArrayList<Int>();endPass=false
            finished=plan.pass({clock},{
                if(next==steps.size)false
                else { val s=steps[next++];ran+=s.id;clock+=(s.ms*1e6).toLong();if(s.endsPass)endPass=true;true }
            },{endPass})
            passes+=ran
        }
        return passes
    }
    /** The bake's step order: a clear, the ground, then 1,200 steps of everything else (some slow kerb steps). */
    private fun bake(bands: Int): List<Step> {
        val steps=ArrayList<Step>();var id=0
        steps+=Step(id++,.2) // clear
        if(bands<=1)steps+=Step(id++,.3) else repeat(bands){steps+=Step(id++,.3,endsPass=true)}
        repeat(1200){i->steps+=Step(id++,if(i%97==0)20.0 else .1+(i%4)*.1)}
        return steps
    }

    @Test fun theShippedShapeIs16FinishedBandsAndNoPassInTheSwitchFrame() {
        val s=BakeShape.SHIPPED
        assertEquals(16,s.groundBands);assertEquals(BakeShape.SYNC_FINISH,s.bandSync);assertTrue(s.skipCreationFrame)
        assertEquals(0,s.passLimit);assertFalse(s.finishSlices)
        assertEquals(BakeShape(1,BakeShape.SYNC_NONE,false),BakeShape.UNBANDED)
    }
    @Test fun theBandsCoverTheTargetOnceInRowOrder() {
        for(bands in listOf(1,4,8,16,3,7))for(size in listOf(2048,1000,17)) {
            val rows=BakeShape.rows(size,bands)
            assertEquals(bands,rows.size);assertEquals(0,rows.first().first);assertEquals(size,rows.last().second)
            for(i in 1 until rows.size)assertEquals(rows[i-1].second,rows[i].first,"contiguous")
            assertTrue(rows.all{it.second>it.first},"no empty band")
        }
        assertEquals(List(16){it*128 to (it+1)*128},BakeShape.rows(2048,16))
    }
    @Test fun eachBandGetsItsOwnPassAndEveryStepRunsOnceInTheSameOrder() {
        val budget=3.0
        clock=0;val unbanded=run(BakePasses.of(0,budget),bake(1))
        clock=0;val banded=run(BakePasses.of(0,budget),bake(16))
        // The first 16 passes each end with one band: the clear rides with the first.
        assertEquals(listOf(0,1),banded[0])
        for(b in 1 until 16)assertEquals(listOf(b+1),banded[b])
        // Steps run once each, in order, in both shapes.
        assertEquals((0 until bake(16).size).toList(),banded.flatten())
        assertEquals((0 until bake(1).size).toList(),unbanded.flatten())
        // After the bands the bake is today's budget slicing of the steps left.
        val rest=bake(16).drop(17);clock=0
        assertEquals(run(BakePasses.of(0,budget),rest),banded.drop(16))
        assertTrue(banded.size in unbanded.size+14..unbanded.size+16,"${banded.size} vs ${unbanded.size}")
    }
    @Test fun everyArmHasAShapeAndThePreP13eArmsRunTheUnbandedBake() {
        for(arm in SwitchArm.entries)assertNotNull(SwitchArm.shape(arm))
        assertEquals(BakeShape.SHIPPED,SwitchArm.shape(SwitchArm.OFF));assertEquals(BakeShape.SHIPPED,SwitchArm.shape(SwitchArm.parse("bands16")))
        assertEquals(BakeShape.UNBANDED,SwitchArm.shape(SwitchArm.parse("unbanded")))
        for(id in listOf("delay","skip","early","reuse","holdbake","flush","flushbound","halfslice","noclear"))
            assertEquals(BakeShape.UNBANDED,SwitchArm.shape(SwitchArm.parse(id)),id)
        assertEquals(9,SwitchArm.shape(SwitchArm.parse("passes9")).passLimit);assertEquals(3,SwitchArm.shape(SwitchArm.parse("passes3")).passLimit)
        assertTrue(SwitchArm.shape(SwitchArm.parse("finish")).finishSlices)
        assertEquals(8,SwitchArm.shape(SwitchArm.parse("bands8")).groundBands);assertEquals(BakeShape.SYNC_FLUSH,SwitchArm.shape(SwitchArm.parse("bands8flush")).bandSync)
        assertEquals(-1,SwitchArm.shape(SwitchArm.parse("noground")).groundBands)
        assertThrows(IllegalArgumentException::class.java){SwitchArm.parse("bands12")}
    }
}
