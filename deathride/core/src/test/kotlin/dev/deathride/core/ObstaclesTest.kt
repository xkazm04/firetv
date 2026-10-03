package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import kotlin.math.*

class ObstaclesTest {
    @Test fun retainedStressSeedsDoNotLeaveSurvivorsStuck() {
        val cases=listOf(arrayOf("ridge",1,3,1844695842),arrayOf("frostline",2,1,512592814),arrayOf("summit",0,3,1371829053),arrayOf("redline",1,2,1427739676),arrayOf("scree",2,0,1925718449),arrayOf("highpass",1,3,165714133),arrayOf("reedcut",2,0,707837191),arrayOf("frostline",2,0,1324767137),arrayOf("haulroad",4,1,1846830020),arrayOf("dustwake",1,1,179249199),arrayOf("slagway",2,4,1192678860,true),arrayOf("ballast",2,3,389857597,true),arrayOf("sunspike",1,5,1003603780,true),arrayOf("frostline",2,3,406617684,true),arrayOf("summit",2,5,156581805,true),arrayOf("frostline",1,0,718291239,true),arrayOf("frostline",1,5,1037763904,true),arrayOf("frostline",2,1,1447921555,true),arrayOf("frostline",2,3,549348161,true),arrayOf("summit",2,1,835430310,true))
        val failures=ArrayList<String>()
        for(case in cases) {
            val course=Courses.all.single{it.id==case[0]};val pair=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==case[1]}
            val w=World(case[3] as Int,track=Track(course=course),combatEnabled=true)
            if(case.size>4)Encounters.apply(w,Career.cups[case[1] as Int].id)
            for(c in w.cars){CarCatalog.apply(c,pair[((c.id+(case[2] as Int))%6)/3]);c.aiSkill=Career.difficulties[1].skill};w.reset()
            val frames=Array(6){InputFrame()};while(w.resolved<6 && w.seconds<w.raceLimitSeconds)w.step(frames)
            for(c in w.cars)if(c.finishSeconds<0 && !w.combat.wrecked(c.id)) {
                val near=w.obstacles.all.minBy{hypot(it.x-c.x,it.y-c.y)}
                failures.add("${course.id} ${c.id} ${c.carClass!!.id}: speed=${c.speedMps} yaw=${c.yaw} heading=${c.heading} ai=${c.aiMode} steer=${c.aiInput.steer} xy=${c.x},${c.y} obstacle=${near.definition.id} distance=${hypot(near.x-c.x,near.y-c.y)} headingTo=${atan2(near.y-c.y,near.x-c.x)}")
            }
        }
        assertEquals(emptyList<String>(),failures)
    }
    private fun course(effect: String="rock-field",fraction: Double=.4,lane: Double=0.0): Course {
        val c=Courses.all[0]
        return Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,emptyList(),listOf(ObstaclePlacement(effect,fraction,lane,0.0,91)))
    }
    private fun world(effect: String="rock-field"): World = World(91,track=Track(course=course(effect)),combatEnabled=true).also{w->
        for(c in w.cars){CarCatalog.apply(c,0);c.human=true};w.reset()
    }
    @Test fun authoredPlacementsPassAndEveryNewLintRuleRejectsItsMutation() {
        assertEquals(Courses.all.map{it.id}.toSet(),ObstacleContent.placements.keys)
        for(c in Courses.all)assertEquals(emptyList<String>(),ObstacleContent.errors(c),c.id)
        val c=course();val o=c.obstacles.single()
        fun rejects(rule: String,mutant: TrackObstacle){assertTrue(ObstacleContent.errors(c,arrayOf(mutant)).any{it.contains(rule)},rule)}
        rejects("invalid obstacle definition",o.copy(definition=o.definition.copy(rx=-1.0)))
        rejects("invalid obstacle definition",o.copy(definition=o.definition.copy(drag=2.0)))
        rejects("blocks racing line",o)
        rejects("intrudes beyond recovery shoulder",o)
        rejects("reduce usable width",o.copy(definition=o.definition.copy(rx=20.0,ry=20.0)))
        rejects("outside road shoulder",o.copy(x=o.x+1000))
        val p=TrackPoint();val g=c.grid.first();c.sample((c.startFraction+g.fraction)*c.lengthM,g.laneM,p)
        rejects("covers grid",o.copy(x=p.x,y=p.y))
        val sharp=c.curvature.indices.maxBy{c.curvature[it]};c.sample(c.arc[sharp],8.0,p)
        rejects("straight recovery space",o.copy(x=p.x,y=p.y))
        assertTrue(ObstacleContent.errors(course(fraction=1.01)).any{it.contains("invalid obstacle placement")})
        // A narrow shoulder obstacle blocks the optional inside line without touching the centre line.
        val f=Courses.all[5];val feature=f.features.single{it.kind=="shortcut"}
        f.sample((feature.start+feature.end)*.5*f.lengthM,feature.laneM,p)
        assertTrue(ObstacleContent.errors(f,arrayOf(o.copy(x=p.x,y=p.y,definition=o.definition.copy(rx=.3,ry=.3)))).any{it.contains("blocks racing line")})
        // Combined left/right obstructions leave less than the minimum even when each alone fits.
        c.sample(c.lengthM*.4,0.0,p)
        val nx=-sin(p.heading);val ny=cos(p.heading)
        val a=o.copy(x=p.x+nx*8,y=p.y+ny*8,definition=o.definition.copy(rx=3.0,ry=3.0))
        val b=a.copy(x=p.x-nx*8,y=p.y-ny*8)
        assertTrue(ObstacleContent.errors(c,arrayOf(a,b)).any{it.contains("reduce usable width")})
        assertEquals(emptyList<String>(),ObstacleContent.errors(c,arrayOf(o.copy(definition=o.definition.copy(effect=ObstacleEffect.NONE)))))
    }
    @Test fun placementIsSeededAtLoadAndRaceResetDoesNotMoveIt() {
        assertEquals(course().obstacles.toList(),course().obstacles.toList())
        val w=world();val before=w.obstacles.all.toList();w.reset();assertEquals(before,w.obstacles.all.toList())
        assertNotEquals(course().obstacles.single(),Course("test","test","",0.0,"industrial",Courses.all[0].nodes,Courses.all[0].spots,emptyList(),listOf(ObstaclePlacement("rock-field",.4,0.0,0.0,92))).obstacles.single())
    }
    @Test fun dragUsesSecondsAndStrongestPatchAndDecorationDoesNothing() {
        for(effect in listOf("brush","tree-decoration")) {
            val w=world(effect);val c=w.cars[0];val o=w.obstacles.all[0]
            c.x=o.x;c.y=o.y;c.vx=10.0;c.vy=0.0
            repeat(60){w.obstacles.drag(c,1.0/60)}
            assertEquals(if(effect=="brush")6.8 else 10.0,c.vx,1e-8)
        }
    }
    @Test fun solidStopsBothMassesAndCentreOverlapWithoutNonFiniteState() {
        for(car in listOf(0,1)) {
            val w=world();val c=w.cars[0];CarCatalog.apply(c,car)
            val o=w.obstacles.all[0];c.heading=o.heading
            c.x=o.x-o.cx*(o.definition.rx+c.spec.circleOffsetM+c.spec.circleRadiusM-.1)
            c.y=o.y-o.cy*(o.definition.rx+c.spec.circleOffsetM+c.spec.circleRadiusM-.1)
            c.vx=o.cx*20;c.vy=o.cy*20
            w.obstacles.collide(c)
            assertTrue(c.speedMps<20);assertTrue(c.wallImpactMps>0)
            c.x=o.x;c.y=o.y;w.obstacles.collide(c)
            assertTrue(c.x.isFinite() && c.y.isFinite() && c.yaw.isFinite())
            c.x=o.x+o.cx*o.definition.rx;c.y=o.y+o.cy*o.definition.rx
            val px=c.x;val py=c.y;w.obstacles.collide(c)
            assertTrue(hypot(c.x-px,c.y-py)>0.0,"A circle centred exactly on the ellipse boundary must depenetrate")
            assertEquals(0.0,w.ramClosingMps.sum())
        }
    }
    @Test fun visibilityAndWeaponsUseSolidFootprintsButNotBrushOrShadows() {
        for(effect in listOf("rock-field","brush","tree-decoration")) {
            val w=world(effect);val o=w.obstacles.all[0]
            val x=o.x-o.cx*10;val y=o.y-o.cy*10;val ex=o.x+o.cx*10;val ey=o.y+o.cy*10
            assertEquals(effect=="rock-field",w.combat.roadFraction(x,y,ex,ey,.5)<1)
            assertEquals(effect=="rock-field",w.obstacles.solidAt(o.x,o.y))
            val c=w.cars[0];c.x=x;c.y=y;c.heading=o.heading
            assertEquals(effect!="tree-decoration",w.obstacles.avoid(c,.4*w.track.lengthM,0.0)!=0.0)
            c.heading=wrapAngle(o.heading+Math.PI)
            assertEquals(0.0,w.obstacles.avoid(c,.4*w.track.lengthM,0.0))
            c.x=o.x-o.cx*100;c.y=o.y-o.cy*100;c.heading=o.heading
            assertEquals(0.0,w.obstacles.avoid(c,.4*w.track.lengthM,0.0))
        }
    }
    @Test fun minePlacementInsideSolidRefusesWithoutSpendingAmmo() {
        val w=world();val c=w.cars[0];val o=w.obstacles.all[0]
        val input=Array(6){InputFrame()};repeat(300){w.step(input)}
        c.heading=o.heading;val rear=c.spec.circleOffsetM+c.spec.circleRadiusM+CombatRules["dropClearanceM"]
        c.x=o.x+o.cx*rear;c.y=o.y+o.cy*rear
        assertFalse(w.combat.fire(0,Weapons.MINE));assertEquals(0,w.combat.shots[Weapons.MINE])
        w.obstacles.enabled=false;assertTrue(w.combat.fire(0,Weapons.MINE))
    }
    @Test fun liveGunsProjectilesAndHarpoonStopAtSolidButCrossBrush() {
        for(effect in listOf("rock-field","brush"))for(kind in listOf("rivet","hammer","harpoon")) {
            val w=world(effect);val owner=w.cars[0];CarCatalog.apply(owner,8);w.reset()
            val frames=Array(6){InputFrame()};repeat(300){w.step(frames)}
            val o=w.obstacles.all[0]
            for(c in w.cars){c.x=o.x+100;c.y=o.y+100;c.vx=0.0;c.vy=0.0}
            owner.x=o.x-o.cx*12;owner.y=o.y-o.cy*12;owner.heading=o.heading
            val target=w.cars[1];target.x=o.x+o.cx*9;target.y=o.y+o.cy*9;target.heading=o.heading
            val hp=w.combat.health(1)
            when(kind) {
                "rivet"->assertTrue(w.combat.fire(0,Weapons.RIVET))
                "hammer"->{assertTrue(w.combat.fire(0,Weapons.HAMMER));repeat(60){w.combat.step(frames,Tuning.STEP_SECONDS)}}
                else->{val input=InputFrame().also{it.ability=1.0};w.abilities.begin(owner,input,Tuning.STEP_SECONDS)
                    input.ability=0.0;repeat(60){w.abilities.begin(owner,input,Tuning.STEP_SECONDS);w.abilities.resolve()}}
            }
            assertEquals(effect=="brush",w.combat.health(1)<hp,"$effect / $kind")
            if(kind=="harpoon" && effect=="rock-field")assertEquals(1.0,target.ability.slowScale)
        }
    }
    @Test fun activeContactDragPerceptionAndWholeStepAllocateNothingAndReplay() {
        val w=world();val c=w.cars[0];val o=w.obstacles.all[0];val frames=Array(6){InputFrame()}
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        fun touch(){c.x=o.x;c.y=o.y;c.vx=10.0;w.obstacles.collide(c);w.obstacles.avoid(c,.4*w.track.lengthM,0.0);w.step(frames)}
        repeat(20000){touch()};val id=Thread.currentThread().threadId();val before=bean.getThreadAllocatedBytes(id)
        repeat(3000){touch()};assertEquals(0L,bean.getThreadAllocatedBytes(id)-before)
        val a=world("brush");val b=world("brush");repeat(600){a.step(frames);b.step(frames)};assertEquals(a.stateHash(),b.stateHash())
    }
}
