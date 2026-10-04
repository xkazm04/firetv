package dev.deathride.game

import com.badlogic.gdx.files.FileHandle
import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class RegionPresentationTest {
    @Test fun allCandidateFilesAreVerifiedAndRejectAlwaysFallsBack() {
        val root=FileHandle("../assets/regions");val manifest=RegionMaterials.manifest(root)
        var count=0
        for(r in Regions.all)for(slot in r.variants.keys) {
            val e=manifest.single{it.getString("id")==r.variants[slot]}
            assertTrue(RegionMaterials.eligible(e,r,slot,true))
            assertFalse(RegionMaterials.eligible(e,r,slot,false))
            assertEquals(256L*256*4,RegionMaterials.verifiedFile(root,e).read().use{TextureBudget.pngBytes(it,256)})
            e.get("status").set("Reject");assertFalse(RegionMaterials.eligible(e,r,slot,true))
            e.get("ownerEvidence").set("");e.get("status").set("Keep");assertFalse(RegionMaterials.eligible(e,r,slot,true)) // no evidence
            e.get("status").set("candidate");assertTrue(RegionMaterials.eligible(e,r,slot,true))
            assertFalse(RegionMaterials.eligible(e,r,slot,false))
            count++
        }
        assertEquals(16,count)
    }
    @Test fun weatherStaysBoundedThroughHoursPauseAndRepeatedRegionChanges() {
        assertEquals(160,VisualTuning["particleCapacity"].toInt())
        assertEquals(160,RegionAtmosphere.CAPACITY+RegionAtmosphere.VEHICLE_CAPACITY)
        assertTrue(RegionAtmosphere.VEHICLE_CAPACITY>=72)
        val pool=RegionAtmosphere()
        for(region in Regions.all) {
            pool.select(region);assertEquals(0,pool.activeCount)
            repeat(120_000){i->
                pool.update(if(i%100==0).1 else 1.0/60)
                assertTrue(pool.activeCount<=region.weatherCap)
                for(k in region.weather.indices)assertTrue(pool.familyCount(k)<=region.weather[k].cap)
            }
            assertTrue(pool.spawned>100)
            for((w,h) in listOf(1920f to 1080f,1280f to 720f,390f to 844f))assertTrue(pool.coverage(w,h)<=.04)
            pool.update(600.0);assertTrue(pool.activeCount<=2)
            val count=pool.activeCount;pool.update(Double.NaN);pool.update(-1.0);assertEquals(count,pool.activeCount)
        }
        pool.select(null);pool.update(1000.0);assertEquals(0,pool.activeCount)
    }
    @Test fun nativeCandidateRegionComesFromEventEvenWhenOriginalCourseBelongsElsewhere() {
        for(id in listOf("scrap-1-a","foundry-1-a","salt-1-a","switchback-1-a","crown-1-a")) {
            val p=TrackPreview.read(File("../tracks/candidates/drafts/$id.json").readText())
            assertEquals(id.substringBefore('-'),p.course.region.division)
        }
    }
    @Test fun weatherCannotAlterReplayOrProfile() {
        val inputs=Array(6){InputFrame()};val course=Courses.all.first()
        val baseline=TrackDraft.world(course,0,seed=927);val other=TrackDraft.world(course,0,seed=927)
        val weather=RegionAtmosphere()
        repeat(1200){i->
            if(i%240==0)weather.select(Regions.all[i/240])
            weather.update(if(i%7==0).07 else .013)
            baseline.step(inputs);other.step(inputs)
            assertEquals(baseline.stateHash(),other.stateHash())
        }
    }
}
