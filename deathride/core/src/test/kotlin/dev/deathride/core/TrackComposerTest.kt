package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class TrackComposerTest {
    @Test fun alternateRouteUsesCanonicalProgressAndSurvivesExport() {
        val base=Courses.all.first();val main=TrackComposer.compile(base,TrackComposer.example(),false).course
        val q=Projection();main.project(10*TrackQuality.longest,0.0,q);val start=q.s/main.lengthM
        main.project(20*TrackQuality.longest,8.2*TrackQuality.longest,q);val end=q.s/main.lengthM
        val alt=TrackComposer.parse(TrackComposer.example()).mapIndexed { i,p -> if(i==1 || i==2)p.copy(a=40.0)else p }
        val recipe=TrackComposer.csv(TrackComposer.parse(TrackComposer.example())+DesignPrimitive("split",start,end)+alt+DesignPrimitive("rejoin",0.0))
        val composed=TrackComposer.compile(base,recipe);val c=composed.course
        assertEquals(emptyList<String>(),TrackLinter.errors(c));assertEquals(1,c.branches.size)
        val imported=TrackLabCodec.course(TrackLabCodec.csv(c)+mapOf("id" to c.id,"startFraction" to c.startFraction.toString()))
        assertEquals(emptyList<String>(),TrackLinter.errors(imported));assertEquals(TrackLabCodec.csv(c),TrackLabCodec.csv(imported))
        val p=TrackPoint();for(i in 1..99){val s=c.lengthM*(start+(end-start)*i/100);c.sample(s,0.0,p,1);c.project(p.x,p.y,q,s-1,1);assertEquals(s,q.s,1.0)}
        val w=World(1730,track=Track(course=c),combatEnabled=false);val input=Array(6){InputFrame()};val used=BooleanArray(6)
        for(car in w.cars){CarCatalog.apply(car,0);car.aiSkill=AiSkills.all.single{it.id=="Pro"};car.human=false};w.raceLaps=2;w.reset()
        while(w.finished<6 && w.seconds<240){w.step(input);for(car in w.cars)if(car.trackRoute==1)used[car.id]=true}
        assertEquals(6,w.finished,"Split/rejoin must finish: "+w.cars.joinToString { "${it.id}:${it.lap.laps}/${it.lap.progressM}" })
        assertTrue(used.all { it },"Each car alternates routes over two laps")
        assertTrue(w.cars.all { it.lap.laps==2 && it.finishSeconds>c.lengthM*2/it.spec.maxSpeedMps })
        val folder=java.io.File(TrackQuality.root,"tracks/composer");folder.mkdirs();java.io.File(folder,"split-example.csv").writeText(recipe)
    }
    private fun junctionRecipe()=TrackComposer.csv(listOf(0.0 to 0.0,30.0 to 30.0,30.0 to 45.0,0.0 to 45.0,0.0 to 30.0,30.0 to 0.0,30.0 to -15.0,0.0 to -15.0).map { DesignPrimitive("anchor",it.first,it.second,3.6,4.8) }+DesignPrimitive("junction",15.0,15.0,6.0,4.8))
    @Test fun declaredJunctionPreservesPassageAndRejectsMissingOrFalseDeclarations() {
        val c=TrackComposer.compile(Courses.all.first(),junctionRecipe(),false).course
        assertEquals(emptyList<String>(),TrackLinter.errors(c))
        assertEquals(1,c.junctions.size)
        assertEquals(1.0,trackShape(c).metrics.getValue("crossings"))
        assertEquals(0.0,trackShape(c).metrics.getValue("undeclaredCrossings"))
        val p=TrackPoint();val q=Projection()
        for(f in listOf(c.junctions[0].first,c.junctions[0].second))for(offset in -25..25) {
            val s=f*c.lengthM+offset;c.sample(s,0.0,p);c.project(p.x,p.y,q,s-2)
            assertTrue(TrackJunctions.cyclicGap(c,s,q.s)<1,"Passage jumped at $s to ${q.s}")
        }
        val undeclared=Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,emptyList())
        assertTrue(TrackLinter.errors(undeclared).any { it.contains("overlap") })
        val wrong=Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,listOf(TrackJunction(.1,.6,0.0)))
        assertTrue(TrackLinter.errors(wrong).any { it.contains("junction") })
        val w=World(1729,track=Track(course=c),combatEnabled=false);val input=Array(6){InputFrame()}
        for(car in w.cars){CarCatalog.apply(car,0);car.aiSkill=AiSkills.all.single{it.id=="Pro"};car.human=false};w.raceLaps=2;w.reset()
        while(w.finished<6 && w.seconds<180)w.step(input)
        assertEquals(6,w.finished,"Six cars must traverse both junction passages without lap skips")
        assertTrue(w.cars.all { it.lap.laps==2 && it.finishSeconds>c.lengthM*2/it.spec.maxSpeedMps })
    }
    @Test fun primitiveRoadHasSmoothPhysicalBakeAndVariableWidths() {
        val c=TrackComposer.compile(Courses.all.first(),TrackComposer.example())
        assertEquals(emptyList<String>(),TrackLinter.errors(c.course),"Minimum baked radius ${1/c.course.curvature.max()/TrackQuality.longest} L")
        assertTrue(c.course.width.max()-c.course.width.min()>2)
        assertTrue(trackShape(c.course).metrics.getValue("hullPerimeterRatio")>1.12)
        assertTrue(trackShape(c.course).metrics.getValue("signChanges")>=4)
        assertTrue(shapeGates(trackShape(c.course).metrics).all { it["status"]=="pass" })
        assertTrue(c.course.features.isNotEmpty())
        assertTrue(c.course.obstacles.isNotEmpty())
        val imported=TrackLabCodec.course(TrackLabCodec.csv(c.course)+mapOf("id" to c.course.id,"startFraction" to c.course.startFraction.toString()))
        assertEquals(c.course.startFraction,imported.startFraction)
        assertEquals(emptyList<String>(),TrackLinter.errors(imported))
        val again=TrackComposer.compile(Courses.all.first(),TrackComposer.csv(c.primitives))
        assertEquals(TrackLabCodec.csv(c.course),TrackLabCodec.csv(again.course))
    }
    @Test fun malformedOpenAndImplicitGraphRecipesCannotSilentlyBake() {
        val recipe=TrackComposer.example();val base=Courses.all.first()
        assertThrows(IllegalArgumentException::class.java){TrackComposer.compile(base,recipe.replace("3.6",".2"))}
        val ops=TrackComposer.fromAnchors(TrackComposer.parse(recipe).map { DesignAnchor(it.a,it.b,it.c,it.widthW,it.surface) })
        assertThrows(IllegalArgumentException::class.java){TrackComposer.compile(base,TrackComposer.csv(ops.dropLast(1)))}
        assertThrows(IllegalArgumentException::class.java){TrackComposer.compile(base,TrackComposer.csv(ops.take(4)+DesignPrimitive("split",0.0)))}
        for(kind in listOf("rejoin","bridge"))assertThrows(IllegalStateException::class.java){TrackComposer.compile(base,TrackComposer.csv(ops.take(4)+DesignPrimitive(kind,0.0)))}
    }
}
